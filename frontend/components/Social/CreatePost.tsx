"use client";

import { useState, useRef } from "react";
import { useSocialStore } from "@/stores/useSocialStore";
import { SocialService } from "@/services/socialService";

export default function CreatePost() {
  const { currentUser } = useSocialStore();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理图片选择
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // 移除图片
  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviewUrls = [...previewUrls];
    
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setImages(newImages);
    setPreviewUrls(newPreviewUrls);
  };

  // 处理发布
  const handlePublish = async () => {
    if (!content.trim() && images.length === 0) return;
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const response = await SocialService.createPost({
        content,
        images: images.length > 0 ? images : undefined
      });
      
      if (response.success && response.data) {
        useSocialStore.getState().addPost(response.data);
        // 重置表单
        setContent("");
        setImages([]);
        setPreviewUrls([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("发布失败:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-start">
        {/* 用户头像 */}
        {currentUser?.avatar ? (
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {currentUser?.name.charAt(0) || '我'}
            </span>
          </div>
        )}
        
        {/* 发布内容区域 */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享新鲜事..."
            className="w-full border border-gray-200 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows={3}
            disabled={loading}
          />
          
          {/* 图片预览 */}
          {previewUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={url} 
                    alt={`预览${index + 1}`} 
                    className="rounded-lg object-cover w-full h-24"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* 操作区域 */}
          <div className="mt-3 flex items-center justify-between">
            {/* 工具按钮 */}
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="ml-1 text-sm">图片</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={loading}
              />
            </div>
            
            {/* 发布按钮 */}
            <button
              onClick={handlePublish}
              disabled={(!content.trim() && images.length === 0) || loading}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                content.trim() || images.length > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? '发布中...' : '发布'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}