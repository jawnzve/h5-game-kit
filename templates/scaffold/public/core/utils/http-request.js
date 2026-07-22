/**
 * HTTP请求工具类
 * 基于参考项目game-web-ai-template-main的http.js重构
 * 提供统一的API请求接口，包含Token管理、签名、错误处理等功能
 */
(function () {
	var httpRequest = {
		data: {
			headers: {
				'app-version': '',
				'cli-os': 'web',
				'authorize-token': '',
			},
		},

		/**
		 * 获取Token
		 * @param {function} callback 回调函数
		 */
		getToken: function (callback) {
			// 仅在App环境运行，始终通过hybirdapp获取token
			try {
				window.hybirdapp
					.getToken()
					.then(function (response) {
						try {
							console.log('Token 获取成功: ' + response.data.token);
							httpRequest.data.headers['authorize-token'] = response.data.token;
							httpRequest.data.headers['app-version'] = httpRequest.getVersionNumber();
							callback && callback();
						} catch (thenError) {
							console.error('❌ Token 处理失败:', thenError);
							console.error('响应数据:', response);
							// 即使处理失败也执行回调，避免卡住
							callback && callback();
						}
					})
					.catch(function (error) {
						try {
							console.error('❌ Token 获取失败:', error.error || error);
						} catch (catchError) {
							console.error('❌ Token 错误处理失败:', catchError);
						}
					});
			} catch (error) {
				console.error('❌ getToken 调用失败:', error);
				// 即使失败也执行回调，避免卡住
				callback && callback();
			}
		},

		/**
		 * 通用请求方法（参考game-web-ai-template-main）
		 * @param {string} method 请求方法类型 ('get', 'post', 'put', 'delete' 等)
		 * @param {string} url 请求地址,如果url包含http，则不拼接apiBase
		 * @param {object} params 请求参数
		 * @param {function} successCallback 成功回调函数
		 * @param {function} errorCallback 失败回调函数，参数：xhr, textStatus
		 * @param {object} options 可选配置项 (timeout, headers等)
		 */
		request: function (method, url, params, successCallback, errorCallback, options) {
			if (!httpRequest.data.headers['authorize-token']) {
				httpRequest.getToken(function () {
					httpRequest._request(method, url, params, successCallback, errorCallback, options);
				});
			} else {
				httpRequest._request(method, url, params, successCallback, errorCallback, options);
			}
		},

		/**
		 * 内部请求方法（参考game-web-ai-template-main）
		 */
		_request: function (method, url, params, successCallback, errorCallback, options) {
			// 检查环境配置是否已设置
			if (!window.httpConfig || !window.httpConfig.currentEnv) {
				console.error('❌ HTTP环境配置未设置，请确保 http-config.js 已正确加载');
				if (errorCallback) {
					errorCallback(null, '环境配置未设置');
				}
				return;
			}

			// 设置默认配置
			var config = {
				timeout: 8000,
				headers: httpRequest.data.headers,
				dataType: 'json',
			};

			// 合并用户自定义配置
			if (options) {
				for (var key in options) {
					config[key] = options[key];
				}
			}

			var _url = window.httpConfig.currentEnv.apiBase + url;
			if (url.indexOf('http') > -1) {
				_url = url;
			}

			console.log('📤 ' + method.toUpperCase() + ' 请求:', _url);
			console.log('📤 请求参数:', params);

			var xhr = $.ajax({
				type: method.toLowerCase(),
				timeout: config.timeout,
				headers: config.headers,
				url: _url,
				data: httpRequest.formatData(params),
				dataType: config.dataType,
				success: function (data) {
					console.log('✅ ' + method.toUpperCase() + ' 响应:', data);
					
					// 使用base64.js对API响应进行UTF8解码处理
					var decodedData = data;
					if (window.base64 && window.base64.decodeObjectStrings) {
						try {
							decodedData = window.base64.decodeObjectStrings(data);
						} catch (error) {
							console.warn('⚠️ API响应解码失败，使用原始数据:', error);
							decodedData = data;
						}
					}
					
					successCallback && successCallback(decodedData);
				},
				error: function (xhr, textStatus) {
					console.error('❌ ' + method.toUpperCase() + ' 请求失败:', url, '状态:', textStatus, '状态码:', xhr.status);
					errorCallback && errorCallback(xhr, textStatus);
				}
			});

			// 返回xhr对象，以便可以取消请求
			return xhr;
		},

		/**
		 * 格式化数据并添加签名（参考game-web-ai-template-main）
		 * @param {object} data 请求参数
		 * @returns {object} 格式化后的参数（包含签名和时间戳）
		 */
		formatData: function (data) {
			var time = Math.floor(Date.now() / 1000);
			var params = {};
			var sign = [];
			var signStr = '';
			
			if (data) {
				for (var k in data) {
					sign.push(k + '=' + data[k]);
					params[k] = data[k];
				}
				sign.sort(); // 排序
				signStr = sign.join('&') + '|' + time + '|' + window.httpConfig.currentEnv.signKey;
				params['_sign'] = md5(signStr);
			}
			params['_time'] = time;
			return params;
		},

		/**
		 * 获取版本号（参考game-web-ai-template-main）
		 * @param {string} type 应用类型，默认'loong'
		 * @returns {string} 版本号
		 */
		getVersionNumber: function (type) {
			type = type || 'loong';
			var _str = navigator.userAgent.toLowerCase();
			var arrType = _str.split(type + '/')[1];
			if (arrType) {
				var _versionNumber = arrType.split('(web')[0];
				return _versionNumber.trim();
			}
			return '1.0.0';
		},

		// 便捷方法
		get: function (url, params, successCallback, errorCallback, options) {
			return httpRequest.request('get', url, params, successCallback, errorCallback, options);
		},

		post: function (url, params, successCallback, errorCallback, options) {
			return httpRequest.request('post', url, params, successCallback, errorCallback, options);
		},

		put: function (url, params, successCallback, errorCallback, options) {
			return httpRequest.request('put', url, params, successCallback, errorCallback, options);
		},

		delete: function (url, params, successCallback, errorCallback, options) {
			return httpRequest.request('delete', url, params, successCallback, errorCallback, options);
		},

		/**
		 * 统一的API响应错误处理
		 * @param {Object} response API响应对象
		 * @param {Object} options 选项
		 * @param {boolean} options.showError 是否显示错误提示（默认true）
		 * @param {Function} options.onError 自定义错误处理回调
		 * @returns {boolean} 是否成功（true表示成功，false表示失败）
		 */
	handleApiResponse: function(response, options) {
		options = options || {};
		// 修复：只有当 showError 明确为 true 时才显示错误，undefined/null 时默认为 true，但 false 时必须为 false
		var showError = (options.showError === undefined || options.showError === null) ? true : options.showError;
		var onError = options.onError;
		
		// 兼容字符串和数字类型的errno
		if (response.errno == 0 || response.errno === '0') {
			return true; // 成功
		}
		
		// 失败处理：只有当 showError 明确为 true 时才显示错误吐司
		if (showError === true && response.error) {
			if (typeof showToast === 'function') {
				showToast(response.error, 'error');
			}
		}
			
			// 自定义错误处理
			if (onError && typeof onError === 'function') {
				onError(response);
			}
			
			return false; // 失败
		},
		
		/**
		 * 统一的网络错误处理
		 * @param {string} apiName API名称（用于日志）
		 * @param {string} status 错误状态
		 * @param {Object} options 选项
		 * @param {boolean} options.showError 是否显示错误提示（默认true）
		 * @returns {Error} 错误对象
		 */
		handleNetworkError: function(apiName, status, options) {
			options = options || {};
			var showError = options.showError !== false; // 默认true
			
			console.error('❌ ' + (apiName || 'API') + '请求失败:', status);
			
			if (showError) {
				if (typeof showToast === 'function') {
					showToast('网络错误，请稍后重试', 'error');
				}
			}
			
			return new Error('API请求失败: ' + status);
		},
		
		/**
		 * 统一的API调用封装（Promise版本）
		 * @param {string} method 请求方法 ('get', 'post', 'put', 'delete')
		 * @param {string} url 请求地址
		 * @param {Object} params 请求参数
		 * @param {Object} options 选项
		 * @param {string} options.apiName API名称（用于日志和错误提示）
		 * @param {boolean} options.showError 是否显示错误提示（默认true）
		 * @param {Function} options.onSuccess 成功回调，参数为response
		 * @param {Function} options.onError 自定义错误处理回调
		 * @param {Function} options.onNetworkError 自定义网络错误处理回调
		 * @param {Object|Function} options.loading Loading状态管理
		 *   - 如果传入对象：{ start: Function, end: Function }，会在请求开始和结束时调用
		 *   - 如果传入函数：function(isLoading) {}，isLoading为true表示开始，false表示结束
		 * @returns {Promise} Promise对象
		 */
		callApi: function(method, url, params, options) {
			options = options || {};
			var apiName = options.apiName || 'API';
			var showError = options.showError !== false; // 默认true
			var onSuccess = options.onSuccess;
			var onError = options.onError;
			var onNetworkError = options.onNetworkError;
			var loading = options.loading;
			
			// 处理loading开始
			var handleLoadingStart = function() {
				if (loading) {
					if (typeof loading === 'function') {
						// 函数形式：loading(true)
						loading(true);
					} else if (loading && typeof loading.start === 'function') {
						// 对象形式：loading.start()
						loading.start();
					}
				}
			};
			
			// 处理loading结束
			var handleLoadingEnd = function() {
				if (loading) {
					if (typeof loading === 'function') {
						// 函数形式：loading(false)
						loading(false);
					} else if (loading && typeof loading.end === 'function') {
						// 对象形式：loading.end()
						loading.end();
					}
				}
			};
			
			return new Promise(function(resolve, reject) {
				if (!window.httpRequest) {
					reject(new Error('httpRequest 模块未加载'));
					return;
				}
				
				// 开始loading
				handleLoadingStart();
				
				// 确保在请求完成（成功或失败）后结束loading
				var resolveWrapper = function(response) {
					handleLoadingEnd();
					resolve(response);
				};
				
				var rejectWrapper = function(error) {
					handleLoadingEnd();
					reject(error);
				};
				
				httpRequest[method](
					url,
					params,
					function(response) {
						// 使用统一的错误处理
						if (httpRequest.handleApiResponse(response, { showError: showError, onError: onError })) {
							// API响应格式兼容处理
							// 统一处理两种格式：
							// 1. ito格式：response.data 直接包含游戏数据
							// 2. witchs-poison格式：response.data.content 包含游戏数据
							if (response.data) {
								// 如果存在 response.data.content，说明是 witchs-poison 格式
								// 将 content 的内容合并到 data 中，并添加 gameData 字段指向实际游戏数据
								if (response.data.content && typeof response.data.content === 'object') {
									// witchs-poison格式：游戏数据在 response.data.content 中
									response.gameData = response.data.content;
									// 同时保留原始结构，以便兼容旧代码
								} else {
									// ito格式：游戏数据直接在 response.data 中
									response.gameData = response.data;
								}
							}
							
							// 成功处理
							if (onSuccess && typeof onSuccess === 'function') {
								onSuccess(response);
							}
							resolveWrapper(response);
						} else {
							// 失败处理
							rejectWrapper(response);
						}
					},
					function(xhr, status) {
						// 检查响应体中是否有业务错误信息（errno和error字段）
						// 如果有，当作业务错误处理，而不是网络错误
						var responseData = null;
						if (xhr.responseText) {
							try {
								responseData = JSON.parse(xhr.responseText);
							} catch (e) {
								// 如果响应不是JSON格式，忽略
							}
						} else if (xhr.responseJSON) {
							responseData = xhr.responseJSON;
						}
						
						// 如果响应体中有errno字段，检查是否为业务错误
						// errno == 0 或 errno === '0' 表示成功，非0表示业务错误
						if (responseData && typeof responseData.errno !== 'undefined') {
							// 检查errno是否为0（成功）
							if (responseData.errno == 0 || responseData.errno === '0') {
								// API响应格式兼容处理（与success回调中的处理一致）
								if (responseData.data) {
									if (responseData.data.content && typeof responseData.data.content === 'object') {
										// witchs-poison格式
										responseData.gameData = responseData.data.content;
									} else {
										// ito格式
										responseData.gameData = responseData.data;
									}
								}
								
								// errno为0，虽然是HTTP错误但业务逻辑成功，当作成功处理
								if (onSuccess && typeof onSuccess === 'function') {
									onSuccess(responseData);
								}
								resolveWrapper(responseData);
							} else {
								// errno非0，业务错误，使用统一的错误处理
								if (httpRequest.handleApiResponse(responseData, { showError: showError, onError: onError })) {
									// 不应该成功，但为了兼容性
									resolveWrapper(responseData);
								} else {
									// 失败处理
									rejectWrapper(responseData);
								}
							}
						} else {
							// 真正的网络错误
							var error = onNetworkError 
								? onNetworkError(xhr, status)
								: httpRequest.handleNetworkError(apiName, status, { showError: showError });
							rejectWrapper(error);
						}
					}
				);
			});
		}
	};

	window.httpRequest = httpRequest;
})();