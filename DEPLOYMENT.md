# 🚀 ShipCrewHub 免费部署指南

## 推荐方案：Vercel (前端) + Railway (后端)

### 📋 部署步骤

## 1. 后端部署到 Railway

### 1.1 准备工作

1. 注册 Railway 账号：https://railway.app
2. 连接你的 GitHub 账号
3. Fork 或上传你的项目到 GitHub

### 1.2 部署后端

1. 在 Railway 创建新项目
2. 选择 "Deploy from GitHub repo"
3. 选择你的 ShipCrewHub 仓库
4. 在 Root Directory 设置为 `backend`
5. 添加环境变量：
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-super-secret-key-here
   ```

### 1.3 添加数据库

在 Railway 中添加数据库有两种方式：

**方式一：在项目创建时添加**

1. 部署完后端项目后，在项目主页面
2. 点击右上角的 **"+ New"** 按钮
3. 选择 **"Database"**
4. 选择 **"Add MySQL"** 或 **"Add PostgreSQL"**
5. Railway 会自动创建数据库并生成连接信息

**方式二：通过 Add Service（如果可见）**

1. 在项目页面查找 **"Add Service"** 或 **"+"** 按钮
2. 选择数据库类型
3. 确认创建

**重要提示：**

- Railway 会自动将数据库连接信息添加到环境变量中
- 通常会生成 `DATABASE_URL` 或 `MYSQL_URL` 变量
- 你的应用会自动获得这些连接信息

### 1.4 配置构建命令

在 Railway 中设置：

- Build Command: `npm run build`
- Start Command: `npm start`

## 2. 前端部署到 Vercel

### 2.1 准备工作

1. 注册 Vercel 账号：https://vercel.com
2. 连接 GitHub 账号

### 2.2 部署前端

1. 在 Vercel 创建新项目
2. 选择你的 GitHub 仓库
3. 设置 Root Directory 为 `frontend`
4. 添加环境变量：
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app
   ```

### 2.3 配置构建设置

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## 3. 其他免费替代方案

### 方案 2：Netlify + Render

- **前端**: Netlify (https://netlify.com)
- **后端**: Render (https://render.com)
- 同样的步骤，只是平台不同

### 方案 3：GitHub Pages + Back4App

- **前端**: GitHub Pages (免费静态托管)
- **后端**: Back4App (免费额度)

## 4. 注意事项

### 4.1 数据库迁移

确保在生产环境运行数据库迁移：

```bash
npm run migrate
```

### 4.2 环境变量安全

- 不要在代码中硬编码敏感信息
- 使用平台提供的环境变量功能

### 4.3 CORS 配置

确保后端 CORS 设置允许前端域名访问

## 5. 成本估算

### Railway (后端)

- 免费额度：$5/月 或 500 小时
- 足够小型应用使用

### Vercel (前端)

- 免费额度：100GB 带宽/月
- 无限制静态部署

## 6. 性能优化建议

虽然不要求高性能，但可以考虑：

- 启用 gzip 压缩
- 静态资源 CDN
- 数据库索引优化
- API 响应缓存

## 7. 监控和日志

Railway 和 Vercel 都提供：

- 应用日志查看
- 性能监控
- 错误追踪

---

选择这个方案的优势：
✅ 完全免费（在限额内）
✅ 自动 CI/CD
✅ HTTPS 证书自动配置
✅ 全球 CDN
✅ 简单易用的管理界面
