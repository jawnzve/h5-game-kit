# Cursor `/loop dynamic` Prompt 模板

用于流程 **⑤**（`h5-game-test`）：对照 product / `spec.md` 跑 Playwright L2 直至全绿。  
全绿后进入 **⑥ 人工 sim 验收**（本 Loop **不**代替用户点 sim-lobby）。

将 `<gameId>` 替换为实际 gameId，在 Cursor 中执行：

```
/loop dynamic
```

粘贴以下内容：

```text
执行 h5-game-test（gameId=<gameId>）：
1. 阅读 h5-game-kit/skills/h5-game-test/SKILL.md（或项目内 .cursor/skills）与 docs/WORKFLOW-MODES.md（⑤→⑥）
2. 对照 docs/games/<gameId>/product.md 与 spec.md；npm run build && 运行 scripts/run-e2e.ps1 或 npx playwright test tests/e2e/<gameId>.spec.js（APP_PATH 为 App 版 app-index，不测 Preview）
3. 读取 tests/e2e/last-run.json
4. 若失败：优先改游戏仓 src/ 与 tests/；按该游戏 im.md（真源在 h5-game-server/docs/games/<gameId>/）
5. 根因在自研后端时可改 h5-game-server；禁止在前端仓篡改/编造 im.md、rest.md、fixtures
6. 禁止修改 public/core/bridge/hybirdapp-plugin.js
7. 契约/引擎缺口 → 改 h5-game-server（回 ③）；无本机路径或服务不可用 → BLOCKED: Backend，勿瞎猜字段
8. L2 全绿（含 spec 视角矩阵全部用例）则输出摘要、提示用户做 ⑥ sim-lobby 人工验收，并停止 Loop
9. 同一用例连续失败 3 次则停止，标注 BLOCKED 原因
```

## 停止条件

| 类型 | 条件 |
|------|------|
| Success（⑤） | spec 全部 L2（含视角）全绿 → **提示 ⑥**，停止自动 Loop |
| Blocked: Backend | 缺契约 / 服务不可用 / 与文档不符 → 回 ③ 改 server；环境不可用时暂停 |
| Blocked: Spec | 同一用例 3 次仍失败 |
| User | `/loop stop` |

## 参考

- Skill：`skills/h5-game-test/SKILL.md`
- 工作流：`docs/WORKFLOW-MODES.md`
- 后端：`docs/BACKEND-SPEC.md`
