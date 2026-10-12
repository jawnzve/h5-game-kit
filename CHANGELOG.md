# Changelog

## 0.2.1 — 2026-09-02

### ④ live 工程落地（werewords 首款）

- **h5-game-server**：`docker-compose.live.yml`、`config.live.docker.yml`（`mysql-test`）
- **werewords**：`test:e2e:live`、`werewords.live.spec.js`、`run-app-e2e-live.mjs`
- **h5-game-admin**：`test:e2e:live`、`admin-werewords.live.spec.cjs`
- **run-live-integration.ps1**：`profile live` + health 等待 + 强制跑 live（不再 SKIP）
- **run-live-integration.ps1**：mysql 种子（`docker cp` + `utf8mb4`）、`e2e` 镜像构建
- **orchestrator**：③ 进度一览模板

### 版本

- `VERSION` → `0.2.1`

---

## 0.2.0 — 2026-09-02

### 工作流重构（breaking）

- **①–⑤** 取代 v0.1 的 ①–⑥ / ⑤-O / ⑥-O
- **①** 必填 **§1.1 基础设施决策**（管理端 / MySQL）
- **③** 合并三轨自主开发：**③-S** 后端 · **③-F** 玩家 App · **③-A** 管理端
- **③ 子门禁**：`go test` + 玩家/admin **Mock** `test:e2e`（非最终交付证明）
- **④** 新增 **真联调自动化** 技术交付门禁（`LIVE-INTEGRATION-SPEC.md`、`h5-game-live-test`、`run-live-integration.ps1`）
- **⑤** 人工 **sim** 为 **产品交付终点**（须在 ④ live 全绿后）
- v0.1 **⑥-O 真库人工** 主验收并入 **④ admin live + DB 断言**

### 文档 / Skill

- 重写 `WORKFLOW-MODES.md`、`rules/h5-game-kit.mdc`
- 更新 orchestrator、spec、preview、server、dev、admin、test Skills
- 新增 `skills/h5-game-live-test/SKILL.md`
- 更新 `ADMIN-SPEC`、`BACKEND-SPEC`、`LOCAL-SERVER-SPEC`
- `product-doc.template.md` / `example`：§1.1 基础设施决策

### 版本

- `VERSION` → `0.2.0`

---

## 0.1.6 — 2026-09-02

### 自测门禁强化

- **③**：`go test ./internal/games/<gameId>/...` 全绿方可进 ④（`BACKEND-SPEC` / `h5-game-server` skill）
- **⑤-O**：product 有 §运营时，admin Playwright 全绿与玩家 ⑤ **并列门禁**，均绿后才进 ⑥
- 更新 `WORKFLOW-MODES`、`orchestrator`、`h5-game-admin` skill、Rule、`ADMIN-SPEC`

### 版本

- `VERSION` → `0.1.6`

---

## 0.1.5 — 2026-09-02

### init-game 可选生成 AGENT.md

- 新增 `docs/templates/AGENT.md.template`、`AGENTS.md.template`
- `init-game.ps1` 增加 `-InstallAgentMd`（已存在则跳过）；支持 `-GameName`
- `new-game.ps1` 默认传入 `-InstallAgentMd`

### 版本

- `VERSION` → `0.1.5`

---

## 0.1.4 — 2026-09-02

### 工具链文档小补

- `KIT_README` 模板增加 `ADMIN-SPEC` 链接
- `h5-game-spec` skill：① 产出 §运营、待确认项询问管理端
- `product-doc.example.md` 增加 §运营与管理端示例

### 版本

- `VERSION` → `0.1.4`

---

## 0.1.3 — 2026-09-02

### 管理端自动化验收（⑤-O）

- `ADMIN-SPEC.md` / `WORKFLOW-MODES.md` / `h5-game-admin` skill：补充 Playwright L2（Mock admin API）
- 新增 `docs/templates/admin-spec.template.md`
- werewords 参考实现：`h5-game-admin` A01–A09

### 版本

- `VERSION` → `0.1.3`

---

## 0.1.2 — 2026-09-02

### 管理端纳入工具链（③-O，可选）

- 新增 `docs/ADMIN-SPEC.md`：`h5-game-admin` 职责、API 约定、新游戏 checklist
- 新增 `skills/h5-game-admin/SKILL.md`（与 `h5-game-server` 并列）
- 扩展 `h5-game-server` / `h5-game-orchestrator` skill、`rules/h5-game-kit.mdc`、`WORKFLOW-MODES.md`、`BACKEND-SPEC.md`
- 模板：`BACKEND-CONTRACTS.README.md` 增加 `ops.md` / SQL 指针；`product-doc.template.md` 增加 §运营

### 版本

- `VERSION` → `0.1.2`

---

## 0.1.1 — 2026-08-04

### 工作流与契约

- 正式固定 **①–⑥**：product → Preview → 自研 `h5-game-server`（引擎 + im/rest/fixtures）→ App 对接 → L2 全绿 → sim-lobby 人工验收
- 契约真源仅在后端仓；前端只保留 `BACKEND-CONTRACTS.md` 指针
- **删除** `CONTRACT_GAPS`（模板、`init-game` 生成与各 Skill/Rule 引用）
- 清掉「外部/同事交付契约」「后端提供」「交后端」等旧方案表述；缺口一律回 **③** 改 `h5-game-server`
- 预览模式 Blocked 统一为 **③～⑥**（可停在 ②）

### Skills / Rule / 文档

- Rule：`h5-game-kit.mdc`；②：`h5-game-preview`（兼容清理旧 `h5-game-ui` / `h5-game-loop.mdc`）
- Skills / LOOP / TECH-STACK / PREVIEW-UI-SPEC / LOCAL-SERVER / product·spec 模板：对齐自研后端；`im.md` 引用统一经 `BACKEND-CONTRACTS.md` → server 仓
- e2e 用例模板 fixture 默认指向同级 `h5-game-server`（可用 `H5_SERVER_ROOT`）
- `sync-kit` / README：不再暗示前端仓存 `im.md` / fixtures 真源

### 版本

- `VERSION` → `0.1.1`（由本文件与 sync 写入游戏仓 `KIT_VERSION.txt`）

---

## 0.1.0 — 2026-06-30

- 初始 kit：Skill、Rule、文档模板、Playwright 脚手架、`init-game.ps1` / `sync-kit.ps1`
