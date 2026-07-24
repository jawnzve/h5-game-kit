# LESSONS — H5 Game Loop 通用踩坑

> **唯一真源（全员共享）**：本文件在 **kit 仓库** `h5-game-loop-kit/docs/LESSONS.md`。  
> 任意游戏踩到**跨游戏**工程坑 → 对 AI 说「**记进工具包 LESSONS**」→ 写入**本文件**（不是游戏仓 `spec.md`）。  
> 各游戏仓有只读镜像 `docs/KIT-LESSONS.md`，由 `sync-kit.ps1` 更新。

## 维护约定

- **活跃条目上限** 30；超限合并或标 `obsolete`
- 写前 grep 同 `#标签` + 根因，有则合并
- `im.md` 大改、技术栈升级 → 相关条目标 `obsolete`
- 格式：`### L-YYYY-MM-DD-序号 | 阶段 | #标签`

## 何时记入本文（通用层）

**必提议**（仍须过 rubric，且 **必须** 跨游戏可复用）：

- 用户纠正了 **工程/工具链/测试** 类错误（非 im 业务字段）
- 用户说「记一下 / 记入 LESSONS」

**可提议**（疑难刚解决，且 rubric 全过）：

- 低版本 WebView / `build.target` 兼容
- Playwright mock、Vite e2e 钩子、Pinia 模式
- Loop 测修、last-run.json 排查

**不因修了几轮就记**：复杂 IM/玩法问题修 5 轮也正常，若根因仅本游戏 → 只更新 `spec.md`，不进本文。

**不记入本文**：

- 某游戏 `im.md` 业务字段、阶段机、视角 userId（→ 游戏 `spec.md` 视角矩阵）
- 产品规则未定（→ `product.md` §16）
- 后端缺契约（→ `CONTRACT_GAPS.md`）
- typo、本机环境偶发

---

## 活跃条目

### L-2026-07-15-01 | ① product | #mermaid #gitlab #product-doc

- **现象**：GitLab 渲染 `product.md` 中 `stateDiagram-v2` 失败，提示 `Syntax error in text`（Mermaid 10.7.0）
- **根因**：阶段 ID 含连字符（如 `elect-mayor`）被解析为减法；边标签中的 `～`/`≤`/全角括号、`note` 内 `\n` 亦易触发解析错误
- **避免**：用 `state "elect-mayor" as electMayor` 别名，边只用别名；标签用普通连字符与短横线文案；多行说明用 `note … end note`，勿在 note 行内写 `\n`；表格空单元格用 `-` 不用 `—`
- **状态**：active

### L-2026-07-15-02 | ② ui | #css #webview #compat

- **现象**：App 旧 WebView（尤指 iOS 14.4 及以下 / 旧 Android）上间距消失、毛玻璃无效、卡片比例变形、昵称不省略、描边异常等
- **根因**：目标环境低于现代 CSS 能力；Flexbox `gap` 需 iOS 14.5+；`aspect-ratio` / `backdrop-filter` / `-webkit-text-stroke` 等支持不齐；flex 子项默认 `min-width:auto` 撑破省略
- **避免**（② 写样式时默认按此做）：
  1. **Flex 间距**：不用 `flex + gap`，用子项 `margin`（`:not(:last-child)` 或具名 class）；**Grid + `gap` 可保留**
  2. **毛玻璃**：先给实色半透明底，再写 `backdrop-filter` + `-webkit-backdrop-filter`，并用 `@supports` 增强
  3. **宽高比**：不用单独依赖 `aspect-ratio`；改显式宽高、`padding-bottom` 百分比，或 JS 按宽算高
  4. **省略/均分**：需省略或均分的 flex 子项设 `min-width: 0`；双按钮均分用 `flex: 1 1 0`，勿 `width: 100%` 硬撑
  5. **描边字**：避免 `-webkit-text-stroke` + `paint-order`；用 `text-shadow` 模拟
  6. **其它惯例**：可滚容器加 `-webkit-overflow-scrolling: touch`；控件 `appearance: none`；交互区去 tap 高亮 / 禁长按选中（按需）
  7. **字重**：**勿**用数值 `font-weight`（如 `400`/`500`/`600`/`700`/`800`）；部分 **Android WebView** 对数值字重映射异常或不生效。常规文案用 `normal`，加粗用 `bold`
- **参考**：ito `compatibility-notes.md`；witchs-poison / aeroplane-chess / event-anniversary 的 `shared-styles` 注释
- **状态**：active

<!-- 示例（勿删，供复制）：
### L-2026-06-30-01 | ④ dev | #webview #vite

- **现象**：旧 WebView 白屏，console 报 optional chaining 语法错误
- **根因**：`build.target` 高于 App 内置 Chromium 支持版本
- **避免**：`vite.config` 设 `target: 'es2018'`（或按 TECH-STACK）；勿默认 esnext
- **状态**：active
-->

---

## 已归档（obsolete）

（无）
