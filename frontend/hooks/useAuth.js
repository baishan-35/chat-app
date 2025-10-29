import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login: loginStore, logout: logoutStore } = useAuthStore()

  /**
   * 尝试调用主登录端点
   * @param {Object} credentials - 登录凭证 {email, password}
   * @returns {Promise<Object>} 登录结果
   */
  const tryPrimaryLogin = async (credentials) => {
    try {
      console.log('尝试主登录端点: /api/auth/login')
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('服务器返回非JSON响应')
      }

      const result = await response.json()

      // 检查业务逻辑是否成功
      if (!result.success) {
        throw new Error(result.message || '登录失败')
      }

      return result
    } catch (err) {
      console.error('主登录端点失败:', err)
      throw err
    }
  }

  /**
   * 尝试调用降级登录端点
   * @param {Object} credentials - 登录凭证 {email, password}
   * @returns {Promise<Object>} 登录结果
   */
  const tryFallbackLogin = async (credentials) => {
    try {
      console.log('尝试降级登录端点: /api/auth/simple-login')
      
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      // 降级端点永远返回200，无需检查状态
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('降级端点返回非JSON响应')
      }

      const result = await response.json()

      // 降级端点总是返回成功
      if (!result.success) {
        throw new Error(result.message || '降级登录失败')
      }

      return result
    } catch (err) {
      console.error('降级登录端点失败:', err)
      throw err
    }
  }

  /**
   * 登录方法 - 带重试机制
   * @param {Object} credentials - 登录凭证 {email, password}
   * @returns {Promise<Object>} 登录结果
   */
  const login = async (credentials) => {
    try {
      setIsLoading(true)
      setError(null)

      // 验证输入
      if (!credentials || !credentials.email || !credentials.password) {
        throw new Error('请提供邮箱和密码')
      }

      let result = null
      let lastError = null

      // 第一步：尝试主登录端点
      try {
        result = await tryPrimaryLogin(credentials)
        console.log('主登录端点成功')
      } catch (primaryError) {
        console.warn('主登录端点失败，尝试降级端点')
        lastError = primaryError

        // 第二步：主端点失败，尝试降级端点
        try {
          result = await tryFallbackLogin(credentials)
          console.log('降级登录端点成功')
        } catch (fallbackError) {
          console.error('降级端点也失败了')
          lastError = fallbackError
        }
      }

      // 如果所有端点都失败
      if (!result) {
        throw lastError || new Error('登录失败，请稍后重试')
      }

      // 更新认证状态
      if (result.data && result.data.user && result.data.accessToken) {
        console.log('登录成功，更新状态:', result.data.user)
        loginStore(result.data.user, result.data.accessToken)
        
        // 等待状态保存到localStorage
        await new Promise(resolve => setTimeout(resolve, 100))
      } else {
        throw new Error('登录响应数据格式错误')
      }

      return result
    } catch (err) {
      const errorMessage = err.message || '登录过程中发生错误'
      console.error('登录错误:', errorMessage)
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 登出方法
   */
  const logout = () => {
    try {
      setError(null)
      logoutStore()
      console.log('登出成功')
    } catch (err) {
      console.error('登出错误:', err)
      setError(err.message || '登出失败')
    }
  }

  /**
   * 清除错误信息
   */
  const clearError = () => {
    setError(null)
  }

  return {
    login,
    logout,
    clearError,
    isLoading,
    error,
  }
}
