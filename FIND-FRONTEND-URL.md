# 🔍 查找前端 URL 指南

## 在 Vercel 中查找你的前端 URL

### 步骤 1：登录 Vercel

1. 访问：https://vercel.com
2. 点击右上角 "Login"
3. 选择 "Continue with GitHub"

### 步骤 2：找到项目

1. 在 Dashboard 中查看项目列表
2. 找到名为 "ShipCrewHub" 或类似名称的项目
3. 项目卡片上通常会显示 URL

### 步骤 3：获取完整 URL

项目 URL 通常是以下格式之一：

- `https://ship-crew-hub.vercel.app`
- `https://ship-crew-hub-git-main-your-username.vercel.app`
- `https://ship-crew-hub-xxx-your-username.vercel.app`

### 步骤 4：验证 URL

找到 URL 后，直接在浏览器中访问：

- 应该能看到你的前端应用
- 检查页面是否正常加载
- 查看是否有登录/注册功能

## 📱 常见的 Vercel URL 格式

Vercel 自动生成的 URL 格式：

```
https://[项目名]-[git分支]-[用户名].vercel.app
```

或者简化格式：

```
https://[项目名].vercel.app
```

## 🔧 如果找不到 URL

### 检查部署状态

1. 在 Vercel 项目页面查看 "Deployments"
2. 确认最新部署状态为 "Ready"
3. 点击部署记录查看详情

### 重新部署（如果需要）

1. 在项目页面点击 "Redeploy"
2. 等待部署完成
3. 获取新的 URL

## 🎯 找到 URL 后测试

一旦找到前端 URL，请测试：

1. **基础功能**

   - 页面是否正常加载
   - 静态资源是否正常显示

2. **登录功能**

   - 尝试使用测试账号登录：
     - 用户名：`admin`
     - 密码：`admin`

3. **API 连接**
   - 检查浏览器开发者工具 (F12)
   - 查看 Network 标签页
   - 确认 API 请求发送到正确的后端地址

---

**💡 提示：** 如果暂时找不到 URL，也可以截图 Vercel 界面，我来帮你找！
