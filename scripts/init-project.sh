#!/bin/bash

# ShipCrewHub 项目初始化脚本

echo "🚀 开始初始化 ShipCrewHub 项目..."

# 检查是否在项目根目录
if [ ! -f "README.md" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ 需要 Node.js 版本 >= $REQUIRED_VERSION，当前版本: $NODE_VERSION"
    exit 1
fi

# 复制环境配置文件
echo "📄 创建环境配置文件..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
else
    echo "⚠️  .env 文件已存在，跳过"
fi

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请启动 Docker Desktop"
    exit 1
fi

# 启动数据库服务
echo "🐳 启动数据库服务..."
cd docker/development
docker-compose up -d mysql redis
cd ../..

# 等待数据库服务启动
echo "⏳ 等待数据库服务启动..."
sleep 10

# 检查数据库连接
echo "🔍 检查数据库连接..."
until docker-compose -f docker/development/docker-compose.yml exec mysql mysqladmin ping -h localhost --silent; do
    echo "等待 MySQL 启动..."
    sleep 2
done

# 创建后端项目
echo "🔧 初始化后端项目..."
cd backend
if [ ! -f "package.json" ]; then
    npm init -y
    echo "✅ 已创建后端 package.json"
else
    echo "⚠️  后端 package.json 已存在，跳过"
fi

# 安装后端依赖
echo "📦 安装后端依赖..."
npm install express cors helmet morgan dotenv bcryptjs jsonwebtoken
npm install -D @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken typescript ts-node nodemon eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier

cd ..

# 创建前端项目
echo "🎨 初始化前端项目..."
cd frontend
if [ ! -f "package.json" ]; then
    npm create vite@latest . -- --template react-ts
    echo "✅ 已创建前端项目"
else
    echo "⚠️  前端项目已存在，跳过"
fi

# 安装前端依赖
echo "📦 安装前端依赖..."
npm install antd @reduxjs/toolkit react-redux axios dayjs lodash
npm install -D @types/lodash

cd ..

# 创建 Git 提交
echo "📝 创建初始提交..."
git add .
git commit -m "feat: 初始化项目结构和开发环境配置"

echo "🎉 项目初始化完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 启动数据库管理界面:"
echo "   - phpMyAdmin: http://localhost:8080"
echo "   - Redis Commander: http://localhost:8081"
echo ""
echo "2. 开发服务器:"
echo "   cd backend && npm run dev"
echo "   cd frontend && npm run dev"
echo ""
echo "3. 数据库连接信息:"
echo "   Host: localhost:3306"
echo "   Database: shipcrewdb_dev"
echo "   Username: root"
echo "   Password: rootpassword"
echo ""
echo "4. 开始开发:"
echo "   - 后端 API: http://localhost:3000"
echo "   - 前端应用: http://localhost:5173"
