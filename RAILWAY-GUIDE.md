# 📚 Railway 部署详细步骤指南

## 🚀 第一步：部署后端到 Railway

### 1. 创建 Railway 账号并登录

- 访问：https://railway.app
- 使用 GitHub 账号登录（推荐）

### 2. 创建新项目

1. 点击 **"Start a New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择你的仓库：`Ely-Tao/ShipCrewHub`
4. 在配置页面：
   - **Root Directory**: 设置为 `backend`
   - **Build Command**: `npm run build`（通常自动识别）
   - **Start Command**: `npm start`（通常自动识别）

### 3. 添加数据库（重要步骤）

Railway 界面更新后，添加数据库的方法：

#### 方法 A：通过项目面板

1. 在项目主页面，查找 **"+ New"** 按钮（通常在右上角）
2. 点击后选择 **"Database"**
3. 选择 **"Add MySQL"**
4. 等待数据库创建完成

#### 方法 B：如果找不到上述按钮

1. 在项目页面左侧或底部查找 **"Add Service"** 按钮
2. 或者查找带有 **"+"** 符号的按钮
3. 选择 **"MySQL"** 或 **"PostgreSQL"**

#### 方法 C：通过命令面板

1. 按 `Cmd+K`（Mac）或 `Ctrl+K`（Windows）打开命令面板
2. 搜索 "Add MySQL" 或 "Database"
3. 选择相应选项

### 4. 配置环境变量

添加以下环境变量（在项目设置中）：

```
NODE_ENV=production
JWT_SECRET=your-super-secret-key-123456789
PORT=3000
```

**注意：**

- Railway 会自动添加数据库连接变量（如 `DATABASE_URL` 或 `MYSQL_URL`）
- 你不需要手动配置数据库连接字符串

### 5. 等待部署完成

- Railway 会自动构建和部署你的应用
- 部署完成后会提供一个 URL，类似：`https://your-app-name.railway.app`

## 💡 常见问题解决

### 如果找不到"Add Service"按钮：

1. **刷新页面** - 有时界面需要刷新
2. **检查项目状态** - 确保项目已成功创建
3. **查看项目设置** - 在项目设置中可能有添加服务的选项
4. **使用搜索** - 在页面顶部搜索框搜索 "database" 或 "mysql"

### 如果部署失败：

1. 检查 `backend/package.json` 中的脚本
2. 确保 `build` 和 `start` 命令正确
3. 查看 Railway 的构建日志获取错误信息

### 数据库连接问题：

1. Railway 自动提供数据库连接信息
2. 在代码中使用 `process.env.DATABASE_URL` 或 `process.env.MYSQL_URL`
3. 如果使用 MySQL，确保你的代码支持 SSL 连接

## 🎯 验证部署成功

部署完成后，访问：

- `https://your-app-name.railway.app/health` - 健康检查
- `https://your-app-name.railway.app/api/v1/auth/login` - API 测试

如果这些地址能正常访问，说明后端部署成功！
