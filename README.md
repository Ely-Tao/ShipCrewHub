# ShipCrewHub - 公司内部人员管理系统

## 项目简介

ShipCrewHub 是一个专为海运公司设计的内部人员管理系统，支持船员和岸基人员的统一管理，包括人员信息、年假计算、证书管理、休假审批等功能。

## 技术栈

### 后端
- Node.js 18+ 
- Express.js
- TypeScript
- MySQL 8.0
- Redis 7.0
- JWT 认证

### 前端
- React 18
- TypeScript
- Ant Design 5.0
- Redux Toolkit
- Vite

## 项目结构

```
ShipCrewHub/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── services/        # 业务逻辑
│   │   ├── models/          # 数据模型
│   │   ├── middleware/      # 中间件
│   │   ├── routes/          # 路由
│   │   ├── utils/           # 工具函数
│   │   └── types/           # 类型定义
│   ├── tests/               # 测试文件
│   └── package.json
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/           # 页面
│   │   ├── services/        # API服务
│   │   ├── hooks/           # 自定义Hook
│   │   ├── types/           # 类型定义
│   │   └── utils/           # 工具函数
│   └── package.json
├── database/                # 数据库脚本
│   ├── migrations/          # 迁移脚本
│   ├── seeds/               # 种子数据
│   └── schemas/             # 表结构
├── docs/                    # 项目文档
│   ├── api/                 # API文档
│   ├── database/            # 数据库文档
│   └── deployment/          # 部署文档
├── docker/                  # Docker配置
│   ├── development/         # 开发环境
│   └── production/          # 生产环境
└── scripts/                 # 脚本工具
```

## 开发环境要求

- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 7.0
- Docker >= 20.10
- Git >= 2.30

## 快速开始

### 1. 环境检查
```bash
node --version
npm --version
docker --version
mysql --version
redis-server --version
```

### 2. 安装依赖
```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

### 3. 数据库设置
```bash
# 启动MySQL和Redis
docker-compose up -d mysql redis

# 运行数据库迁移
cd backend
npm run migrate
```

### 4. 启动开发服务器
```bash
# 启动后端服务
cd backend
npm run dev

# 启动前端服务
cd frontend
npm run dev
```

## 开发规范

### 代码风格
- 使用 ESLint + Prettier 进行代码格式化
- 使用 TypeScript 进行类型检查
- 遵循 Conventional Commits 规范

### 分支管理
- `main`: 生产环境代码
- `develop`: 开发环境代码
- `feature/*`: 功能开发分支
- `hotfix/*`: 紧急修复分支

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

## 许可证

MIT License

## 联系方式

- 项目负责人: [Your Name]
- 邮箱: [your.email@company.com]
- 项目地址: [https://github.com/yourcompany/ShipCrewHub]
