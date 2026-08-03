---
name: h5-game-server
description: >-
  语音房 H5 流程③：在 h5-game-server 为新游戏注册 Engine、实现玩法并撰写 im/rest/fixtures。
  触发：Preview 已人工确认、用户确认进入后端，或 orchestrator 判定进 ③。
---
# h5-game-server

## 流程位置

**③ 自研后端** — ② Preview **已人工确认**之后；产出契约 + 可运行引擎，供 ④ 对接。

必读：`docs/BACKEND-SPEC.md`。

## 前置

1. **先问**用户：本机 `h5-game-server` 绝对路径？（**禁止**脚本自动 clone）
2. 若无仓：给出 clone 示例，等用户提供路径后再继续
3. `product.md` 已确认；② 已确认

## 输出

- `internal/games/<gameId>/`（Engine / State / actions / tick）
- `docs/games/<gameId>/im.md`、`rest.md`、`fixtures/`
- registry 注册
- 前端仓 `BACKEND-CONTRACTS.md` / `CONTRACT_GAPS.md` 指针更新为 Ready（契约齐后）

## 步骤

1. 确认后端仓路径可读
2. 对照 product 列阶段、动作、结算；实现状态机（单测优先）
3. 写 `im.md` / `rest.md` / fixtures，与实现一致
4. 注册 Engine；本地 `docker compose` / 测试按该仓 README
5. 更新前端 `CONTRACT_GAPS.md` → Ready for ④
6. 提示进入 **④ h5-game-dev**

## 禁止

- 为每个游戏新建后端 Git 仓 / 复制鉴权·验签·房间层
- 编造与实现不符的契约字段
- 修改各游戏仓的 `hybirdapp-plugin.js`
- 跳过「询问后端路径」

## 参考

- `docs/BACKEND-SPEC.md`
- 示例实现：werewords 所在 `h5-game-server/internal/games/werewords/`
