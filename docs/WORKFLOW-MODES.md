# 工作流模式

## 完整模式（需 ③ 后端契约）

```
① product 确认 → ② UI → ③ im/rest/fixtures 齐备 → ④ 接功能 → ⑤ L2 全绿
```

**终点**：⑤ 浏览器 Playwright 全绿（含 IM/REST 对接验证）。

## 预览模式（③ 未齐时允许）

后端同事**尚未提供** `im.md` / `rest.md` / fixtures 时：

- 可完成 **① + ②**（产品文档 + mock UI）
- ④⑤ 标 **Blocked: Backend**，**不算失败、不强行到终点**
- AI 维护 `CONTRACT_GAPS.md`，等待后端

**预览终点**：② UI 可在 `npm run dev`（或你提供的本地服务命令）下预览 mock 阶段/视角。

## 与 Rule 的关系

- 无后端契约 → **允许停在前一可达步骤**，不要求凑满五步
- 禁止为到终点而编造 IM/REST 或跳过 Blocked
