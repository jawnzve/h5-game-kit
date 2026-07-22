# 通用 UI 组件

**运行时 JS** + **TS 薄封装**（`src/lib/ui.ts`、`src/composables/useLottie.ts`）。新游戏业务只写 TS，见 `docs/TECH-STACK.md` §5.5。

## 为何保留 JS 而非改成 TS？

| 层 | 格式 | 原因 |
|----|------|------|
| `public/core/components/*.js` | IIFE 全局 | 经 `<script>` 在 **Vue bundle 之前** 加载；`http-request.js` 依赖 `window.showToast` |
| `src/lib/ui.ts`、composables | TypeScript | 游戏侧统一入口 |

## 组件一览

| 文件 | 全局 API | app-index |
|------|----------|-----------|
| `web-toast.js` | `showToast` | ✅ |
| `web-alert.js` | `showAlert` | ✅ |
| `web-loading.js` | `showLoading` / `hideLoading` | ✅ |
| `web-input.js` | `createInputField` | ✅ |
| `web-lottie.js` | `LottiePlayer.*` | ✅ |

Lottie 详细用法：`public/assets/anim/lottie-usage-guide.md`
