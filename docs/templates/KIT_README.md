# H5 Game Kit — {{GameId}}

本文件是游戏仓到 **h5-game-kit** 的索引（由 init-game / sync-kit 生成）。

- Kit 版本: {{KitVersion}}（{{SyncSource}} 更新）
- Skill: `.cursor/skills/`（sync `-InstallSkills`）或 `{{KitRoot}}\skills\`
- 编排: `h5-game-orchestrator`
- 模式: `{{KitRoot}}\docs\WORKFLOW-MODES.md`（**①–⑤** v0.2）
- 真联调④: `{{KitRoot}}\docs\LIVE-INTEGRATION-SPEC.md`
- 技术栈: `{{KitRoot}}\docs\TECH-STACK.md`
- 自研后端: `{{KitRoot}}\docs\BACKEND-SPEC.md`
- 管理端: `{{KitRoot}}\docs\ADMIN-SPEC.md`（③-A，§1.1 要管理端时）
- 本地服: `{{KitRoot}}\docs\LOCAL-SERVER-SPEC.md`
- 测修 Loop: `{{KitRoot}}\loop\LOOP-PROMPT.md`（③ Mock 子门禁）
- 通用踩坑: `{{KitRoot}}\docs\LESSONS.md`（本仓镜像 `docs/KIT-LESSONS.md`）

升级 kit 后在本仓执行:

```powershell
& "<kit-root>\scripts\sync-kit.ps1" -GameId {{GameId}} -Target "<本仓>" -InstallSkills
```

> `WORKFLOW-MODES` / `LIVE-INTEGRATION-SPEC` / `TECH-STACK` 等 **不**拷进游戏仓；读 kit 真源（上表路径）。
