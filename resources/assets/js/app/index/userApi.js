define(['vendor/jquery', 'vendor/jsencrypt', './config'], function($1, JSEncrypt, config) {

	function authCheck() {
		return $.ajax({
			type: 'POST',
			url: '/api/auth/check',
			data: {
				id: 0
			},
			dataType: 'json',
		});
	}

	function login(username, password) {
		var encrypt = new JSEncrypt.JSEncrypt();
		encrypt.setPublicKey(config.encrypt.publicKey);

		return $.ajax({
			type: 'POST',
			url: '/api/auth/login',
			dataType: 'json',
			data: {
				email: username,
				password: encrypt.encrypt(password)
			},
		});
	}

	function weixinLogin(login_key) {
		return $.ajax({
			type: 'POST',
			url: '/api/auth/login/weixin',
			data: {
				login_key: login_key,
			},
			dataType: 'json',
		});
	}

	function weixinQrcode(refresh) {
		return $.ajax({
			type: 'POST',
			url: '/api/auth/weixin/loginkey',
			data: {
				refresh: refresh,
			},
			dataType: 'json',
		});
	}


	return {
		authCheck: authCheck,
		login: login,
		weixinLogin: weixinLogin,
		weixinQrcode: weixinQrcode,
	};
});