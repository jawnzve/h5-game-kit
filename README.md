# h5-game-kit

语音房 H5 游戏的 **工具链起点包**（Skill、Rule、scaffold、文档）：自研后端约定 + **①–⑤** 工作流（v0.2）。

[[_TOC_]]

**Git 仓库**（两处同源，`origin` 为 GitHub）：

- GitHub：https://github.com/jawnzve/h5-game-kit.git
- GitLab：https://gitlab.haochang.tv/chanpin_yongyan/h5-game-kit.git

```powershell
git clone https://github.com/jawnzve/h5-game-kit.git
```

**技术栈约定**：Vue 3 + Vite + TypeScript + Pinia — 见 [`docs/TECH-STACK.md`](docs/TECH-STACK.md)。  
**工作流**：[`docs/WORKFLOW-MODES.md`](docs/WORKFLOW-MODES.md) · **真联调④**：[`docs/LIVE-INTEGRATION-SPEC.md`](docs/LIVE-INTEGRATION-SPEC.md) · **自研后端**：[`docs/BACKEND-SPEC.md`](docs/BACKEND-SPEC.md) · **管理端**：[`docs/ADMIN-SPEC.md`](docs/ADMIN-SPEC.md)

## 目录结构

```
h5-game-kit/
├── VERSION / CHANGELOG.md
├── docs/
│   ├── WORKFLOW-MODES.md          # ①–⑤ / 预览·完整终点
│   ├── LIVE-INTEGRATION-SPEC.md   # ④ 真联调自动化
│   ├── BACKEND-SPEC.md            # 自研后端（多游戏一服务）
│   ├── ADMIN-SPEC.md              # 管理端（h5-game-admin，③-A）
│   ├── TECH-STACK.md              # 技术栈与目录约定
│   ├── LOCAL-SERVER-SPEC.md       # 本地服 / http-config / sim-lobby
│   ├── PREVIEW-UI-SPEC.md         # Preview 外壳规范
│   ├── LESSONS.md                 # 跨游戏通用踩坑（真源）
│   └── templates/
│       ├── KIT_README.md          # → 游戏仓 docs/games/<id>/KIT_README.md
│       ├── product-doc.template.md / product-doc.example.md
│       ├── spec.template.md
│       ├── BACKEND-CONTRACTS.README.md
│       ├── AGENT.md.template / AGENTS.md.template
│       └── fixtures/README.md
├── skills/
│   ├── h5-game-orchestrator/      # 总控
│   ├── h5-game-spec/              # ① 产品文档
│   ├── h5-game-preview/           # ② Preview 原型
│   ├── h5-game-server/            # ③-S 后端引擎
│   ├── h5-game-admin/             # ③-A 管理端（按需）
│   ├── h5-game-dev/               # ③-F 玩家 App
│   ├── h5-game-test/              # ③ 子门禁 Mock E2E
│   ├── h5-game-live-test/         # ④ 真联调
│   ├── h5-game-lessons/           # 通用踩坑记录
│   ├── h5-game-track/             # 埋点（玩法完成后，触发词加载）
│   └── agentmd-creator/           # 可选 AGENT.md
├── rules/
│   └── h5-game-kit.mdc            # → 游戏仓 .cursor/rules/
├── loop/                          # /loop dynamic 用 prompt
├── tests/e2e/                     # Playwright helpers + 用例模板
├── scripts/
│   ├── new-game.ps1 / scaffold-game.ps1 / init-game.ps1 / sync-kit.ps1
│   ├── run-e2e.ps1
│   ├── run-live-integration.ps1
│   └── fix-product-md-anchors.mjs
├── templates/scaffold/            # Vite 工程骨架（new-game 拷贝）
│   ├── public/sim-lobby.html      # ⑤ 多窗 sim（{{gameId}} 占位）
│   ├── public/core/               # 桥 / http / UI 组件（禁改 hybirdapp-plugin.js）
│   ├── docs/APP-SYNC-NOTES.md     # ③-F 从 werewords 回拷说明
│   └── src/lib/throttle.ts, server-time.ts, …
├── playwright.config.template.js
└── package.template.json
```

> 游戏仓**不**复制整份 `docs/`；用 `KIT_README.md` 指回本仓路径。`LESSONS` 仅镜像为游戏仓 `docs/KIT-LESSONS.md`。

## 新游戏快速开始

### 1. 新建游戏仓库

在空目录或新 clone 的游戏仓执行：

```powershell
# <kit-root> = 本仓库 clone 路径；<game-repo> = 游戏仓路径
& "<kit-root>\scripts\new-game.ps1" `
  -GameId "my-game" `
  -GameName "我的游戏" `
  -Target "<game-repo>" `
  -InstallSkills
```

等价于 **`scaffold-game.ps1`**（Vite + `app.js` + `http-config` + bridge + 双入口）+ **`init-game.ps1`**（Rule、Skill、E2E、docs）。

