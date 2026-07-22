---
name: h5-game-dev
description: >-
  语音房 H5 游戏流程④：Vue3+Vite+TS+Pinia 项目接 IM/REST/sync 与 e2e 钩子；只读 im.md/rest.md/fixtures。
---
# h5-game-dev

## 技术栈（必须）

见 `h5-game-loop-kit/docs/TECH-STACK.md`：

- IM/REST/sync → **`src/services/`** + **`src/stores/`（Pinia）**
- 类型 → **`src/types/`**（对齐 `im.md`）
- bridge → **`src/bridge/`**（薄封装，不替代协议）
- 组件继续读 store，不在 SFC 内堆解析逻辑

## 流程位置

**④ 功能实现** — 前置：**③ 后端契约到齐**且只读审查通过。

## 输入

- 已确认的 **`product.md`** + ② 已有 Vue UI
- 后端提供的 **`im.md`、`rest.md`（只读）**、fixtures（**路径与格式以仓库实际为准**）
- `CONTRACT_GAPS.md` 无阻塞项

## 输出

- `src/types/im.ts`（及阶段/玩家类型）— 严格按 **该游戏 `im.md`**
- `src/services/im-parser.ts`、`sync.ts`；REST 用 **`src/services/rest.ts`**（封装 `http-request.js`）
- 埋点：**`src/services/track.ts`**（封装 `track-log.js`）
- **仅 App 版**（`app-index`）接 IM/REST/sync；Preview 保持 mock
- IM/REST 目标：**远端真实接口**（`http-config` 按域名 + `rest.md`/`im.md`）；**不连本机 API**
- Pinia store 接 IM/sync；SFC 绑定 store
- `?e2e=1`：`window.__testIMHandler`、`window.__gameLog`
- 更新 `spec.md`：**视角矩阵** + L2 用例表

## 禁止

- 读取或修改后端代码仓库
- 撰写或修改 `rest.md`、`im.md`、fixtures
- 跨游戏照搬 IM 解析
- React；在 services/store 以外散落 IM 解析

## 契约审查（进入本 Skill 前必做）

读后端提供的 IM/REST 文档与 fixtures（路径见 `BACKEND-CONTRACTS.md` 或 `CONTRACT_GAPS.md`），更新 `CONTRACT_GAPS.md`（不修改契约原文件）：

- 各 product.md 阶段是否在 im.md 有对应推送/字段说明
- rest 与 im、sync 是否矛盾
- fixture 与 im.md 是否一致
- 缺失或矛盾 → **Blocked: Backend**；**不猜测**

## 步骤

0. 读 kit `docs/LESSONS.md`（通用踩坑）；游戏专有看 `spec.md` / `im.md`
1. 只读审查契约
2. 补全 `src/types/` 与 spec 视角矩阵
3. 实现 services + Pinia + bridge 绑定；**sync** 见下节
4. e2e 钩子与 data-testid 断言稳定
5. `npm run build` 类型检查通过 → **⑤ h5-game-test**
6. 需要 dev 环境（roomId、token、Centrifugo URL 等）时 **向用户索取**；apiBase 预设新建时默认 witchs-poison 模板，**须已询问用户是否沿用**
7. 通用工程疑难解决后 → `h5-game-lessons`；游戏 IM/玩法只更新 `spec.md`

## REST / 埋点（scaffold 已含）

**REST**（路径以 `rest.md` 为准，`apiBase` 来自 `http-config`）：

```typescript
import { postApi, getApi } from '@/services/rest';

const res = await postApi('/api/your-path', { playId: 'xxx' }, { apiName: '开始游戏' });
// res.gameData — callApi 已兼容 data / data.content 两种格式

import { apiLoadingAdapter } from '@/lib/ui';
await postApi('/api/...', { ... }, { apiName: '提交', loading: apiLoadingAdapter });
```

**埋点**（`trackLogUrl` 来自 `http-config`，gameId 来自 `window.__GAME_ID__`）：

```typescript
import { trackLog } from '@/services/track';

trackLog('stage_enter', { stage: 'ready', roomId: 123 });
// 实际上报 Event: game_<gameId>_stage_enter
```

- Token：App 内由 `hybirdapp.getToken()` 自动写入请求头
- 签名：`_sign` + `_time` 由 `http-request.js` 自动追加
- ④ 实现 `getCurrentUserId()` 可提升埋点 user_id 准确度（可选）

**防抖**（防重复点击调 API）：

```typescript
import { throttleApiCall } from '@/lib/throttle';

async function onStartClick() {
  if (!throttleApiCall('ready-start', 800)) return;
  await postApi('/api/...', { ... });
}
```

**服务器时间**（倒计时 / 埋点 EventTime；`app-main` 已 `initServerTimeSync()`）：

```typescript
import { serverNow, remainingMs, formatCountdown } from '@/lib/server-time';

const left = remainingMs(endTimestamp);
const label = formatCountdown(left);
```

**状态同步（IM 真源，sync 兜底）** — 读 `product.md` §6.1，对照 `rest.md` sync 接口：

```typescript
import {
  configureSyncTriggers,
  setSyncHandler,
  setInitialSyncHandler,
  triggerInitialSync,
  startDelayedSyncDetection,
  onImReceived,
} from '@/lib/game-sync';
import { postApi } from '@/services/rest';

// 1. 按 product.md §6.1 开关（delayed 默认 false）
configureSyncTriggers({
  initial: true,
  foreground: true,
  reconnect: true,
  delayed: false, // product 勾选「倒计时无 IM」时改为 true
});

// 2. 注册 sync API（路径来自 rest.md，勿编造）
setSyncHandler(async (opts) => {
  const res = await postApi('/api/.../sync', { /* rest.md */ }, { apiName: 'sync', ...opts });
  // 解析 res.gameData → 写 Pinia
});

setInitialSyncHandler(async () => {
  await window.GameSync?.sync?.({ silent: true });
});

// 3. 房间就绪后首屏（通用时机，非 mount 自动）
await triggerInitialSync();

// 4. 收到 IM 后（im-parser 内）
onImReceived();

// 5. 某阶段倒计时开始且 product 启用 delayed 时
startDelayedSyncDetection(2000);
```

- **已自动接线**（`initAppLifecycle`）：回前台、断网 online → `GameSync.sync`
- **需 ④ 手动调用**：`triggerInitialSync`（房间就绪后）、`startDelayedSyncDetection`（按 product）

## 参考

- 技术栈：`h5-game-loop-kit/docs/TECH-STACK.md`
- 设计方案 §5、§8.3
