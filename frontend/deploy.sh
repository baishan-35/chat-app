#!/bin/bash

# 部署到Vercel的脚本

echo "正在部署到Vercel..."

# 确保在frontend目录中
cd "$(dirname "$0")"

# 验证Vercel CLI是否已安装
if ! command -v vercel &> /dev/null
then
    echo "Vercel CLI未安装，请先运行: npm install -g vercel"
    exit 1
fi

# 部署到Vercel
echo "开始部署..."
vercel --prod

echo "部署完成！请检查终端输出以获取预览URL。"