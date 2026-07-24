const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3100;
const DIST = path.join(__dirname, 'dist');
const GAME_ID = process.env.GAME_ID || '{{gameId}}';

if (!fs.existsSync(DIST)) {
  console.warn('[app.js] dist/ 不存在，请先 npm run build');
}

app.get('/', (req, res) => {
  const appIndex = `/games/${GAME_ID}/app-index.html`;
  const target = path.join(DIST, 'games', GAME_ID, 'app-index.html');
  if (fs.existsSync(target)) {
    return res.redirect(appIndex);
  }
  res.status(503).send('dist/ 未构建或缺少 app-index.html，请运行 npm run build');
});

app.use(express.static(DIST));

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const server = app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  const appPath = `/games/${GAME_ID}/app-index.html`;
  const previewPath = '/preview/preview-index.html';
  console.log('Web 静态服已启动（托管 dist/；API 由 http-config 按域名选择）');
  console.log('');
  console.log(`App（本地）:     http://localhost:${PORT}${appPath}`);
  console.log(`Preview（本地）: http://localhost:${PORT}${previewPath}`);
  console.log(`App（局域网）:     http://${localIP}:${PORT}${appPath}`);
  console.log(`Preview（局域网）: http://${localIP}:${PORT}${previewPath}`);
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`端口 ${PORT} 已被占用，可尝试: PORT=3200 npm start`);
    process.exit(1);
  }
  console.error('服务器启动失败:', err);
  process.exit(1);
});
