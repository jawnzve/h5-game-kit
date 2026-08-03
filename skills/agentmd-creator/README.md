# AgentMD Creator

基于 ETH Zurich 研究的 AGENT.md / CLAUDE.md 上下文文件生成技能。遵循"极简主义"原则，只包含 Agent 无法自己发现的信息。

---

## 功能特性

- **研究驱动** — 基于 ETH Zurich 2026 年论文 "Evaluating AGENTS.md"
- **极简输出** — 目标 30 行以内，拒绝冗余
- **工具为中心** — 提取具体的命令，而非概念解释
- **陷阱驱动** — 只写 Agent 会踩的坑
- **多平台支持** — 生成 CLAUDE.md / AGENTS.md / .cursorrules / copilot-instructions.md

## 快速开始

### 1. 安装技能

本 Skill 已随 **`h5-game-kit`** 分发：

```
h5-game-kit/skills/agentmd-creator/
```

安装方式（与 kit 内其他 Skill 相同）：

| 方式 | 做法 |
|------|------|
| **@ 引用** | `@h5-game-kit/skills/agentmd-creator/SKILL.md` |
| **复制到个人** | 复制到 `%USERPROFILE%\.cursor\skills\` 或 `~/.cursor/skills/` |
| **复制到项目** | 复制到 `<repo>/.cursor/skills/` |

上游仓库（可选更新）：https://gitea.haochang.tv/agent/agentmd-creator/

### 2. 触发使用

对 Agent 说：
- "生成 AGENT.md"
- "创建 CLAUDE.md"
- "优化当前项目的上下文文件"
- "init context file"

### 3. 工作原理

Agent 会：
1. 扫描仓库（pyproject.toml, package.json, Makefile, CI 配置等）
2. 提取非显而易见的信息
3. 按标准模板生成极简上下文文件
4. 验证不超过 30 行

## 版本

当前版本：**v1.0.0**

遵循 Semantic Versioning。版本历史见 CHANGELOG.md。

## 参考

- 论文：[arxiv.org/abs/2602.11988](https://arxiv.org/abs/2602.11988)
- 原始技能：[mryll/skills/agentmd](https://github.com/mryll/skills/tree/main/skills/agentmd)
