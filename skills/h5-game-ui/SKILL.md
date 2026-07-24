---
name: h5-game-ui
description: >-
  语音房 H5 游戏流程②：按 product.md 生成共用 Vue SFC + Preview（阶段/状态/视角 mock 验收）
  + App 壳（app-index.html）。Preview 不接真接口；App 壳留 ④ 钩子。触发：product 确认后。
---
# h5-game-ui

## 流程位置

**② H5 UI** — `product.md` 确认后；产出 **Preview + App 壳**。  
（Loop 主流程：① product → **② UI** → ③ 等后端 → ④ 功能 → ⑤ L2；**不是**第 ③ 步。）

## 技术栈（必须）

见 `h5-game-loop-kit/docs/TECH-STACK.md` §9：

- **Vue 3** + TS + Pinia + SFC
- **双入口**：**Preview**（mock 验收）+ **App**（`games/<gameId>/app-index.html`）
- 静态构建进 **`dist/`**；`npm start` 托管 dist

## 前置

- **`product.md` 已确认**（v2 结构：§3 组件 + §4+ 阶段矩阵）
- 无 Vite 骨架 → 提示运行 `init-game.ps1` / `new-game.ps1`，**停止**，不编造 `app.js`
- 新建游戏 **http-config**：默认 witchs-poison 预设，**须询问用户**是否沿用（见 TECH-STACK §9）

## 输出

### 共用

- `src/stages/*.vue`、`src/components/` — App 与 Preview **复用**
- `data-testid` = product **§3 组件** 与 **§4+ 阶段矩阵** 中的元素 ID

### Preview 版（人工验收 UI）

- 入口：`preview/preview-index.html` → `src/entries/preview-main.ts`
- **外壳规范**：必读 **`docs/PREVIEW-UI-SPEC.md`**
  - 左侧 `preview-panel`：阶段 / 视角 / **调试（尺寸）** / **分阶段 Mock**（无 Mock 不显示）
  - 右侧 **可调尺寸手机视口**（默认 iPhone SE 375×667，`preview-phone-viewport`）+ 外侧桌面底色
  - 内嵌 `GameShell`，与 App **共用**阶段 SFC
- Pinia **`preview` store**：mock 阶段、视角、矩阵所需状态
- **`src/lib/preview-mock-controls.ts`**：各阶段可见 Mock 项映射
- **`useGameView()`**：Preview / App 分流（`GAME_VIEW_MODE_KEY`）
- **不**调用 REST/IM；**不**依赖 `im.md` 业务字段

### App 版（正式壳）

- 入口：`games/<gameId>/app-index.html` → `src/entries/app-main.ts`
- ② 仅 UI + `game` store 空壳；预留 `src/services/` 钩子
- **不含** Preview 侧栏与桌面底色
- ④ 接远端 IM/REST

## 禁止

- ② 在 App 版接真实 IM/REST（属 ④）
- Preview 依赖 `im.md` 写业务解析
- 跳过 product §3 / §4+ 发明元素
- Playwright L2 测 preview 页

## 步骤

1. 读 **`docs/PREVIEW-UI-SPEC.md`** + product **§1 概述**、**§2 全局**、**§3 组件**、**§4+ 矩阵**
2. 实现共用 SFC（交互类型与矩阵一致：可见 / 可点击 / 可输入 / 可滚动）
3. 实现 **GameLayout**（Logo 中英文、独立阶段条；按需 `variant` 如 ready 底栏）
4. 实现 **PreviewApp**（§PREVIEW-UI-SPEC 外壳 + 阶段/视角/Mock）
5. 编写 **`preview-mock-controls.ts`**（Mock 项与阶段矩阵对齐）
6. 实现 **App 壳** + 空 `game` store
7. `npm run build`；可选 `scripts/smoke-preview.mjs` 冒烟
8. 请用户在 **Preview** 验收；通过后并行 ③ 等契约

## 通用 UI（scaffold 已含）

- **Toast / Alert / Loading / Input**：`public/core/components/*.js` + `src/lib/ui.ts`
- **Lottie**：`useLottie()` + `LottieCanvas.vue`
- **Preview 调试尺寸**：`PreviewDevicePanel` + `preview-devices.ts`（scaffold 已含；游戏专属调试放 `PreviewDevPanel`）

## 参考

- **Preview 规范**：`h5-game-loop-kit/docs/PREVIEW-UI-SPEC.md`
- **完整示例**：werewords 仓库（`PreviewApp.vue`、`GameLayout.vue`、`PlayerList.vue`）
- `TECH-STACK.md` §9、`LOCAL-SERVER-SPEC.md`
- `product-doc.example.md`（werewords 在 kit `docs/templates/`）
