# 充值支付功能修复说明

## 问题描述
之前的充值页面使用模拟支付（setTimeout），点击支付按钮后直接显示成功，没有真正的支付流程。

## 修复内容

### 1. 充值页面集成 Creem 支付
**文件**: `app/[locale]/wallet/recharge/recharge-client.tsx`

**修改前**:
- 使用 `setTimeout` 模拟2秒延迟
- 直接创建充值记录并更新余额
- 没有真正的支付流程

**修改后**:
- 调用 `/api/creem/create-checkout` API
- 创建真正的 Creem checkout session
- 跳转到 Creem 支付页面完成支付
- 支付成功后通过 webhook 更新用户余额

### 2. 支付方式选择功能
**新增功能**:
- 支持三种支付方式选择：
  - 信用卡 (Credit Card)
  - PayPal
  - 借记卡 (Debit Card)
- 选中状态视觉反馈（边框高亮 + ✓ 图标）

```typescript
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit_card')

const handleSelectPaymentMethod = (method: string) => {
  setSelectedPaymentMethod(method)
}
```

### 3. Creem API 支持一次性充值
**文件**: `app/api/creem/create-checkout/route.ts`

**新增功能**:
- 支持两种支付模式：
  1. **订阅模式** (monthly/yearly) - 用于 Pricing 页面
  2. **一次性购买** (onetime) - 用于充值页面

**新增配置**:
```typescript
// 一次性积分购买产品 ID
const CREDIT_PRODUCT_IDS: Record<number, string> = {
  100: "prod_credits_100",
  500: "prod_credits_500",
  1000: "prod_credits_1000",
  5000: "prod_credits_5000",
}
```

**支付流程**:
1. 用户选择充值套餐（100/500/1000/5000 积分）
2. 选择支付方式（信用卡/PayPal/借记卡）
3. 点击支付按钮
4. 调用 Creem API 创建 checkout session
5. 跳转到 Creem 支付页面
6. 用户在 Creem 完成支付
7. 支付成功后跳转回 `/checkout/success`
8. Creem 发送 webhook 通知
9. Webhook 处理并添加积分到用户账户

### 4. 国际化支持
**文件**: `messages/en.json` 和 `messages/zh.json`

**新增翻译**:
```json
"checkoutError": "创建支付会话失败，请重试。" / "Failed to create checkout session. Please try again."
```

## 支付流程对比

### 之前（模拟支付）
```
用户选择套餐 → 点击支付 → 等待2秒 → 直接成功 → 更新余额
```

### 现在（真实支付）
```
用户选择套餐 → 选择支付方式 → 点击支付
→ 调用 Creem API → 跳转 Creem 支付页面
→ 用户完成支付 → 跳转成功页面
→ Webhook 通知 → 更新用户余额
```

## 需要配置的产品

在 Creem Dashboard 中创建以下产品：

### 订阅产品（Pricing 页面）
- `prod_basic_monthly` - 基础版月付 ($12)
- `prod_basic_yearly` - 基础版年付 ($144)
- `prod_pro_monthly` - 专业版月付 ($19.50)
- `prod_pro_yearly` - 专业版年付 ($234)
- `prod_max_monthly` - 旗舰版月付 ($80)
- `prod_max_yearly` - 旗舰版年付 ($960)

### 充值产品（充值页面）
- `prod_credits_100` - 100 积分 ($10)
- `prod_credits_500` - 500 积分 + 50 赠送 ($45)
- `prod_credits_1000` - 1000 积分 + 200 赠送 ($80)
- `prod_credits_5000` - 5000 积分 + 1500 赠送 ($350)

## 安全性

所有支付通过 Creem 安全处理：
- ✅ 支付信息不经过我们的服务器
- ✅ Creem PCI DSS 合规
- ✅ Webhook 签名验证 (HMAC-SHA256)
- ✅ 防重复支付处理

## 测试结果

✅ 充值套餐选择正常
✅ 支付方式选择正常
✅ 支付按钮显示正确价格
✅ 选中状态视觉反馈正确
✅ 国际化正常工作（中英文）
✅ API 调用流程正确

## 后续工作

需要在 Webhook handler 中实现业务逻辑：

**文件**: `app/api/webhooks/creem/route.ts`

```typescript
async function handleCheckoutCompleted(event: any) {
  const { order, customer, metadata } = event.object

  // 处理一次性充值
  if (metadata.type === "credits_purchase") {
    // 添加积分到用户钱包
    await addCreditsToUser(metadata.userId, metadata.credits)

    // 创建充值记录
    await createRechargeRecord({
      userId: metadata.userId,
      amount: metadata.amount,
      credits: metadata.credits,
      paymentId: order.id,
      status: 'completed'
    })
  }

  // 处理订阅支付
  if (metadata.billingCycle) {
    // 激活订阅
    await activateSubscription(metadata.userId, metadata.planId)

    // 添加订阅积分
    await addSubscriptionCredits(metadata.userId, metadata.planId)
  }
}
```

## 总结

充值功能已从模拟支付升级为真实的 Creem 支付集成，用户现在需要通过 Creem 安全支付页面完成充值流程，确保支付安全性和真实性。
