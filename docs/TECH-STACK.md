# 语音房 H5 小游戏 — 技术栈约定

> **版本**：v1.0  
> **适用范围**：本 kit 脚手架、Skill、Rule 及由此 init 的新游戏仓库  
> **变更**：修改本文需同步 `rules/h5-game-loop.mdc` 与相关 Skill

---

## 1. 总览

| 层 | 技术 | 说明 |
|----|------|------|
| 本地服务 | **Node.js + Express** | 静态托管 Vite 构建产物 |
| 构建 | **Vite** | 开发与生产构建 |
| 语言 | **TypeScript** | H5 业务代码、类型、测试 |
| UI | **Vue 3** | `<script setup lang="ts">` + SFC |
| 状态 | **Pinia** | 游戏阶段、玩家、视角等 |
| 样式 | **CSS**（可选 CSS 变量） | 不用 Tailwind / CSS-in-JS |
| E2E | **Playwright** | L2，Mock IM |
| 后端契约 | **`im.md` / `rest.md` / fixtures** | AI 只读，不访问后端代码 |

**禁止（新游戏）：** React / Svelte、无 TypeScript 的新业务代码、重写 App bridge 层、在代码中硬编码 IM/REST 字段（以契约为准）。

---

## 2. 目录结构（新游戏 scaffold 目标）

**一游戏一仓库**：每个 Git 仓只含一个 `gameId`；`public/core/` 随 scaffold 落在该仓内。**不建** `h5-game-common` 独立包。kit（`h5-game-loop-kit`）全局一份，经 `new-game.ps1` / `sync-kit.ps1` 接入。

```
<game-repo>/
├── app.js                          # Express 静态服
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/                         # 不经过 Vite transform 的静态资源
│   ├── core/                       # 桥 / http / UI 运行时（自 scaffold 拷贝）
│   ├── css/                        # kit 通用样式（如 kit-scrollbar.css）
│   └── games/<gameId>/assets/
├── dist/                           # npm run build 产出；npm start 托管此目录
│   └── games/<gameId>/
│       ├── app-index.html          # App 正式入口（WebView / E2E / ④ 真联调）
│       └── …
├── src/                            # 共用 Vue SFC（App 与 Preview 复用）
│   ├── entries/
│   │   ├── app-main.ts             # → app-index.html
│   │   └── preview-main.ts         # → preview 页
│   ├── bridge/                     # App 桥接类型声明 + 薄封装（不替代 hybirdapp 协议）
│   ├── types/                      # im、阶段、玩家等（对齐 im.md）
│   ├── stores/                     # Pinia（game.ts 等）
│   ├── services/                   # IM 解析、REST、sync
│   ├── composables/
│   ├── components/                 # 通用 UI 块
│   ├── App.vue
├── preview/                        # Preview 入口 HTML（② 确认 UI）
│   └── preview-index.html
├── docs/games/<gameId>/
├── tests/e2e/                      # Playwright
└── .cursor/rules/                  # h5-game-loop.mdc
```

**产物部署：** `npm run build` → `dist/`；`npm start`（Express）托管 **`dist/`**。

**入口：**

- **App**：`dist/games/<gameId>/app-index.html` — WebView、E2E、④ 远端真接口
- **Preview**：`dist/preview/preview-index.html` — ② 仅 mock 验收 UI

Playwright `baseURL` 指向 `npm start` 的静态服（默认端口 3100，见 `LOCAL-SERVER-SPEC.md`）。

---

## 3. Vite

| 项 | 约定 |
|----|------|
| 模式 | `development` / `test` / `production`（`.env.*`） |
| `base` | `'./'` 或项目子路径，适配 WebView |
| 多页 | **app-index**（`games/<gameId>/app-index.html`）+ **preview-index**（`preview/preview-index.html`） |
| 目标 | `build.target` 按 App WebView 最低版本设置（默认 `es2018`） |
| E2E | `?e2e=1` 或 `import.meta.env.VITE_E2E` 暴露 `__testIMHandler` / `__gameLog` |

