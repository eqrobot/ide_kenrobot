define(['vendor/jquery', './EventManager', './util', './userApi'], function(_, EventManager, util, userApi) {
	var userInfo;
	var loginCheckTimer;
	var loginCallback;
	var dialog;
	var qrcodeTimeout = 10 * 60 * 1000;

	function init() {
		initLoginDialog();

		initUserDialog();

		$('.user-login li').on('click', onLogin);
	}

	function getUserId() {
		return userInfo ? userInfo.uid : 0;
	}

	function getUserInfo() {
		return userInfo;
	}

	function getUserName() {
		return userInfo ? userInfo.name : "";
	}

	function authCheck() {
		var promise = $.Deferred();
		userApi.authCheck().done(function(result){
			if(result.status == 0) {
				userInfo = result.data;
				promise.resolve();
			} else {
				userInfo = null;
				promise.reject();
			}
		});

		return promise;
	}

	function showLoginDialog(callback, type, isRegister) {
		loginCallback = callback;

		dialog = util.dialog({
			selector: ".login-dialog",
			onClosing: function() {
				loginCallback = null;
				setWeixinLoginCheck(false);
			},
		});

		type = type || "account";

		$('.switch .' + type, dialog).click();
		if(isRegister) {
			$('.switch', dialog).removeClass("active");
			$('.login-tips', dialog).removeClass("active");
			$('.register-tips', dialog).addClass("active");
			$('.footer .login-footer', dialog).removeClass("active");
			$('.footer .register-footer', dialog).addClass("active");
		} else {
			$('.switch', dialog).addClass("active");
			$('.login-tips', dialog).addClass("active");
			$('.register-tips', dialog).removeClass("active");
			$('.footer .login-footer', dialog).addClass("active");
			$('.footer .register-footer', dialog).removeClass("active");
		}
		$('.qrcode', dialog).removeClass("timeout");

		if(type == "account") {
			$('.email', dialog).focus();
		}

		refreshWeixinQrcode();
		setTimeout(onQrcodeTimeout, qrcodeTimeout);
	}

	function initLoginDialog() {
		var scan = $('.scan', dialog);

		$('.switch li', dialog).on('click', function() {
			var li = $(this);
			var action = li.data("action");
			var tab = $('.tab-' + action, dialog);

			util.toggleActive(tab);
			util.toggleActive(li);

			if(action == "weixin") {
				setWeixinLoginCheck(true);
			} else {
				$('.email', dialog).focus();
				setWeixinLoginCheck(false);
			}
		});

		$('.login-btn', dialog).on('click', doLogin);

		var scanTimerId;
		$('.qrcode', dialog).hover(function(e) {
			if(dialog.is(':animated')) {
				return;
			}

			clearTimeout(scanTimerId);
			scan.stop().show().removeClass("x-fadeOut").addClass("x-fadeIn");
		}, function(e) {
			if(dialog.is(':animated')) {
				return;
			}

			scan.removeClass("x-fadeIn").addClass("x-fadeOut");
			scanTimerId = setTimeout(function() {
				scan.hide().removeClass("x-fadeOut");
			}, 300);
		});

		$('.qrcode-refresh', dialog).on('click', function() {
			refreshWeixinQrcode(true);
		});

		$('form', dialog).on('keyup', function(e) {
			if(e.keyCode != 13) {
				return;
			}

			if(!$(".tab-account", dialog).hasClass("active")) {
				return;
			}

			$(".login-btn", dialog).click();
		});

		refreshWeixinQrcode();
	}

	function onQrcodeTimeout() {
		setWeixinLoginCheck(false);
		$('.qrcode').addClass("timeout");
	}

	function doLogin() {
		var username = $('.email', dialog).val();
		var password = $('.password', dialog).val();
		userApi.login(username, password).done(function(result){
			if (result.status == 0) {
				//登录成功
				util.message(result.message);
				$('.x-dialog-close', dialog).click();

				userInfo = result.data;
				doUpdateUser();
				doLoginCallback();
				EventManager.trigger("user", "login");
			} else if (result.status == 1) {
				userInfo = result.data;
				doUpdateUser();
				doLoginCallback();
			} else {
				var message = $('.message', dialog);
				message.addClass("active").text(result.message).delay(2000).queue(function() {
					message.removeClass("active").text('').dequeue();
				});
			}
		});
	}

	function setWeixinLoginCheck(value) {
		clearInterval(loginCheckTimer);
		if (!value) {
			return;
		}

		var doCheck = function() {
			var key = $('.qrcode-key', dialog).val();
			userApi.weixinLogin(key).done(function(result) {
				if (result.status == 0) {
					//登录成功
					userInfo = result.data;
					setWeixinLoginCheck(false);
					$('.x-dialog-close', dialog).click();
					util.message(result.message);

					doUpdateUser();
					doLoginCallback();
					EventManager.trigger("user", "login");
				} else if (result.status == 1) {
					//已经登录
					userInfo = result.data;
					setWeixinLoginCheck(false);
					doUpdateUser();
				} else if(result.status == -3) {
					refreshWeixinQrcode();
				} else {
					//登录失败
				}
			});
		};

		loginCheckTimer = setInterval(doCheck, 3000);
	}

	/**
	 * 刷新验证码
	 */
	function refreshWeixinQrcode(timeout) {
		userApi.weixinQrcode(true).done(function(result){
			if (result.status != 0) {
				return;
			}

			$('.qrcode-key', dialog).val(result.data.login_key);
			$('.qrcode', dialog).attr('src', result.data.qrcodeurl);

			if(timeout) {
				$(".qrcode", dialog).removeClass("timeout");
				setTimeout(onQrcodeTimeout, qrcodeTimeout);
			}
		});
	}

	function doLoginCallback() {
		loginCallback && loginCallback();
	}

	function initUserDialog() {
		var user = $('.user');
		var userMenu = $('.user-menu', user);

		var hideMenu = function() {
			userMenu.hide();
		}

		userMenu.on('mouseleave', hideMenu);
		user.on('mouseleave', hideMenu);

		$('.user-info', user).on('mouseover', function() {
			userMenu.show();
		});

		$('ul > li', userMenu).on('click', onMenuClick);

		if(user.hasClass("active")) {
			$('.top-menu').css({
				'margin-right': user.width(),
			});
		}
	}

	function onMenuClick(e) {
		var li = $(this);
		var action = li.data('action');
		switch(action) {
			case "share":
				EventManager.trigger("project", "share");
				break;
			case "logout":
				window.location.href = "/logout";
				break;
		}
	}

	function doUpdateUser() {
		var user = $('.user');
		var topMenu = $('.top-menu');

		if(userInfo) {
			user.addClass("active");
			$(".photo img", user).attr("src", userInfo.avatar_url);
			$(".name", user).text(userInfo.name);

			topMenu.css({
				'margin-right': user.width(),
			});
		} else {
			user.removeClass("active");
			$(".name", user).text("");
			$(".photo img", user).attr("src", "#");

			topMenu.css({
				'margin-right': 0,
			});
		}
	}

	function onLogin(e) {
		var action = $(this).data('action');
		showLoginDialog(null, "weixin", action == "register");
	}

	return {
		init: init,
		getUserId: getUserId,
		getUserInfo: getUserInfo,
		getUserName: getUserName,
		authCheck: authCheck,
		showLoginDialog: showLoginDialog,
	};
});
