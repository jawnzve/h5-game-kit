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

见 `h5-game-kit/docs/TECH-STACK.md` §9：

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
  - 左侧 `preview-panel`：阶段（`stageId（中文名）`）/ **视口** / **调试（人数、尺寸）** / **分阶段 Mock**（无 Mock 不显示）
  - 右侧 **多视口横排**：`PreviewPhoneViewport` ×N，每个视口一个视角、可增删排序；默认 iPhone 12 Pro 390×844
  - 内嵌 `GameShell`，与 App **共用**阶段 SFC
- Pinia **`preview` store**：局状态（全视口共享）+ `viewports` 槽位 + `perViewState`（仅本人可见的部分）
- **`src/lib/preview-perspectives.ts`**：视角表、mock userId、视角文案 —— 按 product §1 各段视角填写
- **`src/lib/preview-mock-controls.ts`**：各阶段可见 Mock 项映射
- **`useGameView()`**：Preview / App 分流（`GAME_VIEW_MODE_KEY` + `PREVIEW_PERSPECTIVE_KEY`）
- toast 用 **`useViewportToast()`**，落在本视口内（视口根节点已标 `data-toast-root`）
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

1. 读 **`docs/PREVIEW-UI-SPEC.md`** + product **§1 概述**、**§2 全局**、**§3 组件**（含 §3.0 壳层/正文）、**§4+ 矩阵**
2. 填 **`preview-perspectives.ts`** 视角表；把 `preview` store 的 `PreviewPerspective` 收敛为具体联合类型
3. 按 product **§3.0** 划分**固定壳**与**阶段正文**：正文随阶段 remount，需跨阶段保留的数据一律进 store
4. 实现共用 SFC（交互类型与矩阵一致：可见 / 可点击 / 可输入 / 可滚动）
5. 实现 **GameLayout**（Logo 中英文、独立阶段条；按需 `variant` 如 ready 底栏）
6. 扩展 **PreviewApp**（scaffold 已含多视口外壳，通常只需补 Mock 面板）
7. 编写 **`preview-mock-controls.ts`** + `PreviewMockPanel.vue`（Mock 项与阶段矩阵对齐）
8. 实现 **App 壳** + 空 `game` store
9. `npm run build`；可选 `scripts/smoke-preview.mjs` 冒烟
10. 请用户在 **Preview** 并排对比各视角验收；通过后并行 ③ 等契约

## 通用 UI（scaffold 已含）

- **Toast / Alert / Loading / Input**：`public/core/components/*.js` + `src/lib/ui.ts`（toast 支持视口级挂载）
- **Lottie**：`useLottie()` + `LottieCanvas.vue`
- **Preview 多视口外壳**：`PreviewPhoneViewport` + `PreviewViewportPanel` + `preview` store 视口槽位
- **Preview 调试尺寸**：`PreviewDevicePanel` + `preview-devices.ts`（游戏专属调试放 `PreviewDevPanel`）
- **Mock 玩家池**：`src/mock/players.ts`（四类昵称样例）+ `truncateNickname()`
- **布局工具**：`useScrollAreaHeight()`（flex 一屏算滚动区高度）
- **设计令牌**：`src/styles/tokens.css`（`--kit-*`）+ `actions.css`（`.btn` / `.option`）

## 参考

- **Preview 规范**：`h5-game-kit/docs/PREVIEW-UI-SPEC.md`
- **完整示例**：werewords 仓库（`PreviewApp.vue`、`GameLayout.vue`、`PlayerList.vue`）
- `TECH-STACK.md` §9、`LOCAL-SERVER-SPEC.md`
- `product-doc.example.md`（werewords 在 kit `docs/templates/`）
