# 管理端 L2 用例 — {{gameName}}（gameId: `{{gameId}}`）

> 仓: `h5-game-admin` · **③ 子门禁**: `npm run test:e2e`（Mock）  
> **④ live**: `npm run test:e2e:live`（真 server + MySQL，见 kit `LIVE-INTEGRATION-SPEC.md`）  
> Mock 拦截 `/admin/games/{{gameId}}/**`。契约见后端 `ops.md`。

| ID | 场景 | 断言要点 |
|----|------|----------|
| A01 | （填写） | GET 列表 + `X-Admin-Token` |
| A02 | | |

失败读 `tests/e2e/last-run.json`。
