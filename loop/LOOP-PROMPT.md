# Cursor `/loop dynamic` Prompt 模板

用于流程 **③ 子门禁**（`h5-game-test`）：对照 product / `spec.md` 跑 Playwright **Mock** L2 直至全绿。  
Mock 全绿后进入 **④ live**（`h5-game-live-test`）；**④ 全绿后** 进入 **⑤ sim**（本 Loop **不**代替用户点 sim-lobby）。

将 `<gameId>` 替换为实际 gameId，在 Cursor 中执行：

```
/loop dynamic
```

粘贴以下内容：

```text
执行 h5-game-test（gameId=<gameId>）— ③-F Mock 子门禁：
1. 阅读 h5-game-kit/skills/h5-game-test/SKILL.md 与 docs/WORKFLOW-MODES.md（③ 子门禁 → ④ live → ⑤ sim）
2. 对照 docs/games/<gameId>/product.md 与 spec.md；npm run build && npm run test:e2e（Mock，非 live）
3. 读取 tests/e2e/last-run.json
4. 若失败：优先改游戏仓 src/ 与 tests/；契约缺口 → ③-S h5-game-server
5. 禁止修改 hybirdapp-plugin.js；禁止在前端仓编造 im/rest
6. Mock L2 全绿 → 检查 ③-S go test、③-A admin Mock（若 §1.1 要管理端）→ 提示 ④ run-live-integration / h5-game-live-test
7. 同一用例连续失败 3 次 → BLOCKED
```

## 停止条件

| 类型 | 条件 |
|------|------|
| Success（③ 子门禁） | Mock L2 全绿 + ③ 各轨子门禁就绪 → **提示 ④**，停止 Loop |
| Blocked | 契约/环境/连续 3 次失败 |
| User | `/loop stop` |

## 参考

- Mock：`skills/h5-game-test/SKILL.md`
- Live：`skills/h5-game-live-test/SKILL.md`、`docs/LIVE-INTEGRATION-SPEC.md`
- 工作流：`docs/WORKFLOW-MODES.md`
