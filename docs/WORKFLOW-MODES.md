# 工作流模式

> **v0.2**：①–⑤ 五步；③ 合并三端开发；④ 真联调自动化门禁；⑤ sim 产品终点。

## 完整模式（目标顺序）

```
人工输入规则/目标
  → ① product.md + 基础设施决策 → 【人工确认】
  → ② Preview 原型（可交互 mock）→ 【人工确认】
  → ③ 自主开发（后端 + 玩家前端 + 管理端[按需]）+ ③ 子门禁 Mock/内存自测
  → ④ 真联调自动化验收 → 【全绿 · 技术交付】
  → ⑤ 【人工】sim-lobby 多窗体验验收 → 【产品终点】
```

| 步 | 含义 | 门禁 |
|----|------|------|
| ① | AI 写 `product.md`，**含基础设施决策**（管理端 / MySQL 等） | **人工确认**后才进 ② |
| ② | Preview：阶段/视角可预览；**仅** mock 状态与跳转 | **人工确认**后才进 ③ |
| ③ | 三轨开发：**③-S** 后端 · **③-F** 玩家 App · **③-A** 管理端（① 勾选时） | ③ **子门禁**全绿后进 ④ |
| ④ | 真环境联调自动化（见 `LIVE-INTEGRATION-SPEC.md`） | **全绿**后进 ⑤ |
| ⑤ | 人工 sim 验收 | ④ 全绿后；**产品交付终点** |

### ③ 自主开发（三轨）

| 轨 | 仓 | Skill | 产出 |
|----|-----|-------|------|
| **③-S** | `h5-game-server` | `h5-game-server` | 引擎 + `im.md` / `rest.md` / fixtures +（按需）`ops.md` / SQL / admin handler |
| **③-F** | 游戏前端仓 | `h5-game-dev` | App 完整接 IM/REST/sync（**非** Preview） |
| **③-A** | `h5-game-admin` | `h5-game-admin` | 运营页面 + `admin-spec.md`（**仅** ① 需要管理端时） |

三轨可并行；**③ 完成** = 各轨实现齐备 + **子门禁**全绿。

### ③ 子门禁（Mock / 内存 · 非最终交付证明）

| 子门禁 | 命令 | 说明 |
|--------|------|------|
| 后端 | `go test ./internal/games/<gameId>/... -count=1` | 内存引擎；不连 Redis / WS / MySQL |
| 玩家前端 | `npm run test:e2e`（Mock API/IM） | 对照 `spec.md` L2；Skill：`h5-game-test` |
| 管理端 | `h5-game-admin` `npm run test:e2e`（Mock `/admin/...`） | 仅 ① 需要管理端时 |

**未绿不得进 ④**。Mock 子测用于开发期快速回归，**不能替代** ④ 真联调。

### ④ 真联调自动化（技术交付门禁）

| 项 | 说明 |
|----|------|
| 规格 | `docs/LIVE-INTEGRATION-SPEC.md` |
| Skill | `h5-game-live-test` |
| 环境 | Docker：`api` + `redis` + `centrifugo` +（按需）`mysql-test` |
| 验什么 | 玩家 H5 ↔ server ↔ IM；（有管理端）admin ↔ server ↔ MySQL |
| 入口 | `scripts/run-live-integration.ps1`（或各仓 `test:e2e:live`） |
| 与 ③ 子测 | **④ 全绿**才是完整模式技术交付；红了在 ④ 修，不留给 ⑤ 当主战场 |

### ⑤ sim（产品终点）

| 项 | 说明 |
|----|------|
| 入口 | `public/sim-lobby.html` |
| 前置 | **④ 全绿** |
| 真/假 | **真** REST / IM / Redis / MySQL（玩法）；**仅** sim 玩家 ID、roomId、无 App 桥为模拟 |
| 管理端 | sim-lobby **只开玩家多窗**；有管理端时 ④ 已验 admin+DB，⑤ 可另开 admin **随手抽验** |

**完整模式终点**：③ 子门禁全绿 + **④ live 全绿** + **⑤ 人工 sim 通过**。

## 预览模式（③ 未齐时允许）

- 可完成 **① + ②**（产品已确认 + Preview 可交互验收）
- ③～⑤ 标 **Blocked: Backend**（或未开后端），**不算失败**
- 继续补齐后再进 ③…
- **禁止**为推进而编造 IM/REST 字段

**预览终点**：② 经人工确认的 Preview（非纯静态截图页）。

## 新旧对照（v0.1 → v0.2）

| v0.1 | v0.2 |
|------|------|
| ③ 仅后端 | **③-S** 后端（同左） |
| ④ 前端对接 | **③-F** 玩家完整开发 |
| ③-O 管理端 | **③-A** 管理端 |
| ⑤ 玩家 Mock E2E（交付门禁） | **③ 子门禁** |
| ⑤-O admin Mock（交付门禁） | **③ 子门禁** |
| ⑥ 人工 sim | **⑤** 人工 sim（产品终点） |
| ⑥-O 真库人工 | **并入 ④** admin live + DB 断言 |

## 与 Rule / Skills

- Rule：`rules/h5-game-kit.mdc`
- 编排：`skills/h5-game-orchestrator/SKILL.md`
- ①：`h5-game-spec` · ②：`h5-game-preview`
- ③-S：`h5-game-server` · ③-F：`h5-game-dev` · ③-A：`h5-game-admin`
- ③ 子测 Mock：`h5-game-test`（玩家）、`h5-game-admin`（管理端）
- ④：`h5-game-live-test`
- 踩坑：`h5-game-lessons`
