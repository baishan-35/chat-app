const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 创建输出目录
const outputDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 图标尺寸
const sizes = [72, 96, 128, 144, 152, 192, 256, 384, 512];

// 为每个尺寸生成图标
sizes.forEach(size => {
  // 创建画布
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 绘制背景
  ctx.fillStyle = '#4f46e5'; // 同主题色
  ctx.fillRect(0, 0, size, size);
  
  // 绘制简单的聊天图标
  ctx.fillStyle = '#ffffff';
  ctx.font = `${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💬', size / 2, size / 2);
  
  // 保存为PNG文件
  const buffer = canvas.toBuffer('image/png');
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, buffer);
  console.log(`已生成 ${filename}`);
});

// 生成favicon
const faviconCanvas = createCanvas(32, 32);
const faviconCtx = faviconCanvas.getContext('2d');
faviconCtx.fillStyle = '#4f46e5';
faviconCtx.fillRect(0, 0, 32, 32);
faviconCtx.fillStyle = '#ffffff';
faviconCtx.font = '20px Arial';
faviconCtx.textAlign = 'center';
faviconCtx.textBaseline = 'middle';
faviconCtx.fillText('💬', 16, 16);

const faviconBuffer = faviconCanvas.toBuffer('image/png');
const faviconPath = path.join(__dirname, '../public/favicon.ico');
fs.writeFileSync(faviconPath, faviconBuffer);
console.log('已生成 favicon.ico');

console.log('所有图标文件生成完成！');