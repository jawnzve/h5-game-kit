/**
 * 埋点上报（与 aeroplane-chess 同源，gameId 改用 window.__GAME_ID__）
 * 依赖：http-config.js（trackLogUrl）、可选 getCurrentUserId / userInfo
 */
(function () {
	function getGameId() {
		if (window.__GAME_ID__) {
			return window.__GAME_ID__;
		}
		for (var key in window) {
			if (key.endsWith('Config') && window[key] && window[key].gameId) {
				return window[key].gameId;
			}
		}
		return undefined;
	}

	function getUserId() {
		return new Promise(function (resolve) {
			if (typeof window.getCurrentUserId === 'function') {
				window
					.getCurrentUserId()
					.then(function (userId) {
						resolve(userId);
					})
					.catch(function () {
						resolve(undefined);
					});
				return;
			}
			var userId;
			if (window.userInfo && window.userInfo.userId) {
				userId = window.userInfo.userId;
			} else if (window.currentUserId !== undefined) {
				userId = window.currentUserId;
			}
			resolve(userId);
		});
	}

	var trackLog = function (action, message) {
		if (!window.httpConfig || !window.httpConfig.currentEnv) {
			console.error('❌ 埋点配置缺失: window.httpConfig.currentEnv 不存在');
			return;
		}
		if (!window.httpConfig.currentEnv.trackLogUrl) {
			console.error('❌ 埋点URL缺失: window.httpConfig.currentEnv.trackLogUrl 不存在');
			return;
		}

		var gameId = getGameId();
		if (!gameId) {
			console.error('❌ 游戏ID缺失: 设置 window.__GAME_ID__（scaffold 在 app-index.html 注入）');
			return;
		}

		getUserId().then(function (userId) {
			var messageTemp = {
				project_name: gameId,
				user_id: userId,
				source: window.hybirdapp && window.hybirdapp.inApp() ? 'app' : 'web',
				message: message,
			};

			var eventTime =
				window.ServerTimeSync && window.ServerTimeSync.isInitialized()
					? window.ServerTimeSync.now()
					: new Date().getTime();

			var errParame = {
				ClientOs: 'web',
				service: window.httpConfig.currentEnv.apiBase || '',
				Environment: window.httpConfig.currentEnv.name || 'TEST',
				IP: '-',
				Event: 'game_' + gameId + '_' + action,
				Level: 'info',
				EventTime: eventTime,
				URL: window.location.href,
				Message: JSON.stringify(messageTemp),
			};

			fetch(window.httpConfig.currentEnv.trackLogUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(errParame),
			})
				.then(function (res) {
					return res.json();
				})
				.then(function (data) {
					console.log('✅ 埋点上报成功:', action, data);
				})
				.catch(function (error) {
					console.error('❌ 埋点上报失败:', action, error);
				});
		});
	};

	if (typeof window !== 'undefined') {
		window.trackLog = trackLog;
	}
})();
