/**
 * Web Toast组件 - 通用轻量级提示组件
 * 样式：统一灰底白字（不区分 success / warning / error / info）
 * 功能：轻量级提示，自动消失，支持点击关闭
 */

(function (window) {
    'use strict';

    const TOAST_CONTAINER_ID = 'web-toast-container';
    const DEFAULT_DURATION = 2000;
    // 仅保留一个全局Toast实例与定时器
    let CURRENT_TOAST = null;
    let CURRENT_TIMER = null;

    function getOrCreateToastContainer() {
        let container = document.getElementById(TOAST_CONTAINER_ID);
        if (!container) {
            container = document.createElement('div');
            container.id = TOAST_CONTAINER_ID;
            Object.assign(container.style, {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: '10000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                width: '100%',
                maxWidth: '80vw'
            });
            document.body.appendChild(container);
        }
        return container;
    }

    function createToastElement(message, type) {
        const toast = document.createElement('div');
        toast.className = `web-toast web-toast-${type}`;
        toast.textContent = message;
        
        // 基础样式（所有 type 共用，避免红/绿/橙区分）
        Object.assign(toast.style, {
            background: 'rgba(80, 80, 80, 0.96)',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '10px',
            fontSize: '16px',
            lineHeight: '1.5',
            textAlign: 'center',
            opacity: '0',
            transition: 'all 0.3s ease-in-out',
            transform: 'translateY(-12px)',
            pointerEvents: 'auto',
            maxWidth: '320px',
            wordWrap: 'break-word',
            cursor: 'pointer'
        });

        return toast;
    }

    window.showToast = function (message, type = 'info', duration = DEFAULT_DURATION) {
        const container = getOrCreateToastContainer();

        // 若存在正在显示的Toast，则先移除并清理其定时器（新的一条顶掉上一条）
        if (CURRENT_TIMER) {
            clearTimeout(CURRENT_TIMER);
            CURRENT_TIMER = null;
        }
        if (CURRENT_TOAST && CURRENT_TOAST.parentNode) {
            CURRENT_TOAST.parentNode.removeChild(CURRENT_TOAST);
        }

        const toast = createToastElement(message, type);
        container.appendChild(toast);
        CURRENT_TOAST = toast;

        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // 自动隐藏
        CURRENT_TIMER = setTimeout(() => {
            hideToast(toast);
        }, duration);

        // 点击手动关闭
        toast.addEventListener('click', () => {
            if (CURRENT_TIMER) {
                clearTimeout(CURRENT_TIMER);
                CURRENT_TIMER = null;
            }
            hideToast(toast);
        });

        return toast;
    };

    function hideToast(toast) {
        if (!toast || !toast.parentNode) return;

        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            if (toast === CURRENT_TOAST) {
                CURRENT_TOAST = null;
            }
        }, 300);
    }

    // 兼容性别名
    window.showTip = window.showToast;

})(typeof window !== 'undefined' ? window : this);

