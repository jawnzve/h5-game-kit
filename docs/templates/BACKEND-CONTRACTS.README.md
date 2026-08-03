# 后端契约说明 — {{gameName}}（gameId: `{{gameId}}`）

> **契约真源在自研后端仓** `h5-game-server/docs/games/{{gameId}}/`（本前端仓不存副本）。  
> 由本工具链在 **③** 与引擎一并维护；前端 **④** 只读审查与引用。

## 交付物（后端仓路径）

| 文件 | 说明 |
|------|------|
| [`im.md`](../../../../h5-game-server/docs/games/{{gameId}}/im.md) | Centrifugo、channel、信封、snapshot |
| [`rest.md`](../../../../h5-game-server/docs/games/{{gameId}}/rest.md) | REST：身份、sync、actions |
| [`fixtures/`](../../../../h5-game-server/docs/games/{{gameId}}/fixtures/) | 与 im 一致的样例 JSON |

相对路径按游戏仓与 `h5-game-server` 的实际相对位置调整。

## AI 行为

- **③**：在后端仓撰写/修改契约，须与引擎一致
- **④**：前端仓只读上述文件 → 更新 `CONTRACT_GAPS.md`；**禁止**在前端仓复制改写契约
- 缺文档 → 回 ③ 补齐，或标 **Blocked: Backend**

## fixtures

见后端仓 `fixtures/README.md`；前端勿编造业务字段。
