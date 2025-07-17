#!/bin/zsh

# ShipCrewHub 项目初始化脚本 (简化版)

echo "🚀 开始初始化 ShipCrewHub 项目..."

# 检查必要工具
check_requirements() {
    echo "🔍 检查环境要求..."
    
    local missing_tools=()
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("Node.js")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    if ! command -v mysql &> /dev/null; then
        missing_tools+=("MySQL")
    fi
    
    if ! command -v redis-server &> /dev/null; then
        missing_tools+=("Redis")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_tools+=("Docker")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo "❌ 缺少必要工具: ${missing_tools[*]}"
        echo "请运行: ./scripts/setup-dev-env-simple.sh"
        exit 1
    fi
    
    echo "✅ 所有必要工具已安装"
}

# 创建环境配置文件
setup_env() {
    echo "📄 设置环境配置..."
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo "✅ 已创建 .env 文件"
    else
        echo "⚠️  .env 文件已存在，跳过创建"
    fi
}

# 测试数据库连接
test_database() {
    echo "🔍 测试数据库连接..."
    
    # 测试 MySQL
    if mysql -u root -e "SELECT 1" &> /dev/null; then
        echo "✅ MySQL 连接成功"
    else
        echo "❌ MySQL 连接失败"
        echo "请运行: brew services start mysql"
        exit 1
    fi
    
    # 测试 Redis
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis 连接成功"
    else
        echo "❌ Redis 连接失败"
        echo "请运行: brew services start redis"
        exit 1
    fi
}

# 创建开发数据库
create_database() {
    echo "🗄️  创建开发数据库..."
    
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS shipcrewdb_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ 数据库 shipcrewdb_dev 创建成功"
    else
        echo "❌ 数据库创建失败"
        exit 1
    fi
}

# 初始化后端项目
init_backend() {
    echo "🔧 初始化后端项目..."
    
    cd backend
    
    if [ ! -f "package.json" ]; then
        # 创建 package.json
        cat > package.json << 'EOF'
{
  "name": "shipcrewdb-backend",
  "version": "1.0.0",
  "description": "ShipCrewHub Backend API",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "keywords": ["api", "express", "typescript"],
  "author": "ShipCrewHub Team",
  "license": "MIT"
}
EOF
        echo "✅ 创建后端 package.json"
    fi
    
    # 安装依赖
    echo "📦 安装后端依赖..."
    npm install express cors helmet morgan dotenv bcryptjs jsonwebtoken mysql2 redis joi winston multer
    npm install -D @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer typescript ts-node nodemon eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier jest @types/jest
    
    cd ..
}

# 初始化前端项目
init_frontend() {
    echo "🎨 初始化前端项目..."
    
    cd frontend
    
    if [ ! -f "package.json" ]; then
        echo "📦 创建 React 项目..."
        npm create vite@latest . -- --template react-ts
    fi
    
    # 安装依赖
    echo "📦 安装前端依赖..."
    npm install
    npm install antd @reduxjs/toolkit react-redux axios dayjs lodash @types/lodash
    
    cd ..
}

# 启动开发服务器提示
show_next_steps() {
    echo ""
    echo "🎉 项目初始化完成！"
    echo ""
    echo "📋 接下来可以："
    echo "1. 启动后端开发服务器:"
    echo "   cd backend && npm run dev"
    echo ""
    echo "2. 启动前端开发服务器:"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "3. 访问应用:"
    echo "   - 后端 API: http://localhost:3000"
    echo "   - 前端应用: http://localhost:5173"
    echo ""
    echo "4. 数据库管理:"
    echo "   - 连接命令: mysql -u root shipcrewdb_dev"
    echo "   - Redis 命令: redis-cli"
    echo ""
    echo "📚 查看文档: docs/QUICKSTART.md"
}

# 主函数
main() {
    check_requirements
    setup_env
    test_database
    create_database
    init_backend
    init_frontend
    show_next_steps
}

# 运行主程序
main
