/**
 * 通用 Lottie 动画组件
 * 提供全屏 Lottie 动画的初始化和销毁功能，支持自定义动画文件
 * 
 * 使用方法：
 * 1. 在 HTML 中添加 canvas 元素：
 *    <canvas id="my-lottie-canvas" class="lottie-animation"></canvas>
 * 
 * 2. 在 CSS 中添加样式（或使用 shared-styles.css 中的样式）：
 *    .lottie-animation {
 *        position: fixed;
 *        top: 0;
 *        left: 50%;
 *        transform: translateX(-50%);
 *        height: 100vh;
 *        width: auto;
 *        display: block;
 *        pointer-events: none;
 *        z-index: 9998;
 *    }
 * 
 * 3. 在 JavaScript 中使用：
 *    // 初始化动画
 *    const instance = await window.LottiePlayer.init({
 *        canvasId: 'my-lottie-canvas',
 *        src: './assets/anim/Confetti.lottie',  // 自定义动画文件路径
 *        autoplay: true,
 *        loop: false
 *    });
 * 
 *    // 播放控制
 *    window.LottiePlayer.play();
 *    window.LottiePlayer.pause();
 *    window.LottiePlayer.stop();
 * 
 *    // 销毁动画
 *    window.LottiePlayer.destroy();
 */

