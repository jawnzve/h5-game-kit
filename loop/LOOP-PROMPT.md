# Cursor `/loop dynamic` Prompt 模板

将 `<gameId>` 替换为实际 gameId，在 Cursor 中执行：

```
/loop dynamic
```

粘贴以下内容：

```text
执行 h5-game-test（gameId=<gameId>）：
1. 阅读 h5-game-loop-kit/skills/h5-game-test/SKILL.md（或项目内 .cursor/skills）
2. npm run build && 运行 scripts/run-e2e.ps1 或 npx playwright test tests/e2e/<gameId>.spec.js（APP_PATH 为 App 版 app-index，不测 Preview）
3. 读取 tests/e2e/last-run.json
4. 若失败：仅修改 src/ 与 tests/，按 h5-game-dev 修复；IM 以该游戏 im.md 为准
5. 禁止修改 rest.md、im.md、fixtures（后端契约，AI 只读）；不访问后端代码仓库
6. 后端问题记入 BLOCKED: Backend，交后端同事处理
7. L2 全绿（含 spec 视角矩阵全部用例）则输出摘要并停止 Loop
8. 同一用例连续失败 3 次则停止，标注 BLOCKED 原因
```

## 停止条件

| 类型 | 条件 |
|------|------|
| Success | spec 声明的全部 L2 用例（含各视角）全绿 |
| Blocked: Backend | 缺契约 / REST 404 / 与后端文档不符 |
| Blocked: Spec | 同一用例 3 次仍失败 |
| User | `/loop stop` |
