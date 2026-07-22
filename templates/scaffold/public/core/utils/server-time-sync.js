/**
 * 服务器时间同步工具类
 * 完全基于 reference/core.js 的实现逻辑
 * 
 * 核心原理：
 * 1. 从服务器获取初始时间戳（通过 onAIGameDevice）
 * 2. 使用 performance.now() 单调时钟计算流逝时间
 * 3. 每秒更新一次 timestamp = 服务器基准时间 + 流逝时间
 * 4. 前后台切换时重新校准
 * 
 * 优势：
 * - 不受客户端系统时间修改影响
 * - 使用高精度单调时钟，更准确
 * - 定时更新，随时可用
 */
class ServerTimeSync {
    constructor() {
        // 当前服务器时间戳（毫秒）- 每秒更新
        this.timestamp = Date.now();
        
        // 服务器时间基准（收到回调时的服务器时间，毫秒）
        this.baseServerTimestamp = 0;
        
        // 本地高精度时钟基准（收到回调时的 performance.now 或 Date.now）
        this.basePerfNow = 0;
        
        // 本地时间基准（收到回调时的 Date.now，毫秒）
        this.baseLocalNow = 0;
        
        // 服务器与本地时间偏移（毫秒）
        this.offsetMs = 0;
        
        // 零差矫正：首次回调时的常量偏移（server - local），毫秒
        this.deltaFixMs = 0;
        
        // 定时器
        this.timer = null;
        
        // 是否已初始化
        this.initialized = false;
        
        console.log('🕐 ServerTimeSync 初始化');
        
        // 页面关闭时清除定时器
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.stopTimer();
            });
        }
    }
    
    /**
     * 检查是否支持 performance.now
     * @returns {boolean}
     */
    isPerformanceSupported() {
        return !!(window.performance && window.performance.now);
    }
    
    /**
     * 初始化时间基准
     * @param {number} serverTimestamp 服务器时间戳（毫秒）
     */
    initialize(serverTimestamp) {
        if (typeof serverTimestamp !== 'number' || serverTimestamp <= 0) {
            console.error('❌ 服务器时间戳无效:', serverTimestamp);
            return;
        }
        
        this.timestamp = serverTimestamp;
        
        // 初始化时间基准（优先使用单调时钟，避免系统时间跳变影响）
        this.baseServerTimestamp = serverTimestamp;
        this.basePerfNow = this.isPerformanceSupported() ? performance.now() : Date.now();
        this.baseLocalNow = Date.now();
        this.offsetMs = serverTimestamp - Date.now();
        
        // 记录零差矫正的常量偏移，使两路时间在显示上对齐
        this.deltaFixMs = this.baseServerTimestamp - this.baseLocalNow;
        
        this.initialized = true;
        
        console.log('✅ ServerTimeSync 已初始化');
        console.log('📊 服务器时间基准:', new Date(this.baseServerTimestamp).toLocaleString());
        console.log('📊 本地时间基准:', new Date(this.baseLocalNow).toLocaleString());
        console.log('📊 时间偏移:', this.offsetMs, 'ms');
        console.log('📊 使用时钟:', this.isPerformanceSupported() ? 'performance.now' : 'Date.now');
        
        // 启动定时更新
        this.startTimer();
    }
    
    /**
     * 校准服务器时间基准（切到前台或需要时调用）
     * @param {number=} newServerTimestamp 可选的新服务器时间（毫秒）
     */
    calibrate(newServerTimestamp) {
        const usePerfNow = this.isPerformanceSupported();
        
        // 重置本地基准
        this.basePerfNow = usePerfNow ? performance.now() : Date.now();
        this.baseLocalNow = Date.now();
        
        // 计算服务器基准：优先用传入值，否则用本地时间 + 已知偏移估算
        const serverBase = typeof newServerTimestamp === 'number' 
            ? newServerTimestamp 
            : this.baseLocalNow + (this.offsetMs || 0);
            
        this.baseServerTimestamp = serverBase;
        
        // 更新当前权威时间
        this.timestamp = this.baseServerTimestamp;
        
        // 维护展示对齐用的常量偏移
        this.deltaFixMs = this.baseServerTimestamp - this.baseLocalNow;
        
        console.log('🔄 ServerTimeSync 已校准');
        console.log('📊 新服务器基准:', new Date(this.baseServerTimestamp).toLocaleString());
        console.log('📊 新本地基准:', new Date(this.baseLocalNow).toLocaleString());
        
        // 重启定时器
        this.startTimer();
    }
    
    /**
     * 启动定时器，每秒更新时间戳
     */
    startTimer() {
        // 先清除之前的定时器
        this.stopTimer();
        
        const usePerfNow = this.isPerformanceSupported();
        const baseServerTs = this.baseServerTimestamp || this.timestamp || Date.now();
        const baseMonoNow = this.basePerfNow || (usePerfNow ? performance.now() : Date.now());
        const baseLocalNow = this.baseLocalNow || Date.now();
        
        this.timer = window.setInterval(() => {
            const nowMono = usePerfNow ? performance.now() : Date.now();
            const elapsed = nowMono - baseMonoNow;
            
            // 服务器权威时间：只用服务器基准 + 单调时钟流逝，不受系统时间修改影响
            this.timestamp = Math.floor(baseServerTs + elapsed);
            
            // 用同一套单调时钟计算"本地时间"，避免顺序调用 Date.now 带来的额外毫秒偏差
            const localNowFromMono = Math.floor(baseLocalNow + elapsed);
            const deltaSrv = this.timestamp - localNowFromMono;
            
            // 可选：取消注释以查看详细日志
            // console.log('⏱️ ServerTime:', this.timestamp, 'LocalTime:', Date.now(), 'Δ:', deltaSrv);
        }, 1000);
        
        console.log('▶️ ServerTimeSync 定时器已启动');
    }
    
    /**
     * 停止定时器
     */
    stopTimer() {
        if (this.timer) {
            window.clearInterval(this.timer);
            this.timer = null;
            console.log('⏸️ ServerTimeSync 定时器已停止');
        }
    }
    
    /**
     * 获取当前服务器时间（权威时间）
     * @returns {number} 服务器时间戳（毫秒）
     */
    now() {
        if (!this.initialized) {
            console.warn('⚠️ ServerTimeSync 未初始化，返回本地时间');
            return Date.now();
        }
        
        return this.timestamp;
    }
    
    /**
     * 获取服务器与本地时间偏移
     * @returns {number} 偏移毫秒数
     */
    getOffset() {
        return this.offsetMs;
    }
    
    /**
     * 检查是否已初始化
     * @returns {boolean}
     */
    isInitialized() {
        return this.initialized;
    }
    
    /**
     * 计算剩余时间（用于倒计时）
     * @param {number} endTimestamp 结束时间戳（毫秒）
     * @returns {number} 剩余毫秒数
     */
    getRemainingTime(endTimestamp) {
        return Math.max(0, endTimestamp - this.now());
    }
    
    /**
     * 格式化时间显示 (mm:ss)
     * @param {number} milliseconds 毫秒数
     * @returns {string} 格式化的时间字符串
     */
    formatTime(milliseconds) {
        if (milliseconds <= 0) return '00:00';
        const totalSeconds = Math.ceil(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * 获取调试信息
     * @returns {Object} 调试信息对象
     */
    getDebugInfo() {
        return {
            initialized: this.initialized,
            timestamp: this.timestamp,
            timestampStr: new Date(this.timestamp).toLocaleString(),
            baseServerTimestamp: this.baseServerTimestamp,
            baseServerTime: new Date(this.baseServerTimestamp).toLocaleString(),
            basePerfNow: this.basePerfNow,
            baseLocalNow: this.baseLocalNow,
            baseLocalTime: new Date(this.baseLocalNow).toLocaleString(),
            offsetMs: this.offsetMs,
            deltaFixMs: this.deltaFixMs,
            currentLocalTime: Date.now(),
            currentLocalTimeStr: new Date().toLocaleString(),
            timeDiff: this.timestamp - Date.now(),
            usePerformance: this.isPerformanceSupported(),
            timerActive: this.timer !== null
        };
    }
}

// 创建全局单例
if (typeof window !== 'undefined') {
    window.ServerTimeSync = new ServerTimeSync();
}
