'use client';

import React, { useState, useRef, useCallback } from 'react';
import MediaPreview from './MediaPreview';

interface FileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  onUploadProgress?: (progress: number) => void;
  maxFileSize?: number; // 默认10MB
  allowedTypes?: string[]; // 默认允许的文件类型
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onUploadProgress,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false); // 华为浏览器预览优化
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 验证文件
  const validateFile = useCallback((file: File): boolean => {
    // 检查文件大小
    if (file.size > maxFileSize) {
      setError(`文件大小不能超过 ${maxFileSize / (1024 * 1024)}MB`);
      return false;
    }

    // 检查文件类型
    if (!allowedTypes.includes(file.type)) {
      setError(`不支持的文件类型。支持的类型: ${allowedTypes.join(', ')}`);
      return false;
    }

    return true;
  }, [maxFileSize, allowedTypes]);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file);
        
        // 生成预览URL（仅对图片）
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        } else {
          setPreviewUrl(null);
        }
      }
    }
  };

  // 处理拖拽
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file);
        
        // 生成预览URL（仅对图片）
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        } else {
          setPreviewUrl(null);
        }
      }
    }
  };

  // 模拟上传进度
  const simulateUploadProgress = useCallback(() => {
    setUploadProgress(0);
    setIsUploading(true);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10;
        if (onUploadProgress) {
          onUploadProgress(newProgress);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 200);
    
    return interval;
  }, [onUploadProgress]);

  // 上传文件
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('请先选择文件');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      // 模拟上传进度
      const progressInterval = simulateUploadProgress();
      
      // 执行实际上传
      await onFileUpload(selectedFile);
      
      // 清理进度模拟
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // 显示完成状态
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(0);
      setError(err instanceof Error ? err.message : '上传失败');
    }
  };

  // 清除选择
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-uploader">
      {/* 文件选择区域 */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        
        {previewUrl ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="预览" 
                className="max-h-48 max-w-full object-contain mb-2 media-preview huawei-browser-fix"
                onClick={() => {
                  // 华为浏览器优化：点击图片显示全屏预览
                  if (navigator.userAgent.includes('HuaweiBrowser')) {
                    setShowPreview(true);
                  }
                }}
              />
              <p className="text-sm text-gray-500">{selectedFile?.name}</p>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="bg-gray-200 rounded-full p-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">{selectedFile.name}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-gray-200 rounded-full p-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-gray-600">点击选择文件或拖拽文件到此处</p>
            <p className="text-sm text-gray-500 mt-1">支持 JPG, PNG, PDF, DOC 文件，最大 10MB</p>
          </div>
        )}
      </div>

      {/* 上传进度 */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>上传中...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {selectedFile && !isUploading && (
        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors disabled:opacity-50"
            onClick={handleUpload}
            disabled={isUploading}
          >
            上传文件
          </button>
          <button
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded transition-colors"
            onClick={handleClear}
            disabled={isUploading}
          >
            清除
          </button>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
      
      {/* 华为浏览器媒体预览 */}
      {showPreview && selectedFile && (
        <MediaPreview 
          file={selectedFile} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </div>
  );
};

export default FileUploader;