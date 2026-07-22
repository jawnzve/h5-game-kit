# 模板示例

## 示例 1：Python/FastAPI 项目

```markdown
---
skills:
  - fastapi-mvc-sqlite
---

# drug-m

## Tooling

- 包管理: `uv sync`
- 启动: `./start.sh start`
- 测试: `uv run pytest tests/ -v`
- 构建: `./start.sh build`
- 脚本: `start.sh` 支持 start/stop/restart + PID 管理

## Required Services

- SQLite: 本地文件，无需启动

## Non-Obvious Rules

- bcrypt==4.0.1（5.x 与 passlib 不兼容）
- 生命周期用 @asynccontextmanager lifespan
- 业务逻辑在 services 层，不在路由层
- 新接口放 app/api/v1/endpoints/

## Project-Specific Patterns

- 测试用 pytest + httpx.AsyncClient
- 密码哈希用 app/core/security.py 的 get_password_hash
```

## 示例 2：Node.js/前端项目

```markdown
---
skills:
  - vitepress-interactive-markdown
---

# skills-market

## Tooling

- 包管理: `pnpm install`
- 启动: `pnpm docs:dev`
- 构建: `pnpm docs:build`
- 部署: `pnpm docs:deploy`

## Required Services

- 无

## Non-Obvious Rules

- VitePress markdown 不支持 <aside>，用 <div class="aside">
- 技能 README 通过 Gitea API 加载：`/api/v1/repos/{owner}/{repo}/raw/README.md`
- Gitea raw 文件无 CORS，必须用 API 端点

## Project-Specific Patterns

- 技能数据在 docs/.vitepress/data/skills.js
- 样式在 docs/.vitepress/theme/skills.css
```

## 示例 3：Go 项目

```markdown
# my-go-service

## Tooling

- 包管理: `go mod tidy`
- 启动: `go run ./cmd/server`
- 测试: `go test ./... -race`
- 构建: `go build -o bin/server ./cmd/server`
- 脚本: `make dev` 启动热重载

## Required Services

- Postgres: `docker compose up postgres`
- Redis: `docker compose up redis`

## Non-Obvious Rules

- 接口定义在 internal/ports/
- 测试用 testify + sqlmock
- 迁移用 golang-migrate，文件在 migrations/
```

## 示例 4：Python 技能项目

```markdown
---
name: skill-name
category: software-development
version: "1.0.0"
description: |
  一句话描述技能用途。
  触发词：「关键词1」「关键词2」。
---

# skill-name

## Tooling

- 包管理: uv
- 验证: `python3 -m py_compile scripts/*.py`
- 发布: `git push origin main`

## Required Services

- 无

## Non-Obvious Rules

- SKILL.md 面向 Agent 运行时，README.md 面向用户
- 详细内容放 references/，不占用上下文窗口
- 脚本放 scripts/，降低重复劳动
- frontmatter 必须包含 name + description + version

## Project-Specific Patterns

- 技能目录名：小写，连字符分隔
- 标准结构：SKILL.md + README.md + CHANGELOG.md + references/ + scripts/
```
