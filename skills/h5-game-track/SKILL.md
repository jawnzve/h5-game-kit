---
name: h5-game-track
description: >-
  语音房 H5 埋点：玩法流程做完之后，按埋点表用 trackLog 在 App 前端上报。
  触发：埋点、埋点表、埋点文档、trackLog、上报事件。
  不进入 ①–⑤；不要因为「继续」或 ③-F 主动做埋点。
---

# h5-game-track

## 何时用

玩法、Preview、App 对接都已经做完，用户拿出埋点表或明确说要上报时，再加载本 Skill。

不进 ①–⑤，也不作为子门禁。`h5-game-dev` 做对接时不要顺手加埋点。

## 通道

- 运行时：`public/core/utils/track-log.js` 的 `window.trackLog`。事件名由它拼成 `game_{gameId}_{action}`，业务 action **不含** `game_` 前缀。
- App 页 `games/<gameId>/app-index.html` 必须先有 `window.__GAME_ID__`，再加载 `/core/utils/track-log.js`。
- 信封 `user_id` 读 `getCurrentUserId` / `userInfo` / `window.currentUserId`。入座后把当前玩家写到 `window.currentUserId`。
- 业务放在 `src/services/<gameId>-track.ts`，经 `src/services/track.ts` 调用。只在 App 入口启用。Preview 不报。
- 本环境 `trackLogUrl` 为空：跳过请求并打日志，不要当成上报成功。
- `EventTime` 优先 `ServerTimeSync`。

## 谁上报

先把埋点表里的事件分成两类：

| 类 | 谁报 |
|----|------|
| 本人操作（点击、提交、自己的开关） | 只报操作者这一台设备 |
| 公共事件（开局、进阶段、轮次、整局结束，每个客户端都会收到） | 全局只报 **一条** |

公共事件的上报人：当前快照里还在局里的玩家，按座位号从小到大，取第一个。已逃跑或不在名单里的不算。这个人不在了，再按座位号顺延。各端用同一份快照算出同一个人。不要按房主，也不要每个客户端各报一条。

断线、切到后台，不算「不在」。只要人还在名单里且没被标成逃跑，下一次仍由他报。

## 去重

- 去重记在当前页面内存。不要写 localStorage。
- 页面还在、只是连接断了又接上：内存还在，已经处理过的不再报。
- 页面关掉或刷新后再进来：内存没了。第一份快照按当前阶段把已经过去的公共事件标成已处理，然后跳过，不补报。
- 同一份快照再写进来一次，也不要再报。

## 后台

人在后台时，页面常常发不出请求。回到前台会再拉一次当前局面。只补「离开前的最后一帧」和「现在这一帧」仍然对得上的那一条。中间跳过的阶段不逐条补。

快照已经写进页面、只是请求没发出去：回来后不要再发一次。

其他玩家不替他补报。

## 跟后端的关系

事件是否发生，以后端快照为准。玩家本地点了，但请求没到后端、后端按超时处理的，埋点也按超时记，不要按本地点击记成已操作。

快照里没有单独字段时，可以用阶段变化推断，并在**该游戏**的 product / spec 里写清推断规则。不要把某一款游戏的事件字段写进本 Skill，也不要编造埋点表里没有的字段。

## 禁止

- 改 `public/core/utils/track-log.js`、`hybirdapp-plugin.js`
- Preview 里启用上报
- 公共事件每个在局客户端各报一条
- 用本地存储做「已上报」档案

## 参考

- `docs/TECH-STACK.md` §5.4
- scaffold：`templates/scaffold/public/core/utils/track-log.js`、`templates/scaffold/src/services/track.ts`
