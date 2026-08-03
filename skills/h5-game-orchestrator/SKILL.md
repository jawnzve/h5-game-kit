---
name: h5-game-orchestrator
description: >-
  H5 Game Loop 总控：根据仓库状态判断当前步骤，加载对应 Skill 并推进流程。
  触发：新游戏、继续开发、不知道下一步、用户提供游戏规则后自动编排。
---
# h5-game-orchestrator

## 作用

用户输入游戏规则或说「继续」时，**先读本 Skill**，再按状态加载 `h5-game-spec` / `ui` / `dev` / `test`，减少手动喊步骤名。

## 状态判断（按 gameId 检查 `docs/games/<gameId>/`）

| 条件 | 当前步 | 动作 |
|------|--------|------|
| 无 `product.md` 或仅空模板 | **①** | → `h5-game-spec` |
| `product.md` 为 draft / §16 有待确认且用户未说确认 | **① 门禁** | 列出待确认项，**不进入 ②** |
| product 已确认，无可用 `src/` 或 UI 未实现 | **②** | → `h5-game-ui`（无工程骨架 → 提示跑 `new-game.ps1`，**不自行编造**） |
| UI 已有，`CONTRACT_GAPS` 为 Blocked | **③** | 更新缺口清单；**预览模式终点** = ② 完成 |
| 契约齐且 Ready for dev | **④** | → `h5-game-dev` |
| ④ 完成或用户要测修 | **⑤** | → `h5-game-test` 或 `/loop dynamic` |

读 `CONTRACT_GAPS.md`：`Blocked: Backend` → 不得进入 ④⑤。

## 用户只输入规则时

1. 若无 gameId → **先问** gameId；**询问 http-config 是否沿用 witchs-poison apiBase 预设**
2. 若无游戏仓 → 提示运行 `init-game.ps1 -InstallSkills`
3. 执行 **① h5-game-spec** → 产出 `product.md` → 请用户确认
4. 确认后 **自动进入 ②**（不必等用户说「做 UI」）
5. ② 完成后检查 `CONTRACT_GAPS`：
   - Blocked → 说明预览模式已到终点，列缺的后端交付物
   - Ready → 自动进入 **④**（不必等用户说「接功能」）
6. ④ 完成后提示 **⑤** 或主动跑 `h5-game-test`

## 模式

见 `docs/WORKFLOW-MODES.md`：

- **预览模式**：③ 不齐，停在 ②，**允许**
- **完整模式**：③ 齐，目标 ⑤ 全绿

## 禁止

- 为推进流程编造 `im.md` / `rest.md`
- 在无 scaffold 前自行创建 `app.js` / 重写 `hybirdapp-plugin.js`
- 跳过 ① 确认门禁进 ②

## 参考

- Rule：`rules/h5-game-kit.mdc`
- 运行时骨架：`templates/scaffold/`（`new-game.ps1` 已含）
- 模式：`docs/WORKFLOW-MODES.md`
