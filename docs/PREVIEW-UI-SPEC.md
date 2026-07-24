# Preview UI 规范（流程 ②）

> **适用**：`h5-game-ui` 阶段；**仅 Preview 入口**，App 版与 Playwright E2E **不**使用本壳。  
> **参考实现**：`werewords` 仓库 `src/PreviewApp.vue`、`GameLayout.vue`、`lib/preview-mock-controls.ts`。

---

## 1. 流程位置

| 步骤 | Skill | 产出 |
|------|-------|------|
| ① | `h5-game-spec` | `product.md` 确认 |
| **②** | **`h5-game-ui`** | 共用 SFC + **Preview 壳** + App 壳 |
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

```
preview-shell
├── aside.preview-panel          # 左侧：阶段 / 视角 / 调试 / Mock（仅开发用）
└── div.preview-device-area      # 外侧桌面底色（区分非手机区域）
    └── div.preview-phone        # 可调尺寸手机视口，data-testid=preview-phone-viewport
        ├── main.preview-stage   # data-testid=stage-{stageId}
        │   └── GameShell        # 与 App 共用阶段 SFC
        └── LottieCanvas         # 可选
```

**样式约定**

- `preview-device-area`：灰蓝桌面背景，居中手机框；`overflow: auto`（大机型可滚动）
- `preview-phone`：默认 **375×667**（iPhone SE）；宽高由侧栏 **调试 → 尺寸** 切换，`:style` 绑定；游戏背景色，圆角 + 阴影
- `preview-panel`：固定宽度侧栏（260px），不参与「手机 UI」截图

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

### 6.1 阶段 / 视角

- 阶段下拉：`ALL_STAGES`（来自 `product.md` §2.1）
- 视角下拉：覆盖 product **§1 整局流程** 各段视角（如创建者 / 已加入 / 观众，或身份列）
- 视角标签随阶段变化（例：准备阶段仅「创建者」，非「创建者/村长」）

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

- `useGameView()`：`inject(GAME_VIEW_MODE_KEY)` → Preview 用 `preview` store，App 用 `game` store
- `isMayor` / 村长徽章等与 **当前阶段** 一致，禁止在 `ready` 阶段因视角 preset 误显示村长

### 6.4 调试 → 尺寸（kit 通用）

侧栏 **fieldset「调试」** 内，`PreviewDevicePanel` 提供机型预设与自定义宽高：

| 预设 | 逻辑分辨率 |
|------|------------|
| iPhone 14 Pro Max | 430×932 |
| iPhone 12 Pro | 390×844 |
| iPhone XR | 414×896 |
| iPhone SE（默认） | 375×667 |
| 自定义设备… | 宽 280–800、高 400–1200 |

- 状态：`preview` store 的 `previewPhoneWidth` / `previewPhoneHeight`
- 实现：`src/lib/preview-devices.ts` + `src/components/PreviewDevicePanel.vue`
- **游戏独有**调试项（如玩家数量）放 `PreviewDevPanel.vue`，**不要**写进 kit 通用层

---

## 7. ② 实施检查清单

1. 读 `product.md` §1～§3、§4+ 各阶段矩阵  
2. 实现共用 SFC + `data-testid`  
3. **PreviewApp**：§3 外壳 + 阶段/视角切换  
4. **`preview-mock-controls.ts`**：按阶段矩阵配置 Mock  
5. **GameLayout**：Logo + 阶段条 + 必要 variant  
6. App 壳：`app-index` + 空 `game` store  
7. `npm run build`；可选 `node scripts/smoke-preview.mjs`  
8. 人工在 Preview 验收各阶段、各视角  

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
| `src/PreviewApp.vue` | 侧栏 + 可调尺寸手机容器 + 样式 |
| `src/components/GameShell.vue` | 阶段 SFC 挂载占位 |
| `src/components/PreviewDevicePanel.vue` | 调试 → 尺寸（机型预设 + 自定义） |
| `src/components/PreviewDevPanel.vue` | 游戏专属调试项占位 |
| `src/components/PreviewMockPanel.vue` | Mock 开关占位（② 按游戏填充） |
| `src/composables/useGameView.ts` | preview / app 分流 |
| `src/lib/preview-devices.ts` | 机型预设与 phoneStyle 工具 |
| `src/lib/preview-mock-controls.ts` | 分阶段 Mock ID 映射 |

**werewords（完整 ② 示例，含游戏独有 UI）**

| 文件 | 说明 |
|------|------|
| `src/components/GameLayout.vue` | Logo / 阶段条 / variant |
| `src/components/PlayerList.vue` | list / grid |
| `scripts/smoke-preview.mjs` | ② 冒烟（可选） |
