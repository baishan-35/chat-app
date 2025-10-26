// MediaPreview.tsx
// 专为华为浏览器优化的媒体预览组件
'use client';

import React, { useState, useEffect } from 'react';

interface MediaPreviewProps {
  file: File;
  onClose: () => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ file, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 为华为浏览器优化的媒体预览
    if (file) {
      try {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        
        // 华为浏览器特定处理
        if (navigator.userAgent.includes('HuaweiBrowser')) {
          // 预加载媒体以确保在华为浏览器中正确显示
          const img = new Image();
          img.onload = () => {
            console.log('华为浏览器图片预加载完成');
          };
          img.onerror = () => {
            console.warn('华为浏览器图片预加载失败');
          };
          img.src = url;
        }
      } catch (err) {
        setError('无法生成预览');
        console.error('生成媒体预览时出错:', err);
      }
    }

    // 清理函数
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file]);

  // 华为浏览器特定的渲染优化
  const renderMedia = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-red-500 mb-2">预览加载失败</div>
          <div className="text-sm text-gray-500">{error}</div>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    // 根据文件类型渲染不同的预览
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={previewUrl}
          alt="预览"
          className="max-h-full max-w-full object-contain media-preview huawei-browser-fix"
          onLoad={() => {
            // 华为浏览器加载完成后的处理
            if (navigator.userAgent.includes('HuaweiBrowser')) {
              console.log('华为浏览器图片加载完成');
            }
          }}
          onError={(e) => {
            console.error('图片加载失败:', e);
            setError('图片加载失败');
          }}
        />
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <video
          src={previewUrl}
          controls
          className="max-h-full max-w-full media-preview huawei-browser-fix"
          onError={(e) => {
            console.error('视频加载失败:', e);
            setError('视频加载失败');
          }}
        />
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-gray-200 rounded-full p-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-gray-600">{file.name}</div>
          <div className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 huawei-compat">
      <div className="relative w-full h-full max-w-3xl max-h-3xl flex flex-col">
        {/* 关闭按钮 */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all touch-target"
            aria-label="关闭预览"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 媒体内容 */}
        <div className="flex-1 flex items-center justify-center p-4">
          {renderMedia()}
        </div>

        {/* 文件信息 */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg inline-block">
            <div className="font-medium">{file.name}</div>
            <div className="text-sm opacity-75">
              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;