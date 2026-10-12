# 真联调自动化规格（④）

> **④ 技术交付门禁**：Docker 真环境 + 自动化脚本，验玩家 H5、后端、管理端（按需）、MySQL（按需）全链路。  
> **不替代** ③ Mock 子测；**不替代** ⑤ 人工 sim 体感验收。

## 1. 目标

| 项 | 要求 |
|----|------|
| 触发 | ③ 三轨完成且 **子门禁全绿** |
| 通过标准 | 本规格所列 live 用例 **全部全绿** |
| 失败处理 | 在 ④ 修代码并重跑，**不进 ⑤** |
| 与 Mock | ③ `test:e2e`（Mock）仍保留；④ 验 Mock 覆盖不到的对接面 |

## 2. 环境（`h5-game-server` Docker Compose）

建议 profile：**`live`**（与现有 `test` profile 的 `smoke`/`e2e` 并存或合并演进）。

| 服务 | 用途 |
|------|------|
| `api` | Go API `:4000` |
| `redis` | 局内快照 |
| `centrifugo` | WebSocket IM |
| `mysql-test` | 测试库 + 迁移/种子（**仅** product ① 勾选 MySQL 时启用） |

`config.yml`：`APP_ENV=local`、`ALLOW_SIM=true`；MySQL 指向 `mysql-test`。

### 启动

```powershell
cd <h5-game-server>
docker compose --profile live up -d --build
```

## 3. 验收矩阵（按 product §1.1 基础设施决策裁剪）

| 链路 | 无管理端 / 无 MySQL | 有管理端 + MySQL |
|------|---------------------|------------------|
| 后端整局 | `docker compose --profile test run --rm e2e`（或 live profile 同等容器） | 同上 + Catalog 从 MySQL 读词 |
| 玩家 H5 | Playwright **live**：不加载 `mock-im` / `mock-game-api` | 同上 |
| 管理端 | 跳过 | Playwright **live**：真 `/admin/...` + **查库断言** |

### 3.1 玩家 live 范围（建议）

- **不必**重跑 ③ 全部 L2 用例（太慢、易 flaky）
- 跑 **主链路冒烟**：`ready` → 关键阶段 → `settle`（或 product 定义的最短完整局）
- 入口：`/games/<gameId>/app-index.html?e2e=1&live=1`（`live=1` 禁用 Mock helpers）
- `apiBase` 指向 `http://localhost:4000`（`http-config` local）

### 3.2 管理端 live 范围（有 ③-A 时）

- 增/改/删一条运营数据（如词库词条）
- HTTP 200 + `errno=0`
- **MySQL 断言**：对应表存在预期行（或 count 变化）
- Host 使用 `localhost`，应走**测试库**槽位（与 `docs/ops.md` 一致）

### 3.3 后端 e2e（必有）

- 沿用 `cmd/e2e`：`REST` + `Centrifugo` 订阅 + `version` 单调递增
- live 门禁 **必须包含** 此步（Go 客户端，无浏览器）

## 4. 命令约定

### 4.1 一键（推荐）

```powershell
# kit 根目录
& ".\scripts\run-live-integration.ps1" `
  -GameId "werewords" `
  -ServerRoot "H:\path\h5-game-server" `
  -GameRepo "H:\path\werewords" `
  -AdminRoot "H:\path\h5-game-admin"   # 无管理端可省略
```

### 4.2 分仓（实现演进中）

| 仓 | 建议脚本 | 说明 |
|----|----------|------|
| `h5-game-server` | `docker compose --profile test run --rm e2e` | 已有 |
| 游戏前端仓 | `npm run test:e2e:live` | werewords：`tests/e2e/werewords.live.spec.js` |
| `h5-game-admin` | `npm run test:e2e:live` | `tests/e2e/admin-werewords.live.spec.cjs` |

> **v0.2.1**：werewords + admin 已提供 live 用例；server 提供 `docker-compose.live.yml` + `config.live.docker.yml`。

## 5. 与 ⑤ sim 的分工

| | ④ live | ⑤ sim |
|--|--------|--------|
| 执行 | 自动化 | 人工 |
| 目的 | 联调正确性、落库、IM 时序 | 体感、动画、节奏、边角玩法 |
| 玩家身份 | `sim-e2e*` / 脚本固定 ID | `sim-seat-N` + 你选的 roomId |
| 管理端 | 自动化 CRUD + 查库 | 可选另开 admin 随手点 |

④ 发现联调 bug **在 ④ 修**；⑤ 若发现明显联调问题，应**回到 ④** 补用例并修至全绿。

## 6. Skill 与文档

- Skill：`skills/h5-game-live-test/SKILL.md`
- 工作流：`docs/WORKFLOW-MODES.md`
- 后端：`docs/BACKEND-SPEC.md` §7–§8
- 管理端：`docs/ADMIN-SPEC.md` §6
