# 快速开始指南

## 🎯 项目基础设置完成情况

✅ **已完成**：
- [x] 项目目录结构创建
- [x] Git仓库初始化
- [x] 基础配置文件创建
- [x] 开发环境脚本准备
- [x] Docker开发环境配置
- [x] 编辑器配置

## 🚀 接下来的步骤

### 1. 环境检查和安装

您的当前环境：
- ✅ Node.js v22.16.0 (满足 >= 18.0 要求)
- ✅ npm v10.9.2
- ✅ Git v2.39.5
- ❌ Docker (需要安装)
- ❌ MySQL (需要安装)
- ❌ Redis (需要安装)

### 2. 安装必要工具

```bash
# 运行环境安装脚本
./scripts/setup-dev-env.sh

# 或手动安装：
# 安装 Docker Desktop
# 从官网下载: https://www.docker.com/products/docker-desktop/

# 使用 Homebrew 安装其他工具
brew install mysql redis

# 启动服务
brew services start mysql
brew services start redis
```

### 3. 项目初始化

```bash
# 运行项目初始化脚本
./scripts/init-project.sh

# 或手动执行：
# 1. 复制环境配置
cp .env.example .env

# 2. 启动数据库服务
cd docker/development
docker-compose up -d mysql redis

# 3. 初始化后端和前端项目
```

### 4. 验证安装

```bash
# 检查服务状态
docker-compose -f docker/development/docker-compose.yml ps

# 检查数据库连接
mysql -h localhost -u root -p

# 检查Redis连接
redis-cli ping
```

### 5. 开发工具访问

安装完成后，您可以访问：
- 📊 **phpMyAdmin**: http://localhost:8080
- 💾 **Redis Commander**: http://localhost:8081

## 📁 项目结构说明

```
ShipCrewHub/
├── 📁 backend/                 # 后端服务
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # 控制器 (处理HTTP请求)
│   │   ├── 📁 services/        # 业务逻辑服务
│   │   ├── 📁 models/          # 数据模型 (TypeORM实体)
│   │   ├── 📁 middleware/      # 中间件 (认证、日志等)
│   │   ├── 📁 routes/          # 路由定义
│   │   ├── 📁 utils/           # 工具函数
│   │   └── 📁 types/           # TypeScript类型定义
│   └── 📁 tests/               # 测试文件
├── 📁 frontend/                # 前端应用
│   └── 📁 src/
│       ├── 📁 components/      # React组件
│       ├── 📁 pages/           # 页面组件
│       ├── 📁 services/        # API服务
│       ├── 📁 hooks/           # 自定义Hook
│       ├── 📁 types/           # TypeScript类型
│       └── 📁 utils/           # 工具函数
├── 📁 database/                # 数据库相关
│   ├── 📁 migrations/          # 数据库迁移脚本
│   ├── 📁 seeds/               # 初始数据
│   └── 📁 schemas/             # 数据库结构
├── 📁 docker/                  # Docker配置
│   ├── 📁 development/         # 开发环境
│   └── 📁 production/          # 生产环境
├── 📁 scripts/                 # 脚本工具
└── 📁 docs/                    # 项目文档
```

## 🛠️ 开发工具选择理由

### 为什么选择这些技术？

1. **Node.js + TypeScript**
   - 全栈JavaScript开发，技术栈统一
   - TypeScript提供类型安全，减少运行时错误
   - 丰富的生态系统和社区支持

2. **React + Ant Design**
   - React是目前最流行的前端框架
   - Ant Design提供企业级UI组件
   - 适合构建复杂的管理系统

3. **MySQL + Redis**
   - MySQL适合存储结构化数据
   - Redis提供高性能缓存
   - 两者结合提供完整的数据存储方案

4. **Docker**
   - 环境一致性保证
   - 简化部署流程
   - 便于团队协作

## 🔧 配置文件说明

- **`.env.example`**: 环境变量模板，包含所有必要的配置项
- **`.gitignore`**: Git忽略文件配置
- **`.editorconfig`**: 编辑器配置，统一代码风格
- **`.gitattributes`**: Git属性配置，处理文件类型

## 💡 开发建议

1. **使用推荐的VSCode扩展**
   - 项目已配置推荐扩展列表
   - 这些扩展能提供更好的开发体验

2. **遵循Git提交规范**
   - 使用 feat/fix/docs 等前缀
   - 提交信息要清晰明确

3. **环境变量管理**
   - 敏感信息不要提交到代码仓库
   - 使用 .env 文件管理本地配置

## 🆘 常见问题

### Q: Docker启动失败怎么办？
A: 确保Docker Desktop已启动，检查端口是否被占用

### Q: 数据库连接失败？
A: 检查MySQL服务是否启动，端口配置是否正确

### Q: 权限问题？
A: 在macOS上可能需要使用sudo，或者调整文件权限

## 📞 获取帮助

如果遇到问题，请：
1. 检查错误日志
2. 查看相关文档
3. 在团队群里提问
4. 提交Issue到代码仓库

---

**下一步**: 准备开始 [1.2 项目架构搭建](./docs/development/phase-1-2.md)
