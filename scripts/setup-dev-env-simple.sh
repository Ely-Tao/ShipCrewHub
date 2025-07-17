#!/bin/zsh

# ShipCrewHub 简化环境安装脚本
# 解决常见的 macOS 环境问题

echo "🚀 开始安装 ShipCrewHub 开发环境 (简化版)..."

# 检查并安装 Homebrew
install_homebrew() {
    if ! command -v brew &> /dev/null; then
        echo "📦 安装 Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # 添加到 PATH
        if [[ -f "/opt/homebrew/bin/brew" ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
            eval "$(/opt/homebrew/bin/brew shellenv)"
        elif [[ -f "/usr/local/bin/brew" ]]; then
            echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
            eval "$(/usr/local/bin/brew shellenv)"
        fi
        
        echo "✅ Homebrew 安装完成"
    else
        echo "✅ Homebrew 已安装"
    fi
}

# 安装 Docker Desktop
install_docker() {
    if ! command -v docker &> /dev/null; then
        echo "🐳 安装 Docker Desktop..."
        brew install --cask docker
        echo "⚠️  请手动启动 Docker Desktop 应用程序"
        echo "   可以在 Applications 文件夹中找到 Docker 应用"
    else
        echo "✅ Docker 已安装"
    fi
}

# 安装 MySQL
install_mysql() {
    if ! command -v mysql &> /dev/null; then
        echo "🗄️  安装 MySQL..."
        brew install mysql
        echo "🔧 启动 MySQL 服务..."
        brew services start mysql
        
        # 设置 MySQL 安全配置
        echo "🔐 MySQL 安装完成，请记住以下信息："
        echo "   - 默认用户: root"
        echo "   - 默认密码: (空)"
        echo "   - 连接命令: mysql -u root"
    else
        echo "✅ MySQL 已安装"
    fi
}

# 安装 Redis
install_redis() {
    if ! command -v redis-server &> /dev/null; then
        echo "💾 安装 Redis..."
        brew install redis
        echo "🔧 启动 Redis 服务..."
        brew services start redis
        
        echo "✅ Redis 安装完成"
        echo "   - 默认端口: 6379"
        echo "   - 连接命令: redis-cli"
    else
        echo "✅ Redis 已安装"
    fi
}

# 检查 Node.js 版本
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo "✅ Node.js 已安装: $NODE_VERSION"
        
        # 检查版本是否符合要求
        if [[ "$NODE_VERSION" < "v18.0.0" ]]; then
            echo "⚠️  建议升级到 Node.js 18+ 以获得更好的性能"
        fi
    else
        echo "❌ Node.js 未找到"
    fi
}

# 主安装流程
main() {
    echo "🔍 检查当前环境..."
    
    # 检查当前已安装的工具
    check_nodejs
    
    # 安装缺失的工具
    install_homebrew
    install_docker
    install_mysql
    install_redis
    
    echo ""
    echo "🎉 环境安装完成！"
    echo ""
    echo "📋 验证安装："
    echo "  Node.js: $(node --version 2>/dev/null || echo '未安装')"
    echo "  npm: $(npm --version 2>/dev/null || echo '未安装')"
    echo "  Docker: $(docker --version 2>/dev/null || echo '未安装或未启动')"
    echo "  MySQL: $(mysql --version 2>/dev/null || echo '未安装')"
    echo "  Redis: $(redis-server --version 2>/dev/null || echo '未安装')"
    echo ""
    echo "🔧 服务状态："
    echo "  MySQL: $(brew services list | grep mysql || echo '未启动')"
    echo "  Redis: $(brew services list | grep redis || echo '未启动')"
    echo ""
    echo "📱 接下来："
    echo "1. 启动 Docker Desktop 应用程序"
    echo "2. 运行: ./scripts/init-project.sh"
    echo "3. 如有问题，请查看 docs/QUICKSTART.md"
}

# 运行主程序
main
