"use client";

import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600">出错了</h2>
              <p className="mt-2 text-gray-600">
                抱歉，处理您的请求时出现了问题。
              </p>
              <button
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.reload();
                }}
              >
                重新加载页面
              </button>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left bg-gray-100 p-4 rounded">
                  <summary className="font-bold text-gray-800">错误详情</summary>
                  <pre className="mt-2 text-sm text-red-600">
                    {this.state.error && this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;