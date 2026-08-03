# 自研后端规格（h5-game-server）

> 多游戏一服务。新游戏 **不**新建后端仓，只加引擎与契约。  
> 与 Rule / `WORKFLOW-MODES.md` 中的 **③** 对应。

## 1. 仓库

| 项 | 说明 |
|----|------|
| 默认仓名 | `h5-game-server` |
| 技术 | Go + Centrifugo + Redis |
| 获取 | kit **不**自动 clone；进 ③ 时 AI **询问**本机路径，人或自行 clone 后提供 |

## 2. 新游戏要做什么

**只需：**

1. `internal/games/<gameId>/` — 实现 `engine.Engine` / `State`（状态机、裁决、Tick）
2. `docs/games/<gameId>/` — `im.md`、`rest.md`、`fixtures/`
3. 在 `cmd/server`（或 registry 装配处）**注册**该 Engine

**不必重做（共用层已有）：**

- `config`：Host / `APP_ENV`、签密钥
- `auth`：sim / bridge、sim 昵称头像派生
- 验签、`ALLOW_SIM`
- `room`：Redis snap、按 roomId 的 TTL、active 集合、version
- `im`：Centrifugo JWT + publish
- HTTP 壳：`/api/games/{gameId}/...`
- TickLoop

## 3. 隔离约定

| 维度 | 规则 |
|------|------|
| REST | `/api/games/{gameId}/...` |
| Channel | `game:{gameId}:{roomId}` |
| Redis | `h5g:{gameId}:{roomId}:snap` |
| 契约 | `docs/games/{gameId}/` |

## 4. 写入顺序（强约束）

`改状态 → version++ → Save Redis → publish IM`（先持久化再广播）。

## 5. 房间 TTL（按 roomId，非 matchId）

默认（可用 `ROOM_TTL_*` 覆盖）：

| 状态 | TTL |
|------|-----|
| 局中 / ready 有人 | 1h（写入滑动刷新） |
| 空房 / settle | 5m |

`matchId` 仅局内标识，不单独建 Redis key、不做历史归档（除非产品另行要求）。

## 6. 前端同步约定（供 ④ 对齐）

- IM **单通道** Centrifugo；REST 与 IM 均可下发同结构 snapshot；`version` 幂等
- sync 与 IM 同 DTO；断线/回前台/漏消息走 sync
- 详见 TECH-STACK 与 werewords 实现

## 7. Skill

步骤清单见 `skills/h5-game-server/SKILL.md`。