**脚本约定（package.json）：**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "start": "node app.js",
    "test:e2e": "playwright test"
  }
}
```

---

## 4. TypeScript

| 范围 | 要求 |
|------|------|
| **必须 TS** | `types/`、`stores/`、`services/`（IM 解析、REST）、Pinia |
| **推荐 TS** | `components/`、`stages/`、composables |
| **类型来源** | 阶段 enum 对齐 `product.md` §3；IM 类型对齐 `im.md`（④ 后补全） |
| **共享** | Playwright fixture 与 `types/im.ts` 结构一致，避免双份定义 |

① 产品阶段 **不写** IM 字段类型；③ 契约到齐后在 `types/im.ts` 实现。

---

## 5. Vue 3 + Pinia

### 5.1 组件

- 使用 **Composition API** + `<script setup lang="ts">`
- 阶段 UI：`stages/StageReady.vue` 等，或单 `App.vue` 内 `v-if="game.currentStage === 'ready'"`
- **`data-testid`** 与 `product.md` §3 组件及 §4+ 阶段矩阵中的元素 ID 一致（如 `el-btn-start`）

### 5.2 Pinia

- 建议单 store `useGameStore`（或 `game` + `ui` 拆分）
- 状态：`currentStage`、玩家列表、当前视角、loading/error
- **IM / sync 入口**：service 解析后 **写 store**，组件只读 store
- 不在组件内直接调 bridge 发 REST（走 `services/`）

### 5.3 与 App 桥接

- bridge 能力（IM、getToken、roomInfo）通过 **`src/bridge/`** 封装
- 实现可复用现有 `hybirdapp-plugin.js` 协议；scaffold 提供 TS 声明与 init 钩子
- **IM 为真源，sync 为兜底**（与设计方案一致）

### 5.4 REST 与埋点

| 层 | 路径 | 说明 |
|----|------|------|
| 运行时 | `public/core/utils/http-request.js` | Token、签名、`callApi`；依赖 zepto + MD5 + http-config |
| 运行时 | `public/core/utils/track-log.js` | `window.trackLog`；gameId = `window.__GAME_ID__` |
| 运行时 | `server-time-sync.js` | `ServerTimeSync`；由 `onAIGameDevice.timestamp` 初始化 |
| 运行时 | `throttle-utils.js` | `ThrottleUtil.throttleApiCall(key, ms)` |
| TS 封装 | `src/services/rest.ts`、`track.ts` | REST / 埋点 |
| 运行时 | `game-sync.js` | 调度壳；默认时机见 `src/lib/game-sync.ts` |
| TS 封装 | `src/lib/game-sync.ts`、`app-lifecycle.ts` | 注册 handler + 通用时机 |
| 运行时 | `public/core/components/*.js` | IIFE 全局，`<script>` 先于 Vue 加载（**不改为 Vite TS 包**，见 components/README.md） |
| TS 封装 | `src/lib/ui.ts`、`src/composables/useLottie.ts` | toast、loading、Lottie（preload/show/hide 模式） |

### 5.5 新游戏：JS 运行时 vs TS 业务（已定）

**新游戏业务代码一律 TypeScript**（`src/` 下 Vue SFC、Pinia、services）。**不必**、也**不建议**为对齐技术栈而把 `public/core/*.js` 整体改写成 TS 再打进 Vite。

| 层 | 格式 | 新游戏用法 |
|----|------|------------|
| `public/core/` | 运行时 **JS**（`<script>` 先于 Vue） | 随 scaffold 拷贝，**一般不手改**；升级 kit 时手动合并或重跑 scaffold 相关目录 |
| `src/lib/`、`src/services/`、`src/composables/` | **TS** | ②④ 只在这里写逻辑；通过 `ui.ts`、`rest.ts` 等封装访问运行时 |
| `src/` 业务 | **TS + Vue** | 禁止新增纯 JS 业务文件 |

**保留 JS 的原因（仅新游戏栈）**

1. `app-index.html` 须在 Vue bundle 之前加载桥、`http-config`、vendor、`http-request`。
2. `http-request.js` 运行时调用 `window.showToast` / `loading` 回调，与 script 全局 API 耦合。
3. 全 TS 化需同步重写 http 管线并改 E2E 注入顺序，收益小于维护成本。

**游戏侧约定**：Toast / Loading / Lottie / Input 一律从 `@/lib/ui` 或 `@/composables/useLottie` 调用，不要在 SFC 里散落 `window.showToast`。

### 5.5.1 通用滚动条（`kit-scrollbar.css`）

| 项 | 约定 |
|----|------|
| 真源 | `templates/scaffold/public/css/kit-scrollbar.css` |
| 同步 | `sync-kit.ps1` 覆盖 `public/css/kit-*.css`（不删游戏自有 css） |
| 引入 | `preview-index.html` / `app-index.html` 的 `<head>` 加 `<link href="/css/kit-scrollbar.css">` |
| 用法 | 可滚动容器加 class **`kit-scrollbar`**（WebKit + Firefox 细滚动条，配色参考 aeroplane-chess） |

### 5.6 往 kit 加新通用能力：用 TS 还是 JS？

按**谁依赖、何时加载**决定，不是按「新游戏栈 = 全 TS」一刀切。

| 场景 | 放进 kit 的位置 | 格式 | 还要做什么 |
|------|-----------------|------|------------|
| **Vue 组件**（阶段 UI、布局块） | `templates/scaffold/src/components/` | **Vue SFC + TS** | ② 各游戏可改样式；不必进 `public/core` |
| **仅 Vue/TS 用的逻辑**（composable、纯函数） | `src/composables/` 或 `src/lib/` | **TS** | 游戏只 `import`，无 script 标签 |
| **须在 Vue 前加载**，或 **`http-request.js` 等运行时 JS 要调** | `public/core/components/` 或 `utils/` | **JS**（IIFE → `window.*`） | ① `app-index.html` 加 `<script>`；② `src/lib/*.ts` 薄封装；③ `vite-env.d.ts` 补类型 |
| **两者都要**（推荐，与 toast/lottie 同模式） | JS 运行时 + TS 封装 | **JS + TS** | 游戏侧**只引 TS**，不直接改 JS |

**决策口诀**

1. 能不能等 Vite 启动后再加载？**能 → TS（`src/`）**  
2. `http-request` / 桥 / 其他 `public/core/*.js` 要不要在运行时直接调？**要 → 补 JS 全局 + TS 封装**  
3. 是不是某个游戏私有的 UI？**是 → 只写在该游戏仓 `src/`，不进 kit scaffold**

**示例**

- 新的「倒计时环」只在 Vue 里用 → `src/components/CountdownRing.vue` + 可选 `useCountdown.ts`，**TS 即可**  
- 新的「全局音效播放器」且 `callApi` 失败时要 `playError()` → `public/core/components/web-audio.js` + `src/lib/ui.ts` 导出 `playErrorSfx()`，**JS + TS**  
- 新的 IM 解析 helper → 各游戏 `src/services/`，**不进 kit**（IM 结构因游戏而异）

---

## 6. 开发与 AI 流程对齐

| 步骤 | 技术栈相关产出 |
|------|----------------|
| ① product.md | 阶段 ID、元素 ID（无 IM 类型） |
| ② h5-game-ui | 共用 SFC + **Preview**（阶段/状态/视角 mock）+ **App 壳**（`app-index`） |
| ③ 契约 | 后端 im/rest/fixtures |
| ④ h5-game-dev | App 版接 **远端** IM/REST/sync（按文档，不连本机 API） |
| ⑤ h5-game-test | Playwright + `last-run.json` |

---

## 7. 与旧模板（game-template）的关系

- 旧模板：**无 Vite、JS、CDN Vue、manager-base 类**
- 新约定：**Vite + TS + Pinia + SFC**；逻辑从 manager 类 **迁移到 store + services**
- **工程骨架、本地服**：`templates/scaffold/` + `scripts/scaffold-game.ps1`（已提取）
- **App 桥接**：`templates/scaffold/public/core/bridge/` + `src/bridge/`（已提取）

---

## 9. 双版本：App 与 Preview（已定）

| 版本 | 入口 | 用途 | 数据 |
|------|------|------|------|
| **App** | `games/<gameId>/app-index.html` | WebView；**E2E / Loop 只测此入口**；④ 远端 IM/REST | ④ 起真实逻辑 |
| **Preview** | `preview/preview-index.html` | **仅你人工**确认阶段/状态/视角 UI | mock，**不参与 Playwright** |

② `h5-game-ui`：**先实现共用组件**，再交付 Preview（完整 mock 矩阵）+ App 入口（壳，预留 services 钩子）。  
④ `h5-game-dev`：只改 **App 版**数据流；Preview 保持 mock 供回归 UI。

**http-config**：新建游戏时默认 **witchs-poison** 的 apiBase 预设；AI **须询问**是否沿用。本机 `npm start` 打开页面时，apiBase 仍走 **远端 dev/test**，不指向 `localhost:4000`。

---

## 10. 检查清单（新游戏）

- [ ] `vue`、`pinia`、`vite`、`typescript`、`vue-tsc` 已安装
- [ ] `npm run dev` 可本地预览；`npm run build` 通过类型检查
- [ ] Express 托管 `dist/`；`app-index.html` 与 preview 均可访问
- [ ] Preview 可切换阶段/状态/视角
- [ ] `?e2e=1` 钩子已接
- [ ] 未引入 React / 未在新代码中用纯 JS 写业务逻辑
