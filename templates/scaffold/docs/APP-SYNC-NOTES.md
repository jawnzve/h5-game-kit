# App 同步链路（④ 从 werewords 回拷说明）

scaffold 已含：`public/sim-lobby.html`（`{{gameId}}` / `{{gameTitle}}` 占位）。

下列文件以 **werewords** 为实现参考，新游戏 ④ 时按需拷贝并改 gameId（不必在 init 时强制覆盖）：

| 文件 | 用途 |
|------|------|
| `src/lib/identity.ts` | sim / bridge 自动降级 |
| `src/services/im.ts` | Centrifugo 单通道 |
| `src/lib/snapshot.ts` | version decide + 映射 |
| `src/lib/throttle.ts` | `throttleApiCall` |
| `src/lib/server-time.ts` | ServerTimeSync 封装 |
| `src/lib/game-sync.ts` | 前后台 sync 门闩 |
| `src/lib/app-lifecycle.ts` | 进后台停表 / 回前台校准 |
| `src/lib/app-boot.ts` | im-token → Connect → sync |

退出确认：各游戏按 `product.md` 接线；可用 `web-alert` + `mountRoot` → `[data-toast-root]`（见 werewords `exit-confirm.ts` 示例，**非**必选模板）。

后端 TTL / Engine：见 kit `docs/BACKEND-SPEC.md`。
