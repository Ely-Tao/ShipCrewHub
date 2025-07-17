#!/bin/zsh

# ShipCrewHub 开发环境安装脚本
# 适用于 macOS 系统

echo "🚀 开始安装 ShipCrewHub 开发环境..."

# 设置错误处理
set -e

# 检查网络连接
echo "🌐 检查网络连接..."
if ! ping -c 1 google.com &> /dev/null; then
    echo "❌ 网络连接失败，请检查网络设置"
    exit 1
fi

# 检查是否安装了 Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ 未找到 Homebrew，正在安装..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # 添加 Homebrew 到 PATH
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
    eval "$(/opt/homebrew/bin/brew shellenv)"
else
    echo "✅ Homebrew 已安装"
fi

# 更新 Homebrew
echo "🔄 更新 Homebrew..."
brew update

# 检查 Node.js 版本
NODE_VERSION=$(node --version 2>/dev/null || echo "v0.0.0")
REQUIRED_VERSION="v18.0.0"

if [[ "$NODE_VERSION" < "$REQUIRED_VERSION" ]]; then
    echo "📦 当前 Node.js 版本: $NODE_VERSION，需要升级到 >= $REQUIRED_VERSION"
    
    # 安装 Node.js (通过 nvm)
    if ! command -v nvm &> /dev/null; then
        echo "📦 安装 nvm..."
        
        # 尝试多个镜像源
        echo "正在尝试从 GitHub 下载 nvm..."
        if ! curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash; then
            echo "GitHub 下载失败，尝试国内镜像..."
            curl -o- https://gitee.com/mirrors/nvm/raw/v0.39.0/install.sh | bash
        fi
        
        # 重新加载配置
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
        
        echo "✅ nvm 安装完成"
    else
        echo "✅ nvm 已安装"
    fi
    
    # 安装和使用 Node.js 18
    echo "📦 安装 Node.js 18..."
    nvm install 18
    nvm use 18
    nvm alias default 18
else
    echo "✅ Node.js 版本符合要求: $NODE_VERSION"
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
echo "2. 验证安装: node --version && npm --version && docker --version"
echo "3. 启动 Docker Desktop 应用程序"
echo "4. 运行项目初始化脚本: ./scripts/init-project.sh"
echo ""
echo "🔧 数据库服务管理命令："
echo "  启动 MySQL: brew services start mysql"
echo "  停止 MySQL: brew services stop mysql"
echo "  启动 Redis: brew services start redis"
echo "  停止 Redis: brew services stop redis"
echo ""
echo "💡 提示: 如果遇到权限问题，请使用 sudo 运行相关命令"
echo "📞 如果遇到问题，请查看项目文档或寻求帮助"
