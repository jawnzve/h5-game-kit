---
name: h5-game-ui
description: >-
  语音房 H5 游戏流程②：按 product.md 生成共用 Vue SFC + Preview（阶段/状态/视角 mock 验收）
  + App 壳（app-index.html）。Preview 不接真接口；App 壳留 ④ 钩子。触发：product 确认后。
---
# h5-game-ui

## 技术栈（必须）

见 `h5-game-loop-kit/docs/TECH-STACK.md` §9：

- **Vue 3** + TS + Pinia + SFC
- **双入口**：**Preview**（mock 验收）+ **App**（`games/<gameId>/app-index.html`）
- 静态构建进 **`dist/`**；`npm start` 托管 dist

## 流程位置

**② H5 UI** — product 确认后；产出 **Preview + App 壳**，④ 再在 App 版接真数据。

## 前置

- **`product.md` 已确认**
- 无 Vite 骨架 → 提示运行 `new-game.ps1`，**停止**，不编造 `app.js`
- 新建游戏 **http-config**：默认 witchs-poison 预设，**须询问用户**是否沿用（见 TECH-STACK §9）

## 输出

### 共用

- `src/stages/*.vue`、`src/components/` — App 与 Preview **复用**
- `data-testid` = product **§3 组件** 与 **§4+ 阶段矩阵** 中的元素 ID

### Preview 版（给你确认 UI）

- 入口：`preview/preview-index.html` → `src/entries/preview-main.ts`
- Pinia **mock**：可切换 **阶段、状态、身份/视角**（覆盖 product §4+ 视角·元素矩阵）
- **不**调用真实 REST/IM；不依赖 `im.md` 业务字段

### App 版（正式壳）

- 入口：`games/<gameId>/app-index.html` → `src/entries/app-main.ts`
- ② 仅 UI + store 空壳/占位 mock；预留 `src/services/`、`src/stores/game.ts` 钩子
- ④ 在此入口接 **远端** IM/REST（按文档，**不连本机 API**）

## 禁止

- ② 在 App 版接真实 IM/REST（属 ④）
- Preview 依赖 `im.md` 写业务解析
- 跳过 product §3 / §4+ 发明元素

## 步骤

1. 读 product **§1 概述**、**§2 全局**、**§3 组件**、**§4+ 各阶段矩阵**
2. 实现共用 SFC（交互类型：可见 / 可点击 / 可输入 / 可滚动 等与矩阵一致）
3. 实现 **Preview**：阶段/状态/视角切换面板 + mock 数据
4. 实现 **App 壳**：`app-index` 路由/阶段分支 + 空 store
5. `npm run dev` 可开 Preview；`npm run build` 产出 dist 两入口
6. 请你用 **Preview** 确认 UI；确认后并行 ③ 等契约

## 通用 UI（scaffold 已含）

- **Toast / Alert / Loading / Input**：`public/core/components/*.js`（运行时全局）+ `src/lib/ui.ts`
- **Lottie**：**ito 实战版** `web-lottie.js`；用法见 `public/assets/anim/lottie-usage-guide.md`
- **Vue 3**：`useLottie()` composable；App 壳 `LottieCanvas.vue`
- **JS 不整体迁 TS**：script 顺序与 `http-request` 依赖见 `public/core/components/README.md`

```typescript
import { useLottie } from '@/composables/useLottie';
import { DEFAULT_LOTTIE_CANVAS_ID } from '@/lib/ui';

const fx = useLottie({
  instanceId: 'confetti',
  canvasId: DEFAULT_LOTTIE_CANVAS_ID,
  src: '/assets/anim/Confetti.lottie',
  destroyOnUnmount: false,
});
await fx.preload(); // loading 阶段
await fx.play();    // 结算：复用 show，不重复拉文件
```

## 参考

- `TECH-STACK.md` §9、`LOCAL-SERVER-SPEC.md`
- `product-doc.example.md`
