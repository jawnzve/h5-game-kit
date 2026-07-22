# 后端契约说明 — {{gameName}}（gameId: `{{gameId}}`）

> **由后端同事提供**，格式 **不固定**；AI **只读**实际文档，不套用 kit 模板。

## 预期交付物

| 文件 | 维护人 | 说明 |
|------|--------|------|
| `im.md`（或等价文件名） | 后端 | IM/推送：连接、channel、消息 JSON 等，写法因人/项目而异 |
| `rest.md`（或等价文件名） | 后端 | REST 路径、入参、响应、错误码、sync |
| `fixtures/*.json` | 后端 | 真实消息样例，与 `im.md` 一致 |

**推荐路径**（可协商）：`docs/games/{{gameId}}/`  
老项目可用其他路径（如 `im-messages.md`）；以仓库内 **实际路径** 为准，记入 `CONTRACT_GAPS.md`。

## AI 行为

- **不生成、不修改** 上述契约文件
- ③ 阶段：读后端提供的文档 → 更新 `CONTRACT_GAPS.md`
- 缺文档 → **Blocked: Backend**

## fixtures

见 `fixtures/README.md`。
