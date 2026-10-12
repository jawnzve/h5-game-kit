---
name: h5-game-test
description: >-
  语音房 H5 流程③ 子门禁（玩家）：Playwright Mock L2、读 last-run.json、修至 spec 全绿。
  全绿后与其他 ③ 子门禁一并进入 ④ live。根因在服务端 → 改 h5-game-server。
---
# h5-game-test

## 流程位置

**③-F 子门禁（Mock）** — ③-F App 对接完成后。  
**不是**最终交付门禁；**④ live** 才是真联调验收。Mock 全绿 + ③-S/③-A 子门禁全绿 → 进 **④**。

## 前置

- `tests/e2e/<gameId>.spec.js`；**Mock** API/IM（`mock-im.js`、`mock-game-api.js`）
- `APP_PATH` = App `app-index.html?e2e=1`（**不是** Preview，**不是** `live=1`）
- `spec.md` L2 + 视角矩阵

## 步骤

0. 读 `docs/LESSONS.md`、`spec.md`
1. `npm run build` + `npm start`
2. `npm run test:e2e` 或 `scripts/run-e2e.ps1`
3. **必读** `tests/e2e/last-run.json`
4. 失败 → 改 `src/` / `tests/`；契约缺口 → **③-S**
5. 全绿 → 确认 ③-S（及 ③-A）子门禁 → 提示 **④ `h5-game-live-test`**

## 停止条件

| 类型 | 条件 |
|------|------|
| Success（③ 子门禁） | spec L2 全绿 → 检查 ③ 各轨 → 进 **④** |
| Blocked | 契约/环境/连续 3 次失败 |

## 禁止

- 用 Mock E2E **代替** ④ live
- Mock 未绿进 ④ 或宣称完整模式技术交付完成
- 改 `hybirdapp-plugin.js`

## Helpers

- `tests/e2e/helpers/mock-im.js`、`mock-bridge.js`、`capture-logs.js`

## 参考

- `docs/WORKFLOW-MODES.md`
- ④：`skills/h5-game-live-test/SKILL.md`
