# Pika CLI Server

这是 Pika CLI 的后端服务器，提供项目创建和 GitHub 集成功能。

## 环境配置

### 1. 创建环境变量文件

在 `packages/server/` 目录下创建 `.env` 文件：

```bash
# GitHub OAuth 配置
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# 数据库配置
DATABASE_URL="file:./dev.db"

# 前端地址
FRONTEND_URL=http://localhost:5173

# 会话密钥（用于加密会话）
SESSION_SECRET=your_session_secret_here

# 服务器端口
PORT=3000
```

### 2. 获取 GitHub OAuth 凭据

1. 访问 [GitHub Developer Settings](https://github.com/settings/applications/new)
2. 点击 "New OAuth App"
3. 填写以下信息：
   - **Application name**: Pika CLI
   - **Homepage URL**: http://localhost:5173
   - **Authorization callback URL**: http://localhost:3000/api/auth/github/callback
4. 点击 "Register application"
5. 复制 **Client ID** 和 **Client Secret** 到 `.env` 文件中

### 3. 生成会话密钥

可以使用以下命令生成一个随机的会话密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 功能

- GitHub OAuth 认证
- 项目创建和管理
- 数据库集成（Prisma + SQLite）
- RESTful API 接口

## API 端点

- `GET /api/auth/github` - GitHub 登录
- `GET /api/auth/github/callback` - GitHub 回调
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 登出
- `GET /api/auth/status` - 检查登录状态
