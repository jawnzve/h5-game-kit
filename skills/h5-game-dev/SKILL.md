---
name: h5-game-dev
description: >-
  语音房 H5 流程③-F：Vue3+Vite+TS+Pinia 完整接 IM/REST/sync；契约真源在自研后端仓，前端只读。
  完成后跑 ③ 子门禁 Mock E2E（h5-game-test）。
---
# h5-game-dev

## 技术栈（必须）

见 `h5-game-kit/docs/TECH-STACK.md`：IM/REST/sync → `src/services/` + Pinia；**禁止**改 `hybirdapp-plugin.js`。

## 流程位置

**③-F 玩家前端完整开发** — ② Preview **已确认**；**③-S** 契约可读（可并行，但对接前须契约与引擎一致）。

## 输入

- 已确认 `product.md`（含 §1.1）+ ② Preview 共用 SFC
- 后端仓 `im.md` / `rest.md` / fixtures（`BACKEND-CONTRACTS.md`）——**只读**

## 输出

- App 完整：`identity` / Centrifugo / sync / REST；`version` 幂等
- `?e2e=1` 钩子；更新 `spec.md` L2 表
- **③ 子门禁**：提示跑 **`h5-game-test`**（Mock `test:e2e`）至全绿

## 禁止

- 在 ② Preview 阶段接真接口
- 在前端仓撰写/篡改契约
- React；编造字段

## 步骤

0. 读 `docs/LESSONS.md`；契约审查（缺 → 回 **③-S**）
1. 实现 services + Pinia + 绑定
2. `npm run build` → **`h5-game-test`** Mock E2E 至全绿
3. 与 ③-S（及 ③-A）子门禁均绿后 → **④ `h5-game-live-test`**

## 参考

- `docs/BACKEND-SPEC.md`、`docs/WORKFLOW-MODES.md`
- werewords `src/stores/game.ts`
