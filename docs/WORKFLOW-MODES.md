# 工作流模式

## 完整模式（目标顺序）

```
人工输入规则/目标
  → ① product.md → 【人工确认】
  → ② Preview 原型（可交互 mock）→ 【人工确认】
  → ③ 自研后端（引擎 + im/rest/fixtures）
  → ④ 前端对接 IM/REST/sync + 联调
  → ⑤ 对照 product 自测（Playwright L2）→ 【全绿】
  → ⑥ 【人工】sim-lobby / 多窗验收
```

| 步 | 含义 | 门禁 |
|----|------|------|
| ① | AI 写 `product.md` | **人工确认**后才进 ② |
| ② | Preview 原型：阶段/视角可预览；**须**简单跳转 + mock 状态（参照 werewords Preview）；改 UI 同步改 product | **人工确认**后才进 ③ |
| ③ | 在 `h5-game-server` 加引擎+契约（AI **先问**本机后端路径，不自动 clone） | 契约与实现齐备后进 ④ |
| ④ | App 接真 IM/REST | 对接可跑后进 ⑤ |
| ⑤ | L2 等自测，对照 product | **全绿**后才进 ⑥ |
| ⑥ | 人工 sim 验收 | 正式交付前的人测；**不得**在 ⑤ 未绿时当作流程终点 |

**完整模式终点**：⑤ 全绿 + ⑥ 人工 sim 验收通过（⑥ 由用户确认；AI 在 ⑤ 结束后主动提示）。

## 预览模式（③ 未齐时允许）

- 可完成 **① + ②**（产品已确认 + Preview 可交互验收）
- ③～⑥ 标 **Blocked: Backend**（或未开后端），**不算失败**
- 继续在后端仓补齐后再进 ③④…
- **禁止**为推进而编造 IM/REST 字段

**预览终点**：② 经人工确认的 Preview（非纯静态截图页）。

## 与 Rule / Skills

- Rule：`rules/h5-game-kit.mdc`
- 编排：`skills/h5-game-orchestrator/SKILL.md`
- 后端：`docs/BACKEND-SPEC.md`、`skills/h5-game-server/SKILL.md`
