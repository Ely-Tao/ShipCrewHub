# 🔧 Railway 环境变量紧急设置指南

## ⚠️ 当前问题

- Railway 仍然连接 `::1:3306`（本地地址）
- 没有看到调试日志，说明代码未更新或环境变量未设置

## 🎯 立即行动清单

### 1. 在 Railway 后端服务中设置环境变量

**进入你的 Railway 项目 → 点击后端服务 → Variables 标签页**

**必须添加的变量：**

```
NODE_ENV=production
JWT_SECRET=ShipCrewHub-Production-Secret-2024
MYSQL_URL=mysql://root:TDeqvCPoXpzgilPqlpRCBQXafBYBiBiw@mysql.railway.internal:3306/railway
```

### 2. 检查变量是否正确设置

确认以下变量存在：

- ✅ `NODE_ENV` = `production`
- ✅ `JWT_SECRET` = `ShipCrewHub-Production-Secret-2024`
- ✅ `MYSQL_URL` = `mysql://root:TDeqvCPoXpzgilPqlpRCBQXafBYBiBiw@mysql.railway.internal:3306/railway`

### 3. 强制重新部署

**方法 A - Railway 界面：**

1. 在服务页面点击 **"Settings"**
2. 找到 **"Redeploy"** 按钮
3. 等待重新部署完成

**方法 B - 如果没有 Redeploy 按钮：**

1. 点击 **"Deploy"** 按钮
2. 或者在 **"Deployments"** 标签页触发新部署

### 4. 验证修复成功

重新部署后，查看日志应该显示：

```
🔍 环境变量调试信息:
NODE_ENV: production
MYSQL_URL 存在: true
🚀 使用 Railway 数据库连接
🔍 正在解析数据库 URL...
✅ URL 解析结果:
  - Host: mysql.railway.internal
  - Port: 3306
  - Database: railway
✅ MySQL 连接池创建成功
```

## 🆘 如果环境变量设置后仍然失败

可能的原因：

1. **变量名错误** - 确保是 `MYSQL_URL`（全大写）
2. **URL 格式错误** - 确保复制完整的数据库连接字符串
3. **缓存问题** - 重启 Railway 服务

## 💡 重要提示

- Railway 的环境变量设置后需要重新部署才生效
- 确保 MySQL 数据库服务也在运行状态
- 如果问题持续，可以尝试删除并重新创建环境变量

---

**下一步：** 设置完环境变量后，等待 2-3 分钟让 Railway 重新部署，然后查看日志！
