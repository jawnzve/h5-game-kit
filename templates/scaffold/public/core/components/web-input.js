/**
 * Web Input组件 - 通用输入框组件
 * 功能：创建带字符计数、侧边按钮的输入框组件
 * 支持：字符上限验证、超出提示、侧边按钮点击回调
 * 样式：内联样式，无需外部CSS文件
 */

(function (window) {
    'use strict';

    // 确保样式只注入一次
    let stylesInjected = false;

    function injectStyles() {
        if (stylesInjected) return;

        const style = document.createElement('style');
        style.id = 'web-input-styles';
        style.textContent = `
            /* ===== 输入框组件样式 ===== */
            .input-field {
                flex: 1;
                width: 100%;
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: #ffffff;
                padding: 14px 16px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: normal;
                box-sizing: border-box;
                transition: all 0.15s ease;
                -webkit-appearance: none;
                appearance: none;
            }

            .input-field::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }

            .input-field:focus {
                outline: none;
                border-color: #FFC107;
                box-shadow: none;
            }

            .input-container {
                position: relative;
                display: flex;
                align-items: flex-start;
            }

            .input-container > *:not(:last-child) {
                margin-right: 12px;
            }

            .input-inner {
                position: relative;
                width: 100%;
                flex: 1;
            }

            .input-inner .input-field {
                padding-right: 48px;
            }

            .input-counter {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                z-index: 2;
                color: rgba(255, 255, 255, 0.55);
                font-size: 12px;
                pointer-events: none;
                user-select: none;
            }

            .input-counter.error {
                color: #FF3B30;
            }

            .input-container.with-button {
                display: flex;
                align-items: flex-start;
                /* 使用 margin 定义间距（兼容 iOS 低版本），间距由 .input-container > *:not(:last-child) 控制 */
            }

            .input-ai-btn {
                width: 48px;
                height: 48px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                background: rgba(0, 0, 0, 0.9);
                color: #ffffff;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                transition: var(--btn-press-transition, transform 0.12s ease);
                transform-origin: center;
                user-select: none;
                min-width: 48px;
                flex-shrink: 0;
                -webkit-tap-highlight-color: transparent;
            }

            .input-ai-btn:active:not(:disabled) {
                transform: scale(var(--btn-press-scale, 0.95));
            }

            .input-ai-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }

            /* btn_random.png 原图 160×170：固定宽 28px，高按比例（与返回按钮写法一致） */
            .input-ai-btn-icon {
                width: 28px;
                height: calc(28px * 170 / 160);
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                display: block;
                flex-shrink: 0;
                pointer-events: none;
                -webkit-user-drag: none;
                user-select: none;
            }
        `;
        document.head.appendChild(style);
        stylesInjected = true;
    }

    /**
     * 创建输入框组件
     * @param {Object} options 配置选项
     * @param {string} options.placeholder - 输入框占位符
     * @param {number} options.maxLength - 字符上限（默认15）
     * @param {string} options.value - 初始值
     * @param {boolean} options.showCounter - 是否显示字符计数（默认true）
     * @param {boolean} options.showSideButton - 是否显示侧边按钮（默认false）
     * @param {string} options.sideButtonText - 侧边按钮文本（默认'🎲'）；若提供 sideButtonImageSrc 则作无障碍说明与 alt
     * @param {string} [options.sideButtonImageSrc] - 若设置则在侧键内显示该图片，替代 sideButton 纯文本
     * @param {Function} options.onInput - 输入变化回调函数
     * @param {Function} options.onSideButtonClick - 侧边按钮点击回调函数
     * @param {Function} options.onExceed - 超出字符上限回调函数
     * @returns {Object} 返回包含container、input、counter、sideButton的对象
     */
    window.createInputField = function (options = {}) {
        // 注入样式
        injectStyles();

        const {
            placeholder = '',
            maxLength = 15,
            value = '',
            showCounter = true,
            showSideButton = false,
            sideButtonImageSrc = '',
            onInput = null,
            onSideButtonClick = null,
            onExceed = null
        } = options;

        let sideButtonText =
            options.sideButtonText !== undefined && options.sideButtonText !== null
                ? String(options.sideButtonText)
                : '🎲';

        // 创建容器
        const container = document.createElement('div');
        container.className = 'input-container';
        if (showSideButton) {
            container.classList.add('with-button');
        }

        // 创建内层容器（用于字符计数定位）
        const inner = document.createElement('div');
        inner.className = 'input-inner';

        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-field';
        input.placeholder = placeholder;
        input.value = value;
        // 不设置 maxLength，允许超出输入，只通过字符计数提示

        // 如果有字符计数，需要右侧padding
        if (showCounter) {
            input.style.paddingRight = '48px';
        }

        // 创建字符计数
        let counter = null;
        if (showCounter) {
            counter = document.createElement('span');
            counter.className = 'input-counter';
            updateCounter(counter, value.length, maxLength);
            inner.appendChild(counter);
        }

        // 输入事件处理
        input.addEventListener('input', function (e) {
            const currentLength = e.target.value.length;

            // 更新字符计数
            if (counter) {
                updateCounter(counter, currentLength, maxLength);
            }

            // 检查是否超出上限
            if (currentLength > maxLength) {
                if (onExceed) {
                    onExceed(currentLength, maxLength);
                }
            }

            // 调用输入回调
            if (onInput) {
                onInput(e.target.value, currentLength);
            }
        });

        inner.appendChild(input);
        container.appendChild(inner);

        // 创建侧边按钮
        let sideButton = null;
        let sideButtonImg = null;
        if (showSideButton) {
            sideButton = document.createElement('button');
            sideButton.type = 'button';
            sideButton.className = 'input-ai-btn';
            if (sideButtonImageSrc) {
                sideButtonImg = document.createElement('img');
                sideButtonImg.src = sideButtonImageSrc;
                sideButtonImg.className = 'input-ai-btn-icon';
                sideButtonImg.alt = sideButtonText || '随机';
                sideButtonImg.draggable = false;
                sideButton.appendChild(sideButtonImg);
            } else {
                sideButton.textContent = sideButtonText;
            }
            sideButton.setAttribute('aria-label', sideButtonText || '侧边按钮');

            sideButton.addEventListener('click', function () {
                if (onSideButtonClick) {
                    onSideButtonClick();
                }
            });

            container.appendChild(sideButton);
        }

        // 添加全局点击监听，点击外部关闭键盘（失焦）
        // iOS低版本兼容性处理：确保键盘能够正确收起
        let outsideClickHandler = null;
        let isInputFocused = false;
        let blurTimeout = null; // 防抖：避免重复触发失焦
        
        // 监听输入框焦点状态
        input.addEventListener('focus', () => {
            isInputFocused = true;
        });
        
        input.addEventListener('blur', () => {
            isInputFocused = false;
            // 清除防抖定时器
            if (blurTimeout) {
                clearTimeout(blurTimeout);
                blurTimeout = null;
            }
        });
        
        // 失焦处理函数（统一处理iOS兼容性）
        const handleBlur = () => {
            // 如果已经在处理失焦，跳过
            if (blurTimeout) {
                return;
            }
            
            // 检查当前焦点是否在输入框上
            const activeElement = document.activeElement;
            if (activeElement !== input && !isInputFocused) {
                return;
            }
            
            // 执行失焦
            if (input && (activeElement === input || isInputFocused)) {
                input.blur();
                
                // iOS低版本特殊处理：某些iOS版本需要额外的操作才能确保键盘完全收起
                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                if (isIOS) {
                    // 方法1：创建一个临时的不可见输入框来"吸收"焦点
                    // 这可以强制iOS收起键盘
                    const tempInput = document.createElement('input');
                    tempInput.style.position = 'absolute';
                    tempInput.style.left = '-9999px';
                    tempInput.style.top = '-9999px';
                    tempInput.style.opacity = '0';
                    tempInput.style.pointerEvents = 'none';
                    tempInput.style.width = '1px';
                    tempInput.style.height = '1px';
                    document.body.appendChild(tempInput);
                    
                    // 延迟聚焦临时输入框，确保原输入框已失焦
                    setTimeout(() => {
                        try {
                            tempInput.focus();
                        } catch (e) {
                            // 忽略焦点错误
                        }
                        
                        // 延迟移除临时输入框
                        setTimeout(() => {
                            if (tempInput.parentNode) {
                                tempInput.parentNode.removeChild(tempInput);
                            }
                        }, 50);
                    }, 10);
                }
                
                // 设置防抖：200ms内不重复触发
                blurTimeout = setTimeout(() => {
                    blurTimeout = null;
                }, 200);
            }
        };
        
        // 使用 setTimeout 避免当前点击事件立即触发失焦
        setTimeout(() => {
            outsideClickHandler = (e) => {
                // 如果点击的是容器内部，忽略
                if (container.contains(e.target)) {
                    return;
                }
                
                // 执行失焦处理
                handleBlur();
            };
            
            // 使用click事件（主要事件，兼容桌面端和移动端）
            document.addEventListener('click', outsideClickHandler);
            
            // iOS低版本兼容：同时监听touchstart
            // touchstart在iOS上更可靠，会在click之前触发
            // 使用passive: true提高性能
            const touchHandler = (e) => {
                // 如果点击的是容器内部，忽略
                if (container.contains(e.target)) {
                    return;
                }
                
                // 执行失焦处理
                handleBlur();
            };
            
            document.addEventListener('touchstart', touchHandler, { passive: true });
            
            // 保存touchHandler引用以便销毁时移除
            outsideClickHandler._touchHandler = touchHandler;
        }, 100);

        return {
            container: container,
            input: input,
            counter: counter,
            sideButton: sideButton,
            // 获取当前值
            getValue: function () {
                return input.value;
            },
            // 设置值
            setValue: function (val) {
                input.value = val;
                if (counter) {
                    updateCounter(counter, val.length, maxLength);
                }
                // 触发input事件
                input.dispatchEvent(new Event('input', { bubbles: true }));
            },
            // 设置侧边按钮loading状态
            setSideButtonLoading: function (loading) {
                if (sideButton) {
                    sideButton.disabled = loading;
                    if (sideButtonImg) {
                        if (loading) {
                            sideButton.textContent = '...';
                        } else {
                            sideButton.textContent = '';
                            sideButton.appendChild(sideButtonImg);
                        }
                    } else {
                        sideButton.textContent = loading ? '...' : sideButtonText;
                    }
                }
            },
            // 设置侧边按钮文本
            setSideButtonText: function (text) {
                sideButtonText = text != null ? String(text) : '';
                if (sideButton) {
                    if (sideButtonImg) {
                        sideButtonImg.alt = sideButtonText;
                        sideButton.setAttribute('aria-label', sideButtonText || '侧边按钮');
                    } else {
                        sideButton.textContent = sideButtonText;
                    }
                }
            },
            // 设置禁用状态
            setDisabled: function (disabled) {
                input.disabled = disabled;
                if (sideButton) {
                    sideButton.disabled = disabled;
                }
            },
            // 聚焦
            focus: function () {
                input.focus();
            },
            // 失焦
            blur: function () {
                input.blur();
            },
            /**
             * 判断组件是否当前挂载在 DOM 中
             * @returns {boolean}
             */
            isMounted: function () {
                return container.isConnected;
            },
            /**
             * 将组件挂载（或重新挂载）到指定父元素
             * 若已在该父元素中则跳过，若已在其他父元素中则移动过来
             * @param {HTMLElement} parentEl - 目标父元素
             */
            mountTo: function (parentEl) {
                if (!parentEl) return;
                if (container.parentNode === parentEl) return;
                parentEl.appendChild(container);
            },
            // 销毁
            destroy: function () {
                if (outsideClickHandler) {
                    document.removeEventListener('click', outsideClickHandler);
                    // 移除touchstart监听（如果存在）
                    if (outsideClickHandler._touchHandler) {
                        document.removeEventListener('touchstart', outsideClickHandler._touchHandler);
                    }
                }
                // 确保输入框失焦
                if (input && document.activeElement === input) {
                    input.blur();
                }
                // 清除防抖定时器
                if (blurTimeout) {
                    clearTimeout(blurTimeout);
                    blurTimeout = null;
                }
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            }
        };
    };

    /**
     * 更新字符计数显示
     * @param {HTMLElement} counter - 计数元素
     * @param {number} currentLength - 当前字符数
     * @param {number} maxLength - 最大字符数
     */
    function updateCounter(counter, currentLength, maxLength) {
        counter.textContent = `${currentLength}/${maxLength}`;

        // 超出上限时显示错误色
        if (currentLength > maxLength) {
            counter.classList.add('error');
        } else {
            counter.classList.remove('error');
        }
    }

    /**
     * 验证输入框字符数是否超出上限
     * @param {HTMLElement|Object} inputOrField - 输入框元素或createInputField返回的对象
     * @param {number} maxLength - 最大字符数
     * @returns {Object} 返回 { valid: boolean, length: number, maxLength: number }
     */
    window.validateInputLength = function (inputOrField, maxLength = 15) {
        let value = '';
        if (inputOrField && typeof inputOrField.getValue === 'function') {
            // 是createInputField返回的对象
            value = inputOrField.getValue();
        } else if (inputOrField && inputOrField.value !== undefined) {
            // 是input元素
            value = inputOrField.value;
        } else {
            return { valid: false, length: 0, maxLength: maxLength };
        }

        const length = value.length;
        return {
            valid: length <= maxLength,
            length: length,
            maxLength: maxLength
        };
    };

})(typeof window !== 'undefined' ? window : this);

