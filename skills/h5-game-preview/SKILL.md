---
name: h5-game-preview
description: >-
  语音房 H5 游戏流程②：按 product.md 生成共用 Vue SFC + Preview（阶段/状态/视角 mock 验收）
  + App 壳（app-index.html）。Preview 不接真接口；App 完整对接属 ③-F。触发：product 确认后。
---
# h5-game-preview

## 流程位置

**② Preview** — `product.md`（含 **§1.1**）**已人工确认**后。  
（流程 v0.2：① → **② Preview 确认** → ③ 自主开发 → ④ live → ⑤ sim。）

## 技术栈（必须）

见 `h5-game-kit/docs/TECH-STACK.md` §9：Vue 3 + TS + Pinia + 双入口。

## 前置

- **`product.md` 已确认**（含 §1.1）
- 无 Vite 骨架 → 提示 `init-game.ps1` / `new-game.ps1`，**停止**

## 输出

### Preview 版（人工验收原型）

- 入口：`preview/preview-index.html`
- **外壳**：`docs/PREVIEW-UI-SPEC.md`
- Pinia preview store：阶段跳转 + mock 状态
- **不**调用 REST/IM

### App 版（② 仅壳）

- 入口：`games/<gameId>/app-index.html`
- ② 仅共用 UI + `game` store 空壳；**完整 IM/REST 对接属 ③-F**

## 禁止

- ② 在 App 接真实 IM/REST（属 **③-F**）
- Playwright L2 测 preview 页

## 步骤

1. 读 PREVIEW-UI-SPEC + product
2. 实现共用 SFC + Preview 外壳 + App 空壳
3. `npm run build`；请用户 **Preview 验收**
4. **用户确认原型后** → 进入 **③**（`h5-game-orchestrator` 编排 ③-S / ③-F / ③-A）

## 参考

- `docs/PREVIEW-UI-SPEC.md`、`TECH-STACK.md`、`LOCAL-SERVER-SPEC.md`
