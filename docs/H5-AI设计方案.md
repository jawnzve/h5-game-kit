# H5 语音房游戏 — AI Loop 设计方案

> **版本**：v1.4  
> **适用范围**：语音房内 H5 游戏（IM + REST），与周年庆等活动页静态栈分离  
> **分工**：**后端由同事负责**（撰写并维护 `rest.md` / `im.md` / fixtures）；**AI 只读契约、审查缺口、H5 开发、自动化测试与 bug 修复**；**AI 不访问后端代码仓库**  
> **技术栈**：Vue 3 + Vite + TypeScript + Pinia — 详见 [`TECH-STACK.md`](TECH-STACK.md)

---

## 1. 背景与目标

### 1.1 背景

- 游戏运行在 **公司 App WebView** 内，通过 `hybirdapp.im` 收 IM、通过 REST 调 **游戏后端 API**（地址见 H5 仓 `http-config.js` 的 `apiBase`）。
- IM 经 **QNI 桥接** 下发，客户端 action 带 `WEB_` 前缀（如 `WEB_WITCHESPOISON_UPDATE_VIEW`）。
- **后端实现细节不在 AI 工作范围内**；接口与 IM 结构以后端同事提供的 **`rest.md`、`im.md`、fixtures** 为准。
- App 有 **测试包**，且与环境（test/prod 等）对应。

### 1.2 目标

用户只需输入：

- 游戏目标
- 游戏规则（阶段、操作、胜负条件）
- （可选）UI 说明、素材路径

AI 通过 **Loop 工作流** 分阶段自动完成：

| 阶段 | 项 | 说明 |
|------|-----|------|
| ① | **product** | 根据游戏规则产出 `product.md`（阶段、页面元素、功能逻辑） |
| ② | **H5 UI** | Vue SFC + Pinia mock（**不依赖后端契约**） |
| ③ | **等待** | 等后端 `rest.md`、`im.md`、fixtures（AI 只读审查，不代写） |
| ④ | **功能** | 按契约接 REST / IM / sync |
| ⑤ | **L2 测修** | Playwright；**完整模式终点**（需 ③） |

**预览模式**：③ 未齐时允许在 **②** 结束，不算失败（见 `WORKFLOW-MODES.md`）。

### 1.3 非目标（AI / Loop 不负责）

- 不开发、不读取后端代码仓库（Go 服务、数据库、QNI 发 IM 等由后端同事维护）
- **不撰写、不修改** `rest.md`、`im.md`（契约由后端同事设计并提供；AI 只读、审查、直接使用）
- **不推断或编造** IM / REST 业务字段；缺 fixture 时向后端索取，不用 AI 虚构样例充当契约
- **App 真机 / WebView 联调**（不在本工具链终点范围内）

---

## 2. 系统架构

### 2.1 角色与职责

| 角色 | 职责 |
|------|------|
| **产品/你** | 提供游戏目标与规则；确认契约与测试场景 |
| **后端同事** | REST、IM 广播、QNI 对接；**撰写并维护** `rest.md`、`im.md`、真实 IM 样例 JSON |
| **AI + Loop** | 规则 → UI →（等契约）→ 功能 → L2 测修至全绿；契约 **只读** |

### 2.2 架构图（主流程五步）

```
┌─────────────────────────────────────────────────────────────┐
│ ① 用户输入：游戏目标 + 游戏规则 +（可选）UI 说明              │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ ② AI：H5 UI 生成（spec + 各阶段页面 / 样式 / mock 预览）      │
│    不依赖 rest.md / im.md；可 web-preview 或本地 mock 状态   │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ ③ 等待后端文档（并行；AI 输出 CONTRACT_GAPS 直至齐备）        │
│    rest.md │ im.md │ fixtures/*.json │ dev apiBase         │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ ④ AI：功能实现（只读契约 → IM / REST / sync → UI 接真数据）   │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ ⑤ AI Loop：Playwright L2 → last-run.json → 修 H5 → 重测      │
│    全绿 = 完成（产品文档 + UI + 前端逻辑 + 后端对接）          │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 运行时数据流

```
玩家操作 H5
    → REST POST → 游戏后端（同事维护；AI 仅按 rest.md 调用）
        → QNI 发 IM → App → window.im(JSON) → H5 更新 UI

丢包 / 前后台 / 超时未收到 IM：
    → H5 POST sync → 拉取与 IM 同构的快照 → 恢复 UI
