/**
 * HybirdApp JavaScript 插件
 * 将AppBridgeService的所有方法注入到window.hybirdapp中
 * 支持通过window.hybirdapp.方法名调用
 */

(function (window) {
	'use strict';

	// 超时错误信息
	var timeoutErrorMessage = {
		errno: 1,
		error: 'AppBridge timeout message',
		api: '',
	};

	/**
	 * AppBridge 单次task
	 */
	function AppBridgeTask(data, taskId, callBack, retry, hold) {
		retry = retry || -1;
		hold = hold || false;
		this.taskId = 1;
		this.callBack = undefined;
		this.callBackName = '';
		this.param = { api: '' };
		this.retry = -1;
		this.retryInterval = 0;
		this.timer = null;
		this.timeOut = 3000;
		this.isTimeOut = false;
		this.hold = false;

		this.createBridge(data, taskId, callBack, retry, hold);
	}

	AppBridgeTask.prototype.createBridge = function (req, taskId, callBack, retry, hold) {
		retry = retry || -1;
		hold = hold || false;
		this.taskId = taskId;
		this.callBack = callBack;
		this.retry = retry;
		this.hold = hold;

		var api = req.api.toString();
		var namePrefix = 'cb_' + api.split('.').pop() + '_';
		this.callBackName = namePrefix + this.taskId;

		this.deleteCallBack();

		req.callback = this.callBackName;
		window[this.callBackName] = this.implementCallBack.bind(this);

		this.retryInterval = 0;
		this.isTimeOut = false;
		this.param = {};
		for (var key in this.param) {
			if (this.param.hasOwnProperty(key)) {
				this.param[key] = this.param[key];
			}
		}
		for (var reqKey in req) {
			if (req.hasOwnProperty(reqKey)) {
				this.param[reqKey] = req[reqKey];
			}
		}
		this.interactive(this.param);
	};

	AppBridgeTask.prototype.interactive = function (req) {
		if (window.hasOwnProperty('hg')) {
			window.hg.call(JSON.stringify(req));
		} else if (window.hasOwnProperty('webkit')) {
			window.webkit.messageHandlers.call.postMessage(JSON.stringify(req));
		} else {
			this.clearTimer();
			return;
		}
	};

	AppBridgeTask.prototype.implementCallBack = function (jsonStr) {
		if (this.callBack) {
			var appData = JSON.parse(jsonStr);
			this.callBack(appData);
			if (!this.param.clickCallback && !this.hold) {
				this.callBack = undefined;
			}
		}
		this.deleteCallBack();
	};

	AppBridgeTask.prototype.deleteCallBack = function () {
		if (window.hasOwnProperty(this.callBackName) && !this.hold) {
			delete window[this.callBackName];
		}
	};

	AppBridgeTask.prototype.createTimer = function () {
		var self = this;
		this.clearTimer();
		this.timer = window.setTimeout(function () {
			self.retryInterval++;
			self.resend();
			self.overtime();
			if (!self.isTimeOut) {
				self.createTimer();
			} else {
				self.clearTimer();
			}
		}, 1000);
	};

	AppBridgeTask.prototype.resend = function () {
		if (this.retry < 0 || this.retryInterval !== 2) {
			return;
		}
		this.retryInterval = 0;
		this.retry--;
		if (this.retryInterval <= this.retry) {
			this.interactive(this.param);
		}
	};

	AppBridgeTask.prototype.overtime = function () {
		if (this.retry >= 0 || this.param.clickCallback) {
			return;
		}
		if (this.retryInterval >= this.timeOut / 1000 && window[this.callBackName]) {
			this.isTimeOut = true;
			this.retryInterval = 0;
			var error = {};
			for (var key in timeoutErrorMessage) {
				if (timeoutErrorMessage.hasOwnProperty(key)) {
					error[key] = timeoutErrorMessage[key];
				}
			}
			error.api = this.param.api;
			this.implementCallBack(JSON.stringify(error));
		}
	};

	AppBridgeTask.prototype.clearTimer = function () {
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = null;
	};

	AppBridgeTask.prototype.remove = function () {
		this.clearTimer();
		this.callBack = undefined;
		if (window.hasOwnProperty(this.callBackName)) {
			delete window[this.callBackName];
		}
	};

	/**
	 * app桥交互服务
	 */
	function AppBridge() {
		this.retryDefault = -1;
		this.taskId = 1;
		this.archvieTaskMap = {};
	}

	AppBridge.prototype.run = function (req, retry, isCallback) {
		retry = retry || this.retryDefault;
		isCallback = isCallback !== undefined ? isCallback : true;
		this.taskId++;
		var self = this;
		return new Promise(function (resolve, reject) {
			var callback;
			if (isCallback) {
				callback = function (res) {
					if (res && (res.errno === 0 || res.errno === 200)) {
						if (req.clickCallback) {
							req.clickCallback(res);
						}
						resolve(res);
					}
					reject(res);
				};
			}
			new AppBridgeTask(req, self.taskId, callback, retry);
		});
	};

	AppBridge.prototype.archiveRun = function (req, callback) {
		this.taskId++;
		var task = new AppBridgeTask(req, this.taskId, callback, -1, true);
		this.archvieTaskMap[req.api] = task;
	};

	AppBridge.prototype.archiveTaskRemove = function (req) {
		var task = this.archvieTaskMap[req.api];
		if (task && task.interactive) {
			task.interactive(req);
		}
		if (task) {
			task.remove();
			delete this.archvieTaskMap[req.api];
		}
	};

	/**
	 * 主服务类
	 */
	function HybirdAppService() {
		this.bridge = new AppBridge();
		this.appGoBackSucceed = null;
		this.appGoBackFail = null;
		this._interceptBackCustom = null;
		this._interceptBackCustomClear = true;
	}

	HybirdAppService.prototype.inApp = function (tag) {
		tag = tag || 'loong';
		return navigator.userAgent.toLowerCase().indexOf(tag) > -1;
	};

	/**
	 * 获取token
	 * @public
	 * @method  getToken
	 * @returns {Promise<AppResponse>}
	 * @memberof AppServices
	 * @description
	 * 回调参数：
	 * @example
	 * {
	 *   errno: number
	 *   error: string
	 *   data:{
	 *       token: string
	 *     }
	 *  }
	 */
	HybirdAppService.prototype.getToken = function () {
		var data = {
			api: 'com.heartgo.loong.getToken',
		};
		return this.bridge.run(data, 3);
	};

	/**
	 * 复制
	 * @public
	 * @method copy
	 * @param {string} textStr 被复制文本
	 * @returns {Promise<AppResponse>}
	 * @memberof AppServices
	 * @description
	 * 复制web页文本
	 */
	HybirdAppService.prototype.copy = function (textStr) {
		var data = {
			api: 'com.heartgo.loong.copy',
			data: {
				text: textStr,
			},
		};
		return this.bridge.run(data, this.bridge.retryDefault, false);
	};

	/**
	 * 关闭页面
	 * @public
	 * @method finish
	 */
	HybirdAppService.prototype.finish = function () {
		var data = {
			api: 'com.heartgo.loong.finish',
		};
		return this.bridge.run(data, this.bridge.retryDefault, false);
	};

	/**
	 * 告知H5当前所在语音房的房间信息
	 * @returns {Promise<AppResponse>}
	 * @memberof AppServices
	 * @description
	 * 回调参数：
	 * @example
	 * {
	 *   errno: number
	 *   error: string
	 *   data: {
	 *     roomId: number
	 *     roomCode: number
	 *     name: string
	 *   }
	 * }
	 */
	HybirdAppService.prototype.voiceRoomInfo = function () {
		var data = {
			api: 'com.heartgo.loong.voiceRoomInfo',
		};
		return this.bridge.run(data);
	};

	// 分割线，以下是web的方法======================================================================

	/**
	 * 进入前台事件回调
	 * @param {() => void} back 回调
	 * @returns {void}
	 * @memberof AppServices
	 */
	HybirdAppService.prototype.willEnterForeground = function (back) {
		if (!back) {
			return;
		}
		window['willEnterForeground'] = back;
	};

	/**
	 * 进入后台事件回调
	 * @param {() => void} back 回调
	 * @returns {void}
	 * @memberof AppServices
	 */
	HybirdAppService.prototype.didEnterBackground = function (back) {
		if (!back) {
			return;
		}
		window['didEnterBackground'] = back;
	};

	/**
	 * (仅 Android)页面恢复事件
	 * @param {() => void} back 回调
	 * @returns {void}
	 * @memberof AppServices
	 * @example
	 * Android 生命周期：
	 * 创建 → 前台 (willEnterForeground) → 恢复 (willResume) → 暂停 (willPause) → 后台 (didEnterBackground) → 销毁
	 */
	HybirdAppService.prototype.willResume = function (back) {
		if (!back) {
			return;
		}
		window['willResume'] = back;
	};

	/**
	 * (仅Android)页面暂停事件回调
	 * @param {() => void} back 回调
	 * @returns {void}
	 * @memberof AppServices
	 */
	HybirdAppService.prototype.willPause = function (back) {
		if (!back) {
			return;
		}
		window['willPause'] = back;
	};

	/**
	 * 游戏 IM 消息透传
	 * @param {() => void} back 回调
	 * @returns {void}
	 * @memberof AppServices
	 * @description
	 * 回调参数：
	 * @example
	 * {
	 *   // im原始json数据
	 * }
	 */
	HybirdAppService.prototype.im = function (back) {
		if (!back) {
			return;
		}
		window['im'] = function (data) {
			back(data);
		};
	};

	/**
	 * 获取设备信息
	 * @param {*} back
	 * @returns {void}
	 * @memberof AppServices
	 * @description
	 * 回调参数：
	 * @example
	 *	{
	 *     timestamp: number, // 本地校准过的时间戳，毫秒
	 *     windowIns: { // 屏幕安全外间距， 单位 px。
	 *       top: number
	 *       left: number
	 *       bottom: number
	 *       right: number
	 *     }
	 *   }
	 */
	HybirdAppService.prototype.onAIGameDevice = function (back) {
		if (!back) {
			return;
		}
		window['onAIGameDevice'] = function (data) {
			back(data);
		};
	};

	// 创建全局实例并注入到window.hybirdapp
	if (!window.hybirdapp) {
		window.hybirdapp = new HybirdAppService();
	}

	// 导出到模块系统（如果支持）
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = HybirdAppService;
	}
})(typeof window !== 'undefined' ? window : this);
