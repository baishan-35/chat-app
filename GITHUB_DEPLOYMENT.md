# GitHub部署指南

## 概述
本文档详细说明了如何将项目代码推送到GitHub仓库。

## 前置要求

### 1. 安装Git
首先需要在您的系统上安装Git：

1. 访问 [Git官网](https://git-scm.com/downloads)
2. 下载适用于Windows的Git安装包
3. 运行安装程序，使用默认设置即可
4. 安装完成后，重启您的命令行或PowerShell

### 2. 验证Git安装
```bash
git --version
```

### 3. 配置Git用户信息
```bash
git config --global user.name "您的用户名"
git config --global user.email "您的邮箱@example.com"
```

## 创建GitHub仓库

### 1. 登录GitHub
1. 访问 [GitHub](https://github.com)
2. 登录您的账户（如果没有账户，请先注册）

### 2. 创建新仓库
1. 点击右上角的 "+" 号
2. 选择 "New repository"
3. 输入仓库名称（例如：chat-app）
4. 选择仓库可见性（Public或Private）
5. 不要初始化README、.gitignore或license
6. 点击 "Create repository"

## 推送代码到GitHub

### 1. 初始化本地Git仓库
在项目根目录（e:\MyWX）中打开命令行或PowerShell：

```bash
cd e:\MyWX
git init
```

### 2. 添加所有文件到Git
```bash
git add .
```

### 3. 创建初始提交
```bash
git commit -m "初始提交"
```

### 4. 设置主分支名称
```bash
git branch -M main
```

### 5. 添加远程仓库地址
将下面的URL替换为您在GitHub上创建的仓库URL：
```bash
git remote add origin https://github.com/您的用户名/chat-app.git
```

### 6. 推送代码到GitHub
```bash
git push -u origin main
```

## 后续更新

### 推送后续更改
当您对代码进行修改后，可以使用以下命令推送更新：

```bash
# 添加更改的文件
git add .

# 创建提交
git commit -m "描述您的更改"

# 推送到GitHub
git push
```

## 忽略文件配置

为了防止不必要的文件被推送到GitHub，建议创建一个`.gitignore`文件：

```bash
# 在项目根目录创建.gitignore文件
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".next/" >> .gitignore
echo "backend/uploads/" >> .gitignore
echo "*.log" >> .gitignore
```

## 常见问题解决

### 1. 推送失败
如果推送时出现权限错误，可能需要使用SSH密钥或个人访问令牌：

#### 使用个人访问令牌
1. 在GitHub上生成个人访问令牌
2. 使用以下URL格式推送：
```bash
git remote set-url origin https://用户名:令牌@github.com/用户名/仓库名.git
```

### 2. 推送大文件失败
如果项目包含大文件，可能需要使用Git LFS：

1. 安装Git LFS：
```bash
git lfs install
```

2. 跟踪大文件类型：
```bash
git lfs track "*.zip"
git lfs track "*.mp4"
```

3. 提交并推送：
```bash
git add .gitattributes
git commit -m "添加Git LFS配置"
git push
```

## 最佳实践

### 1. 分支管理
```bash
# 创建新分支
git checkout -b feature-branch

# 切换分支
git checkout main

# 合并分支
git merge feature-branch
```

### 2. 提交信息规范
- 使用清晰、简洁的提交信息
- 以动词开头（如：添加、修复、更新等）
- 避免使用无意义的提交信息（如："更新"、"修复"）

### 3. 定期推送
定期将代码推送到远程仓库，以防本地数据丢失。

## 参考资源

- [Git官方文档](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)