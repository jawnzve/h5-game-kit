import os from 'node:os';
import type { Plugin } from 'vite';

function getLocalIPv4(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

/** 开发服启动后打印 App / Preview 的本地与局域网完整路径（覆盖 Vite 默认 printUrls） */
export function printDevEntryUrls(gameId: string): Plugin {
  return {
    name: 'print-dev-entry-urls',
    configureServer(server) {
      server.printUrls = () => {
        const addr = server.httpServer?.address();
        const port =
          typeof addr === 'object' && addr && 'port' in addr
            ? addr.port
            : (server.config.server.port ?? 5173);
        const lan = getLocalIPv4();
        const appPath = `/games/${gameId}/app-index.html`;
        const previewPath = '/preview/preview-index.html';
        const log = server.config.logger.info;
        log('');
        log(`App（本地）:     http://localhost:${port}${appPath}`);
        log(`Preview（本地）: http://localhost:${port}${previewPath}`);
        log(`App（局域网）:     http://${lan}:${port}${appPath}`);
        log(`Preview（局域网）: http://${lan}:${port}${previewPath}`);
        log('');
      };
    },
  };
}
