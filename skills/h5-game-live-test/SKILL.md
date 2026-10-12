---
name: h5-game-live-test
description: >-
  语音房 H5 流程④：真环境联调自动化验收。Docker 起真服务，跑 server e2e +
  玩家/admin live Playwright（按需）。全绿后进 ⑤ sim。触发：③ 子门禁全绿后。
---
# h5-game-live-test

## 流程位置

**④ 真联调自动化** — ③ 三轨完成且 **子门禁（go test + Mock E2E）全绿** 之后。  
**④ 全绿** = 完整模式 **技术交付**；再提示用户 **⑤ sim** 产品验收。

必读：`docs/LIVE-INTEGRATION-SPEC.md`。

## 前置

1. **先问**路径：`h5-game-server`（必须）、游戏前端仓、`h5-game-admin`（① §1.1 要管理端时）
2. `docker compose` 可用；`config.yml` 已配置
3. product **§1.1** 已确认（决定是否跑 admin live / mysql-test）

## 步骤

1. 读 `LIVE-INTEGRATION-SPEC.md` 与 product §1.1
2. 启动 live 环境：
   ```powershell
   cd <h5-game-server>
   docker compose --profile live up -d --build
   # profile live 未就绪时，可暂用：docker compose up -d --build
   ```
3. 跑后端 e2e：
   ```powershell
   docker compose --profile test run --rm e2e
   ```
4. 游戏前端仓 live 用例（实现后）：
   ```powershell
   npm run build && npm run test:e2e:live
   ```
5. 有管理端时 admin live（实现后）：
   ```powershell
   cd <h5-game-admin>
   npm run test:e2e:live
   ```
6. 或一键：
   ```powershell
   & "<kit-root>\scripts\run-live-integration.ps1" -GameId "<gameId>" ...
   ```
7. 失败 → 修 `src/` / server / admin；**在 ④ 重跑至全绿**；根因契约 → 回 **③-S**
8. **全绿后** → 告知用户进入 **⑤ sim-lobby**

## 停止条件

| 类型 | 条件 |
|------|------|
| Success（④） | live 矩阵全绿 → 提示 **⑤** |
| Blocked: Env | Docker / MySQL / 路径不可用 |
| Blocked: Not implemented | 某游戏 `test:e2e:live` 未实现 → 先补用例或标 Blocked |
| User | 用户暂停 |

## 禁止

- 用 ③ Mock E2E **代替** ④
- ④ 未绿宣称 ⑤ 完成或完整模式技术交付完成
- ④ 未绿把联调 bug 留给 ⑤ 当主修场
- 改 `hybirdapp-plugin.js`

## 参考

- `docs/LIVE-INTEGRATION-SPEC.md`
- `h5-game-server/README.md`（e2e / compose）
- Skill：`h5-game-test`（③ Mock，对照用）
