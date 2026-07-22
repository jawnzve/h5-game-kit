/**
 * HTTP 配置 — 按页面 hostname 选环境（见 kit LOCAL-SERVER-SPEC.md）
 * apiBase 预设：witchs-poison 通用模板；新建游戏时可按需修改。
 * 本机 npm start：连远端 dev/test API，不连 localhost:4000
 */
var HTTP_DOMAIN_ENV_PRESETS = {
  prod: {
    apiBase: 'https://h5-game-server.hiheartgo.com',
    signKey: '051ca4deba99267dcf4ef343ebcdbe2c',
    trackLogUrl: 'https://logstar-server.qniqni.com/api/web/event',
    name: 'PROD',
  },
  test: {
    apiBase: 'https://loong-h5-game-server.test.haochang.tv',
    signKey: '41a939289369cc56dcc80d8f0df66759',
    trackLogUrl: 'https://logstar-server.test.qniqni.com/api/web/event',
    name: 'TEST',
  },
  'small-test': {
    apiBase: 'https://loong-h5-game-server.small-test.haochang.tv',
    signKey: '41a939289369cc56dcc80d8f0df66759',
    trackLogUrl: 'https://logstar-server.test.qniqni.com/api/web/event',
    name: 'SMALL-TEST',
  },
  'new-test': {
    apiBase: 'https://loong-h5-game-server.new-test.haochang.tv',
    signKey: '41a939289369cc56dcc80d8f0df66759',
    trackLogUrl: 'https://logstar-server.test.qniqni.com/api/web/event',
    name: 'NEW-TEST',
  },
  audit: {
    apiBase: 'https://h5-game-server.audit.hiheartgo.com',
    signKey: '051ca4deba99267dcf4ef343ebcdbe2c',
    trackLogUrl: 'https://logstar-server.qniqni.com/api/web/event',
    name: 'AUDIT',
  },
  dev: {
    apiBase: 'https://loong-h5-game-server.test.haochang.tv',
    signKey: '41a939289369cc56dcc80d8f0df66759',
    trackLogUrl: 'https://logstar-server.test.qniqni.com/api/web/event',
    name: 'DEV',
  },
};

function _clonePreset(key) {
  var p = HTTP_DOMAIN_ENV_PRESETS[key];
  if (!p) return null;
  return {
    apiBase: p.apiBase,
    signKey: p.signKey,
    trackLogUrl: p.trackLogUrl,
    name: p.name,
  };
}

function _hostMatchesEnvSegment(hostname, segment) {
  if (!hostname || !segment) return false;
  return hostname.indexOf(segment) !== -1 || hostname.indexOf(segment.slice(1) + '.') === 0;
}

function _isQniqniProdHost(hostname) {
  if (!hostname || !/qniqni\.com$/i.test(hostname)) return false;
  if (hostname.indexOf('.dev') !== -1 || hostname.indexOf('.audit') !== -1) return false;
  if (_hostMatchesEnvSegment(hostname, '.test')) return false;
  if (_hostMatchesEnvSegment(hostname, '.small-test') || _hostMatchesEnvSegment(hostname, '.new-test')) {
    return false;
  }
  return true;
}

function _isPrivateLanHost(hostname) {
  if (!hostname) return false;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  if (/^10\.\d+\.\d+\.\d+$/.test(hostname)) return true;
  if (/^192\.168\.\d+\.\d+$/.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname)) return true;
  return false;
}

function _resolveEnvByLocation() {
  var hostname = (typeof location !== 'undefined' && location.hostname) || '';

  try {
    var search = (typeof location !== 'undefined' && location.search) || '';
    var params = typeof URLSearchParams !== 'undefined' ? new URLSearchParams(search) : null;
    var forceKey = params && params.get('http_env');
    if (forceKey && HTTP_DOMAIN_ENV_PRESETS[forceKey]) {
      return { env: _clonePreset(forceKey), matched: 'url:http_env=' + forceKey };
    }

    if (_hostMatchesEnvSegment(hostname, '.small-test')) {
      return { env: _clonePreset('small-test'), matched: 'host:.small-test' };
    }
    if (_hostMatchesEnvSegment(hostname, '.new-test')) {
      return { env: _clonePreset('new-test'), matched: 'host:.new-test' };
    }
    if (_hostMatchesEnvSegment(hostname, '.test')) {
      return { env: _clonePreset('test'), matched: 'host:.test' };
    }
    if (hostname.indexOf('.audit') !== -1) {
      return { env: _clonePreset('audit'), matched: 'host:.audit' };
    }
    if (hostname.indexOf('.dev') !== -1) {
      return { env: _clonePreset('dev'), matched: 'host:.dev' };
    }
    if (_isQniqniProdHost(hostname)) {
      return { env: _clonePreset('prod'), matched: 'host:qniqni.com' };
    }
    if (_isPrivateLanHost(hostname)) {
      return { env: _clonePreset('dev'), matched: 'host:local→remote-dev' };
    }

    return { env: _clonePreset('dev'), matched: 'fallback:dev' };
  } catch (e) {
    return { env: _clonePreset('dev'), matched: 'error:' + String(e) };
  }
}

var _picked = _resolveEnvByLocation();
var httpConfig = { currentEnv: _picked.env };

if (typeof console !== 'undefined' && console.log) {
  console.log(
    '[http-config] ' +
      httpConfig.currentEnv.name +
      ' | ' +
      _picked.matched +
      ' | apiBase: ' +
      httpConfig.currentEnv.apiBase
  );
}

if (typeof window !== 'undefined') {
  window.httpConfig = httpConfig;
  window.HTTP_DOMAIN_ENV_PRESETS = HTTP_DOMAIN_ENV_PRESETS;
  window.HTTP_DOMAIN_ENV_CONFIG = { environments: HTTP_DOMAIN_ENV_PRESETS };
}
