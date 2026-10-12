---
name: h5-game-orchestrator
description: >-
  H5 Game Kit 总控：按仓库状态判断 ①–⑤，加载对应 Skill。
  触发：新游戏、继续开发、不知道下一步、用户提供游戏规则后自动编排。
---
# h5-game-orchestrator

## 作用

用户输入规则或说「继续」时，**先读本 Skill**，再加载对应子 Skill。

目标顺序见 `docs/WORKFLOW-MODES.md`（**v0.2**）：

① → ② → ③（③-S + ③-F + ③-A[按需] + **子门禁**）→ **④ live 全绿** → **⑤ sim 人工**

## 状态判断（按 gameId 查 `docs/games/<gameId>/`）

| 条件 | 当前步 | 动作 |
|------|--------|------|
| 无 `product.md` 或仅空模板 | **①** | → `h5-game-spec` |
| product draft / **§1.1 基础设施**或玩法未确认 | **① 门禁** | 列待确认项，**不进 ②** |
| product 已确认，UI/Preview 未就绪 | **②** | → `h5-game-preview` |
| Preview 已有但用户**未确认原型** | **② 门禁** | 请用户确认 Preview；**不进 ③** |
| ② 已确认，后端引擎/契约未齐 | **③-S** | → `h5-game-server`（**先问** server 路径） |
| 引擎有但 `go test` 未绿 | **③-S 门禁** | 跑测至全绿 |
| ② 已确认，App 未完整对接 | **③-F** | → `h5-game-dev` |
| ① 要管理端，admin 页面未齐 | **③-A** | → `h5-game-admin`（**先问** admin 路径）；可与 ③-S/③-F 并行 |
| ③ 某轨完成，玩家 Mock L2 未绿 | **③ 子门禁** | → `h5-game-test` |
| ③ 有管理端，admin Mock L2 未绿 | **③ 子门禁** | → `h5-game-admin` `npm run test:e2e` |
| ③ 子门禁全绿，live 未绿或未跑 | **④** | → `h5-game-live-test` / `run-live-integration.ps1` |
| ④ 全绿 | **⑤** | 提示 `sim-lobby` **人工产品验收** |

`h5-game-server` 未齐且用户暂不开发后端 → 可停在 **预览终点（② 已确认）**。

**基础设施判断**：product **§1.1**「是否需要管理端」= 是 → ③ 含 **③-A** + ④ 含 admin live；「是否需要 MySQL」= 是 → ③-S 含 SQL + ④ 含 `mysql-test` 与查库断言。

## ③ 进度一览（向用户汇报时建议附带）

```
③ 自主开发进度 — <gameId>
  ③-S 后端（go test）     [ ] / [x]
  ③-F 玩家 App 对接       [ ] / [x]
  ③-A 管理端（§1.1 要）   [ ] / [x] / N/A
  子门禁 Mock E2E（玩家） [ ] / [x]
  子门禁 Mock E2E（admin）  [ ] / [x] / N/A
→ 上述全 [x] 后进 ④ live
```

判定参考：`go test` 绿、玩家 `npm run test:e2e` 绿、admin `npm run test:e2e` 绿（若要管理端）。

## 用户只输入规则时

1. 无 gameId → 先问；询问 http-config 是否沿用既有 apiBase 预设
2. 无游戏仓 → 提示 `new-game.ps1` / `init-game.ps1 -InstallSkills`
3. **①** → 写 product + **§1.1**；请用户确认玩法与基础设施
4. 确认后 **②** → Preview；**请用户确认原型**
5. ② 确认后 **③**（三轨 + 子门禁至全绿）
6. **④** live 至全绿
7. **⑤** 提示 sim 人工验收

## 模式

- **预览**：可停在 ②（已确认）；③ 未齐不算失败
- **完整（技术）**：③ 子门禁 + **④ live 全绿**
- **完整（产品）**：上述 + **⑤ sim 通过**

## 禁止

- 跳过 ① 或 ② 人工确认门禁
- ① 未确认管理端/MySQL 决策就进 ③-A 或宣称需要/不需要 ops
- 为推进编造 `im.md` / `rest.md` / `ops.md`
- 自动 `git clone` 后端/admin 仓（问人要路径）
- **③ 子门禁未绿进 ④**
- **④ 未绿进 ⑤**（正式产品验收）
- 宣称完整模式完成而缺上述门禁

## 参考

- Rule：`rules/h5-game-kit.mdc`
- `docs/WORKFLOW-MODES.md`、`docs/LIVE-INTEGRATION-SPEC.md`
- `docs/BACKEND-SPEC.md`、`docs/ADMIN-SPEC.md`
