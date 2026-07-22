/**
 * Web Loading组件 - 通用加载动画组件
 * 功能：显示/隐藏全屏加载动画（转圈动画）
 */

(function (window) {
    'use strict';

    const LOADING_CONTAINER_ID = 'web-loading-container';
    let LOADING_INSTANCE = null;

    function getOrCreateLoadingContainer() {
        let container = document.getElementById(LOADING_CONTAINER_ID);
        if (!container) {
            container = document.createElement('div');
            container.id = LOADING_CONTAINER_ID;
            container.className = 'loading-overlay';
            Object.assign(container.style, {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: '9999',
                opacity: '0',
                visibility: 'hidden'
            });
            document.body.appendChild(container);
        }
        return container;
    }

    function createLoadingContent() {
        const content = document.createElement('div');
        content.className = 'loading-content';
        // 设置 loading-content 样式（对应原来的 CSS 变量值）
        Object.assign(content.style, {
            background: 'rgba(0, 0, 0, 1)',
            borderRadius: '16px', // var(--border-radius-large)
            padding: '32px', // var(--spacing-3xl)
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'none',
            border: '1px solid rgba(255, 255, 255, 0.2)' // var(--border-lighter)
        });
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        // 设置 loading-spinner 样式（对应原来的 CSS 变量值）
        Object.assign(spinner.style, {
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 255, 255, 0.2)', // var(--border-lighter)
            borderTop: '3px solid #ffffff', // var(--text-primary)
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
            display: 'block'
        });
        
        // 添加 spin 动画 keyframes（如果不存在）
        if (!document.getElementById('loading-spin-keyframes')) {
            const style = document.createElement('style');
            style.id = 'loading-spin-keyframes';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        content.appendChild(spinner);
        return content;
    }

    window.showLoading = function () {
        const container = getOrCreateLoadingContainer();
        
        // 如果已经显示，直接返回
        if (LOADING_INSTANCE && container.querySelector('.loading-content')) {
            return;
        }

        // 清除之前的内容
        container.innerHTML = '';
        
        // 创建加载内容
        const content = createLoadingContent();
        container.appendChild(content);
        LOADING_INSTANCE = container;

        // 立即显示
        container.style.opacity = '1';
        container.style.visibility = 'visible';

        return container;
    };

    window.hideLoading = function () {
        const container = getOrCreateLoadingContainer();
        
        if (!container || !LOADING_INSTANCE) {
            return;
        }

        // 立即隐藏并移除内容
        container.style.opacity = '0';
        container.style.visibility = 'hidden';
        if (container.parentNode) {
            container.innerHTML = '';
        }
        LOADING_INSTANCE = null;
    };

})(typeof window !== 'undefined' ? window : this);

