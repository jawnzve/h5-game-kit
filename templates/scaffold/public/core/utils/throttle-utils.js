/**
 * 按钮/请求节流工具
 * 用于防止短时间重复点击导致多次调用 API
 */

(function (global) {
    var store = {};

    /**
     * 节流检查：短时间多次操作只放行一次
     * @param {string} key 唯一标识，不同按钮/操作使用不同 key
     * @param {number} [intervalMs=800] 间隔毫秒数，此时间内的重复调用会被拒绝
     * @returns {boolean} true 表示通过、可继续执行；false 表示在冷却期内，应跳过
     */
    function throttleApiCall(key, intervalMs) {
        intervalMs = intervalMs == null ? 800 : intervalMs;
        var now = Date.now();
        if (store[key] != null && now - store[key] < intervalMs) {
            return false;
        }
        store[key] = now;
        return true;
    }

    var ThrottleUtil = {
        throttleApiCall: throttleApiCall,
        DEFAULT_MS: 800
    };

    if (global.window !== undefined) {
        global.window.ThrottleUtil = ThrottleUtil;
    }
    if (typeof global !== 'undefined') {
        global.ThrottleUtil = ThrottleUtil;
    }
})(typeof window !== 'undefined' ? window : this);
