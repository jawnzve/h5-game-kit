# IM Fixtures

> **由后端同事提供**真实消息 JSON，AI 不得编造业务字段。

## 命名

`docs/games/<gameId>/fixtures/<phase-or-scenario>.json`

## 格式

**与该项目 `im.md` 描述的消息体一致**（Centrifugo publication、App 透传包等均可，不强制 QNI/`action` 外层）。

## 最少集

- [ ] ready 或首个可操作阶段
- [ ] 1 个 mid-game 阶段
- [ ] game-end（若适用）

## 校验

init 后可用 Playwright L2 或手动 `JSON.parse`；AI 审查 fixture 与 `im.md` 是否一致。
