# App 桥接

| 文件 | 说明 |
|------|------|
| `hybirdapp-plugin.js` | **桥本体**，与 aeroplane-chess / witchs-poison 等同源，**未修改** |

`app-index.html` 在引入插件后、http-config 前，**内联注册空回调**（与 aeroplane-chess `app-index.html` §2.1 相同，非独立桥文件）。

TypeScript 薄封装（kit 新增，参考项目无）：`src/bridge/`
