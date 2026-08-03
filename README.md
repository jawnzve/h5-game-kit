# h5-game-kit

语音房 H5 游戏的 **AI Loop 工具链起点包**：Skill、Rule、测试脚手架、文档模板。

**Git 仓库**（两处同源，`origin` 为 GitHub）：

- GitHub：https://github.com/jawnzve/h5-game-kit.git
- GitLab：https://gitlab.haochang.tv/chanpin_yongyan/h5-game-kit.git

```powershell
git clone https://github.com/jawnzve/h5-game-kit.git
```

**技术栈约定**：Vue 3 + Vite + TypeScript + Pinia — 见 [`docs/TECH-STACK.md`](docs/TECH-STACK.md)。

完整设计见 [`docs/H5-AI-Loop设计方案.md`](docs/H5-AI-Loop设计方案.md)。

## 目录结构

```
h5-game-kit/
├── docs/
│   ├── TECH-STACK.md
│   ├── LESSONS.md
│   ├── WORKFLOW-MODES.md     # 预览 / 完整两种终点
│   ├── LOCAL-SERVER-SPEC.md  # 本地服 / http-config / E2E 行为规格
│   └── H5-AI-Loop设计方案.md
├── skills/                  # 7 个 Cursor Skill
│   ├── h5-game-orchestrator/ # 总控：输入规则后自动编排步骤
│   ├── h5-game-spec/        # ① 产品文档
│   ├── h5-game-ui/          # ② UI
│   ├── h5-game-dev/         # ④ 功能
│   ├── h5-game-test/        # ⑤ 测修
│   ├── h5-game-lessons/     # 通用踩坑记录（④⑤ 疑难后）
│   └── agentmd-creator/     # 游戏仓 AGENT.md（游戏专有上下文，可选）
├── rules/                   # 复制到游戏仓 .cursor/rules/
├── loop/                    # /loop dynamic 用的 prompt 模板
├── tests/e2e/               # Playwright helpers + 用例模板
├── scripts/                 # init-game.ps1、scaffold-game.ps1、new-game.ps1、sync-kit.ps1、run-e2e.ps1、fix-product-md-anchors.mjs
├── templates/scaffold/      # Vite 工程骨架（scaffold-game.ps1 拷贝）
├── playwright.config.template.js
└── package.template.json
```

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

已有工程只需 Loop 工具链时：

```powershell
& "<kit-root>\scripts\init-game.ps1" `
  -GameId "my-game" `
  -Target "<game-repo>" `
  -InstallSkills
```
### 2. 开始开发（推荐说法）

在游戏仓对 AI 说：

```
新游戏 my-game，规则是：……
```

由 **`h5-game-orchestrator`** 判断当前步并加载对应 Skill（①→②→…）。

### 3. 安装 Skill（若 init 未加 -InstallSkills）

| 方式 | 做法 |
|------|------|
| **对话 @ 引用** | `@h5-game-kit/skills/h5-game-spec/SKILL.md`（其他 Skill 同理） |
| **复制到个人** | 复制 `skills/*` → `%USERPROFILE%\.cursor\skills\` |
| **复制到项目** | 复制 `skills/*` → `<game-repo>/.cursor/skills/` |

### 4. 五步流程与两种终点

| 步 | Skill |
|----|-------|
| ① 产品文档 | `h5-game-spec` |
| ② UI | `h5-game-ui` |
| ③ 等后端 | 更新 `CONTRACT_GAPS.md` |
| ④ 功能 | `h5-game-dev` |
| ⑤ 测修 | `h5-game-test` |

| 模式 | 条件 | 终点 |
|------|------|------|
| **预览** | ③ 后端未给契约 | ② mock UI 可预览，**允许不到 ⑤** |
| **完整** | ③ 契约齐备 | ⑤ L2 全绿 |

详见 [`docs/WORKFLOW-MODES.md`](docs/WORKFLOW-MODES.md)。

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
| product/spec **模板** | **`product.md`**、后端 **`im.md` / `rest.md` / fixtures**（格式不固定，后端提供） |
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
**不会覆盖**：`product.md`、`spec.md`、`<gameId>.spec.js`、`src/`、`public/core/`、`im.md`、fixtures

**架构定案**：**一游戏一仓库**；`public/core/` 随 scaffold 落在各游戏仓内，**不建** `h5-game-common` 独立包。runtime 升级用 `sync-kit.ps1`（Skills/E2E）+ 必要时手动合并 scaffold 的 `public/core` 片段。

## 通用踩坑（全员共享）

| 项 | 说明 |
|----|------|
| **唯一真源** | kit `docs/LESSONS.md` |
| **游戏仓只读镜像** | `docs/KIT-LESSONS.md`（`init-game` / `sync-kit` 同步） |
| **怎么记** | 在游戏仓对 AI：**「记进工具包 LESSONS」**（须跨游戏；玩法专有 → 游戏 `spec.md`） |
| **别人怎么用** | ④⑤ 前读 kit LESSONS 或本仓镜像；kit 更新后跑 `sync-kit.ps1` 刷新镜像 |
