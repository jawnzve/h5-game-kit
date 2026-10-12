# 本地静态服务 — 需求规格

> **原则**：环境由 **页面访问域名** 在浏览器内解析（`http-config.js`），**不由** `npm start` 传参切换。  
> **可移植**：实现落在 kit `templates/scaffold/`（提取后）；使用者只需 clone kit，**不依赖**维护者本机路径。

---

## 1. 目标

| 项 | 要求 |
|----|------|
| 启动 | 游戏仓 `npm start` → `node app.js` |
| 职责 | **仅托管静态资源**（见 §3 静态目录）；**不提供**游戏 REST/IM 业务 API |
| 环境 | `apiBase` 由 `http-config.js` 按 **访问域名** 选择 |
| App 联调 | App 版可连 **自研本地后端**（`local` → `http://<hostname>:4000`）或远端预设；见 §4 |
| ⑤ 人工验收 | `public/sim-lobby.html`：多窗 sim；须在 **④ live 全绿之后**（见 WORKFLOW-MODES） |

---

## 2. 端口

**默认 `3100`**（避开 3000 旧游戏、3003 活动页、4000 等）。

| 项 | 约定 |
|----|------|
| 默认 | `process.env.PORT \|\| 3100` |
| 覆盖 | `PORT=3200 npm start` 或游戏仓 `.env` |
| Playwright | `baseURL` 与静态服端口一致（默认 `http://localhost:3100`） |

---

## 3. 静态目录与入口（已定）

按 **TECH-STACK**（Vite）：

| 项 | 约定 |
|----|------|
| **静态根** | `npm run build` 产出 **`dist/`**；`app.js` 托管 `dist/` |
| **App 入口** | **`/games/<gameId>/app-index.html`** — WebView / E2E / 正式联调 |
| **Preview 入口** | **`/preview/preview-index.html`** — ② 可交互原型（阶段跳转+mock 状态），人工确认 |
| **Sim Lobby** | **`/sim-lobby.html`** — **⑤** 多窗人工产品验收 |
| 资源 | 图片等放 `public/games/<gameId>/assets/`（构建时拷贝进 `dist/`） |

`app.js` 可做 `/` → 默认游戏 `app-index` 等 redirect；**不注入** API 环境。

---

## 4. `http-config.js`

提取后：`templates/scaffold/public/core/utils/http-config.js`（构建进 `dist/`）。

| 项 | 约定 |
|----|------|
| 规则引擎 | 按 hostname：私网/`localhost` → **`local`**（apiBase `http://<hostname>:4000`）；`.small-test` / `.audit` / 正式域 → 对应远端 |
| 强制 | `?http_env=local\|small-test\|audit\|prod` |
| **apiBase 预设** | `local` 指向本机/局域网自研后端 `:4000`；远端默认模板新建时 **须询问**是否沿用 |
| **本地联调** | 浏览器打开 `localhost` 或私网 IP 时走 `local`，连同机 Docker 后端；`PUBLIC_WS_URL=auto` 由后端按 Host 推导 WS |
| 导出 | `window.httpConfig.currentEnv` |

---

## 5. 双版本 UI（与 ② / ③-F / ⑤ 对齐）

| 版本 | 入口 | ② Preview | ③-F App | ⑤ 验收 |
|------|------|-----------|---------|--------|
| **Preview** | preview 页 | 可切换阶段/视角；mock 状态 | 不接真实 IM/REST | — |
| **App** | `app-index.html` | 共用 SFC | 接 IM/REST/sync | — |
| **Sim Lobby** | `sim-lobby.html` | — | — | ④ live 全绿后多窗人工验收 |

详见 `TECH-STACK.md` §9。

---

## 6. `package.json`

```json
{
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "vite",
    "build": "vue-tsc -b && vite build"
  }
}
```

- `npm start`：仅静态服，无环境参数  
- Playwright `webServer.command`：`npm start`

### 6.1 启动日志（App / Preview × 本地 / 局域网）

`npm run dev` 与 `npm start` 启动后均打印 **4 行完整 URL**（格式一致）：

```
App（本地）:     http://localhost:<port>/games/<gameId>/app-index.html
Preview（本地）: http://localhost:<port>/preview/preview-index.html
App（局域网）:     http://<局域网IP>:<port>/games/<gameId>/app-index.html
Preview（局域网）: http://<局域网IP>:<port>/preview/preview-index.html
```

| 命令 | 实现位置 | 默认端口 |
|------|----------|----------|
| `npm run dev` | `vite-plugins/print-dev-entry-urls.ts`（Vite 插件，覆盖默认 printUrls） | 5173 |
| `npm start` | `app.js` listen 回调 | 3100 |

---

## 7. E2E（Playwright）— 只测 **App 版**

**Preview 仅人工验收 UI，不进 Playwright Mock L2。** Mock E2E / Loop 打开 **App 入口**（③-F 逻辑路径；`?e2e=1` 无 `live=1`）。④ live 见 `LIVE-INTEGRATION-SPEC.md`。

```
1. 测前：npm run build → npm start（静态服托管 dist/）
2. page.goto(APP_PATH) → 必须是 App 版，不是 preview 页
3. 完整 URL 例：http://localhost:3100/games/my-game/app-index.html?e2e=1
```

| 配置项 | 含义 | 值 |
|--------|------|-----|
| `webServer.command` | 测前自动起静态服 | `npm start` |
| `baseURL` | 网站根 | `http://localhost:3100` |
| **`APP_PATH`** | **App 版**路径（含功能逻辑） | `/games/<gameId>/app-index.html?e2e=1` |
| Preview | ❌ 不用于 E2E | `/preview/preview-index.html` 仅浏览器手动打开 |

---

## 8. 实现位置

| 项 | 路径 |
|----|------|
| 静态服 | `templates/scaffold/app.js` |
| 开发服 URL 日志 | `templates/scaffold/vite-plugins/print-dev-entry-urls.ts` |
| Vite 配置 | `templates/scaffold/vite.config.ts` |
| 脚本 | `templates/scaffold/package.json` |
| http-config | `templates/scaffold/public/core/utils/http-config.js` |
| http-request / track-log / server-time / throttle | `templates/scaffold/public/core/utils/` + `vendor/` |
| 桥接 | `templates/scaffold/public/core/bridge/hybirdapp-plugin.js` + `src/bridge/` |
