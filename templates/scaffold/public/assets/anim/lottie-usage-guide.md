# Lottie 动画使用指南

本文档说明如何在项目中使用新的 Lottie 动画。

> **Kit 说明**：`web-lottie.js` 已同步 **ito 实战版**；Vue 3 推荐 `useLottie()` / `preloadLottie` / `playLottie`。

## Vue 3 快速用法（ito 验证）

```typescript
import { useLottie } from '@/composables/useLottie';
import { DEFAULT_LOTTIE_CANVAS_ID } from '@/lib/ui';

const confetti = useLottie({
  instanceId: 'confetti',
  canvasId: DEFAULT_LOTTIE_CANVAS_ID,
  src: '/assets/anim/Confetti.lottie',
  destroyOnUnmount: false,
});
await confetti.preload(); // loading 阶段
await confetti.play();    // 结算
confetti.hide();
```

### 踩坑（ito 总结）

| 问题 | 做法 |
|------|------|
| 首次播放卡顿 | loading 阶段 `preload()` |
| 重复播放慢 | 用 `show` 复用，勿反复 destroy+init |
| Vue `v-if` 后失效 | canvas 换节点 → destroy 再 init；或 canvas 放 v-if 外 |
| 阶段切换找不到 canvas | `nextTick` 后再 play |
| 内联动画模糊/崩溃 | `canvasSize: { width, height }` 固定尺寸 |
| 资源 404 | 路径用 `/assets/anim/xxx.lottie` |

## 📋 前置条件

1. 确保 `web-lottie.js` 组件已加载（通常在 HTML 中通过 `<script>` 标签引入）
2. 准备好 `.lottie` 或 `.json` 格式的动画文件

## 🚀 快速开始

### 步骤 1: 添加动画文件

将你的 Lottie 动画文件（`.lottie` 或 `.json`）放到 `public/assets/anim/` 目录下：

```
public/
  assets/
    anim/
      Confetti.lottie          # 现有的彩带动画
      MyNewAnimation.lottie    # 你的新动画文件
      AnotherAnimation.json    # 也支持 JSON 格式
```

### 步骤 2: 在 HTML 中添加 Canvas 元素

在需要显示动画的位置添加 `<canvas>` 元素：

```html
<!-- 全屏动画（推荐用于胜利动画等） -->
<canvas id="my-new-animation-canvas" class="lottie-animation"></canvas>

<!-- 或者使用自定义样式 -->
<canvas id="my-custom-animation-canvas" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9999;"></canvas>
```

**注意：**
- 每个动画需要唯一的 `id`
- 建议使用 `lottie-animation` 类（已在 `shared-styles.css` 中定义）
- 如果使用自定义样式，确保 `pointer-events: none` 避免阻挡用户交互

### 步骤 3: 在 JavaScript 中初始化和使用

#### 基础用法

```javascript
// 初始化动画
async function initMyAnimation() {
    if (typeof window.LottiePlayer === 'undefined') {
        console.error('[LottiePlayer] 组件未加载');
        return;
    }
    
    try {
        await window.LottiePlayer.init({
            instanceId: 'my-new-animation',        // 唯一实例 ID
            canvasId: 'my-new-animation-canvas',    // Canvas 元素 ID
            src: './assets/anim/MyNewAnimation.lottie',  // 动画文件路径
            autoplay: true,                        // 是否自动播放
            loop: false                            // 是否循环播放
        });
        console.log('✅ 动画初始化成功');
    } catch (error) {
        console.error('❌ 动画初始化失败:', error);
    }
}

// 调用初始化
initMyAnimation();
```

#### 在 Vue 组件中使用

