import os from 'node:os';
function getLocalIPv4() {
    var _a;
    var interfaces = os.networkInterfaces();
    for (var _i = 0, _b = Object.keys(interfaces); _i < _b.length; _i++) {
        var name_1 = _b[_i];
        for (var _c = 0, _d = (_a = interfaces[name_1]) !== null && _a !== void 0 ? _a : []; _c < _d.length; _c++) {
            var iface = _d[_c];
            if (iface.family === 'IPv4' && !iface.internal)
                return iface.address;
        }
    }
    return 'localhost';
}
/** 开发服启动后打印 App / Preview 的本地与局域网完整路径（覆盖 Vite 默认 printUrls） */
export function printDevEntryUrls(gameId) {
    return {
        name: 'print-dev-entry-urls',
        configureServer: function (server) {
            server.printUrls = function () {
                var _a, _b;
                var addr = (_a = server.httpServer) === null || _a === void 0 ? void 0 : _a.address();
                var port = typeof addr === 'object' && addr && 'port' in addr
                    ? addr.port
                    : ((_b = server.config.server.port) !== null && _b !== void 0 ? _b : 5173);
                var lan = getLocalIPv4();
                var appPath = "/games/".concat(gameId, "/app-index.html");
                var previewPath = '/preview/preview-index.html';
                var log = server.config.logger.info;
                log('');
                log("App\uFF08\u672C\u5730\uFF09:     http://localhost:".concat(port).concat(appPath));
                log("Preview\uFF08\u672C\u5730\uFF09: http://localhost:".concat(port).concat(previewPath));
                log("App\uFF08\u5C40\u57DF\u7F51\uFF09:     http://".concat(lan, ":").concat(port).concat(appPath));
                log("Preview\uFF08\u5C40\u57DF\u7F51\uFF09: http://".concat(lan, ":").concat(port).concat(previewPath));
                log('');
            };
        },
    };
}
