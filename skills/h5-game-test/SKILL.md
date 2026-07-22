---
name: h5-game-test
description: >-
  语音房 H5 游戏流程⑤（终点）：Playwright L2、读 last-run.json、修 H5 直至 spec 全部用例全绿。
  全绿即产品文档、UI、前端逻辑、后端对接均完成。用于跑游戏测试、/loop dynamic 自动测修。禁止改 im.md/rest.md 与后端。
---
# h5-game-test

## 流程位置

**⑤ 自动测试并修 bug（流程终点）** — ④ 完成后；`/loop dynamic` 主要执行本 Skill。L2 全绿 = 项目完成。

## 前置

- `tests/e2e/<gameId>.spec.js` 与 helpers 已从 kit 初始化
- **`APP_PATH` = App 版** `/games/<gameId>/app-index.html?e2e=1`（**不是 Preview**；Preview 无功能逻辑，仅人工看 UI）
- `spec.md` 中 L2 用例表 + **视角矩阵** 已定义
- 后端 fixtures 已就位（只读引用）

## 步骤

0. 读 kit `docs/LESSONS.md`；游戏视角看 `spec.md`
0b. 若 `spec.md` 有 L2 表但 `<gameId>.spec.js` 未实现 → 先按 spec 补 Playwright 用例（**goto App 入口**）
1. `npm run build` 后启动静态服：`npm start`（见 `LOCAL-SERVER-SPEC.md`）
2. 运行：`scripts/run-e2e.ps1` 或 `npx playwright test tests/e2e/<gameId>.spec.js`
3. **必读** `tests/e2e/last-run.json`（console、pageErrors、failedRequests、gameLog）
4. 失败 → 仅改 `src/`、`tests/`；按 **该游戏 im.md** 修 H5（等同 h5-game-dev 约束）
5. 失败原因若指向契约/后端而非 H5 → 标注 **Blocked: Backend**，**不编造**修复
6. 重跑直至全绿或 BLOCKED
7. 通用测修疑难解决后 → `h5-game-lessons`；userId/IM 专有只改 `spec.md`

## 多视角

- 同一 fixture + 不同 `mockBridge.userId` = 不同视角
- Loop 全绿 = **spec 声明的每个视角用例** 都通过，不是每阶段只跑 1 条

## 停止条件

| 类型 | 条件 |
|------|------|
| Success | spec 全部 L2（含视角）全绿 |
| Blocked: Backend | 缺 fixture / REST 404 / 与后端文档不符 |
| Blocked: Spec | 同一用例连续失败 3 次 |
| User | `/loop stop` |

## 禁止

- 读取或修改后端代码仓库
- 改 `rest.md`、`im.md`、fixtures

## Loop Prompt

见 `h5-game-loop-kit/loop/LOOP-PROMPT.md`

## Helpers

- `tests/e2e/helpers/mock-im.js`
- `tests/e2e/helpers/mock-bridge.js`
- `tests/e2e/helpers/capture-logs.js`
