---
name: h5-game-spec
description: >-
  语音房 H5 游戏流程①：根据用户输入的游戏规则产出 product.md 产品文档（概述、全局规则、组件、各阶段视角·元素矩阵）。
  不撰写 im.md/rest.md。触发：新游戏立项、输入游戏目标/规则/阶段/人数/UI 说明、写产品文档。
---
# h5-game-spec

## 流程位置

**① 输入游戏规则** → 产出 `docs/games/<gameId>/product.md`。

## 输入

- gameId
- 游戏目标、规则、人数、阶段列表、胜负条件
- （可选）UI 说明、素材路径

## 输出

- **`product.md`**：完整产品文档，**必须**遵循格式规范
- **不输出** `im.md`、`rest.md`、fixtures
- **不**在此阶段写 `spec.md` 视角矩阵（留待 ④ 前根据 `im.md` 补全）

## 格式规范（必须遵守）

1. **模板**：`h5-game-kit/docs/templates/product-doc.template.md`
2. **示例**：`h5-game-kit/docs/templates/product-doc.example.md`（章节结构、矩阵表列、交互词表、详略程度以此为准）
3. **文档结构**（新）：
   - **§1 概述**：游戏信息、角色、玩法概述、**整局流程**（A/B/C 分段表，视角列随段变化）、前后端职责
   - **§2 全局规则**：阶段总表（含 **前端倒计时** 列）、**§2.2 状态流转**（`flowchart TB` + 分支说明表）、角色、胜负、边界、sync、**§2.7 GitLab 渲染约定**
   - **§3 组件规则**：带锚点；阶段内链引用，不重复全局壳/玩家列表。UI 复杂（跨阶段保留状态、多种列表布局）时**必须**写 **§3.0 壳层与正文**与 **§3.2.1 布局模式**，否则 ② 无法判断哪些 UI 会 remount
   - **§4～§N 各阶段**：§X.1 说明 + **§X.2 视角·元素·异常**（单矩阵表）
   - **待确认 / 修订 / 附录**：编号接最后一个阶段顺延，**不要**固定写 §16、§17（阶段多时会与阶段章节撞号，GitLab 锚点冲突）
4. **阶段矩阵表**：
   - 第 1 列 `元素 ID`；第 2 列 `文案`；中间列为本阶段**视角**；末列 `异常/备注`
   - **通用组件也要逐阶段列出**：`el-player-list`、`el-stage-title`、`el-countdown` 等即便在 §3 已定义，各阶段表仍须写明本阶段是否展示；玩家列表注明布局模式
   - 单元格：`-` 不可见 · `可见` · `可点击` / `可点击（单选|切换|选中）` · `可输入` · `可滚动`（见 template 词表）
   - 表格空单元格用 **`-`**，不用破折号 `—`
5. **§2.2 状态流转**：`flowchart TB`（不用 `stateDiagram-v2`）；节点 ID 用 camelCase，与 §2.1 连字符阶段 ID 一一对应；边标签短句；非线性分支写 **分支说明表** — 格式见 template / example §2.2
6. **GitLab（Mermaid 边标签 + 锚点）**：见 template **§2.7** 与 `docs/LESSONS.md` **L-2026-07-15-01** — 边标签不用 `～`/`≤`/`≥`；内链按 Comrak 锚点规则（勿写 `{#custom-id}`）。**写完/改完 `product.md` 必须跑 `npm run docs:anchors`**（`scripts/fix-product-md-anchors.mjs`），不要手拼锚点
7. 元素 ID 统一 `el-<语义>`，与后续 H5 `data-testid` 一致
8. **§2.6 状态同步策略**：按玩法填写 sync 兜底（默认进页/回前台/断网恢复；延迟兜底仅在有倒计时时）
9. 不确定处写入 **待确认项**（表格形式），标注 **待产品确认**；不得编造 IM/REST 字段
10. **Preview 分叉**：阶段说明或附录 A.1 写明 Preview 与正式环境的差异（侧栏直切阶段不自动推进、倒计时静态、无真实音频/推送等）；Preview 外壳本身由 kit 提供，不在 product.md 重复描述

## 约束

- 遵循 Rule **交互原则**：不知道不编造；gameId/规则/阶段等不明确时 **先提问澄清**，再写 `product.md`
- **禁止**根据玩法推断 IM/REST 字段或撰写后端契约
- 阶段 ID 仅用于 H5 `currentStage`；**不写** IM `action` 名
- 产品文档 **未经用户确认前**，不得进入 ② Preview

## 步骤

1. **澄清输入**：若缺 gameId、规则、人数、阶段等关键信息，先向用户提问，**齐备后再继续**
2. 确认 gameId 与目录 `docs/games/<gameId>/`
3. 阅读 template + example，理解章节结构与矩阵表
4. 从用户规则提取：阶段、角色、胜负、组件、每阶段元素与各视角下的可见/交互类型
5. 写入 `product.md`，版本 `v0.1-draft`
6. 执行 **`npm run docs:anchors`** 修正内链锚点（退出码非 0 说明有悬空链接，先修再继续）
7. 向用户列出待确认项，**等待确认或修改**
8. 用户确认后：更新修订记录，再提示进入 **② h5-game-preview**

## 确认门禁

用户明确表示「确认 / OK / 可以做了」后，方可进入 ②。若用户仅补充规则，则更新 `product.md` 并再次请确认。

## 参考

- 模板：`h5-game-kit/docs/templates/product-doc.template.md`
- 示例：`h5-game-kit/docs/templates/product-doc.example.md`
- GitLab Mermaid：`docs/LESSONS.md` L-2026-07-15-01
- 设计方案 §8.1、§9.0
