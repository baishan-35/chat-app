// 根布局
import type { Metadata } from 'next';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: '私密聊天',
  description: '专为朋友设计的私密聊天空间',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <head>
        <meta name="application-name" content="私密聊天" />
        <meta name="description" content="专为朋友设计的私密聊天空间" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="bg-white text-gray-900">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
