/**
 * Web Alert组件 - 通用模态对话框组件
 * 样式：白底黑字
 * 功能：模态对话框，支持自定义标题、消息、按钮和回调
 */

(function (window) {
    'use strict';

    const ALERT_CONTAINER_ID = 'web-alert-container';

    function getOrCreateAlertContainer() {
        let container = document.getElementById(ALERT_CONTAINER_ID);
        if (!container) {
            container = document.createElement('div');
            container.id = ALERT_CONTAINER_ID;
            Object.assign(container.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.7)',
                zIndex: '10001',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: '0',
                transition: 'opacity 0.2s ease-in-out'
            });
            document.body.appendChild(container);
        }
        return container;
    }

    function createAlertDialog(title, message, buttons) {
        const dialog = document.createElement('div');
        dialog.className = 'web-alert-dialog';
        
        Object.assign(dialog.style, {
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            maxWidth: '320px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'hidden',
            transform: 'scale(0.8)',
            transition: 'transform 0.2s ease-in-out'
        });

        // 标题
        if (title) {
            const titleEl = document.createElement('div');
            titleEl.textContent = title;
            Object.assign(titleEl.style, {
                padding: '20px 16px 8px 16px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#333',
                textAlign: 'center',
            });
            dialog.appendChild(titleEl);
        }

        // 消息内容
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        Object.assign(messageEl.style, {
            padding: '8px 16px 20px 16px',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#666',
            textAlign: 'center',
            wordWrap: 'break-word'
        });
        dialog.appendChild(messageEl);

        // 按钮区域
        const buttonArea = document.createElement('div');
        Object.assign(buttonArea.style, {
            display: 'flex',
            borderTop: '1px solid #eee'
        });

        buttons.forEach((buttonText, index) => {
            const button = document.createElement('button');
            button.textContent = buttonText;
            
            Object.assign(button.style, {
                flex: '1',
                padding: '14px',
                border: 'none',
                background: 'white',
                color: '#007AFF',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease-in-out'
            });

            // 分割线
            if (index > 0) {
                button.style.borderLeft = '1px solid #eee';
            }

            // 主按钮加粗
            if (index === buttons.length - 1) {
                button.style.fontWeight = 'bold';
            }

            // 悬停效果
            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = '#f0f0f0';
            });
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = 'white';
            });

            buttonArea.appendChild(button);
        });

        dialog.appendChild(buttonArea);
        return { dialog, buttons: buttonArea.children };
    }

    window.showAlert = function (title, message, buttons = ['确定'], callback = null) {
        // 支持对象参数
        if (typeof title === 'object') {
            const options = title;
            title = options.title || '提示';
            message = options.message || '';
            buttons = options.buttons || ['确定'];
            callback = options.callback || options.onConfirm || null;
        }

        const container = getOrCreateAlertContainer();
        container.innerHTML = ''; // 清除之前的对话框

        const { dialog, buttons: buttonElements } = createAlertDialog(title, message, buttons);
        container.appendChild(dialog);

        // 绑定按钮事件
        Array.from(buttonElements).forEach((buttonEl, index) => {
            buttonEl.addEventListener('click', () => {
                hideAlert(container, () => {
                    if (callback) {
                        callback(buttons[index], index);
                    }
                });
            });
        });

        // 显示动画
        setTimeout(() => {
            container.style.opacity = '1';
            dialog.style.transform = 'scale(1)';
        }, 10);

        // 点击遮罩关闭
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                hideAlert(container, callback);
            }
        });

        return container;
    };

    function hideAlert(container, callback) {
        if (!container || !container.parentNode) return;

        const dialog = container.querySelector('.web-alert-dialog');
        container.style.opacity = '0';
        if (dialog) {
            dialog.style.transform = 'scale(0.8)';
        }

        setTimeout(() => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
            if (callback) callback();
        }, 300);
    }

})(typeof window !== 'undefined' ? window : this);

