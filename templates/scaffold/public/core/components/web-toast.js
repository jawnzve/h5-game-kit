/**
 * Web Toast组件 - 通用轻量级提示组件
 * 样式：统一灰底白字（不区分 success / warning / error / info）
 * 功能：轻量级提示，自动消失，支持点击关闭
 */

(function (window) {
    'use strict';

    const TOAST_CONTAINER_ATTR = 'data-web-toast-container';
    const DEFAULT_DURATION = 2000;
    /** @type {WeakMap<HTMLElement, { toast: HTMLElement | null, timer: ReturnType<typeof setTimeout> | null }>} */
    const containerState = new WeakMap();

    function getToastMountRoot(explicitRoot) {
        if (explicitRoot instanceof HTMLElement) return explicitRoot;
        const root = document.querySelector('[data-toast-root]');
        return root instanceof HTMLElement ? root : document.body;
    }

    function getContainerState(container) {
        let state = containerState.get(container);
        if (!state) {
            state = { toast: null, timer: null };
            containerState.set(container, state);
        }
        return state;
    }

    function getOrCreateToastContainer(mountRoot) {
        let container = mountRoot.querySelector(`[${TOAST_CONTAINER_ATTR}]`);

        if (!container) {
            container = document.createElement('div');
            container.setAttribute(TOAST_CONTAINER_ATTR, '');
            const onBody = mountRoot === document.body;
            Object.assign(container.style, {
                position: onBody ? 'fixed' : 'absolute',
                top: '50%',
                left: '0',
                right: '0',
                transform: 'translateY(-50%)',
                zIndex: '10000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
            });
            mountRoot.appendChild(container);
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

    window.showToast = function (message, type = 'info', duration = DEFAULT_DURATION, mountRoot) {
        const root = getToastMountRoot(mountRoot);
        const container = getOrCreateToastContainer(root);
        const state = getContainerState(container);

        // 同一挂载根内：新的一条顶掉上一条
        if (state.timer) {
            clearTimeout(state.timer);
            state.timer = null;
        }
        if (state.toast && state.toast.parentNode) {
            state.toast.parentNode.removeChild(state.toast);
        }

        const toast = createToastElement(message, type);
        container.appendChild(toast);
        state.toast = toast;

        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);

        // 自动隐藏
        state.timer = setTimeout(() => {
            hideToast(toast, container);
        }, duration);

        // 点击手动关闭
        toast.addEventListener('click', () => {
            if (state.timer) {
                clearTimeout(state.timer);
                state.timer = null;
            }
            hideToast(toast, container);
        });

        return toast;
    };

    function hideToast(toast, container) {
        if (!toast || !toast.parentNode) return;

        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            const state = containerState.get(container);
            if (state && toast === state.toast) {
                state.toast = null;
            }
        }, 300);
    }

    // 兼容性别名
    window.showTip = window.showToast;

})(typeof window !== 'undefined' ? window : this);

