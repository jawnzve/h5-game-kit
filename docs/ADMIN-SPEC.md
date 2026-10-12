# 管理端规格（h5-game-admin）

> 多游戏共用运营后台；与玩家链路 **①–⑤** 并行。  
> product **§1.1 需要管理端** 时：③-A 实现 + Mock E2E 为 **③ 子门禁**；**④ live** 验真 server + MySQL。

## 1. 仓库

| 项 | 说明 |
|----|------|
| 默认仓名 | `h5-game-admin` |
| 技术 | Vite + React + Ant Design |
| 获取 | kit **不**自动 clone；进 ③-A 时 AI **询问**本机路径 |

## 2. 职责划分

| 仓 | 职责 |
|----|------|
| **h5-game-server** | Go 引擎、Redis、Centrifugo、**MySQL**、`/admin/games/{gameId}/...` |
| **h5-game-admin** | 管理壳、页面、`src/api/<gameId>.ts` |
| **游戏前端仓** | `BACKEND-CONTRACTS.md` 指针；**不**复制 ops/SQL |

## 3. API 约定（共用壳）

| 项 | 说明 |
|----|------|
| 管理前缀 | `/admin/games/{gameId}/...` |
| 鉴权 | `X-Admin-Token` = server `ADMIN_TOKEN` |
| 环境选库 | 按 Host；本机 → 测试库（见 `docs/ops.md`） |

各游戏：`h5-game-server/docs/games/<gameId>/ops.md`（**③-S** 维护）。

## 4. 新游戏 checklist（§1.1 要管理端时）

1. **①** §1.1 确认需要管理端 + MySQL 范围
2. **③-S** `ops.md` + SQL + handler + `go test` 绿
3. **③-A** 页面 + `admin-spec.md`
4. **③ 子门禁** Mock `npm run test:e2e` 全绿
5. **④ live** admin HTTP + **MySQL 断言**（见 `LIVE-INTEGRATION-SPEC.md`）
6. **⑤ sim** 可选另开 admin 随手抽验

## 5. 参考实现

| 游戏 | ops | admin 页面 |
|------|-----|------------|
| werewords | `docs/games/werewords/ops.md` | `src/pages/werewords/` |

## 6. 自动化验收

### 6.1 ③ 子门禁（Mock）

| 项 | 说明 |
|----|------|
| 运行 | `npm run test:e2e` |
| Mock | `mock-admin-api.js` 拦截 `/admin/...` |
| 不测 | MySQL |

### 6.2 ④ 门禁（Live）

| 项 | 说明 |
|----|------|
| 运行 | `npm run test:e2e:live`（待各游戏实现）或 `run-live-integration.ps1` |
| 验 | 真 server + **查库** |
| 替代 | v0.1 的 **⑥-O 人工真库** 主验收 |

## 7. Skill

`skills/h5-game-admin/SKILL.md`（③-A）、`skills/h5-game-live-test/SKILL.md`（④）
