# 使用官方Node.js运行时作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json（如果存在）
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 3001 3007

# 启动应用
CMD ["sh", "-c", "npx prisma db push && npm start"]