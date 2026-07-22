# HTTP / 埋点 / 工具

| 文件 | 说明 |
|------|------|
| `http-request.js` | REST（Token、签名、callApi） |
| `track-log.js` | 埋点；EventTime 优先 `ServerTimeSync.now()` |
| `server-time-sync.js` | 服务器时间 |
| `game-sync.js` | sync 调度壳（通用时机） |
| `throttle-utils.js` | 防抖 |
| `../vendor/` | zepto、MD5、base64 |

TS：`src/lib/game-sync.ts`、`app-lifecycle.ts`、`server-time.ts`；`src/services/rest.ts`、`track.ts`
