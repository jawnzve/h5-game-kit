# Preview UI 规范（流程 ②）

> **适用**：`h5-game-preview` 阶段；**仅 Preview 入口**，App 版与 Playwright E2E **不**使用本壳。  
> **参考实现**：`werewords` 仓库 `src/PreviewApp.vue`、`GameLayout.vue`、`lib/preview-mock-controls.ts`。

---

## 1. 流程位置

| 步骤 | Skill | 产出 |
|------|-------|------|
| ① | `h5-game-spec` | `product.md` 确认 |
| **②** | **`h5-game-preview`** | 共用 SFC + **Preview 壳** + App 壳 |
| ③ | 等待 | `im.md` / `rest.md` / fixtures |
| ④ | `h5-game-dev` | App 接真数据 |
| ⑤ | `h5-game-test` | L2 全绿 |

Preview 用于**人工验收布局与元素**；③ 未齐时可在 ② 结束（预览模式）。

---

## 2. 双入口分工

| 入口 | 路径 | 数据 | 测试 |
|------|------|------|------|
| **Preview** | `preview/preview-index.html` | Pinia `preview` store，mock | 可选 `scripts/smoke-preview.mjs`；**不进 Playwright L2** |
| **App** | `games/<gameId>/app-index.html` | Pinia `game` store，④ 接 IM/REST | Playwright L2 |

共用：`src/stages/*.vue`、`src/components/*`、`data-testid` = `product.md` 元素 ID。

---

## 3. Preview 外壳结构（必须）

Preview 是**多视口工作台**：同一局状态下并排渲染多个手机视口，每个视口一个视角，可直接横向对比「村长看到什么 / 观众看到什么」。

```
preview-shell                          # 整屏 flex，html/body overflow:hidden
├── aside.preview-panel                # 左侧 260px：阶段 / 视口 / 调试 / Mock
└── div.preview-device-area            # 外侧桌面底色，overflow:auto（横向滚动）
    └── div.preview-viewports-row      # TransitionGroup，视口横排
        └── PreviewPhoneViewport ×N    # 每视口独立视角
            ├── div.viewport-header    # 视角下拉 + ← / → 排序 + × 移除
            └── div.preview-phone      # data-toast-root，尺寸由侧栏统一控制
                ├── main.preview-stage # data-testid=stage-{stageId}
                │   └── GameShell      # 与 App 共用阶段 SFC
                └── LottieCanvas       # 可选
```

**样式约定**

- `preview-shell`：`height: 100vh`；`html / body / #app` 设 `overflow: hidden`，滚动交给侧栏与视口区
- `preview-device-area`：灰蓝桌面背景；`overflow: auto`，视口多时横向滚动
- `preview-phone`：默认 **390×844**（iPhone 12 Pro）；宽高由侧栏 **调试 → 尺寸** 统一切换，`:style` 绑定；游戏背景色，圆角 + 阴影
- `preview-panel`：固定宽度侧栏（260px），不参与「手机 UI」截图

**视口标识（供 smoke / 人工定位）**

| 属性 | 值 |
|------|-----|
| `data-perspective` | 该视口当前视角 ID |
| `data-testid`（首个视口） | `preview-phone-viewport` |
| `data-testid`（其余视口） | `preview-viewport-{viewportId}` |

### 3.1 视角下传与视口级 toast

| 机制 | 实现 |
|------|------|
| 视角 | `PreviewPhoneViewport` `provide(PREVIEW_PERSPECTIVE_KEY, perspectiveRef)`；阶段 SFC 用 `useGameView()` 取本视口视图 |
| 局状态 | 全部视口**共享** `preview` store 的局状态；仅「只有本人可见」的部分放 `perViewState[perspective]` |
| toast | 视口根节点标 `data-toast-root` 并 `provide(TOAST_ROOT_KEY, phoneRef)`；SFC 内用 `useViewportToast()`，toast 落在**本视口**而非整屏中央 |