(function() {
    'use strict';

    // 动画实例映射表（支持多个实例）
    const instances = new Map();
    let defaultInstanceId = null;

    /**
     * 设置 canvas 尺寸
     * 高度填满屏幕，宽度根据动画宽高比自适应
     * @param {HTMLCanvasElement} canvas - Canvas 元素
     * @param {number} aspectRatio - 宽高比
     * @param {Object} customSize - 自定义尺寸（可选）
     * @param {number} customSize.width - 自定义宽度
     * @param {number} customSize.height - 自定义高度
     */
    function setCanvasSize(canvas, aspectRatio, customSize = null) {
        if (customSize && customSize.width && customSize.height) {
            // 使用自定义尺寸
            canvas.width = customSize.width;
            canvas.height = customSize.height;
        } else {
            // 默认：高度填满屏幕，宽度根据动画宽高比自适应
            const height = window.innerHeight;
            const width = height * aspectRatio;
            canvas.width = width;
            canvas.height = height;
        }
    }

    /**
     * 初始化 Lottie 动画
     * @param {Object} options 配置选项
     * @param {string} options.instanceId - 实例 ID（用于管理多个实例，默认: 'default'）
     * @param {string} options.canvasId - Canvas 元素的 ID（必需）
     * @param {string} options.src - Lottie 动画文件路径（必需，支持 .lottie 或 .json）
     * @param {boolean} options.autoplay - 是否自动播放（默认: true）
     * @param {boolean} options.loop - 是否循环播放（默认: false）
     * @param {string} options.cdnUrl - DotLottie CDN 地址（默认: pinned @0.65.0 jsdelivr +esm）
     * @param {boolean} options.setAsDefault - 是否设置为默认实例（默认: true，仅第一个实例）
     * @param {Object} options.canvasSize - 自定义 canvas 尺寸（可选，如果不提供则使用屏幕高度自适应）
     * @param {number} options.canvasSize.width - 自定义宽度
     * @param {number} options.canvasSize.height - 自定义高度
     * @returns {Promise} 返回 Promise，动画加载完成后 resolve，返回实例对象
     */
    async function init(options = {}) {
        if (!options.canvasId) {
            return Promise.reject(new Error('canvasId 是必需的参数'));
        }
        if (!options.src) {
            return Promise.reject(new Error('src 是必需的参数'));
        }

        const instanceId = options.instanceId || 'default';
        
        // 合并配置
        const config = {
            instanceId,
            canvasId: options.canvasId,
            src: options.src,
            autoplay: options.autoplay !== undefined ? options.autoplay : true,
            loop: options.loop !== undefined ? options.loop : false,
            cdnUrl: options.cdnUrl || 'https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0.65.0/+esm',
            setAsDefault: options.setAsDefault !== undefined ? options.setAsDefault : (defaultInstanceId === null),
            canvasSize: options.canvasSize || null // 自定义 canvas 尺寸
        };

        // 获取 canvas 元素
        const canvasElement = document.getElementById(config.canvasId);
        if (!canvasElement) {
            return Promise.reject(new Error(`Canvas 元素 #${config.canvasId} 不存在`));
        }

        // 检查是否已存在相同实例且动画文件路径相同，可以复用
        const existingInstance = instances.get(instanceId);
        if (existingInstance && existingInstance.config.src === config.src) {
            // 检查 canvas 元素是否发生变化（可能被 Vue 等框架重新渲染）
            if (existingInstance.canvas !== canvasElement) {
                // Canvas 元素已变化，不能复用，必须重新创建
                // 因为 DotLottie 实例内部保存了对旧 canvas 的引用和 buffer
                destroy(instanceId);
                // 继续执行下面的创建新实例逻辑
            } else {
                // Canvas 未变化，可以复用已加载的实例，只重置播放状态（避免重新加载文件，节省资源）
                const lottieInstance = existingInstance.instance;
                
                // 停止动画并重置到开始位置
                if (lottieInstance.stop) {
                    lottieInstance.stop();
                }
                
                // 如果需要自动播放，从头开始播放
                if (config.autoplay && lottieInstance.play) {
                    lottieInstance.play();
                }
                
                // 更新配置（可能 autoplay 或 loop 有变化）
                existingInstance.config.autoplay = config.autoplay;
                existingInstance.config.loop = config.loop;
                existingInstance.config.canvasSize = config.canvasSize;
                
                // 更新 canvas 尺寸（窗口大小可能变化，或使用自定义尺寸）
                setCanvasSize(canvasElement, existingInstance.aspectRatio, config.canvasSize);
                
                return Promise.resolve(existingInstance);
            }
        }

        // 如果实例已存在但动画文件不同，先销毁
        if (instances.has(instanceId)) {
            destroy(instanceId);
        }

        try {
            // 动态导入 dotLottie
            const { DotLottie } = await import(config.cdnUrl);
            
            // ⚠️ 重要：必须在创建 DotLottie 实例之前设置 canvas 尺寸
            // 因为 DotLottie 会在初始化时根据当前 canvas 尺寸分配 WebAssembly buffer
            // 如果使用自定义尺寸，先设置好，避免后续尺寸不匹配
            if (config.canvasSize && config.canvasSize.width && config.canvasSize.height) {
                canvasElement.width = config.canvasSize.width;
                canvasElement.height = config.canvasSize.height;
            }
            
            // 创建 DotLottie 实例
            const lottieInstance = new DotLottie({
                autoplay: config.autoplay,
                loop: config.loop,
                canvas: canvasElement,
                src: config.src,
            });

            // 等待动画加载完成，获取原始尺寸
            await lottieInstance.load();

            // 获取动画的原始尺寸（如果可用）
            let aspectRatio = 1; // 默认 1:1
            if (lottieInstance.animation) {
                const anim = lottieInstance.animation;
                if (anim.w && anim.h) {
                    aspectRatio = anim.w / anim.h;
                }
            }

            // 设置 canvas 尺寸：如果没有使用自定义尺寸，则使用屏幕高度自适应
            if (!config.canvasSize) {
                setCanvasSize(canvasElement, aspectRatio, null);
            }

            // 窗口大小改变时更新（仅当未使用自定义尺寸时）
            const resizeHandler = () => {
                if (canvasElement && lottieInstance && !config.canvasSize) {
                    setCanvasSize(canvasElement, aspectRatio, null);
                }
            };
            // 仅当未使用自定义尺寸时才添加 resize 监听器
            if (!config.canvasSize) {
                window.addEventListener('resize', resizeHandler);
            }

            // 保存实例信息
            const instanceData = {
                id: instanceId,
                instance: lottieInstance,
                canvas: canvasElement,
                config: config,
                resizeHandler: resizeHandler,
                aspectRatio: aspectRatio,
                customSize: config.canvasSize // 保存自定义尺寸
            };
            instances.set(instanceId, instanceData);

            // 设置为默认实例
            if (config.setAsDefault || defaultInstanceId === null) {
                defaultInstanceId = instanceId;
            }

            console.log(`[LottiePlayer] 动画实例 "${instanceId}" 初始化成功`);
            return Promise.resolve(instanceData);

        } catch (error) {
            console.error(`[LottiePlayer] 初始化失败 (${instanceId}):`, error);
            return Promise.reject(error);
        }
    }

    /**
     * 隐藏指定实例（停止动画并隐藏 canvas，但不销毁实例，可复用）
     * @param {string} instanceId - 实例 ID（默认: 'default'）
     */
    function hide(instanceId = 'default') {
        const instanceData = instances.get(instanceId);
        if (!instanceData) {
            return;
        }
        
        const { instance, canvas } = instanceData;
        
        // 停止动画
        if (instance && instance.stop) {
            instance.stop();
        }
        
        // 隐藏 canvas（不销毁实例，保留已加载的动画数据）
        if (canvas) {
            canvas.style.display = 'none';
        }
        
        console.log(`[LottiePlayer] 隐藏动画实例 "${instanceId}"（保留已加载数据）`);
    }

    /**
     * 显示指定实例（显示 canvas 并重置到开始位置）
     * @param {string} instanceId - 实例 ID（默认: 'default'）
     * @param {boolean} autoplay - 是否自动播放（默认: true）
     */
    function show(instanceId = 'default', autoplay = true) {
        const instanceData = instances.get(instanceId);
        if (!instanceData) {
            console.warn(`[LottiePlayer] 实例 "${instanceId}" 不存在，无法显示`);
            return;
        }
        
        const { instance, canvas, aspectRatio, customSize } = instanceData;
        
        // 显示 canvas
        if (canvas) {
            canvas.style.display = 'block';
            // ⚠️ 重要：只有在没有使用自定义尺寸时才更新 canvas 尺寸
            // 因为重新设置 canvas.width/height 会清空 canvas 并可能影响 WebAssembly buffer
            // 自定义尺寸的 canvas 已经在 init() 时设置好，不需要再次设置
            if (!customSize) {
                // 窗口大小可能变化，重新计算屏幕自适应尺寸
                setCanvasSize(canvas, aspectRatio, null);
            }
        }
        
        // 重置到开始位置 - 移动端需要更可靠的重置方法
        if (instance) {
            // 方法1: 先暂停（如果动画正在播放）
            if (instance.pause) {
                instance.pause();
            }
            
            // 方法2: 停止动画并重置到开始位置
            if (instance.stop) {
                instance.stop();
            }
            
            // 方法3: 尝试使用 seek(0) 重置到第一帧（如果支持）
            if (instance.seek && typeof instance.seek === 'function') {
                try {
                    instance.seek(0);
                } catch (e) {
                    // 静默失败
                }
            }
        }
        
        // 如果需要自动播放，从头开始播放
        // 移动端需要延迟，确保重置操作完成后再调用 play()
        // 使用 requestAnimationFrame 确保与浏览器渲染周期同步
        if (autoplay && instance && instance.play) {
            // 使用 requestAnimationFrame + setTimeout 组合，解决移动端渲染时序问题
            // requestAnimationFrame 确保在浏览器下一个渲染帧执行
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (instance && instance.play) {
                        try {
                            instance.play();
                        } catch (e) {
                            console.error(`[LottiePlayer] play() 调用失败:`, e);
                        }
                    }
                }, 100); // 延迟 100ms，配合 requestAnimationFrame 使用
            });
        }
    }

    /**
     * 销毁指定实例（完全销毁，释放资源）
     * @param {string} instanceId - 实例 ID（默认: 'default'）
     */
    function destroy(instanceId = 'default') {
        const instanceData = instances.get(instanceId);
        if (!instanceData) {
            return;
        }

        try {
            // 清理 resize 监听器
            if (instanceData.resizeHandler) {
                window.removeEventListener('resize', instanceData.resizeHandler);
            }
            // 销毁 DotLottie 实例
            if (instanceData.instance && instanceData.instance.destroy) {
                instanceData.instance.destroy();
            }
        } catch (error) {
            console.error(`[LottiePlayer] 销毁失败 (${instanceId}):`, error);
        }

        instances.delete(instanceId);
        
        // 如果销毁的是默认实例，重新设置默认实例
        if (defaultInstanceId === instanceId) {
            defaultInstanceId = instances.size > 0 ? Array.from(instances.keys())[0] : null;
        }
    }

    /**
     * 销毁所有实例
     */
    function destroyAll() {
        const instanceIds = Array.from(instances.keys());
        instanceIds.forEach(id => destroy(id));
        defaultInstanceId = null;
    }

    /**
     * 播放指定实例的动画
     * @param {string} instanceId - 实例 ID（默认: 'default'）
     */
    function play(instanceId = 'default') {
        const instanceData = instances.get(instanceId);
        if (instanceData && instanceData.instance && instanceData.instance.play) {
            instanceData.instance.play();
        }
    }

    /**
     * 暂停指定实例的动画
     * @param {string} instanceId - 实例 ID（默认: 'default'）
     */
    function pause(instanceId = 'default') {
        const instanceData = instances.get(instanceId);
        if (instanceData && instanceData.instance && instanceData.instance.pause) {
            instanceData.instance.pause();
        }
    }

    /**
     * 停止指定实例的动画
     * @param {string} instanceId - 实例 ID（默认: 'default'）
     */
    function stop(instanceId = 'default') {
        const instanceData = instances.get(instanceId);
        if (instanceData && instanceData.instance && instanceData.instance.stop) {
            instanceData.instance.stop();
        }
    }

    /**
     * 获取指定实例
     * @param {string} instanceId - 实例 ID（默认: 'default'）
     * @returns {Object|null} 实例数据对象或 null
     */
    function getInstance(instanceId = 'default') {
        return instances.get(instanceId) || null;
    }

    /**
     * 获取所有实例 ID 列表
     * @returns {Array} 实例 ID 数组
     */
    function getAllInstanceIds() {
        return Array.from(instances.keys());
    }

    /**
     * 获取默认实例 ID
     * @returns {string|null} 默认实例 ID 或 null
     */
    function getDefaultInstanceId() {
        return defaultInstanceId;
    }

    /**
     * 设置默认实例
     * @param {string} instanceId - 实例 ID
     */
    function setDefaultInstance(instanceId) {
        if (instances.has(instanceId)) {
            defaultInstanceId = instanceId;
        } else {
            console.warn(`[LottiePlayer] 实例 "${instanceId}" 不存在`);
        }
    }

    // 导出到全局
    if (typeof window !== 'undefined') {
        window.LottiePlayer = {
            init,
            destroy,
            destroyAll,
            hide,
            show,
            play,
            pause,
            stop,
            getInstance,
            getAllInstanceIds,
            getDefaultInstanceId,
            setDefaultInstance
        };
    }

})();
