# 自研后端规格（h5-game-server）

> 多游戏一服务。新游戏 **不**新建后端仓，只加引擎与契约。  
> 与 **`WORKFLOW-MODES.md` ③-S** 对应。

## 1. 仓库

| 项 | 说明 |
|----|------|
| 默认仓名 | `h5-game-server` |
| 技术 | Go + Centrifugo + Redis +（按需）MySQL |
| 获取 | kit **不**自动 clone；进 ③-S 时 AI **询问**本机路径 |

## 2. 新游戏要做什么

1. `internal/games/<gameId>/` — Engine / State
2. `docs/games/<gameId>/` — `im.md`、`rest.md`、`fixtures/`；（§1.1 要管理端）`ops.md`
3. （§1.1 要 MySQL）`docs/sql/`
4. registry 注册

## 3. 隔离约定

| 维度 | 规则 |
|------|------|
| REST | `/api/games/{gameId}/...` |
| Channel | `game:{gameId}:{roomId}` |
| Redis | `h5g:{gameId}:{roomId}:snap` |

## 4. 写入顺序（强约束）

`改状态 → version++ → Save Redis → publish IM`。

## 5. 房间持久化

按 `roomId`。**0 人座位不写 Redis**（sync 无房只回内存空大厅；最后一人离开 / 局终回空立刻 `Delete`）。有人的 ready / 局中 snap TTL **30m**（滑动续期）。`ROOM_TTL_EMPTY` 配置项保留但不再生效。

## 6. 前端同步约定（供 ③-F 对齐）

IM 单通道；REST 与 IM 同 snapshot DTO；`version` 幂等。

## 7. ③ 子门禁（go test）

| 项 | 说明 |
|----|------|
| 命令 | `go test ./internal/games/<gameId>/... -count=1` |
| 范围 | 内存引擎；**不连** Redis / IM / MySQL |
| 与 ④ | **未全绿不得进 ④** |

## 8. ④ live（server 部分）

| 项 | 说明 |
|----|------|
| 命令 | `docker compose --profile test run --rm e2e`（live 编排内必跑） |
| 规格 | `docs/LIVE-INTEGRATION-SPEC.md` |
| MySQL | profile `live` + `mysql-test`（按 §1.1 演进） |

## 9. 运营与管理端

- §1.1 要管理端 → **③-S** 写 `ops` + SQL + handler；**③-A** 做 UI
- Mock admin E2E = **③ 子门禁**；真库 = **④ live**

## 10. Skill

`skills/h5-game-server/SKILL.md`（③-S）、`skills/h5-game-live-test/SKILL.md`（④）
