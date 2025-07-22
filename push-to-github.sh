#!/bin/bash

echo "🚀 准备推送到 GitHub 仓库"
echo "========================="

# 检查是否已经创建了 GitHub 仓库
echo "📋 请确认你已经在 GitHub 上创建了仓库："
echo "   仓库地址应该是: https://github.com/Ely-Tao/ShipCrewHub"
echo ""

read -p "是否已经创建了 GitHub 仓库？(y/n): " created_repo

if [ "$created_repo" != "y" ]; then
    echo ""
    echo "请先创建 GitHub 仓库："
    echo "1. 访问: https://github.com/new"
    echo "2. Repository name: ShipCrewHub"
    echo "3. 选择 Public"
    echo "4. 点击 Create repository"
    echo ""
    echo "创建完成后再运行此脚本"
    exit 1
fi

# 添加远程仓库
echo "🔗 添加远程仓库..."
git remote add origin https://github.com/Ely-Tao/ShipCrewHub.git

if [ $? -eq 0 ]; then
    echo "✅ 远程仓库添加成功"
else
    echo "⚠️  远程仓库可能已存在，继续..."
fi

# 检查是否有未提交的更改
echo "📋 检查本地更改..."
if ! git diff-index --quiet HEAD --; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    git commit -m "feat: prepare for deployment - add deployment configs"
fi

# 推送到 GitHub
echo "⬆️  推送到 GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 成功推送到 GitHub!"
    echo "📱 仓库地址: https://github.com/Ely-Tao/ShipCrewHub"
    echo ""
    echo "🚀 现在可以开始部署了："
    echo "1. 后端部署到 Railway: https://railway.app"
    echo "2. 前端部署到 Vercel: https://vercel.com"
    echo ""
    echo "📖 详细步骤请查看 DEPLOYMENT.md 文件"

    # 询问是否打开部署页面
    read -p "是否打开 Railway 部署页面？(y/n): " open_railway
    if [ "$open_railway" = "y" ]; then
        if command -v open >/dev/null 2>&1; then
            open "https://railway.app/new"
        else
            echo "请手动访问: https://railway.app/new"
        fi
    fi
else
    echo "❌ 推送失败，请检查："
    echo "1. GitHub 仓库是否正确创建"
    echo "2. 网络连接是否正常"
    echo "3. GitHub 访问权限是否正确"
fi