```

**原则**：**IM 为状态真源，sync 为兜底**（与飞行棋一致）。

---

## 3. 环境与配置（H5 侧）

| 配置 | 配置文件 | 使用者 | 说明 |
|------|----------|--------|------|
| H5 → 游戏 REST | `<game>/public/core/utils/http-config.js` | H5 / AI | `apiBase` 指向对应环境的游戏 API |
| 埋点 | `http-config.js` 的 `trackLogUrl` | H5 | 按项目配置 |
| 测试包 | App 内建 | QA | 与 http-config 环境名对齐 |

**注意**：QNI、服务端内部配置等 **不在 AI 工作范围**；REST/IM 行为以 **`rest.md`、`im.md`** 为准。

---

## 4. IM 消息规范

> **核心原则**：**每个游戏的 IM 业务结构由后端同事单独设计**，通过该游戏的 **`im.md`** 交付。  
> AI **不生成** `im.md`，**只读取**、审查是否有遗漏/矛盾，并 **严格按文档实现 H5**。  
> 下文 §4.1 为平台层共性；§4.2–§4.3 仅为已上线游戏的 **参考示例**，不是全平台固定 schema。

### 4.1 通用外层结构（QNI / 平台信封，相对稳定）

App 传给 `window.im` 的为 **JSON 字符串**，解析后通常含外层字段：

```json
{
  "roomId": "102119",
  "roomCode": "80056521",
  "groupId": "@TGS#...",
  "roomType": "chatRoom",
  "client": "server",
  "action": "WEB_<GAME>_<EVENT>",
  "sendTime": "...",
  "minIMVersion": "17",
  "content": { }
}
```

H5 通常校验 **`action`**；**`content` 内部字段与各阶段含义以该游戏 `im.md` 为准**，不同游戏可以完全不同。

### 4.2 `im.md` 是唯一 IM 业务契约

| 项 | 说明 |
|----|------|
| **作者** | 后端同事（按游戏玩法设计 action、`content` 字段、阶段枚举、去重规则等） |
| **AI 权限** | **只读** — 读取、对照审查、在 H5 / 测试中引用；**禁止改写或代写** |
| **与代码关系** | H5 的 IM 解析逻辑 **不得** 从其他游戏照搬；必须以 **当前游戏 `im.md`** 为准 |
| **变更** | 后端更新 `im.md` + fixtures → L2 失败 → AI 只改 H5 |

后端在 `im.md`（或等价文档）中应写清连接、channel、消息 JSON 等；**格式不固定**，AI 阅读原文。`rest.md` 同理。
- 阶段枚举、状态机与 IM 的对应关系  
- 是否使用 `msgSeq` / 去重 / 乱序规则（**若文档未写，AI 不得自行假设**）  
- sync 响应与 IM 是否同构、差异字段（也可写在 `rest.md` 的 sync 节，AI 需交叉核对）

### 4.3 已观测到的解析模式示例（非 exhaustive）

以下为历史游戏的 **两种常见写法**，**仅供后端写 `im.md` 时参考**；新游戏可以第三种、第四种结构，**以该游戏 `im.md` 为准**。

| 参考游戏 | 常见写法 | `content` 结构（示例） |
|----------|----------|------------------------|
| 女巫毒药 | 状态在 `content` 根级 | 游戏快照 **直接在 `content` 里**，如 `currentPhase`、`msgSeq` |
| 飞行棋（ludo） | 含 `baseInfo` | `content.baseInfo` 为快照，其余为事件字段 |

**切勿**在实现游戏 A 时照搬游戏 B 的解析代码；**切勿**让 AI 根据玩法推断 IM 结构并写入文档。

### 4.4 样例：女巫毒药（`witchs-poison`）

**action**（H5 侧）：`WEB_WITCHESPOISON_UPDATE_VIEW`（QNI 在服务端 action 前加 `WEB_` 前缀）  

**H5 解析要点**（须与 `im.md` / `im-messages.md` 一致，此处摘录便于对照）：

```javascript
var parsed = JSON.parse(response);
if (!/^WEB_WITCHESPOISON_/.test(parsed.action)) return;

var state = parsed.content; // 本游戏：状态在 content 根级，见 im.md
if (state.msgSeq && state.msgSeq <= lastMsgSeq) return; // 防乱序（im.md 若规定 msgSeq）
lastMsgSeq = state.msgSeq;

