@echo off
title 部署到Vercel

echo 正在部署到Vercel...

cd /d "%~dp0"

where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI未安装，请先运行: npm install -g vercel
    pause
    exit /b 1
)

echo 开始部署...
vercel --prod

echo 部署完成！请检查终端输出以获取预览URL。
pause