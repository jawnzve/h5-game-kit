---
name: h5-game-preview
description: >-
  语音房 H5 游戏流程②：按 product.md 生成共用 Vue SFC + Preview（阶段/状态/视角 mock 验收）
  + App 壳（app-index.html）。Preview 不接真接口；App 壳留 ④ 钩子。触发：product 确认后。
---
# h5-game-preview

## 流程位置

**② Preview** — `product.md` **已人工确认**后；产出 **Preview + App 壳**。  
（流程：① product 确认 → **② Preview 确认** → ③ 自研后端 → ④ 功能 → ⑤ L2 → ⑥ sim 验收。）

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

### Preview 版（人工验收原型）

- 入口：`preview/preview-index.html` → `src/entries/preview-main.ts`
- **外壳规范**：必读 **`docs/PREVIEW-UI-SPEC.md`**
  - 左侧 `preview-panel`：阶段（`stageId（中文名）`）/ **视口** / **调试** / **分阶段 Mock**
  - 右侧 **多视口横排**：`PreviewPhoneViewport` ×N
  - 内嵌 `GameShell`，与 App **共用**阶段 SFC
- Pinia **`preview` store**：**须有**局状态（可切换阶段、人数等）+ 视口槽位 + `perViewState` —— **不是纯静态展示**；简单跳转与状态存储参照 **werewords Preview**
- 改 Preview 行为/文案/阶段时，**同步修订 `product.md`**（反之亦然）；完成后 **请用户确认原型**，确认前 orchestrator **不进 ③**
- **`src/lib/preview-perspectives.ts`**、**`preview-mock-controls.ts`** 等按 product 填写
- toast 用视口级挂载（`data-toast-root`）
- **不**调用 REST/IM；**不**依赖 `im.md` 业务字段

### App 版（正式壳）

- 入口：`games/<gameId>/app-index.html` → `src/entries/app-main.ts`
- ② 仅共用 UI + `game` store 空壳；预留 `src/services/` 钩子
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
10. 请用户在 **Preview** 并排对比各视角验收；**用户明确确认原型后**再进入 ③（自研后端）

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
