---
name: h5-game-admin
description: >-
  语音房 H5 流程③-A：在 h5-game-admin 按 ops.md 实现运营页面。
  仅当 product §1.1 需要管理端时。Mock Playwright 全绿为 ③ 子门禁；真库验收入 ④ live。
  触发：§1.1 要管理端、③-S 已有 ops.md。
---
# h5-game-admin

## 流程位置

**③-A 管理端开发** — 仅 **① §1.1 需要管理端** 时；可与 **③-S / ③-F** 并行。

必读：`docs/ADMIN-SPEC.md`、后端 `ops.md`。

## 前置

1. **先问** `h5-game-admin` 路径
2. **先问/确认** `h5-game-server` 路径；`ops.md` 与 handler 一致
3. product **§1.1** 已确认需要管理端

## 输出

- `src/pages/<gameId>/`、`src/api/<gameId>.ts`
- `docs/admin-spec.md`、Playwright + Mock admin API
- **③ 子门禁**：`npm run test:e2e`（Mock）全绿

## 步骤

1. 读 `ops.md`；实现页面
2. 写 `admin-spec` + Mock Playwright
3. **`npm run test:e2e` 至全绿**
4. 与 ③-S、③-F 子门禁均绿 → **④**（admin live + MySQL 断言）

## 门禁

| 场景 | 规则 |
|------|------|
| §1.1 无管理端 | 不跑 ③-A / admin 子门禁 |
| §1.1 有管理端 | Mock E2E **全绿** 方可进 ④ |
| 真库 | **④ live**，非本 Skill Mock 测 |

## 禁止

- 编造 `ops.md`
- 用 Mock E2E **替代** ④ admin live
- ③-A Mock 未绿进 ④

## 参考

- `docs/ADMIN-SPEC.md`、`docs/LIVE-INTEGRATION-SPEC.md`
