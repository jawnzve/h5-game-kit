---
name: h5-game-spec
description: >-
  语音房 H5 游戏流程①：根据用户输入的游戏规则产出 product.md（含 §1.1 基础设施决策、
  概述、全局规则、组件、各阶段视角·元素矩阵）。不撰写 im.md/rest.md。
  触发：新游戏立项、输入游戏目标/规则/阶段/人数/UI 说明、写产品文档。
---
# h5-game-spec

## 流程位置

**① 输入游戏规则** → 产出 `docs/games/<gameId>/product.md`（**含 §1.1 基础设施决策**）。

## 输入

- gameId
- 游戏目标、规则、人数、阶段列表、胜负条件
- （可选）UI 说明、素材路径
- **必须澄清**：是否需要管理端、是否需要 MySQL / 管什么数据

## 输出

- **`product.md`**：完整产品文档，**必须**遵循格式规范
- **§1.1 基础设施决策**（① 门禁）：管理端 是/否、MySQL 是/否、管理功能清单
- **不输出** `im.md`、`rest.md`、fixtures
- **不**在此阶段写 `spec.md` 视角矩阵（留待 ③-F 根据后端仓 `im.md` 补全）

## 格式规范（必须遵守）

1. **模板**：`h5-game-kit/docs/templates/product-doc.template.md`
2. **示例**：`h5-game-kit/docs/templates/product-doc.example.md`
3. **文档结构**：
   - **§1 概述** + **§1.1 基础设施决策（① 门禁）**
   - **§2 全局规则** … **§3 组件** … **§4+ 各阶段**
   - **§运营与管理端**（与 §1.1 呼应，展开管理功能与验收；无则标「无」）
   - **待确认 / 修订 / 附录**
4. 阶段矩阵、§2.2 flowchart、GitLab 锚点等同 v0.1 规范（见 template / example）
5. **Preview 分叉**：阶段说明或附录写明 Preview 与正式环境差异

## 约束

- **禁止**根据玩法推断 IM/REST 字段
- 产品文档 **未经用户确认前**（含 **§1.1**），不得进入 ②

## 步骤

1. **澄清输入**：gameId、规则、**管理端/MySQL 决策**
2. 阅读 template + example
3. 写入 `product.md`，含 **§1.1**
4. `npm run docs:anchors`
5. 向用户列出待确认项，**明确请确认 §1.1 与玩法**
6. 用户确认后 → 提示进入 **② h5-game-preview**

## 确认门禁

用户明确表示「确认 / OK / 可以做了」，且 **§1.1 三项无悬而未决**，方可进入 ②。

## 参考

- 模板 / 示例：`docs/templates/product-doc.template.md`、`product-doc.example.md`
- 工作流：`docs/WORKFLOW-MODES.md`