App 壳（`App.vue`）同样标 `data-toast-root`，两端行为一致。

---

## 4. 游戏内布局（GameLayout）

与 Preview 壳分离；App 与 Preview **共用** `GameLayout.vue`。

| 区域 | 元素 | 说明 |
|------|------|------|
| Logo | `el-header-title` + `el-header-subtitle` | 中文名 + 英文名（如 Werewords） |
| 阶段条 | `el-stage-title` | 独立 `stage-banner` 区域，与 Logo 分开 |
| 主内容 | 阶段 SFC + 组件 | 见 `product.md` §3、§4+ |
| 倒计时 | `el-countdown` | 有时限阶段 |

**`variant`  prop（按需）**

- `default`：常规上下流式布局
- `ready`（示例）：玩家列表垂直居中 + `#footer` 底栏固定操作按钮（左取消 / 右开始）

各游戏按 `product.md` 阶段增加 variant，**不要**把 Preview 侧栏写进 GameLayout。

---

## 5. 玩家列表（PlayerList）

| `layout` | 用途 | 布局 |
|----------|------|------|
| `list` | 投票、指认等 | 横条：头像左、昵称与徽章、marks |
| `grid` | 准备阶段等 | **2 行 × 4 列**；头像上、昵称下、徽章在昵称右侧 |

- `maxSlots`：grid 时固定 8 座，不足显示「空位」占位
- **徽章**：`loading` / `ready` **不显示村长**；`elect-mayor` 起再显示（与产品阶段一致）

---

## 6. Mock 侧栏

### 6.1 阶段 / 视口

- **阶段下拉**：`ALL_STAGES`（来自 `product.md` §2.1）；选项文案为 **`stageId（中文名）`**，如 `day（天亮了）`，不另起中文行
- **视口 fieldset**（`PreviewViewportPanel`）：选新视口视角 + 「+ 添加视口」+ 当前视口数
- **视角切换**在各视口顶栏，不在侧栏；侧栏没有全局视角下拉
- 视角列表来自 `src/lib/preview-perspectives.ts`，须覆盖 product **§1 整局流程** 各段视角；默认为每个视角开一个视口

### 6.2 分阶段 Mock 开关

**原则**：仅当该阶段矩阵存在对应元素时，侧栏才显示 Mock 项。

实现：`src/lib/preview-mock-controls.ts`

```typescript
export const PREVIEW_MOCK_BY_STAGE: Partial<Record<StageId, PreviewMockControlId[]>> = {
  // 按 product.md §4+ 矩阵填写；无 Mock 的阶段不列出
};
```

无 Mock 时显示「当前阶段无可 Mock 项」，**不要**展示无关 checkbox。

### 6.3 数据与视角

- `useGameView()`：`inject(GAME_VIEW_MODE_KEY)` → Preview 走 `usePreviewView(本视口视角)`，App 走 `game` store
- 身份类派生状态（如村长徽章）必须与 **当前阶段** 一致，禁止在 `ready` 阶段因视角 preset 误显示
- 切视角 / 切阶段时由 `applyPerspectivePreset()` 同步本视口默认状态

### 6.4 调试（kit 通用）

侧栏 **fieldset「调试」** 提供：

| 控件 | 实现 | 说明 |
|------|------|------|
| 玩家数量 | `preview` store `mockPlayerCount` + `src/mock/players.ts` | 0–8 人，联动 mock 玩家池 |
| 尺寸 | `PreviewDevicePanel` + `src/lib/preview-devices.ts` | 机型预设与自定义宽高，作用于**全部视口** |

| 预设 | 逻辑分辨率 |
|------|------------|
| iPhone 14 Pro Max | 430×932 |
| iPhone 12 Pro（默认） | 390×844 |
| iPhone XR | 414×896 |
| iPhone SE | 375×667 |
| 自定义设备… | 宽 280–800、高 400–1200 |

