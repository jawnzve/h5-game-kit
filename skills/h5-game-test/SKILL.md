---
name: h5-game-test
description: >-
  语音房 H5 流程⑤：Playwright L2、读 last-run.json、修至 spec 全绿。
  全绿后提示⑥人工 sim 验收。根因在服务端 → 改 `h5-game-server`。
---
# h5-game-test

## 流程位置

**⑤ 自动测试并修 bug** — ④ 完成后。  
**⑤ 全绿 ≠ 全部结束**：须提示用户做 **⑥ sim-lobby 人工验收**（对照 product）。

## 前置

- `tests/e2e/<gameId>.spec.js` 与 helpers
- **`APP_PATH`** = App `/games/<gameId>/app-index.html?e2e=1`（**不是** Preview）
- `spec.md` L2 + 视角矩阵；契约与 fixtures 就位
- 对照 **product.md** 逐步覆盖主流程与关键分支

## 步骤

0. 读 `docs/LESSONS.md`；视角看 `spec.md` / product
0b. spec 有表但用例未写 → 先补 Playwright（goto App）
1. `npm run build` + `npm start`（见 `LOCAL-SERVER-SPEC.md`）
2. `scripts/run-e2e.ps1` 或 `npx playwright test …`
3. **必读** `tests/e2e/last-run.json`
4. 失败 → 优先改游戏仓 `src/` / `tests/`；按 `BACKEND-CONTRACTS.md` → `h5-game-server/.../im.md`
5. 根因在服务端 → 改 `h5-game-server`（引擎/契约）；无本机路径或服务不可用时标 Blocked，提示回 ③
6. **禁止**改 `hybirdapp-plugin.js` 来「修」表现
7. 重跑直至全绿或 BLOCKED
8. **全绿后**：明确告知用户进入 **⑥**：用 `public/sim-lobby.html` 多窗对照 product 人工验收

## 多视角

- 不同 `mockBridge.userId` = 不同视角；Loop 全绿 = spec **每个视角用例**都过

## 停止条件

| 类型 | 条件 |
|------|------|
| Success（⑤） | spec 全部 L2（含视角）全绿 → 再提示 ⑥ |
| Blocked: Backend | 缺契约/服务不可用/与文档不符 → 回 ③ 改 `h5-game-server`；无路径或环境挂起时暂停 |
| Blocked: Spec | 同用例连续失败 3 次 |
| User | `/loop stop` |

## 禁止

- 修改 `hybirdapp-plugin.js`
- 在前端仓改 `rest.md` / `im.md` / fixtures
- ⑤ 未绿宣称 ⑥ 完成

## Helpers

- `tests/e2e/helpers/mock-im.js`、`mock-bridge.js`、`capture-logs.js`
