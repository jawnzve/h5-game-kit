# IM Fixtures

> 真源在自研后端仓 `h5-game-server/docs/games/<gameId>/fixtures/`。  
> 与引擎实现一并维护；**禁止**在无依据时编造业务字段。

## 命名

`docs/games/<gameId>/fixtures/<phase-or-scenario>.json`

## 格式

与该游戏 `im.md` 描述的消息体一致。

## 最少集

- [ ] ready 或首个可操作阶段
- [ ] 1 个 mid-game 阶段
- [ ] game-end（若适用）

## 校验

fixture 与 `im.md` / 引擎行为一致；前端 ④ 只读审查。
