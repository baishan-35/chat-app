// 根布局
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '聊天应用',
  description: '实时聊天应用演示',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}