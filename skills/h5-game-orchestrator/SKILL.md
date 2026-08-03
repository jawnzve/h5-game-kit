---
name: h5-game-orchestrator
description: >-
  H5 Game Kit 总控：按仓库状态判断 ①–⑥，加载对应 Skill。
  触发：新游戏、继续开发、不知道下一步、用户提供游戏规则后自动编排。
---
# h5-game-orchestrator

## 作用

用户输入规则或说「继续」时，**先读本 Skill**，再加载 `h5-game-spec` / `preview` / `server` / `dev` / `test`。

目标顺序见 `docs/WORKFLOW-MODES.md`：

① product 确认 → ② Preview 确认 → ③ 自研后端 → ④ 对接 → ⑤ L2 全绿 → ⑥ 人工 sim 验收

## 状态判断（按 gameId 查 `docs/games/<gameId>/`）

| 条件 | 当前步 | 动作 |
|------|--------|------|
| 无 `product.md` 或仅空模板 | **①** | → `h5-game-spec` |
| product draft / §16 待确认且用户未确认 | **① 门禁** | 列待确认项，**不进 ②** |
| product 已确认，UI/Preview 未就绪 | **②** | → `h5-game-preview`（无骨架 → 提示 `new-game.ps1`） |
| Preview 已有但用户**未确认原型** | **② 门禁** | 请用户确认 Preview；改 UI 时同步 product；**不进 ③** |
| ② 已确认，后端契约/引擎未齐 | **③** | → `h5-game-server`（**先问**本机 `h5-game-server` 路径） |
| 契约 Ready，App 未接真接口 | **④** | → `h5-game-dev` |
| ④ 完成或要测修 | **⑤** | → `h5-game-test` / `/loop dynamic` |
| ⑤ 全绿 | **⑥** | 提示用户用 `sim-lobby` **人工验收**（对照 product）；AI 不代替点完算过 |

`CONTRACT_GAPS` 为 Blocked 且无自研后端路径 → 可停在 **预览终点（② 已确认）**，不得编造契约进 ④⑤。

## 用户只输入规则时

1. 无 gameId → 先问；询问 http-config 是否沿用既有 apiBase 预设
2. 无游戏仓 → 提示 `new-game.ps1` / `init-game.ps1 -InstallSkills`
3. **①** → 请用户确认 product
4. 确认后 **②**（不必等用户说「做 Preview」）
5. Preview 做好后 **请用户确认原型**；确认前不进 ③
6. ② 确认后 **③**（问后端路径）→ 齐后 **④** → **⑤**
7. ⑤ 全绿 → 明确提示 **⑥ 人工 sim 验收**

## 模式

- **预览**：可停在 ②（已确认）；③ 未齐不算失败
- **完整**：目标 ⑤ 全绿 + ⑥ 人工 sim 通过

## 禁止

- 跳过 ① 或 ② 人工确认门禁
- 为推进编造 `im.md` / `rest.md`
- 自动 `git clone` 后端仓（问人要路径）
- 无 scaffold 时编造 `app.js` / 改 `hybirdapp-plugin.js`
- ⑤ 未绿就宣称 ⑥ 验收完成

## 参考

- Rule：`rules/h5-game-kit.mdc`
- `docs/WORKFLOW-MODES.md`、`docs/BACKEND-SPEC.md`
- scaffold：`templates/scaffold/`
