# 🌐 前端部署到 Vercel 指南

## 📋 准备工作

### 1. 注册 Vercel 账号
- 访问：https://vercel.com
- 使用 GitHub 账号登录

### 2. 导入项目
1. 点击 **"New Project"**
2. 选择 **"Import Git Repository"**
3. 选择你的 `ShipCrewHub` 仓库
4. 点击 **"Import"**

### 3. 配置项目设置

**重要配置项：**
- **Framework Preset**: 选择 `Vite`
- **Root Directory**: 设置为 `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. 添加环境变量

在 Vercel 项目设置中添加环境变量：

**使用你的 Railway 后端 URL：**
```
VITE_API_URL=https://shipcrewhub-production.up.railway.app
```

**已经在代码中配置好了！** 代码中的 `frontend/.env.production` 已经包含正确的 URL。

### 5. 部署

1. 点击 **"Deploy"**
2. 等待部署完成
3. 获得 Vercel 前端 URL：`https://ship-crew-hub.vercel.app`

## 🔍 如何找到 Railway 后端 URL

### 方法 A：在 Railway 服务页面查找
1. 进入 Railway 项目
2. 点击后端服务
3. 查看页面顶部是否有 URL 或 "View Live" 按钮

### 方法 B：生成域名
1. 在 Railway 服务页面查找 **"Generate Domain"** 按钮
2. 或者在 **"Settings"** → **"Domain"** 中添加

### 方法 C：检查 Networking 设置
1. 在服务页面查找 **"Networking"** 标签
2. 查看是否有公网访问配置

## 🎯 完成部署后

1. **前端 URL**: `https://your-app.vercel.app`
2. **后端 URL**: `https://your-app.railway.app`
3. **更新前端环境变量**: 将真实的后端 URL 填入 `VITE_API_URL`

## ✅ 测试连接

部署完成后测试：
- 前端页面能正常加载
- 前端能成功调用后端 API
- 用户注册/登录功能正常

---

**💡 提示：** 如果暂时找不到 Railway URL，可以先部署前端，稍后再更新 API 地址！
