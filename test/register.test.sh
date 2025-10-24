#!/bin/bash

# 用户注册API测试脚本
# 使用curl测试注册端点

echo "=== 用户注册API测试 ==="

# 测试用例1: 成功注册
echo "测试用例1: 成功注册"
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "测试用户"
  }' \
  -c cookies.txt

echo -e "\n"

# 测试用例2: 缺少必要字段
echo "测试用例2: 缺少必要字段"
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com"
  }'

echo -e "\n"

# 测试用例3: 重复邮箱注册
echo "测试用例3: 重复邮箱注册"
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "测试用户2"
  }'

echo -e "\n"

# 测试用例4: 无效邮箱格式
echo "测试用例4: 无效邮箱格式"
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "name": "测试用户3"
  }'

echo -e "\n=== 测试完成 ==="