已有工程只需 Kit 工具链时：

```powershell
& "<kit-root>\scripts\init-game.ps1" `
  -GameId "my-game" `
  -Target "<game-repo>" `
  -InstallSkills `
  -InstallAgentMd
```
### 2. 开始开发（推荐说法）

在游戏仓对 AI 说：

```
新游戏 my-game，规则是：……
```

由 **`h5-game-orchestrator`** 判断当前步并加载对应 Skill（①→②→③→④→⑤）。

### 3. 安装 Skill（若 init 未加 -InstallSkills）

| 方式 | 做法 |
|------|------|
| **对话 @ 引用** | `@h5-game-kit/skills/h5-game-spec/SKILL.md`（其他 Skill 同理） |
| **复制到个人** | 复制 `skills/*` → `%USERPROFILE%\.cursor\skills\` |
| **复制到项目** | 复制 `skills/*` → `<game-repo>/.cursor/skills/` |

### 4. 五步流程与两种终点

| 步 | Skill / 动作 |
|----|----------------|
| ① 产品文档 + §1.1 基础设施 → 人工确认 | `h5-game-spec` |
| ② Preview 原型 → 人工确认 | `h5-game-preview` |
| ③ 自主开发（③-S / ③-F / ③-A）+ **子门禁 Mock 全绿** | `h5-game-server` · `h5-game-dev` · `h5-game-admin` · `h5-game-test` |
| ④ **真联调 live 全绿**（技术交付） | `h5-game-live-test` · `run-live-integration.ps1` |
| ⑤ **人工 sim**（产品终点） | `sim-lobby.html`（④ 全绿后） |

| 模式 | 条件 | 终点 |
|------|------|------|
| **预览** | ③ 未齐 | ② 已人工确认即可停 |
| **完整（技术）** | ③ 齐 | ③ 子门禁 + **④ live 全绿** |
| **完整（产品）** | ③ 齐 | 上述 + **⑤ sim 通过** |

详见 [`docs/WORKFLOW-MODES.md`](docs/WORKFLOW-MODES.md)、[`docs/BACKEND-SPEC.md`](docs/BACKEND-SPEC.md)。

### 5. 本地开发与 Playwright

```powershell
cd <game-repo>
npm install
npx playwright install chromium

npm run dev                              # Vite 开发（:5173）
npm run build                            # 产出 dist/
npm start                                # Express 托管 dist（默认 :3100，见 LOCAL-SERVER-SPEC）
npx playwright test tests/e2e/<gameId>.spec.js
```

环境由 `public/core/utils/http-config.js` 按 **访问域名** 选择远端 API，不由 `npm start` 传参。

## kit 与游戏仓分工

| 放在 kit | 放在各游戏仓 |
|----------|--------------|
| Skill、Rule、TECH-STACK、Playwright helpers | **`src/`** Vue+Pinia 代码、`dist/` 构建产物 |
| product/spec **模板**；`BACKEND-CONTRACTS` 指针模板 | **`product.md`**、**`spec.md`**、**`BACKEND-CONTRACTS.md`**（指向自研 `h5-game-server/docs/games/<id>/`） |
| 用例 **模板** | `tests/e2e/<gameId>.spec.js` |

## 升级 kit

游戏仓记录 `docs/games/<gameId>/KIT_VERSION.txt`。kit 更新后执行：

```powershell
& "<kit-root>\scripts\sync-kit.ps1" `
  -GameId "my-game" `
  -Target "<game-repo>" `
  -InstallSkills
```

**会同步**：Rule、Skills（`-InstallSkills`）、e2e helpers、`run-e2e.ps1`、`KIT_VERSION`、**`docs/KIT-LESSONS.md`（只读镜像）**  
**不会覆盖**：`product.md`、`spec.md`、`<gameId>.spec.js`、`src/`、`public/core/`、`BACKEND-CONTRACTS.md`（契约真源在 `h5-game-server`，不在本仓）

**架构定案**：**一游戏一仓库**；`public/core/` 随 scaffold 落在各游戏仓内，**不建** `h5-game-common` 独立包。runtime 升级用 `sync-kit.ps1`（Skills/E2E）+ 必要时手动合并 scaffold 的 `public/core` 片段。

## 通用踩坑（全员共享）

| 项 | 说明 |
|----|------|
| **唯一真源** | kit `docs/LESSONS.md` |
| **游戏仓只读镜像** | `docs/KIT-LESSONS.md`（`init-game` / `sync-kit` 同步） |
| **怎么记** | 在游戏仓对 AI：**「记进工具包 LESSONS」**（须跨游戏；玩法专有 → 游戏 `spec.md`） |
| **别人怎么用** | ④⑤ 前读 kit LESSONS 或本仓镜像；kit 更新后跑 `sync-kit.ps1` 刷新镜像 |
