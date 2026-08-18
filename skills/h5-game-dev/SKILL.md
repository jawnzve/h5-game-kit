---
name: h5-game-dev
description: >-
  语音房 H5 游戏流程④：Vue3+Vite+TS+Pinia 接 IM/REST/sync；契约真源在自研后端仓，前端只读。
---
# h5-game-dev

## 技术栈（必须）

见 `h5-game-kit/docs/TECH-STACK.md`：

- IM/REST/sync → **`src/services/`** + **`src/stores/`（Pinia）**
- 类型 → **`src/types/`**（对齐 `im.md`）
- bridge → **`src/bridge/`**（薄封装；**禁止**改 `hybirdapp-plugin.js`）
- 组件读 store，不在 SFC 内堆解析

## 流程位置

**④ 功能实现** — 前置：③ 契约与引擎齐备（后端仓 `im.md`/`rest.md`/fixtures 可读且与引擎一致）；② 已确认。

## 输入

- 已确认的 **`product.md`** + ② Preview
- 后端仓契约：`im.md` / `rest.md` / fixtures（路径见 `BACKEND-CONTRACTS.md`）——**前端只读**
- 契约变更只在后端仓；本 Skill **不**在前端仓改契约

## 输出

- 类型与 snapshot 映射对齐 `im.md`
- App：`identity` / Centrifugo IM（单通道）/ sync / REST actions；`version` 幂等
- REST 与 IM **均可** `applySnapshot`（同 DTO）
- `runAction` 建议统一 `throttleApiCall`
- 服务端时间 / 前后台：`ServerTimeSync` + sync 门闩
- `?e2e=1` 钩子；更新 `spec.md` 视角矩阵 + L2 表

## 禁止

- 修改 `public/core/bridge/hybirdapp-plugin.js`
- 在前端仓撰写/篡改 `im.md` / `rest.md` / fixtures
- 跨游戏照搬 IM 解析
- React；编造契约字段

## 契约审查

读后端仓文档与 fixtures（路径见 `BACKEND-CONTRACTS.md`）：

- 阶段是否有对应推送/字段
- rest / im / sync 是否矛盾
- fixture 是否一致
- 缺失或冲突 → **回 ③ 改 `h5-game-server`**（引擎 + 契约），**不猜测**

## 步骤

0. 读 `docs/LESSONS.md`；游戏专有看 `spec.md`；契约看 `BACKEND-CONTRACTS.md` → `h5-game-server/.../im.md`
1. 审查契约（缺则回 ③）
2. 实现 services + Pinia + 绑定；接 sync / IM / REST
3. e2e 钩子与 data-testid
4. `npm run build` → **⑤ h5-game-test**
5. 环境变量向用户索取；通用坑 → `h5-game-lessons`

## 参考

- `docs/BACKEND-SPEC.md`、`docs/TECH-STACK.md`、werewords `src/stores/game.ts`
