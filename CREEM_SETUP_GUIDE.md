# Creem 支付集成设置指南

## 问题诊断

如果您看到 "创建支付会话失败" 的错误，这是因为缺少 Creem API 配置。

## 快速设置步骤

### 1. 创建 Creem 账户

1. 访问 https://creem.io
2. 注册账户（免费）
3. 验证邮箱

### 2. 启用测试模式

1. 登录 Creem Dashboard: https://creem.io/dashboard
2. **重要**: 点击顶部导航栏的 **Test Mode** 切换按钮
3. 确保显示为 "Test Mode"（通常是绿色或蓝色标识）

### 3. 获取测试 API 密钥

1. 在 Dashboard 中，进入 **Developers** 页面
2. 确保顶部显示 "Test Mode"
3. 复制 **Test API Key**（格式类似：`ck_test_xxxxx`）
4. 获取 Webhook Secret（用于验证 webhook）

### 4. 创建测试产品

在 Creem Dashboard（Test Mode）中创建以下产品：

#### 订阅产品（用于 Pricing 页面）

**基础版**:
- 月付产品 ID: `prod_basic_monthly` - $12.00/月
- 年付产品 ID: `prod_basic_yearly` - $144.00/年

**专业版**:
- 月付产品 ID: `prod_pro_monthly` - $19.50/月
- 年付产品 ID: `prod_pro_yearly` - $234.00/年

**旗舰版**:
- 月付产品 ID: `prod_max_monthly` - $80.00/月
- 年付产品 ID: `prod_max_yearly` - $960.00/年

#### 充值产品（用于充值页面）

- `prod_credits_100` - 100 积分 - $10.00（一次性支付）
- `prod_credits_500` - 500 积分 - $45.00（一次性支付）
- `prod_credits_1000` - 1000 积分 - $80.00（一次性支付）
- `prod_credits_5000` - 5000 积分 - $350.00（一次性支付）

**注意**: 创建产品后，记下实际的产品 ID（格式类似：`prod_test_xxxxx`），然后更新到代码中。

### 5. 更新 .env.local 配置

在项目根目录的 `.env.local` 文件中添加：

```bash
# Creem Payment Configuration
CREEM_API_KEY=ck_test_你的实际测试密钥
CREEM_WEBHOOK_SECRET=whsec_你的webhook密钥
CREEM_API_URL=https://test-api.creem.io
CREEM_TEST_MODE=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. 更新产品 ID 到代码

编辑 `app/api/creem/create-checkout/route.ts`，替换产品 ID：

```typescript
// 订阅产品
const PRODUCT_IDS: Record<string, { monthly: string; yearly: string }> = {
  basic: {
    monthly: "prod_test_你的基础版月付产品ID",
    yearly: "prod_test_你的基础版年付产品ID",
  },
  pro: {
    monthly: "prod_test_你的专业版月付产品ID",
    yearly: "prod_test_你的专业版年付产品ID",
  },
  max: {
    monthly: "prod_test_你的旗舰版月付产品ID",
    yearly: "prod_test_你的旗舰版年付产品ID",
  },
}

// 充值产品
const CREDIT_PRODUCT_IDS: Record<number, string> = {
  100: "prod_test_你的100积分产品ID",
  500: "prod_test_你的500积分产品ID",
  1000: "prod_test_你的1000积分产品ID",
  5000: "prod_test_你的5000积分产品ID",
}
```

### 7. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

## 测试支付流程

### 测试卡号

使用以下测试卡号进行支付测试：

| 卡号 | 行为 |
|------|------|
| `4242 4242 4242 4242` | 支付成功 ✅ |
| `4000 0000 0000 0002` | 卡被拒绝 ❌ |
| `4000 0000 0000 9995` | 余额不足 ❌ |
| `4000 0000 0000 0127` | CVC 错误 ❌ |
| `4000 0000 0000 0069` | 卡已过期 ❌ |

**所有测试卡的规则**:
- 过期日期: 任何未来日期（如 12/34）
- CVC: 任何3位数字（如 123）
- 邮编: 任何5位数字（如 12345）
- 持卡人: 任何名字

### 完整测试流程

1. **测试订阅购买**:
   ```
   访问 /pricing
   → 选择一个计划
   → 点击 "Get Started"
   → 跳转到 Creem 支付页面
   → 输入测试卡号: 4242 4242 4242 4242
   → 输入过期日期: 12/34
   → 输入 CVC: 123
   → 点击支付
   → 跳转到 /checkout/success
   ```

2. **测试一次性充值**:
   ```
   访问 /wallet/recharge
   → 选择积分套餐（如 100 积分）
   → 选择支付方式
   → 点击支付
   → 跳转到 Creem 支付页面
   → 输入测试卡号: 4242 4242 4242 4242
   → 完成支付
   → 跳转到 /checkout/success
   ```

## 常见问题

### Q: "创建支付会话失败" 错误

**A**: 检查以下几点：
1. ✅ 是否在 Creem Dashboard 启用了 Test Mode
2. ✅ `.env.local` 中的 `CREEM_API_KEY` 是否正确
3. ✅ 产品 ID 是否正确复制到代码中
4. ✅ 开发服务器是否重启（重启以加载环境变量）

### Q: API 返回 401 错误

**A**:
- 检查 API 密钥是否以 `ck_test_` 开头（测试密钥）
- 确保在 Dashboard 中启用了 Test Mode
- 尝试重新生成 API 密钥

### Q: API 返回 400 错误 - "Invalid product"

**A**:
- 产品 ID 不存在或错误
- 确保在 Test Mode 中创建了产品
- 检查产品 ID 是否正确复制

### Q: 支付页面无法打开

**A**:
- 检查返回的 `checkout_url` 是否存在
- 查看浏览器控制台的错误信息
- 检查 Creem API 响应内容

## 调试技巧

### 查看 API 响应

打开浏览器开发者工具（F12），查看 Network 标签：

1. 点击支付按钮
2. 找到 `/api/creem/create-checkout` 请求
3. 查看 Response 内容
4. 检查错误信息

### 查看服务器日志

```bash
# 在终端中查看 Next.js 开发服务器的输出
# 会显示 console.error 的信息
```

### 测试 API 连接

使用 curl 测试 Creem API：

```bash
curl -X POST https://test-api.creem.io/v1/checkouts \
  -H "x-api-key: YOUR_TEST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "YOUR_PRODUCT_ID",
    "test_mode": true,
    "success_url": "http://localhost:3000/checkout/success"
  }'
```

## 生产环境切换

当准备上线时：

1. **关闭测试模式**:
   ```bash
   # .env.local (生产环境)
   CREEM_TEST_MODE=false
   CREEM_API_URL=https://api.creem.io
   CREEM_API_KEY=ck_live_生产密钥
   ```

2. **创建生产产品**:
   - 在 Creem Dashboard 切换到 Live Mode
   - 创建所有产品
   - 更新产品 ID 到代码

3. **配置生产 Webhook**:
   - 注册生产环境的 webhook URL
   - 更新 `CREEM_WEBHOOK_SECRET`

## 验证清单

测试前确保：

- [ ] Creem 账户已创建
- [ ] Test Mode 已启用
- [ ] 测试 API 密钥已获取
- [ ] .env.local 已配置
- [ ] 开发服务器已重启
- [ ] 产品已在 Test Mode 中创建
- [ ] 产品 ID 已更新到代码
- [ ] Webhook secret 已配置

## 需要帮助？

- Creem 文档: https://docs.creem.io
- Creem Dashboard: https://creem.io/dashboard
- 查看项目文档: `/IMPLEMENTATION_SUMMARY.md`
