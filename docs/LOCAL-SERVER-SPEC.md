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
| App 联调 | **App 版** IM/REST 连 **远端真实后端**（按 `im.md` / `rest.md` + http-config），**不连本机 API** |

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
| **Preview 入口** | **`/preview/preview-index.html`** — 仅 ② 确认 UI |
| 资源 | 图片等放 `public/games/<gameId>/assets/`（构建时拷贝进 `dist/`） |

`app.js` 可做 `/` → 默认游戏 `app-index` 等 redirect；**不注入** API 环境。

---

## 4. `http-config.js`

提取后：`templates/scaffold/public/core/utils/http-config.js`（构建进 `dist/`）。

| 项 | 约定 |
|----|------|
| 规则引擎 | 按 hostname：`.small-test` → … → `.dev` → qniqni 正式 → 回退 **远端 DEV** |
| 强制 | `?http_env=prod\|test\|dev\|…` |
| **apiBase 预设** | 默认以 **witchs-poison** 的 `loong-h5-game-server.*` 为模板；**新建游戏时 AI 须询问**是否沿用或替换 |
| **本地静态服** | 浏览器打开 `localhost:3100` 时，`apiBase` 仍指向 **远端 dev/test API**，**不**拼 `localhost:4000` |
| 导出 | `window.httpConfig.currentEnv` |

---

## 5. 双版本 UI（与 ②③④ 对齐）

| 版本 | 入口 | ② | ④ |
|------|------|---|---|
| **Preview** | preview 页 | 可切换 **阶段 / 状态 / 身份视角**；Pinia **mock**；给你确认 UI | 不接真实 IM/REST |
| **App** | `app-index.html` | 共用 SFC + `data-testid`；可空壳/mock | 按文档接 **真实** IM/REST/sync（远端） |

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

---

## 7. E2E（Playwright）— 只测 **App 版**

**Preview 仅人工验收 UI，不进 Playwright。** L2 / Loop 一律打开 **App 入口**（含 ④ 功能逻辑与 IM/REST 路径）。

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
| 脚本 | `templates/scaffold/package.json` |
| http-config | `templates/scaffold/public/core/utils/http-config.js` |
| http-request / track-log / server-time / throttle | `templates/scaffold/public/core/utils/` + `vendor/` |
| 桥接 | `templates/scaffold/public/core/bridge/hybirdapp-plugin.js` + `src/bridge/` |
