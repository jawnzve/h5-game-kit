/**
 * 游戏同步工具类
 * 统一管理游戏状态同步的触发时机和策略
 * 
 * 支持的同步触发时机：
 * 1. 进入前台时（通过 ServerTimeSync 的回调）
 * 2. 页面加载时（初始同步）
 * 3. 加入游戏失败时
 * 4. 延迟同步检测（倒计时结束后如果没收到IM消息）
 */

class GameSync {
    constructor() {
        // 同步处理器（由具体游戏设置）
        this.syncHandler = null;
        
        // 初始同步处理器（由具体游戏设置）
        this.initialSyncHandler = null;
        
        // 延迟同步定时器
        this.delayedSyncTimer = null;
        
        // 初始同步进行中标记
        this.initialSyncInProgress = false;
        
        // 同步配置
        this.config = {
            // 延迟同步检测时间（毫秒）
            delayedSyncDelay: 2000,
            // 是否启用延迟同步检测
            enableDelayedSync: true
        };
        
        console.log('🎮 GameSync 初始化');
    }
    
    /**
     * 设置同步处理器
     * @param {Object} handler 同步处理器（需要实现 handle() 方法）
     */
    setSyncHandler(handler) {
        if (handler && typeof handler.handle === 'function') {
            this.syncHandler = handler;
            console.log('✅ 已设置游戏同步处理器');
        } else {
            console.warn('⚠️ 同步处理器格式不正确，需要实现 handle() 方法');
        }
    }
    
    /**
     * 设置初始同步处理器
     * @param {Object} handler 初始同步处理器（需要实现 handle() 方法）
     */
    setInitialSyncHandler(handler) {
        if (handler && typeof handler.handle === 'function') {
            this.initialSyncHandler = handler;
            console.log('✅ 已设置初始同步处理器');
        } else {
            console.warn('⚠️ 初始同步处理器格式不正确，需要实现 handle() 方法');
        }
    }
    
    /**
     * 执行游戏同步
     * @param {Object} options 同步选项
     * @param {boolean} options.showLoading 是否显示全局转圈（web-loading），默认 true；与 silent 独立，进入前台等场景可 true + silent
     * @param {boolean} options.silent 是否静默失败（不弹业务错误等），默认 false
     */
    async sync(options = {}) {
        const resolvedSilent = options.silent !== undefined ? options.silent : false;
        // 未指定 showLoading 时：非静默同步默认显示转圈；静默同步默认不显示（避免与「仅 silent」的调用冲突，进入前台需显式 showLoading: true）
        const resolvedShowLoading = options.showLoading !== undefined
            ? options.showLoading
            : !resolvedSilent;
        const mergedOptions = {
            ...options,
            showLoading: resolvedShowLoading,
            silent: resolvedSilent
        };

        if (!this.syncHandler) {
            console.warn('⚠️ 游戏同步处理器未设置，无法执行同步');
            return;
        }

        try {
            console.log('🔄 执行游戏同步', { showLoading: resolvedShowLoading, silent: resolvedSilent });

            if (typeof this.syncHandler.handle === 'function') {
                await this.syncHandler.handle(mergedOptions);
            } else {
                console.error('❌ 同步处理器 handle 方法不存在');
            }
        } catch (error) {
            if (resolvedSilent) {
                console.warn('⚠️ 游戏同步失败（静默模式）:', error);
            } else {
                console.error('❌ 游戏同步失败:', error);
            }
            throw error;
        }
    }
    
    /**
     * 执行初始同步（页面加载时调用）
     * @param {Object} options 同步选项
     */
    async initialSync(options = {}) {
        if (!this.initialSyncHandler) {
            console.warn('⚠️ 初始同步处理器未设置，无法执行初始同步');
            return;
        }
        
        if (this.initialSyncInProgress) {
            console.warn('⚠️ 初始同步正在进行中，跳过重复调用');
            return;
        }
        
        try {
            this.initialSyncInProgress = true;
            console.log('🔄 执行初始同步');
            
            if (typeof this.initialSyncHandler.handle === 'function') {
                await this.initialSyncHandler.handle();
            } else {
                console.error('❌ 初始同步处理器 handle 方法不存在');
            }
        } catch (error) {
            console.error('❌ 初始同步失败:', error);
        } finally {
            this.initialSyncInProgress = false;
        }
    }
    
    /**
     * 启动延迟同步检测
     * 在倒计时结束后，如果指定时间内没收到IM消息，则调用同步接口
     * @param {number} delay 延迟时间（毫秒），默认使用配置值
     */
    startDelayedSyncDetection(delay = null) {
        if (!this.config.enableDelayedSync) {
            console.log('⚠️ 延迟同步检测已禁用');
            return;
        }
        
        // 清除之前的定时器
        this.stopDelayedSyncDetection();
        
        const syncDelay = delay || this.config.delayedSyncDelay;
        console.log(`🔄 启动延迟同步检测：${syncDelay}ms后如果没收到IM消息将调用同步接口`);
        
        this.delayedSyncTimer = setTimeout(() => {
            console.log(`⏰ ${syncDelay}ms内未收到IM消息，静默调用同步接口`);
            // 静默调用同步接口（不显示loading）
            this.sync({ showLoading: false, silent: true });
        }, syncDelay);
    }
    
    /**
     * 停止延迟同步检测
     */
    stopDelayedSyncDetection() {
        if (this.delayedSyncTimer) {
            clearTimeout(this.delayedSyncTimer);
            this.delayedSyncTimer = null;
            console.log('🔄 延迟同步检测已停止');
        }
    }
    
    /**
     * 设置配置
     * @param {Object} config 配置对象
     */
    setConfig(config) {
        if (config && typeof config === 'object') {
            this.config = { ...this.config, ...config };
            console.log('✅ 游戏同步配置已更新:', this.config);
        }
    }
    
    /**
     * 获取当前配置
     * @returns {Object} 配置对象
     */
    getConfig() {
        return { ...this.config };
    }
    
    /**
     * 检查是否正在执行初始同步
     * @returns {boolean}
     */
    isInitialSyncInProgress() {
        return this.initialSyncInProgress;
    }
    
    /**
     * 重置状态（用于清理）
     */
    reset() {
        this.stopDelayedSyncDetection();
        this.initialSyncInProgress = false;
        console.log('🔄 游戏同步状态已重置');
    }
}

// 创建全局单例
if (typeof window !== 'undefined') {
    window.GameSync = new GameSync();
}

