# 多平台同步策略

当项目需要同时支持多个 AI Agent 时，使用以下文件映射：

| Agent | 文件名 | 用途 |
|-------|--------|------|
| Claude Code | `CLAUDE.md` | 上下文文件 |
| Cursor | `.cursorrules` | 规则文件 |
| GitHub Copilot | `.github/copilot-instructions.md` | 指令文件 |
| Gemini | `GEMINI.md` | 上下文文件 |
| 通用 | `AGENTS.md` | 通用上下文 |

## 同步策略

1. **单一来源**：以 `AGENT.md` 为单一来源
2. **符号链接**：其他文件链接到 `AGENT.md`
3. **内容一致**：所有文件内容相同，只是文件名不同

## 示例

```bash
# 创建符号链接
ln -s AGENT.md CLAUDE.md
ln -s AGENT.md .cursorrules
ln -s AGENT.md GEMINI.md
```

## 注意事项

- `.cursorrules` 放在项目根目录
- `copilot-instructions.md` 放在 `.github/` 目录
- 符号链接在 Windows 需要管理员权限
