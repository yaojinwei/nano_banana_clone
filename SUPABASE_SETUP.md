# Supabase Google 登录配置指南

本文档将指导你如何为 BananaEdit 项目配置 Supabase 和 Google 登录功能。

## 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录/注册账号
2. 创建新项目（New Project）
3. 等待项目初始化完成（通常需要 1-2 分钟）

## 步骤 2: 获取 API 密钥

1. 进入你的项目
2. 导航到 **Settings** → **API**
3. 复制以下信息：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 步骤 3: 配置 Google OAuth

### 在 Google Cloud Console 设置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 导航到 **APIs & Services** → **Credentials**
4. 点击 **Create Credentials** → **OAuth client ID**
5. 如果首次使用，需要先配置 OAuth consent screen

### 配置 OAuth consent screen

1. 选择 **External** 用户类型
2. 填写应用信息：
   - App name: BananaEdit
   - User support email: 你的邮箱
   - Developer contact: 你的邮箱
3. 添加 Scopes（可选）
4. 添加测试用户（或验证应用以发布）

### 创建 OAuth 客户端 ID

1. 选择 **Web application** 类型
2. 名称：BananaEdit
3. 添加授权的重定向 URI：
   ```
   https://[your-project-id].supabase.co/auth/v1/callback
   ```
   （将 `[your-project-id]` 替换为你的 Supabase 项目 ID）
4. 点击 **Create** 并复制：
   - **Client ID**
   - **Client Secret**

### 在 Supabase 中配置 Google Provider

1. 返回 Supabase Dashboard
2. 导航到 **Authentication** → **Providers**
3. 找到 **Google** 并点击启用
4. 填入刚才从 Google Cloud Console 获取的：
   - Client ID
   - Client Secret
5. 保存配置

## 步骤 4: 配置本地环境变量

1. 复制 `.env.local.example` 文件：
   ```bash
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local` 文件，填入你的 Supabase 凭证：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 步骤 5: 运行应用

启动开发服务器：
```bash
npm run dev
# 或
pnpm dev
```

访问 http://localhost:3000 测试登录功能。

## 功能说明

### 已实现的功能

✅ Google OAuth 登录/注册
✅ 服务器端认证（更安全）
✅ 自动会话刷新
✅ 用户信息显示（头像、姓名、邮箱）
✅ 登出功能
✅ 响应式导航栏

### 页面路由

- `/login` - 登录页面
- `/signup` - 注册页面
- `/auth/callback` - OAuth 回调处理
- `/auth/logout` - 登出处理

## 测试流程

1. 访问首页，点击 "Log in" 或 "Get Started"
2. 在登录/注册页面点击 "Continue with Google"
3. 选择 Google 账号并授权
4. 成功后自动跳转回首页
5. 导航栏显示用户头像和信息
6. 点击头像可以查看用户菜单并登出

## 故障排查

### Google 登录后未跳转

- 检查 Google Cloud Console 中的重定向 URI 是否正确
- 确保 Supabase 中的 Client ID 和 Secret 正确配置
- 检查浏览器控制台是否有错误信息

### 无法获取用户信息

- 确认 `.env.local` 文件配置正确
- 重启开发服务器使环境变量生效
- 检查 Supabase Dashboard 中的 Authentication Logs

### 会话丢失

- 检查 `middleware.ts` 是否正确配置
- 确认 Cookie 设置（特别是 `sameSite` 属性）

## 安全建议

1. **永远不要** 将 `service_role` 密钥提交到代码仓库
2. 使用环境变量存储敏感信息
3. 在生产环境启用 Supabase Row Level Security (RLS)
4. 定期轮换密钥和令牌
5. 监控 Authentication Logs 发现可疑活动

## 额外资源

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 指南](https://developers.google.com/identity/protocols/oauth2)
- [Next.js 15 + Supabase 示例](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)
