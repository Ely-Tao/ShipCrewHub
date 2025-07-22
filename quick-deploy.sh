#!/bin/bash

echo "🚀 ShipCrewHub 一键部署准备脚本"
echo "================================"

# 检查 Git 状态
echo "📋 检查 Git 状态..."
if [ ! -d ".git" ]; then
    echo "❌ 请先初始化 Git 仓库"
    echo "运行: git init && git add . && git commit -m 'Initial commit'"
    exit 1
fi

# 检查是否有 GitHub 仓库
echo "📋 检查 GitHub 仓库..."
git_remote=$(git remote get-url origin 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "⚠️  请先创建 GitHub 仓库并添加 remote"
    echo "1. 在 GitHub 创建新仓库"
    echo "2. 运行: git remote add origin https://github.com/yourusername/ShipCrewHub.git"
    echo "3. 运行: git push -u origin main"
fi

# 确保所有文件都已提交
echo "📋 检查 Git 提交状态..."
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  有未提交的更改，请先提交："
    echo "git add . && git commit -m 'Prepare for deployment'"
fi

echo ""
echo "✅ 部署准备就绪！"
echo ""
echo "🎯 下一步部署流程："
echo ""
echo "1️⃣  后端部署到 Railway:"
echo "   • 访问: https://railway.app"
echo "   • 点击 'Start a New Project'"
echo "   • 选择 'Deploy from GitHub repo'"
echo "   • 选择你的 ShipCrewHub 仓库"
echo "   • 设置 Root Directory: backend"
echo "   • 添加环境变量:"
echo "     NODE_ENV=production"
echo "     JWT_SECRET=your-super-secret-key"
echo "   • 添加 MySQL 数据库服务"
echo ""
echo "2️⃣  前端部署到 Vercel:"
echo "   • 访问: https://vercel.com"
echo "   • 点击 'New Project'"
echo "   • 选择你的 GitHub 仓库"
echo "   • 设置 Root Directory: frontend"
echo "   • 添加环境变量:"
echo "     VITE_API_URL=你的Railway后端URL"
echo ""
echo "📝 详细部署指南请查看 DEPLOYMENT.md 文件"
echo ""

# 打开部署指南
if command -v open >/dev/null 2>&1; then
    echo "📖 正在打开部署指南..."
    open DEPLOYMENT.md 2>/dev/null || echo "请手动查看 DEPLOYMENT.md 文件"
fi
