#!/bin/bash

# ShipCrewHub 开发环境安装脚本
# 适用于 macOS 系统

echo "🚀 开始安装 ShipCrewHub 开发环境..."

# 检查是否安装了 Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ 未找到 Homebrew，正在安装..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew 已安装"
fi

# 更新 Homebrew
echo "🔄 更新 Homebrew..."
brew update

# 安装 Node.js (通过 nvm)
if ! command -v nvm &> /dev/null; then
    echo "📦 安装 nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    source ~/.zshrc
    nvm install 18
    nvm use 18
    nvm alias default 18
else
    echo "✅ nvm 已安装"
fi

# 安装 Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 安装 Docker..."
    brew install --cask docker
    echo "⚠️  请手动启动 Docker Desktop 应用程序"
else
    echo "✅ Docker 已安装"
fi

# 安装 MySQL
if ! command -v mysql &> /dev/null; then
    echo "🗄️  安装 MySQL..."
    brew install mysql
    echo "🔧 启动 MySQL 服务..."
    brew services start mysql
else
    echo "✅ MySQL 已安装"
fi

# 安装 Redis
if ! command -v redis-server &> /dev/null; then
    echo "💾 安装 Redis..."
    brew install redis
    echo "🔧 启动 Redis 服务..."
    brew services start redis
else
    echo "✅ Redis 已安装"
fi

# 安装其他开发工具
echo "🛠️  安装开发工具..."
brew install git
brew install wget
brew install curl

echo "🎉 开发环境安装完成！"
echo ""
echo "📋 接下来的步骤："
echo "1. 重新加载终端配置: source ~/.zshrc"
echo "2. 验证安装: node --version && npm --version"
echo "3. 启动 Docker Desktop 应用程序"
echo "4. 运行项目初始化脚本"
echo ""
echo "💡 提示: 如果遇到权限问题，请使用 sudo 运行相关命令"
