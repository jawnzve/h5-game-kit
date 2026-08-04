# H5 Game Kit — {{GameId}}

本文件是游戏仓到 **h5-game-kit** 的索引（由 init-game / sync-kit 生成）。

- Kit 版本: {{KitVersion}}（{{SyncSource}} 更新）
- Skill: `.cursor/skills/`（sync `-InstallSkills`）或 `{{KitRoot}}\skills\`
- 编排: `h5-game-orchestrator`
- 模式: `{{KitRoot}}\docs\WORKFLOW-MODES.md`（①–⑥ / 预览·完整）
- 技术栈: `{{KitRoot}}\docs\TECH-STACK.md`
- 自研后端: `{{KitRoot}}\docs\BACKEND-SPEC.md`
- 本地服: `{{KitRoot}}\docs\LOCAL-SERVER-SPEC.md`
- 测修 Loop prompt: `{{KitRoot}}\loop\LOOP-PROMPT.md`
- 通用踩坑（**唯一真源**）: `{{KitRoot}}\docs\LESSONS.md`
- 本仓镜像: `docs/KIT-LESSONS.md`（sync-kit 更新；勿改镜像）

记入通用坑：对 AI 说「记进工具包 LESSONS」→ 改 kit 真源，勿改镜像。

升级 kit 后在本仓执行:

```powershell
& "<kit-root>\scripts\sync-kit.ps1" -GameId {{GameId}} -Target "<本仓>" -InstallSkills
```

> `WORKFLOW-MODES` / `TECH-STACK` / `BACKEND-SPEC` **不**拷进游戏仓；需要时读 kit 真源（上表路径）。游戏仓只保留本指针文件 + `KIT-LESSONS` 镜像。
>
> 旧名 `LOOP_README.md` 已废弃（工具包原名 H5 Game Loop Kit → 现 **H5 Game Kit**）。
