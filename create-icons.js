import sharp from 'sharp';
import fs from 'fs';

const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2E7D32" rx="80"/>
  <text x="256" y="340" font-size="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif">🌱</text>
</svg>
`;

const buffer = Buffer.from(svg);

// 512x512 Icon
sharp(buffer)
  .resize(512, 512)
  .png()
  .toFile('static/icon-512.png')
  .then(() => console.log('✅ icon-512.png erstellt'));

// 192x192 Icon
sharp(buffer)
  .resize(192, 192)
  .png()
  .toFile('static/icon-192.png')
  .then(() => console.log('✅ icon-192.png erstellt'));

// Favicon
sharp(buffer)
  .resize(32, 32)
  .png()
  .toFile('static/favicon.png')
  .then(() => console.log('✅ favicon.png erstellt'));