applyGameState(state);
```

**fixtures**：各阶段至少 1 条 **后端提供的真实 IM JSON**，放在 `docs/games/<gameId>/fixtures/`（或本仓 `public/games/<gameId>/docs/fixtures/`，见 §5）。AI 可校验 JSON 是否与 `im.md` 字段表一致，**不修改业务字段、不凭空生成**。

---

## 5. 与后端同事的协作契约

### 5.1 契约归属与 AI 权限

| 文档 | 维护人 | AI 权限 |
|------|--------|---------|
| **`rest.md`** | 后端 | **只读** — 审查、引用；**不撰写、不修改** |
| **`im.md`** | 后端 | **只读** — 审查、引用；**不撰写、不修改** |
| **`fixtures/*.json`** | 后端（真实 IM/接口样例） | **只读** — 可拷贝到 `tests/` 引用路径；可校验 JSON 格式及与 `im.md` 是否一致；**不编造业务字段** |
| **`spec.md`** | 用户 + AI | AI 可写 — 游戏规则、测试场景表 |
| **`CONTRACT_GAPS.md`** | AI | AI 可写 — 契约缺口清单；**③ 等待阶段**持续更新，契约齐后进入 ④ |

### 5.1.1 两阶段门禁

| 阶段 | 需要什么 | 缺则 |
|------|----------|------|
| **② UI 生成** | 用户规则 + `spec.md` | 只补 spec，**可先出 UI** |
| **④ 功能实现 + ⑤ L2** | `rest.md`、`im.md`、fixtures 齐备且审查通过 | **Blocked: Backend**，停在 ③ |

**③ 等待后端** 可与 ② **并行**：UI 先出稿联调视觉；后端文档就绪后再进入 ④。AI **不撰写** `im.md` / `rest.md`，只读审查并输出 `CONTRACT_GAPS.md`。

后端应交付：

| 交付物 | 说明 | 维护人 | 用于阶段 |
|--------|------|--------|----------|
| `rest.md` | REST 路径、入参、响应、错误码 | 后端 | ④⑤ |
| `im.md` | 各 `WEB_*` action 及 `content` 字段表 | 后端 | ④⑤ |
| `fixtures/*.json` | 各阶段至少 1 条 **真实** IM 样例 | 后端 | ⑤ |
| sync 说明 | sync 与 IM 字段差异（若有） | 后端 | ④ |
| dev 环境 | test 环境 `apiBase`、可选固定测试 `roomId` | 后端/运维 | ④⑤ |

### 5.2 AI 契约审查（只读，进入 ④ 前执行）

AI 读取 `rest.md`、`im.md`、fixtures 后，**不修改原文件**，检查例如：

- 各游戏阶段是否在 `im.md` 中有对应推送 / 字段说明  
- `rest.md` 与 `im.md`、sync 说明是否矛盾  
- fixtures 字段是否与 `im.md` 字段表一致  
- 测试场景所需阶段是否都有 fixture（缺则列入 `CONTRACT_GAPS.md`）  
- H5 现有实现是否与契约不一致（实现 bug → AI 改 H5；契约 bug → 交后端改文档）

审查不通过 → **Blocked: Backend**，停留在 ③，等待后端更新契约后再进入 **④ 功能实现**。

### 5.3 建议目录结构（游戏 H5 仓库内）

推荐（新游戏）：

```
docs/games/<gameId>/
  spec.md              # 游戏规则（用户 + AI）
  CONTRACT_GAPS.md     # 契约缺口（AI 审查输出，契约齐后可删或归档）
  rest.md              # REST 契约（后端，AI 只读）
  im.md                # IM 契约（后端，AI 只读）
  fixtures/
    poison-selection.json
    item-selection.json
    game-end.json
```

**已存在仓库可沿用实际路径**（如 `witchs-poison` 使用 `public/games/witchs-poison/docs/im-messages.md` ≈ `im.md`）。Skill / Rule 以 **该游戏仓库内实际契约路径** 为准，不强求迁移；新游戏优先采用 `docs/games/<gameId>/`。

---

## 6. H5 工程约定

```
<game-repo>/
  public/
    app-index.html                 # WebView 入口
    core/bridge/hybirdapp-plugin.js
    core/utils/http-config.js
    core/utils/http-request.js
    js/
      manager-base.js              # IM 注册、生命周期
      manager-game.js              # 状态机
      game-debug-log.js            # ?e2e=1 结构化日志
    css/
  docs/games/<gameId>/             # 契约与 fixture
  tests/e2e/
    <gameId>.spec.js
    last-run.json                  # 测试输出（AI 读取）
    helpers/mock-im.js
  scripts/
    run-e2e.ps1                    # Loop 调用入口
```

### H5 必须实现的能力

- [ ] `hybirdapp.im` 注册，**严格按该游戏 `im.md`** 解析（不抄其他游戏）
- [ ] `msgSeq` 防乱序（**仅当 `im.md` 规定使用 msgSeq 时**）
- [ ] 各阶段 REST 与防重复提交（按 `rest.md`）
- [ ] sync 兜底：进页、前后台、IM 超时（按 `rest.md` / `im.md` 的 sync 说明）
- [ ] dev：`?e2e=1` 暴露 `window.__testIMHandler` / `window.__gameLog`（含 `userId`、`userRole`、当前阶段，供多视角断言）
- [ ] 各阶段 **视角分支** 具备稳定选择器（推荐 `data-testid`，如 `stage-item-selection-active` / `stage-item-selection-waiting`）
- [ ] （可选）`?vconsole` 仅供人工调试，**Loop 不依赖 vConsole**

---

## 7. 测试分层

| 层级 | 环境 | 数据来源 | Loop 是否必跑 |
|------|------|----------|---------------|
| **L1** | 纯逻辑 | fixture JSON | 可选 |
| **L2** | Playwright + 本地静态服 | Mock IM（fixtures） | **必跑 — Loop 主战场** |
| **L3** | Playwright + dev apiBase | 真实游戏 REST（按 rest.md） | 契约齐后可选 |

### 7.1 Loop 成功标准（流程终点）

- **`spec.md` 中声明的全部 L2 用例通过**（含各阶段 **全部视角**，见 §10.2）— **即项目完成**
- 隐含前提：① `product.md` 已确认、② UI 已完成、④ IM/REST/sync 已接入
- 不得仅跑「每阶段 1 条 smoke」即视为 Loop 成功——**未写入 spec 的视角不在保障范围内**
- `tests/e2e/last-run.json` 中无 `pageErrors`，无 `console` type=error（或可接受白名单）
- 不读取、不修改后端代码；契约问题交后端同事

### 7.2 Playwright 的作用

Playwright 是 **浏览器自动化工具**：自动打开 H5、模拟操作、**收集 console / JS 崩溃 / 失败请求**，写入 `last-run.json` 供 AI 读取。

典型流程：

```bash
npm start -- test          # 起 H5 静态服务
npx playwright test tests/e2e/<gameId>.spec.js
# → 生成 tests/e2e/last-run.json
# → AI Read 该文件 → 修 H5 → 重跑
```

### 7.3 Mock IM 与 Mock 用户（L2）

| 组件 | 作用 |
|------|------|
| **Mock IM** | 注入完整 IM JSON（含外层 + `content`），或调用 `window.__testIMHandler(JSON.stringify(fixture))` |
| **Mock Bridge** | 注入 `getToken`、**`currentUserId`**、房间信息等；**同一 fixture 换 userId 即可切换视角** |

**原则**：IM fixture 通常是 **全桌快照**（所有玩家状态都在 `content` 里）；H5 按 **当前 mock 用户** 决定显示哪套 UI。因此 **一个 fixture + 多个 userId = 多个视角**，无需为每个视角单独造 IM（除非该视角依赖不同的 IM 字段组合，由 `im.md` / spec 决定）。

Playwright **一个 Page 同一时刻只代表一个用户**；测 N 个视角 = **N 条用例**（或 parametrized test），每条 setup 不同的 `mockBridge.userId` 后 reload / 新开 context。

### 7.4 多视角 vs 多人联调

| 类型 | 含义 | L2 | Loop 是否必覆盖 |
|------|------|-----|----------------|
| **同 fixture、不同本地 UI** | 同一 IM，玩家 A 可操作、玩家 B 只能看 | ✅ 换 mock userId，各跑一条用例 | **是**（spec 声明的视角都要写用例） |
| **两人各操作、互相同步** | A 调 REST → B 收到下一条 IM | ⚠️ 双 `browserContext` + 按 user mock REST | 可选（偏 L3） |

---

## 8. Skill 设计

Skill 与主流程五步（§9.0）对应关系：

| 步骤 | Skill |
|------|--------|
| 编排 | `h5-game-orchestrator` |
| ① 输入规则 | `h5-game-spec` → `product.md` |
| ② UI 生成 | `h5-game-ui` |
| ③ 等待后端 | `CONTRACT_GAPS.md` |
| ④ 功能实现 | `h5-game-dev` |
| ⑤ 测修 | `h5-game-test`（完整模式终点） |
| — | `h5-game-lessons` |

### 8.1 Skill：`h5-game-spec`

| 项 | 内容 |
|----|------|
| **触发** | 新游戏、**输入游戏规则**（流程 ①） |
| **输入** | 目标、规则、人数、阶段、UI 说明 |
| **输出** | **`product.md`**；**不含** `im.md` / `rest.md` |
| **约束** | 玩法写 product；IM/REST 等后端；确认前不进 ② |

### 8.2 Skill：`h5-game-ui`

| 项 | 内容 |
|----|------|
| **触发** | **`product.md` 确认后**（流程 ②） |
| **输入** | `product.md`、素材路径 |
| **输出** | Vue SFC + Pinia mock + `data-testid` + preview |
| **不实现** | 真实 REST / IM / sync |
| **约束** | 无工程骨架 → 提示 `new-game.ps1`，不自行编造 bridge / 本地服 |

### 8.3 Skill：`h5-game-dev`

| 项 | 内容 |
|----|------|
| **触发** | 后端 `rest.md`、`im.md`、fixtures 齐备且 **§5.2 审查通过**（流程 ④） |
| **输入** | 已有 UI（②）+ 该游戏 **`im.md`、`rest.md`（只读）** |
| **输出** | IM 解析、REST 调用、sync、`?e2e=1` 钩子；**在已有 UI 上接真数据流** |
| **约束** | **禁止改 `im.md` / `rest.md` / fixtures**；**不访问后端代码**；禁止从其他游戏照搬 IM 解析 |

### 8.4 Skill：`h5-game-test`

| 项 | 内容 |
|----|------|
| **触发** | ④ 完成后，或 `/loop` /「跑游戏测试」（流程 ⑤） |
| **步骤** | 起 H5 → Playwright → 写 `last-run.json` → 失败则交 `h5-game-dev` 修 H5 |
| **停止** | `spec.md` 声明的 L2 全绿（含视角矩阵），或同一用例连续失败 3 次（转人工） |

### 8.5 Skill：`h5-game-lessons`（通用踩坑）

| 项 | 内容 |
|----|------|
| **范围** | **仅 kit** `docs/LESSONS.md` — 跨游戏 H5/Loop/测试陷阱 |
| **不记** | 单游戏 IM、玩法、userId → `spec.md` / `im.md` |
| **游戏专有** | 游戏仓 `AGENT.md`（`agentmd-creator`） |
| **触发** | 通用疑难解决且 rubric 全过；人工纠正工程类；用户要求记入 |

### 8.6 仓库 Rule（摘录）

- 本仓库 **H5 only**；后端以 **`im.md`、`rest.md`、fixtures** 为准，**不访问后端代码仓库**
- **交互原则**：不知道就说不知道，不猜测不编造；输入不明确时先提问澄清，确认后再动手
- **流程顺序**：`product.md` → **UI** → 等后端文档 → **功能** → L2 测修；产品确认前不得进 ②；不得跳过 ② 直接写 IM（除非用户明确要求）
- **`rest.md`、`im.md` 由后端维护；AI 只读**，Loop 中禁止修改
- IM 解析 **以该游戏 `im.md` 为唯一依据**
- 测试失败先读 `tests/e2e/last-run.json`
- Loop 成功 = **`spec.md` 声明的全部 L2 用例（含各视角）全绿** — **流程终点**

---

## 9. Loop 工作流

### 9.0 主流程（五步）

| 步 | 名称 | 负责 | 产出 / 动作 |
|----|------|------|-------------|
| **①** | 输入游戏规则 | 你 | gameId、目标、规则、UI 说明 |
| **②** | H5 UI 生成 | AI `h5-game-spec` + `h5-game-ui` | **`product.md` 确认** + 各阶段 UI（mock） |
| **③** | 等待后端文档 | 后端 + 你 | `rest.md`、`im.md`、fixtures；`CONTRACT_GAPS.md` |
| **④** | 功能实现 | AI `h5-game-dev` | IM/REST/sync；`spec.md` 视角矩阵 + L2 用例 |
| **⑤** | L2 测修 | AI `h5-game-test` + `/loop` | **完整模式终点**；预览模式见 `WORKFLOW-MODES.md` |

**③ 可与 ② 并行**；**③ 未齐允许预览终点（②）**，不算失败。

### 9.1 状态机

```
① 输入规则 → h5-game-orchestrator
  → h5-game-spec → product.md（待确认）
  → 确认后 → h5-game-ui → mock UI
  → ③ 等待 rest.md / im.md / fixtures
      → Blocked → CONTRACT_GAPS → 预览终点（②）允许
      → Ready → h5-game-dev → h5-game-test（L2）
              → 全绿 → 完整终点
```

### 9.2 首轮对话流程

1. **①** 用户提供 gameId、规则 → `h5-game-orchestrator` → `product.md` → **请确认**
2. 确认后 **②** `h5-game-ui`（无骨架 → `new-game.ps1`）
3. **③** 并行等后端；Blocked 时 **预览终点 = ②**
4. 契约齐 → 补 `spec.md` 视角矩阵 → **④** `h5-game-dev`
5. **⑤** `h5-game-test` / `/loop` 至 L2 全绿（完整终点）

### 9.3 Cursor `/loop dynamic` 配置

> **说明**：`/loop` 主要用于 **⑤ 自动测修**；①～④ 为普通对话 Skill，一般不放入 Loop。

**Loop Prompt 模板：**

```text
执行 h5-game-test（gameId=<gameId>）：
1. 运行 scripts/run-e2e.ps1 或 npx playwright test tests/e2e/<gameId>.spec.js
2. 读取 tests/e2e/last-run.json
3. 若失败：仅修改 src/ 与 tests/，按 h5-game-dev 修复；IM 行为以该游戏 im.md 为准
4. 禁止修改 rest.md、im.md、fixtures（后端契约，AI 只读）；不访问后端代码仓库
5. 后端问题 → BLOCKED: Backend，交后端同事
6. L2 全绿（**含 spec 视角矩阵全部用例**）则输出摘要并停止 Loop
7. 同一用例连续失败 3 次则停止，标注 BLOCKED 原因
```

**停止条件：**

| 类型 | 条件 |
|------|------|
| Success | `spec.md` 全部 L2 用例（含各阶段声明视角）全绿 |
| Blocked: Backend | ④⑤ 缺 `im.md` / `rest.md` / fixture；审查不通过；REST 404；与后端文档不符 |
| Blocked: Spec | 同一用例 3 次仍失败 |
| User | `/loop stop` |

### 9.4 AI 读取运行日志的方式

| 来源 | 文件/位置 | 用途 |
|------|-----------|------|
| Playwright | `tests/e2e/last-run.json` | console、pageErrors、failedRequests、gameLog |
| H5 结构化日志 | `window.__gameLog`（e2e 模式） | IM 解析、阶段跳转、**userId / userRole**（多视角分支排查） |
| 静态服务 | 终端 `npm start` 输出 | 端口、启动错误 |

**Loop 不依赖 vConsole**（人眼看 mobile 用；AI 读 Playwright 导出即可）。

---

## 10. 测试场景与多视角

> **时机**：② UI 阶段可在 `spec.md` 写 **玩法阶段**；**视角矩阵与 L2 用例表** 在 **③ 契约到齐、进入 ④ 前** 根据 `im.md` 字段补全（见 §9.2 步骤 4）。

### 10.1 基础场景（功能维度）

每个游戏在 `spec.md` 中定义；用例 ID 建议 **`S<序号>`** 或 **`S<序号>-V<视角>`**（见 §10.2）：

| ID | 场景 | 初始 fixture | 操作 | 期望 |
|----|------|--------------|------|------|
| S01 | 进页展示 | poison-selection.json | 无 | UI 与 fixture、**当前 mock 用户视角** 一致 |
| S02 | 用户操作 | 当前阶段 fixture | mock REST 成功 + 下一条 IM | 进入下一阶段 |
| S03 | sync 兜底 | 空 / 旧状态 | mock sync 响应 | UI 恢复 |
| S04 | msgSeq 乱序 | 两条 IM 颠倒 | 注入 IM | 以较大 msgSeq 为准（**仅当 im.md 规定 msgSeq 时适用**） |
| S05 | reload 恢复 | 任意阶段 | reload + sync | 状态正确 |

### 10.2 视角矩阵（Viewpoint Matrix）— Loop 必声明

同一 **阶段** 内，不同 **用户身份** 可能看到 **不同 UI**（可操作 vs 等待 vs 观战等）。**Loop 不会自动发现未写的视角**；须在 `spec.md` 为每个阶段列出全部视角，并为 **每个视角至少 1 条 L2 用例**。

**命名**：`S<阶段编号>-V<视角编号>`，例如 `S02-V1`、`S02-V2`。

**矩阵模板**（写入 `spec.md`）：

| 阶段 | 视角 ID | 视角说明 | fixture | mock userId 条件 | 期望 UI（data-testid 或 __gameLog） |
|------|---------|----------|---------|------------------|-------------------------------------|
| item-selection | V1 | 当前选物品玩家 | item-selection.json | = `content.currentPlayer` | 可选物品、有操作区 |
| item-selection | V2 | 等待中的在局玩家 | 同上 | ∈ `players` 且 ≠ `currentPlayer` | 等待 UI，无选人控件 |
| item-selection | V3 | 观众 | 同上 | 不在 `players` / 未加入 | 观战文案，只读 |

**Loop 全绿定义**：上表中 **本游戏声明的每一行** 都有对应 Playwright 用例且通过；缺行 = 该视角 bug 可能永远测不到。

**与契约关系**：视角划分来自 **玩法 + `im.md` 字段**（如 `currentPlayer`、`players`、`readyPlayers`）；AI **不发明** 视角，由 spec 与产品/规则确认后写入。

### 10.3 L2 实现要点

```javascript
// 同一 fixture，换 mock 用户 → 不同视角（推荐写法）
test('S02-V1 item-selection active player', async ({ page }) => {
  await mockBridge.setup({ userId: 1001 }); // = fixture.content.currentPlayer
  await mockIM.inject(fixtureItemSelection);
  await expect(page.getByTestId('stage-item-selection-active')).toBeVisible();
});

test('S02-V2 item-selection waiting player', async ({ page }) => {
  await mockBridge.setup({ userId: 1002 }); // 在 players 内，非 currentPlayer
  await mockIM.inject(fixtureItemSelection);
  await expect(page.getByTestId('stage-item-selection-waiting')).toBeVisible();
  await expect(page.getByTestId('item-picker')).not.toBeVisible();
});
```

- **fixture 一份即可**（IM 为全桌状态）；视角差异靠 **`mockBridge.userId`**。  
- fixture 内 `currentPlayer`、`players[].userId` 等须与 mock 用户 **对齐**，否则断言无意义（审查见 §5.2）。  
- 避免仅用可见文案断言（易 flaky）；优先 **`data-testid`** 或 `__gameLog.userRole`。  
- 需要「A 操作 → B 界面变化」时，用 **双 Context + mock REST 分流**（§7.4 第二行），标为 L3 或 spec 可选用例。

### 10.4 样例：`witchs-poison` 部分阶段视角（摘录）

供 `spec.md` 参考；完整表由产品与 `im.md` 定稿后补全。

| 阶段 | 视角 | mock userId 条件 | 期望（摘要） |
|------|------|------------------|--------------|
| ready | 房主 owner | `readyPlayers` 中 readyTime 最早 | 可配置主题、开始试炼 |
| ready | 普通 player | 在 `readyPlayers` 非最早 | 可加入/取消准备 |
| ready | audience | 不在 `readyPlayers` | 观战/加入试炼按钮 |
| poison-selection | 在局玩家（未注入） | 在局且未完成 setup | 选容器 + 惩罚 |
| poison-selection | 在局玩家（已注入） | `setupTime > 0` | 已完成态 |
| poison-selection | audience | 非在局玩家 | 等待文案，无表单 |
| item-selection | 当前选人 | = `currentPlayer` | 可选物品 |
| item-selection | 其他在局玩家 | ≠ `currentPlayer` | 等待 + 只读物品列表 |
| game-end | 赢家 / 输家 / 观众 | 对照 `gameEndResult.winners` / `loser` | 不同结果头图与文案 |

对应 L2 用例示例：`S-ready-V1`、`S-poison-V2`、`S-item-V1` 等。

---

## 11. 范围外（真机联调）

App 测试包 iOS/Android 真机联调 **不在本工具链终点范围内**。本工具链以 **⑤ 浏览器 L2 全绿** 为完成标准。

---

## 12. 风险与对策

| 风险 | 对策 |
|------|------|
| IM 字段变更 | 后端更新 `im.md` + fixtures；L2 先失败 → AI 只改 H5 |
| 误抄其他游戏 IM 解析 | Rule：**以当前游戏 `im.md` 为准**；禁止跨游戏复制 manager 解析段 |
| AI 代写契约 | Rule：**禁止** AI 撰写/修改 `im.md`、`rest.md`；缺则 Blocked: Backend |
| Loop 改范围过大 | Rule：单次仅改失败用例相关 H5 / 测试文件 |
| 后端未 ready | ② UI 可先完成；④⑤ Blocked；**预览模式允许在 ② 结束** |
| 只测单一 userId，漏掉其他视角 | `spec.md` 维护视角矩阵；每视角一条 L2；Loop 全绿 = 矩阵全覆盖 |
| fixture 与 mock userId 不对齐 | §5.2 审查；用例注释写明 userId 与 `currentPlayer` / `players` 对应关系 |

---

## 13. 实施路线图

| 阶段 | 内容 | 负责人 |
|------|------|--------|
| W0 | 定 gameId；**① 输入规则 → ② UI 生成**（mock 预览） | 你 + AI |
| W0′ | **③ 后端提供** `rest.md`、`im.md`、fixture（可与 W0 并行） | 后端 |
| W1 | 4 个 Skill + Rule（含流程顺序、契约只读） | 你 + AI |
| W2 | **④ 功能接入** + L2 首条用例 + `last-run.json` | AI |
| W3 | **⑤** 补全视角矩阵用例，dynamic loop 跑通至全绿（**终点**） | AI Loop |
| W4 | （可选）L3 dev API 联调 | 你 + 后端 |

---

## 14. 待提取资源清单

> **状态**：运行时模板落在 kit `templates/scaffold/`；各游戏仓通过 init/scaffold 拷贝，**不依赖维护者本机路径**。

### 14.1 目标目录（kit 内）

```
h5-game-kit/
├── templates/scaffold/   # app.js、http-config、package 等（提取后）
├── skills/
├── rules/
└── …

<game-repo>/              # 各同事独立 clone / init 的游戏仓
```

> 后端服务由同事独立维护；AI 工作区 **不包含** 后端代码仓库，仅使用后端提供的 `im.md` / `rest.md` / fixtures。

### 14.2 P0 — `h5-game-kit`（Loop / 契约 / 测试）

| 资源 | 提取后路径 | 状态 |
|------|------------|------|
| 设计方案（本文） | `docs/H5-AI-Loop设计方案.md` + `README.md` | **已提取** |
| 游戏规则模板 | `docs/templates/spec.template.md` | **已提取** |
| 后端契约说明 | `docs/templates/BACKEND-CONTRACTS.README.md` | **已提取** |
| 契约缺口模板 | `docs/templates/CONTRACT_GAPS.template.md` | **已提取** |
| IM fixture 引用说明 | `docs/templates/fixtures/README.md` | **已提取** |
| Skill：`h5-game-spec` | `skills/h5-game-spec/SKILL.md` | **已提取** |
| Skill：`h5-game-ui` | `skills/h5-game-ui/SKILL.md` | **已提取** |
| Skill：`h5-game-dev` | `skills/h5-game-dev/SKILL.md` | **已提取** |
| Skill：`h5-game-test` | `skills/h5-game-test/SKILL.md` | **已提取** |
| Skill：`h5-game-orchestrator` | `skills/h5-game-orchestrator/SKILL.md` | **已提取** |
| Cursor Rule | `rules/h5-game-kit.mdc` | **已提取** |
| Playwright helpers | `tests/e2e/helpers/*.js` | **已提取** |
| E2E 用例骨架 | `tests/e2e/game.spec.template.js` | **已提取** |
| 跑测脚本 | `scripts/run-e2e.ps1` | **已提取** |
| Playwright 配置 | `playwright.config.template.js` | **已提取** |
| Vite 工程骨架 | `templates/scaffold/` | **已提取**（含 `public/core` 运行时） |
| npm 依赖 | `templates/scaffold/package.json` | **已提取**（`package.template.json` 仅旧仓补依赖） |

**P0 原则**：不改各游戏线上 `public/` 引用路径也能先用；新游戏初始化时 **拷贝 kit 到仓库** 即可。

### 14.3 运行时 `public/core`（已并入 scaffold）

**定案**：**一游戏一仓库**；runtime 直接落在各游戏仓 `public/core/`，**不建** `h5-game-common` 独立包或 `sync-core` 跨仓同步。

| 类别 | scaffold 路径 | 状态 |
|------|---------------|------|
| Bridge | `public/core/bridge/hybirdapp-plugin.js` | **已提取** |
| http-config / request / track / sync / throttle / server-time | `public/core/utils/` | **已提取** |
| UI（toast / alert / loading / input / lottie） | `public/core/components/` | **已提取** |
| vendor（zepto / MD5 / base64） | `public/core/vendor/` | **已提取** |
| TS 封装 | `src/lib/`、`src/services/`、`src/composables/` | **已提取** |

**刻意未提取**：`user-info.js`（API 路径因游戏而异）、共享 `styles/*.css`（视觉各游戏不同）。

**升级 runtime**：kit 发版后，从 `templates/scaffold/public/core/` 手动 diff 合并到该游戏仓，或局部重跑 scaffold（勿覆盖游戏 `src/`）。

### 14.4 保留在各游戏仓库（不提取）

| 类型 | 示例路径 | 原因 |
|------|----------|------|
| IM 解析与状态机 | `manager-base.js`（解析段）、`manager-game.js` | **每游戏 IM 结构不同**，解析逻辑按该游戏 `im.md` 编写，不提取为共用 |
| 游戏 UI / Vue | `app-vue*.js`、`app-index.html`、各游戏 `css/` | 100% 游戏私有 |
| 游戏契约 | `docs/games/<gameId>/rest.md`、`im.md`、`fixtures/` | 按 gameId 分仓维护 |
| E2E 用例 | `tests/e2e/<gameId>.spec.js` | 断言与 fixture 绑定具体游戏 |
| 环境配置 | 各仓 `http-config.js` 内域名与 signKey | 部署环境不同 |

**不迁移**：旧式 `ManagerBase` — 新游戏用 Pinia + `src/services/`。

### 14.5 提取状态（已定）

| 阶段 | 状态 | 说明 |
|------|------|------|
| **P0** | ✅ 完成 | `h5-game-kit` + `templates/scaffold/`（含 `public/core`） |
| **h5-game-common** | ❌ 不做 | 一仓一游戏，无跨游戏 sync 需求 |
| **ManagerBase 薄封装** | ❌ 不做 | 新栈 Pinia + services |

### 14.6 kit 与游戏仓同步

| 方式 | 说明 |
|------|------|
| **新建** | `new-game.ps1` — scaffold（含 `public/core`）+ Loop 工具链 |
| **升级 Loop** | `sync-kit.ps1` — Rule、Skills、E2E helpers（**不覆盖** `src/`、`public/core/`） |
| **升级 runtime** | 从 kit `templates/scaffold/public/core/` 手动合并到该游戏仓 |

### 14.7 提取完成检查项

- [x] `h5-game-kit` 含 §14.2 全部 P0 资源
- [x] `new-game.ps1` 可初始化 scaffold + Loop 工具链
- [x] `templates/scaffold/public/core/` 含 bridge / utils / components / vendor
- [x] 本文档 §14.2 / §14.3 已更新为实际路径（**无 h5-game-common**）

---

## 15. 命令速查

```powershell
# 启动 H5（test 环境，以项目实际为准）
cd <game-repo>
npm start -- test

# 跑 E2E 并产出日志
npx playwright test tests/e2e/<gameId>.spec.js

# Cursor 启动 Loop
/loop dynamic
执行 h5-game-test：gameId=<gameId>，L2 全绿则停，失败读 last-run.json 修 H5；禁止改 im.md/rest.md/fixtures；不访问后端代码。
```

---

## 16. 附录：关键参考

| 项 | 说明 |
|----|------|
| 后端契约 | 后端同事提供 `docs/games/<gameId>/` 下的 **`im.md`、`rest.md`、fixtures`**；AI **只读**，不访问后端代码 |
| 飞行棋 H5 参考 | `aeroplane-chess`（ludo、`baseInfo` 解析、http-config） |
| 周年庆活动 | `event-anniversary`（静态活动栈，**非**语音房游戏流程） |
| H5 API 配置 | Vite `.env.*` 或 `src/config/env.ts` → apiBase |
| 技术栈约定 | `h5-game-kit/docs/TECH-STACK.md` |
| Loop 工具链 | `h5-game-kit/` — 见 **§14.2** |
| runtime core | 各游戏仓 `public/core/`（自 scaffold 拷贝，见 **§14.3**） |

---

## 17. 一句话总结

**① 输入规则 → orchestrator 编排 → ② UI（mock）→ ③ 等后端 → ④ 接功能 → ⑤ L2 全绿（完整终点）；③ 未齐可在 ② 结束（预览）。**