```javascript
// 在 Vue 的 methods 中添加
methods: {
    async initMyAnimation() {
        if (typeof window.LottiePlayer === 'undefined') {
            console.error('[LottiePlayer] 组件未加载');
            return;
        }
        
        try {
            // 检查实例是否已存在（复用已加载的动画）
            const existingInstance = window.LottiePlayer.getInstance('my-new-animation');
            if (existingInstance) {
                // 实例已存在，直接显示并播放
                window.LottiePlayer.show('my-new-animation', true);
            } else {
                // 实例不存在，初始化新实例
                await window.LottiePlayer.init({
                    instanceId: 'my-new-animation',
                    canvasId: 'my-new-animation-canvas',
                    src: './assets/anim/MyNewAnimation.lottie',
                    autoplay: true,
                    loop: false
                });
            }
        } catch (error) {
            console.error('[LottiePlayer] 初始化失败:', error);
        }
    },
    
    // 隐藏动画（不销毁，保留已加载数据）
    hideMyAnimation() {
        if (typeof window.LottiePlayer !== 'undefined') {
            window.LottiePlayer.hide('my-new-animation');
        }
    },
    
    // 销毁动画（完全释放资源）
    destroyMyAnimation() {
        if (typeof window.LottiePlayer !== 'undefined') {
            window.LottiePlayer.destroy('my-new-animation');
        }
    }
}
```

#### 在 Vue 的 watch 中自动控制

```javascript
watch: {
    // 监听某个状态，自动显示/隐藏动画
    someCondition(newValue) {
        this.$nextTick(() => {
            if (newValue) {
                this.initMyAnimation();
            } else {
                this.hideMyAnimation();
            }
        });
    }
}
```

#### 在生命周期中清理

```javascript
beforeUnmount() {
    // 组件卸载时销毁动画
    if (this.destroyMyAnimation) {
        this.destroyMyAnimation();
    }
}
```

## 🎮 播放控制

```javascript
// 播放动画
window.LottiePlayer.play('my-new-animation');

// 暂停动画
window.LottiePlayer.pause('my-new-animation');

// 停止动画（重置到开始位置）
window.LottiePlayer.stop('my-new-animation');
```

## 📐 自定义样式

如果需要自定义动画的显示位置和大小，可以在 CSS 中定义：

```css
/* 全屏居中（默认样式） */
.my-custom-animation {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 100vh;
    width: auto;
    display: block;
    pointer-events: none;
    z-index: 9998;
}

/* 右上角小动画 */
.my-small-animation {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 200px;
    height: 200px;
    pointer-events: none;
    z-index: 9999;
}

/* 底部居中动画 */
.my-bottom-animation {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-height: 50vh;
    pointer-events: none;
    z-index: 9998;
}
```

## 🔧 高级用法

### 管理多个动画实例

```javascript
// 初始化多个不同的动画
await window.LottiePlayer.init({
    instanceId: 'animation-1',
    canvasId: 'canvas-1',
    src: './assets/anim/Animation1.lottie',
    autoplay: true,
    loop: false
});

await window.LottiePlayer.init({
    instanceId: 'animation-2',
    canvasId: 'canvas-2',
    src: './assets/anim/Animation2.lottie',
    autoplay: false,  // 不自动播放
    loop: true        // 循环播放
});

// 获取所有实例 ID
const allIds = window.LottiePlayer.getAllInstanceIds();
console.log('所有动画实例:', allIds);

// 获取特定实例
const instance = window.LottiePlayer.getInstance('animation-1');

// 销毁所有实例
window.LottiePlayer.destroyAll();
```

### 复用已加载的动画

组件会自动检测相同 `instanceId` 和 `src` 的实例，如果已存在则复用，避免重复加载：

```javascript
// 第一次调用：加载动画文件
await window.LottiePlayer.init({
    instanceId: 'my-animation',
    canvasId: 'my-canvas',
    src: './assets/anim/MyAnimation.lottie'
});

// 第二次调用：复用已加载的实例（不会重新加载文件）
await window.LottiePlayer.init({
    instanceId: 'my-animation',
    canvasId: 'my-canvas',
    src: './assets/anim/MyAnimation.lottie'
});
```

### 使用 hide/show 优化性能

```javascript
// 隐藏动画（保留已加载数据，不销毁实例）
window.LottiePlayer.hide('my-animation');

// 显示动画（重置到开始位置并播放）
window.LottiePlayer.show('my-animation', true);  // true = 自动播放
```

## 📝 完整示例

### 示例 1: 在游戏开始阶段显示欢迎动画

```html
<!-- HTML -->
<canvas id="welcome-animation-canvas" class="lottie-animation"></canvas>
```

