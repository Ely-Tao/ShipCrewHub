# 🚀 Railway 快速部署指南

这个指南将帮你快速找到 Railway 中添加数据库的正确方法。

## 📋 部署步骤

### 1️⃣ 登录 Railway

- 访问：<https://railway.app>
- 使用 GitHub 账号登录

### 2️⃣ 创建项目

1. 点击 **"Start a New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 找到并选择 `ShipCrewHub`
4. Root Directory 设置为 `backend`

### 3️⃣ 添加数据库（关键步骤）

**在 Railway 新界面中，请按以下步骤操作：**

#### 🔍 寻找添加按钮

在项目页面中寻找以下按钮之一：

- ✅ **"+ New"** 按钮（通常在右上角）
- ✅ **"Add Service"** 按钮（可能在侧边栏）
- ✅ **"+"** 符号的按钮
- ✅ **"Add Database"** 选项

#### 📱 界面可能的位置

```
项目页面布局参考：
┌─────────────────────────────────────┐
│ Project Name     [+ New] [Settings] │  ← 查找这里
├─────────────────────────────────────┤
│ Services:                           │
│ ├── backend (Node.js)               │
│ └── [Add Service] ← 或者这里         │
└─────────────────────────────────────┘
```

#### 🎯 操作步骤

1. **找到添加按钮**后，点击它
2. 选择 **"Database"** 选项
3. 选择 **"MySQL"** 或 **"PostgreSQL"**
4. 等待数据库创建完成（约 1-2 分钟）

### 4️⃣ 设置环境变量

在项目设置中添加：

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-key-123456789
PORT=3000
```

**重要提示：** Railway 会自动添加数据库连接变量，你不需要手动配置！

### 5️⃣ 等待部署

- Railway 自动构建并部署应用
- 完成后会提供一个 URL：`https://xxxx.railway.app`

## 🆘 如果还是找不到按钮

### 方法 1：刷新重试

1. 刷新浏览器页面
2. 重新登录 Railway
3. 检查项目是否创建成功

### 方法 2：使用搜索

1. 按 `Cmd+K` (Mac) 或 `Ctrl+K` (Windows)
2. 搜索 "add mysql" 或 "database"
3. 选择相关选项

### 方法 3：检查项目状态

1. 确保后端服务已成功部署
2. 查看项目的 "Services" 标签页
3. 寻找添加新服务的选项

## ✅ 验证部署成功

部署完成后测试：

- `https://your-app.railway.app/health`
- `https://your-app.railway.app/api/v1/auth/login`

如果能访问这些地址，说明部署成功！

---

**💡 提示：** 如果界面与描述不符，请截图发给我，我可以提供更具体的指导！
