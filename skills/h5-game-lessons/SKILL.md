---
name: h5-game-lessons
description: >-
  H5 Game Kit 通用踩坑记录：判断是否记入 kit docs/LESSONS.md（跨游戏工程/测试陷阱）。
  不记单游戏 IM/玩法。触发：疑难解决后、人工纠正工程类错误、用户说「记一下这个坑」。
---
# h5-game-lessons

## 范围

| 记入 | 不记入（游戏仓自行维护） |
|------|--------------------------|
| kit `docs/LESSONS.md` — **跨游戏** H5/Loop/测试陷阱 | 本游戏 IM 字段、阶段、userId → `spec.md` 视角矩阵 |
| 低版本 WebView、Vite target、Playwright mock 等 | 产品未定 → `product.md` §16 |
| Pinia / e2e 钩子 / last-run 排查模式 | 后端缺文档/字段 → 回 ③ 改 `h5-game-server` 契约与引擎 |
| | 游戏专有上下文 → 游戏仓 `AGENT.md`（`agentmd-creator`） |

**Skill 不会自动记游戏专有坑**；游戏上下文靠前端 `product.md` / `spec.md`、后端仓 `im.md`（③）与可选 `AGENT.md`。

## 何时提议记录

**必提议**（须过 rubric，且根因 **跨游戏**）：

- 用户纠正了 **工程/工具链/测试** 类错误（非 im 业务字段）
- 用户明确要求记入 LESSONS

**可提议**（疑难刚解决，且 rubric 全过）：

- 兼容、构建、mock、Loop 流程类 — **与修了几次无关**

**不因轮次提议**：修了很多轮只说明问题复杂；根因若绑本游戏玩法/后端仓 `im.md` → 只写 `spec.md`（或回 ③ 改契约），不进 LESSONS。

**不提议**：

- 单游戏后端仓 `im.md` / 玩法 / mock userId 对齐
- 已在 `TECH-STACK.md` / Rule 写清的
- 一次性 typo、环境偶发

## 筛选 rubric

**全部满足**才写入 `docs/LESSONS.md`：

1. **跨游戏**：换另一个 gameId 仍可能踩（**不满足则一律不记**，与修了几轮无关）
2. **非显而易见**：读 TECH-STACK / 仓库代码仍易错
3. **可执行**：能写清现象、根因、避免（Do-Don't）

## 步骤

1. 判断层级：通用 → 本文；游戏专有 → 更新 `spec.md` / `AGENT.md`，**结束**
2. grep `docs/LESSONS.md` 同 `#标签` 或同根因；有则 **合并** 原条，不新建
3. 向用户 **一句话提议**（默认等确认；必提议类可先写 `status: 待确认`）
4. 按模板追加到 **活跃条目** 区：

```markdown
### L-YYYY-MM-DD-NN | ④ dev | #vite #webview

- **现象**：
- **根因**：
- **避免**：
- **状态**：active | 待确认 | obsolete
```

5. 活跃条目 **>30** → 合并或移入 **已归档**

## 何时读取

- 进入 **④ h5-game-dev**、**⑤ h5-game-test** 前：读 kit `docs/LESSONS.md`（游戏仓可读镜像 `docs/KIT-LESSONS.md`）
- 遇 Blocked / L2 连失败：再读一次相关 `#标签`

## 从游戏仓贡献（跨游戏坑 → 全员共享）

**唯一真源**：`h5-game-kit/docs/LESSONS.md`（所有 gameId 共用这一份）。

在游戏仓（如 werewords）开发时：

1. 用户说 **「记进工具包 LESSONS」** / **「这是通用坑」**
2. 过 rubric（跨游戏 + 非显而易见 + 可执行）
3. **直接编辑 kit 真源** `docs/LESSONS.md`（路径见游戏仓 `docs/games/<gameId>/KIT_README.md` 里的 Kit 根目录）
4. **禁止**只写游戏仓 `spec.md` 当通用坑；**禁止**改游戏仓 `docs/KIT-LESSONS.md`（只读镜像）
5. 写入后提示：其他游戏 `sync-kit.ps1` 可刷新本地 `KIT-LESSONS.md` 镜像

若当前 Cursor 工作区**只有游戏仓、无法改 kit 文件**：向用户说明需打开 kit 仓或 @ 引用 kit 的 `LESSONS.md` 再写入；或用户手动粘贴条目到 kit。

## 禁止

- 在游戏仓创建 `LESSONS.md`
- 把 `im.md` 业务细节写入 kit LESSONS
- 未经 rubric 批量堆砌条目

## 参考

- `h5-game-kit/docs/LESSONS.md`
- `h5-game-kit/docs/TECH-STACK.md`
