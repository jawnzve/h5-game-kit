---
name: agentmd-creator
category: software-development
version: "1.0.0"
description: |
  基于 ETH Zurich 研究的 AGENT.md / CLAUDE.md 上下文文件生成技能。
  遵循"极简主义"原则：只包含 Agent 无法自己发现的信息。
  触发词：「生成 AGENT.md」「创建 CLAUDE.md」「写上下文文件」「agentmd」「init context file」「生成 agent 指令」「优化 AGENT.md」「重写上下文文件」。
---

# AgentMD Creator — 研究驱动的上下文文件生成器

> "Only include what the agent CANNOT discover by navigating the repo."
> — ETH Zurich, "Evaluating AGENTS.md", Feb 2026

## 核心原则

### 1. 极简主义（Concise is Key）
- **目标：30 行以内**（不含 frontmatter 和空行）
- 文档完善的仓库 → 5-10 行
- 无文档的仓库 → 最多 40 行
- 每一条都要问："Agent 没有这个会浪费时间吗？"

### 2. 不可发现性优先
只写 Agent 通过 `ls`/`find`/`grep`/读 README **无法发现**的内容：
- 具体的工具命令（`uv sync` 而非 "用 uv"）
- 非显而易见的约定（"新接口放 v2/ 而非 v1/"）
- Agent 会踩的坑（"bcrypt 5.x 与 passlib 不兼容"）

### 3. 明确禁止的内容
- 项目概述/描述 → Agent 读 README
- 目录结构列表 → Agent 会 `find`
- 安装说明 → 已在 pyproject.toml/package.json
- Git 工作流 → 与任务无关
- 已配置 linter 的代码风格 → 配置文件就是指南
- 依赖列表 → 已在 lock 文件

## 心智模型

### Research-Backed（研究驱动）
ETH Zurich 2026 年论文结论：
- LLM 生成的上下文文件：**-3% 性能，+23% 成本**
- 人工写的极简文件：**+4% 性能**
- 工具提及效果：Agent 使用率从 0.01 跳到 1.6x/任务

### Tool-Centric（工具为中心）
Agent 最依赖的是**具体的工具命令**，不是概念解释。
"Use `uv sync`" > "Use uv for package management"

### Trap-Driven（陷阱驱动）
每个规则都对应一个 Agent 会浪费时间的场景。
不写"我们使用 FastAPI"，写"生命周期用 lifespan 替代 on_event"。

## 决策启发式

| 场景 | 做法 |
|------|------|
| 用户说"生成 AGENT.md" | 先扫描仓库，提取非显而易见信息 |
| 发现 pyproject.toml | 提取 scripts 字段、build system、依赖工具 |
| 发现 package.json | 提取 scripts、package manager |
| 发现 Makefile/Justfile | 提取常用 targets |
| 发现 CI 配置 | 提取实际运行的命令（ground truth） |
| 发现 linter 配置 | 不重复规则，只提"已配置 ruff，见 ruff.toml" |
| 发现 README.md | 标记为"已有文档"，AGENT.md 更短 |
| 文件超过 30 行 | 逐行审查，删除 Agent 能发现的内容 |
| 用户有 skills 系统 | frontmatter 加 skills 列表 |

## 仓库扫描清单

生成 AGENT.md 前，按顺序扫描以下文件提取信息：

1. **pyproject.toml** → scripts、build system、依赖工具（uv/poetry/pip）
2. **package.json** → scripts、package manager（npm/pnpm/yarn/bun）
3. **Makefile / Justfile** → 常用 targets
4. **start.sh / dev.sh** → 启动命令、PID 管理、服务控制
5. **.env.example** → 环境变量、配置方式
6. **CI 配置 (.github/workflows/, .gitlab-ci.yml)** → 实际运行的命令（ground truth）
7. **linter 配置 (ruff.toml, .eslintrc, etc.)** → 已配置则不在 AGENT.md 重复规则
8. **app/main.py / src/index.ts** → 生命周期、路由前缀、中间件
9. **tests/conftest.py / jest.config.js** → 测试框架、fixture 模式
10. **README.md** → 标记已有文档，AGENT.md 可以更短

**提取原则**：只记录 Agent 无法从文件名直接推断的内容。例如：
- ✅ "生命周期用 lifespan 替代 on_event"（非显而易见）
- ❌ "使用 FastAPI"（从 import 可见）
- ✅ "bcrypt==4.0.1（5.x 与 passlib 不兼容）"（陷阱）
- ❌ "SQLAlchemy ORM"（从依赖可见）

## 标准模板

```markdown
---
skills:
  - skill-name-1
  - skill-name-2
---

# project-name

## Tooling

- 包管理: `exact command`
- 启动: `exact command`
- 测试: `exact command`
- 构建: `exact command`
- 脚本: `exact command`

## Required Services

- service: `how to start`

## Non-Obvious Rules

- rule that would waste agent's time
- convention not in README/docs
- trap agent would fall into

## Project-Specific Patterns

- test fixtures approach
- where new code goes
- codegen/migration workflow
```

## 反模式

- 生成目录结构 tree
- 复制 README 内容
- 写"我们使用 X 技术"
- 超过 30 行不审查
- 包含可发现的安装步骤
- 重复 linter 已强制执行的规则

## 诚实边界

- 不替代仓库自身的文档
- 对无文档仓库效果有限（+2.7% 提升）
- 需要人工审查生成的文件
- 不能预测 Agent 的所有陷阱
