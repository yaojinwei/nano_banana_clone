# 导航栏改进说明

## 问题描述
充值页面（钱包）存在于 `/wallet` 路径，但导航栏中的链接不够显眼，导致用户难以找到充值入口。

## 改进内容

### 1. 主导航栏新增"生成器"链接
**位置**: 顶部导航栏左侧
**改进**: 将 AI 图像生成器链接添加到主导航，方便用户快速访问

**修改文件**: `components/navbar.tsx`

```typescript
// 新增链接
<Link href="/generator" className="hover:text-primary transition-colors">
  {t('nav.generator')}
</Link>
```

### 2. 钱包和使用记录链接优化
**位置**: 顶部导航栏右侧（用户登录后显示）
**改进**: 将"钱包"和"使用记录"从下拉菜单移至更显眼的位置

**之前**: 链接隐藏在用户头像的下拉菜单中，需要两次点击才能访问
**现在**: 链接直接显示在导航栏，带图标，一目了然

**修改文件**: `components/navbar.tsx` (第108-123行)

```typescript
{mounted && !loading && isConfigured && user ? (
  <>
    <Link href="/wallet" className="hidden sm:inline-flex text-sm font-medium hover:text-primary transition-colors">
      <span className="flex items-center gap-1">
        <Wallet className="h-4 w-4" />
        {t('nav.wallet')}
      </span>
    </Link>
    <Link href="/usage" className="hidden sm:inline-flex text-sm font-medium hover:text-primary transition-colors">
      <span className="flex items-center gap-1">
        <History className="h-4 w-4" />
        {t('nav.usage')}
      </span>
    </Link>
  </>
) : null}
```

## 页面路径说明

### 钱包相关页面
- **钱包主页**: `/wallet` 或 `/[locale]/wallet`
  - 显示当前余额
  - 快速访问充值和充值记录
  - 显示充值套餐

- **充值页面**: `/wallet/recharge`
  - 选择充值套餐（100、500、1000、5000 积分）
  - 选择支付方式（信用卡、PayPal、借记卡）
  - 完成支付流程

- **充值记录**: `/wallet/recharge-records`
  - 查看所有历史充值记录
  - 显示充值状态（待处理、已完成、失败、已取消）

### 使用记录页面
- **使用记录**: `/usage` 或 `/[locale]/usage`
  - 查看 AI 图像生成历史
  - 显示每次生成的详细信息（提示词、模型、消耗积分）

## 导航结构

### 未登录用户
```
主导航: 首页 | 生成器 | 功能 | 定价 | 关于 | FAQ | [创建图像按钮] | [登录按钮]
```

### 已登录用户
```
主导航: 首页 | 生成器 | 功能 | 定价 | 关于 | FAQ | [钱包图标] [使用记录图标] [创建图像按钮] [用户头像]
```

## 国际化支持

所有新增链接都已完整国际化：
- ✅ 英文版: Generator, Wallet, Usage History
- ✅ 中文版: 生成器, 钱包, 使用记录

## 测试结果

✅ 主导航栏正确显示"生成器"链接
✅ 用户登录后，"钱包"和"使用记录"链接正确显示在导航栏
✅ 链接带图标，视觉清晰
✅ 所有页面路径可正常访问
✅ 中英文切换正常工作

## 下一步建议

1. **添加钱包余额提醒**: 在导航栏显示当前积分余额
2. **充值优惠提示**: 当余额不足时，在导航栏显示充值提醒
3. **快捷充值**: 在导航栏添加快捷充值入口，跳转到常用套餐
4. **移动端优化**: 在移动端菜单中优化钱包和充值入口的展示