```javascript
// JavaScript (Vue)
computed: {
    isGameStarting() {
        return this.currentStage === 'ready' && this.players.length > 0;
    }
},

watch: {
    isGameStarting(newValue) {
        this.$nextTick(() => {
            if (newValue) {
                this.initWelcomeAnimation();
            } else {
                this.hideWelcomeAnimation();
            }
        });
    }
},

methods: {
    async initWelcomeAnimation() {
        if (typeof window.LottiePlayer === 'undefined') return;
        
        try {
            const existing = window.LottiePlayer.getInstance('welcome');
            if (existing) {
                window.LottiePlayer.show('welcome', true);
            } else {
                await window.LottiePlayer.init({
                    instanceId: 'welcome',
                    canvasId: 'welcome-animation-canvas',
                    src: './assets/anim/Welcome.lottie',
                    autoplay: true,
                    loop: false
                });
            }
        } catch (error) {
            console.error('欢迎动画初始化失败:', error);
        }
    },
    
    hideWelcomeAnimation() {
        if (typeof window.LottiePlayer !== 'undefined') {
            window.LottiePlayer.hide('welcome');
        }
    }
}
```

### 示例 2: 在按钮点击时播放反馈动画

```html
<!-- HTML -->
<button @click="handleButtonClick">点击我</button>
<canvas id="button-feedback-canvas" class="lottie-animation" style="width: 300px; height: 300px; top: 50%; left: 50%; transform: translate(-50%, -50%);"></canvas>
```

```javascript
// JavaScript
methods: {
    async handleButtonClick() {
        // 播放反馈动画
        await this.playButtonFeedback();
        
        // 执行其他逻辑
        // ...
    },
    
    async playButtonFeedback() {
        if (typeof window.LottiePlayer === 'undefined') return;
        
        try {
            const existing = window.LottiePlayer.getInstance('button-feedback');
            if (existing) {
                window.LottiePlayer.show('button-feedback', true);
            } else {
                await window.LottiePlayer.init({
                    instanceId: 'button-feedback',
                    canvasId: 'button-feedback-canvas',
                    src: './assets/anim/ButtonFeedback.lottie',
                    autoplay: true,
                    loop: false
                });
            }
            
            // 动画播放完成后自动隐藏（根据动画时长）
            setTimeout(() => {
                window.LottiePlayer.hide('button-feedback');
            }, 2000);  // 假设动画时长为 2 秒
        } catch (error) {
            console.error('反馈动画播放失败:', error);
        }
    }
}
```

## ⚠️ 注意事项

1. **实例 ID 唯一性**：每个动画实例需要唯一的 `instanceId`，避免冲突
2. **Canvas ID 唯一性**：每个 canvas 元素需要唯一的 `id`
3. **资源清理**：在组件卸载时记得调用 `destroy()` 释放资源
4. **性能优化**：使用 `hide()` 而不是 `destroy()` 来临时隐藏动画，可以复用已加载的数据
5. **文件路径**：确保动画文件路径正确，相对路径相对于 HTML 文件位置
6. **Z-index**：确保动画的 `z-index` 设置合理，不会遮挡重要 UI 元素

## 🐛 常见问题

### Q: 动画不显示？
- 检查 canvas 元素是否存在
- 检查动画文件路径是否正确
- 查看浏览器控制台是否有错误信息

### Q: 动画重复加载？
- 使用 `getInstance()` 检查实例是否已存在
- 使用 `hide()` 和 `show()` 而不是重复调用 `init()`

### Q: 动画位置不对？
- 检查 CSS 样式是否正确
- 确保 canvas 元素的 `display` 不是 `none`

### Q: 动画播放不流畅？
- 检查动画文件大小，过大可能影响性能
- 考虑使用 `.lottie` 格式（压缩更好）而不是 `.json`

## 📚 相关文件

- `public/core/components/web-lottie.js` - Lottie 组件核心代码
- `public/css/shared-styles.css` - 通用样式（包含 `.lottie-animation` 和 `.confetti-animation`）
- `public/assets/anim/` - 动画文件存放目录
