# 🧪 ShipCrewHub 部署验证测试

## 🌐 部署地址

- **前端**: https://ship-crew-lh4amsnf7-ely-taos-projects.vercel.app/
- **后端**: https://shipcrewhub-production.up.railway.app

## 📋 验证清单

### 1. 后端 API 测试

#### 基础端点测试

- [ ] 健康检查：`https://shipcrewhub-production.up.railway.app/health`
- [ ] API 根路径：`https://shipcrewhub-production.up.railway.app/api/v1`
- [ ] CORS 配置：检查是否允许前端域名访问

#### 认证相关 API

- [ ] 用户注册：`POST /api/v1/auth/register`
- [ ] 用户登录：`POST /api/v1/auth/login`
- [ ] 获取用户信息：`GET /api/v1/auth/me`

#### 数据库连接测试

- [ ] 数据库连接正常（从 Railway 日志确认）
- [ ] 能够创建新用户
- [ ] 能够查询用户数据

### 2. 前端应用测试

#### 页面加载测试

- [ ] 首页正常加载
- [ ] 登录页面可访问
- [ ] 注册页面可访问
- [ ] 静态资源（CSS、JS、图片）正常加载

#### 功能交互测试

- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 前后端 API 调用成功
- [ ] 错误处理正常显示

### 3. 网络和安全测试

#### HTTPS 和证书

- [ ] 前端使用 HTTPS (Vercel 自动提供)
- [ ] 后端使用 HTTPS (Railway 自动提供)
- [ ] 无混合内容警告

#### CORS 配置

- [ ] 前端能成功调用后端 API
- [ ] 无 CORS 错误
- [ ] 预检请求正常

## 🔧 快速测试命令

### 测试后端健康状态

```bash
curl https://shipcrewhub-production.up.railway.app/health
```

### 测试 API 连通性

```bash
curl https://shipcrewhub-production.up.railway.app/api/v1
```

### 测试用户注册 API

```bash
curl -X POST https://shipcrewhub-production.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

## 🎯 验证步骤

### 步骤 1：后端验证

1. 访问健康检查端点
2. 确认返回 200 状态码
3. 检查 Railway 日志无错误

### 步骤 2：前端验证

1. 访问前端首页
2. 检查页面正常加载
3. 检查浏览器控制台无错误

### 步骤 3：前后端集成验证

1. 在前端尝试注册新用户
2. 确认能成功调用后端 API
3. 验证数据能正确保存到数据库

### 步骤 4：完整流程验证

1. 注册新用户 → 登录 → 使用应用功能
2. 确认整个用户体验流畅

## ⚠️ 常见问题排查

### 如果前端无法调用后端：

1. 检查 CORS 配置
2. 确认 API URL 正确
3. 检查网络请求状态码

### 如果 API 返回错误：

1. 查看 Railway 后端日志
2. 检查数据库连接状态
3. 验证请求数据格式

### 如果页面加载慢：

1. 检查静态资源 CDN
2. 优化图片和 JS 文件大小
3. 启用 gzip 压缩

---

**🎉 成功标准：**

- 后端 API 正常响应
- 前端页面正常加载
- 用户可以注册和登录
- 前后端数据交互正常
