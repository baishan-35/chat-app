// 朋友圈API接口测试脚本
const { default: fetch } = require('node-fetch');
const fs = require('fs');
const path = require('path');

console.log('开始测试朋友圈API接口...');

// 测试基础URL
const BASE_URL = 'http://localhost:3001/api';

// 模拟用户登录获取令牌
async function getTestToken() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    if (data.success && data.data && data.data.accessToken) {
      console.log('✅ 获取测试令牌成功');
      return data.data.accessToken;
    } else {
      console.log('❌ 获取测试令牌失败:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ 获取测试令牌错误:', error.message);
    return null;
  }
}

// 测试创建动态
async function testCreatePost(token) {
  try {
    console.log('\n--- 测试创建动态 ---');
    
    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Cookie': `accessToken=${token}`
      },
      body: JSON.stringify({
        content: '测试动态内容'
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ 创建动态成功');
      console.log('动态ID:', data.data.id);
      return data.data.id;
    } else {
      console.log('❌ 创建动态失败:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ 创建动态错误:', error.message);
    return null;
  }
}

// 测试获取动态列表
async function testGetPosts(token) {
  try {
    console.log('\n--- 测试获取动态列表 ---');
    
    const response = await fetch(`${BASE_URL}/posts?page=1&limit=5`, {
      method: 'GET',
      headers: {
        'Cookie': `accessToken=${token}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ 获取动态列表成功');
      console.log('动态数量:', data.data.posts.length);
      return data.data.posts.length > 0 ? data.data.posts[0].id : null;
    } else {
      console.log('❌ 获取动态列表失败:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ 获取动态列表错误:', error.message);
    return null;
  }
}

// 测试点赞功能
async function testLikePost(token, postId) {
  if (!postId) {
    console.log('❌ 无法测试点赞功能：缺少帖子ID');
    return;
  }
  
  try {
    console.log('\n--- 测试点赞功能 ---');
    
    const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
      method: 'POST',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ 点赞操作成功');
      console.log('操作结果:', data.data.message);
    } else {
      console.log('❌ 点赞操作失败:', data.message);
    }
  } catch (error) {
    console.log('❌ 点赞操作错误:', error.message);
  }
}

// 测试添加评论
async function testAddComment(token, postId) {
  if (!postId) {
    console.log('❌ 无法测试评论功能：缺少帖子ID');
    return;
  }
  
  try {
    console.log('\n--- 测试添加评论 ---');
    
    const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Cookie': `accessToken=${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: '这是一条测试评论'
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ 添加评论成功');
      console.log('评论内容:', data.data.content);
    } else {
      console.log('❌ 添加评论失败:', data.message);
    }
  } catch (error) {
    console.log('❌ 添加评论错误:', error.message);
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始朋友圈API接口测试...\n');
  
  // 获取测试令牌
  const token = await getTestToken();
  if (!token) {
    console.log('❌ 无法继续测试：获取令牌失败');
    return;
  }
  
  // 测试创建动态
  const postId = await testCreatePost(token);
  
  // 测试获取动态列表
  await testGetPosts(token);
  
  // 测试点赞功能
  await testLikePost(token, postId);
  
  // 测试添加评论
  await testAddComment(token, postId);
  
  console.log('\n🎉 API接口测试完成！');
}

// 执行测试
runTests();