# Changelog

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
