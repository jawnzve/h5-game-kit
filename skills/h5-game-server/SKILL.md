---
name: h5-game-server
description: >-
  语音房 H5 流程③-S：在 h5-game-server 注册 Engine、撰写 im/rest/fixtures；
  go test 全绿为 ③ 子门禁。① 要管理端/MySQL 时一并 ops/SQL/admin handler。
  触发：② Preview 已确认。
---
# h5-game-server

## 流程位置

**③-S 自研后端** — ② Preview **已人工确认**之后；产出契约 + 引擎 + **`go test` 全绿**（**③ 子门禁**）。

必读：`docs/BACKEND-SPEC.md`。

## 前置

1. **先问**用户：`h5-game-server` 绝对路径（**禁止**自动 clone）
2. `product.md` 已确认（含 **§1.1**）

## 输出

- `internal/games/<gameId>/` + `docs/games/<gameId>/im.md`、`rest.md`、`fixtures/`
- （§1.1 要管理端）`ops.md`、SQL、admin handler
- （§1.1 要 MySQL）`docs/sql/` 脚本
- **`go test ./internal/games/<gameId>/... -count=1` 全绿**

## 步骤

1. 确认后端仓路径
2. 实现状态机 + 契约 + 注册
3. 跑测至全绿
4. 若 §1.1 要管理端：完成 ops/SQL/handler → 提示 **③-A**
5. 与 ③-F、③-A 子门禁均绿 → **④ live**

## 单测约定

- 内存 `go test`；**不替代** ④ live
- `docker compose e2e` 归入 **④**（见 `LIVE-INTEGRATION-SPEC.md`）

## 禁止

- `go test` 未绿宣称 ③-S 完成或进 ④
- 编造契约字段

## 参考

- `docs/BACKEND-SPEC.md`、`docs/ADMIN-SPEC.md`、`docs/LIVE-INTEGRATION-SPEC.md`