**游戏独有**调试项放 `PreviewDevPanel.vue`，**不要**写进 kit 通用层。

### 6.5 Mock 玩家池

`src/mock/players.ts` 提供 8 人池，前 4 人刻意覆盖 **中文短 / 中文长 / 英文短 / 英文长** 四类昵称，用于在 Preview 就暴露截断、换行、头像错位问题。超长昵称截断用 `src/lib/nickname.ts` 的 `truncateNickname()`。

---

## 7. ② 实施检查清单

1. 读 `product.md` §1～§3、§4+ 各阶段矩阵  
2. **`preview-perspectives.ts`**：按 product §1 各段视角填视角表与 mock userId  
3. **`preview.ts` store**：把 `PreviewPerspective` 收敛为具体联合类型；扩展 `PreviewPerViewState`（只放「仅本人可见」的字段）  
4. 实现共用 SFC + `data-testid`；跨阶段保留的数据一律进 store（正文会 remount，见 product §3.0.3）  
5. **`preview-mock-controls.ts`**：按阶段矩阵配置 Mock，填充 `PreviewMockPanel.vue`  
6. **GameLayout**：Logo + 阶段条 + 必要 variant  
7. App 壳：`app-index` + 空 `game` store  
8. `npm run build`；可选 `node scripts/smoke-preview.mjs`  
9. 人工在 Preview **并排对比各视角**，逐阶段验收  

---

## 8. 禁止

- Preview 接真实 IM/REST 或解析 `im.md` 业务字段  
- 把 Preview 侧栏或桌面底色写进 App 版  
- Playwright L2 打开 preview 页（见 `LOCAL-SERVER-SPEC.md`）  
- 跳过 product 元素自行发明 UI  

---

## 9. 参考文件

**Kit scaffold（通用外壳，新建游戏自带）**

| 文件 | 说明 |
|------|------|
| `src/PreviewApp.vue` | 侧栏 + 多视口横排 + 整屏样式 |
| `src/components/PreviewPhoneViewport.vue` | 单视口：视角下拉 / 排序 / 移除 + toast 根 |
| `src/components/PreviewViewportPanel.vue` | 侧栏「视口」区（添加视口、视口计数） |
| `src/components/PreviewDevicePanel.vue` | 调试 → 尺寸（机型预设 + 自定义） |
| `src/components/PreviewDevPanel.vue` | 游戏专属调试项占位 |
| `src/components/PreviewMockPanel.vue` | Mock 开关占位（② 按游戏填充） |
| `src/components/GameShell.vue` | 阶段 SFC 挂载占位 |
| `src/composables/useGameView.ts` | preview / app 分流 + `PREVIEW_PERSPECTIVE_KEY` |
| `src/composables/usePreviewView.ts` | 单视口数据视图（共享局状态 + 独立视角状态） |
| `src/composables/useScrollAreaHeight.ts` | flex 一屏布局下算滚动区 max-height |
| `src/stores/preview.ts` | 局状态 + 视口槽位 + `perViewState` |
| `src/lib/preview-perspectives.ts` | 视角表、mock userId、视角文案 |
| `src/lib/preview-devices.ts` | 机型预设与 phoneStyle 工具 |
| `src/lib/preview-mock-controls.ts` | 分阶段 Mock ID 映射 |
| `src/lib/nickname.ts` | 昵称截断 |
| `src/lib/ui.ts` | `TOAST_ROOT_KEY` / `useViewportToast()` |
| `src/mock/players.ts` | Mock 玩家池（四类昵称样例） |
| `src/styles/tokens.css` · `actions.css` | 最小设计令牌与按钮/选项基础样式 |

**werewords（完整 ② 示例，含游戏独有 UI）**

| 文件 | 说明 |
|------|------|
| `src/components/GameLayout.vue` | Logo / 阶段条 / variant |
| `src/components/PlayerList.vue` | list / grid |
| `scripts/smoke-preview.mjs` | ② 冒烟（可选） |
