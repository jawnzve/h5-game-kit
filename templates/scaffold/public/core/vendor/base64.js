function Base64() {
	// 使用 var 避免隐式全局
	var _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	this.encode = function (input) {
		var output = '';
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = _utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output += _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
		}
		return output;
	};

	this.decode = function (input) {
		var output = '';
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		// 可选：支持 URL-safe 变体
		input = String(input).replace(/-/g, '+').replace(/_/g, '/');
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

		while (i < input.length) {
			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output += String.fromCharCode(chr1);
			if (enc3 !== 64) output += String.fromCharCode(chr2);
			if (enc4 !== 64) output += String.fromCharCode(chr3);
		}
		output = _utf8_decode(output);
		return output;
	};

	// 处理代理对（Emoji 等），输出 1~4 字节 UTF-8
	var _utf8_encode = function (str) {
		var utftext = '';
		var i = 0;
		while (i < str.length) {
			var code = str.charCodeAt(i++);

			// 代理对合并
			if (code >= 0xd800 && code <= 0xdbff && i < str.length) {
				var next = str.charCodeAt(i);
				if (next >= 0xdc00 && next <= 0xdfff) {
					code = ((code - 0xd800) << 10) + (next - 0xdc00) + 0x10000;
					i++;
				}
			}

			if (code < 0x80) {
				utftext += String.fromCharCode(code);
			} else if (code < 0x800) {
				utftext += String.fromCharCode((code >> 6) | 0xc0, (code & 0x3f) | 0x80);
			} else if (code < 0x10000) {
				utftext += String.fromCharCode((code >> 12) | 0xe0, ((code >> 6) & 0x3f) | 0x80, (code & 0x3f) | 0x80);
			} else {
				utftext += String.fromCharCode((code >> 18) | 0xf0, ((code >> 12) & 0x3f) | 0x80, ((code >> 6) & 0x3f) | 0x80, (code & 0x3f) | 0x80);
			}
		}
		return utftext;
	};

	// 解码 1~4 字节 UTF-8 到 JS 字符串（含代理对）
	var _utf8_decode = function (utftext) {
		var str = '';
		var i = 0;
		while (i < utftext.length) {
			var c = utftext.charCodeAt(i++);
			if (c < 0x80) {
				str += String.fromCharCode(c);
			} else if (c < 0xe0) {
				var c2 = utftext.charCodeAt(i++);
				str += String.fromCharCode(((c & 0x1f) << 6) | (c2 & 0x3f));
			} else if (c < 0xf0) {
				var c2b = utftext.charCodeAt(i++);
				var c3 = utftext.charCodeAt(i++);
				str += String.fromCharCode(((c & 0x0f) << 12) | ((c2b & 0x3f) << 6) | (c3 & 0x3f));
			} else {
				var c2c = utftext.charCodeAt(i++);
				var c3b = utftext.charCodeAt(i++);
				var c4 = utftext.charCodeAt(i++);
				var codePoint = ((c & 0x07) << 18) | ((c2c & 0x3f) << 12) | ((c3b & 0x3f) << 6) | (c4 & 0x3f);
				codePoint -= 0x10000;
				str += String.fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff));
			}
		}
		return str;
	};
}

var base64 = new Base64();
window.base64 = base64;

// 暴露UTF8解码函数用于API响应处理
window.base64.utf8Decode = function(utftext) {
	var str = '';
	var i = 0;
	while (i < utftext.length) {
		var c = utftext.charCodeAt(i++);
		if (c < 0x80) {
			str += String.fromCharCode(c);
		} else if (c < 0xe0) {
			var c2 = utftext.charCodeAt(i++);
			str += String.fromCharCode(((c & 0x1f) << 6) | (c2 & 0x3f));
		} else if (c < 0xf0) {
			var c2b = utftext.charCodeAt(i++);
			var c3 = utftext.charCodeAt(i++);
			str += String.fromCharCode(((c & 0x0f) << 12) | ((c2b & 0x3f) << 6) | (c3 & 0x3f));
		} else {
			var c2c = utftext.charCodeAt(i++);
			var c3b = utftext.charCodeAt(i++);
			var c4 = utftext.charCodeAt(i++);
			var codePoint = ((c & 0x07) << 18) | ((c2c & 0x3f) << 12) | ((c3b & 0x3f) << 6) | (c4 & 0x3f);
			codePoint -= 0x10000;
			str += String.fromCharCode(0xd800 + (codePoint >> 10), 0xdc00 + (codePoint & 0x3ff));
		}
	}
	return str;
};

// 通用的API响应解码函数
// 现代浏览器和服务器已正确处理UTF-8，直接返回原文本即可
window.base64.decodeApiResponse = function(text) {
	// 直接返回原文本，不做额外解码处理
	// 服务器返回的JSON已经是正确的UTF-8编码
	return text;
};

// 递归处理对象中的所有字符串字段
window.base64.decodeObjectStrings = function(obj) {
	if (!obj) return obj;
	
	if (typeof obj === 'string') {
		return window.base64.decodeApiResponse(obj);
	}
	
	if (Array.isArray(obj)) {
		return obj.map(function(item) {
			return window.base64.decodeObjectStrings(item);
		});
	}
	
	if (typeof obj === 'object') {
		var result = {};
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				result[key] = window.base64.decodeObjectStrings(obj[key]);
			}
		}
		return result;
	}
	
	return obj;
};

