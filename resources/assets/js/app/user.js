define(['jquery', './EventManager', './util'], function($, EventManager, util) {
	var userInfo;
	var loginCheckTimer;
	var loginCallback;

	function init() {
		initLoginDialog();

		initUserDialog();
		initCopyright();

		$('.main-header .logo').on('click', onLogoClick);
	}

	function getUserId() {
		return userInfo ? userInfo.id : 0;
	}

	function getUserInfo() {
		return userInfo;
	}

	function getUserName() {
		return userInfo ? userInfo.name : "";
	}

	function authCheck(callback) {
		$.ajax({
			type: 'GET',
			url: '/auth/check',
			dataType: 'json',
		}).done(function(result){
			var success = result.code == 0;
			userInfo = success ? result.user : null;
			callback && callback(success);
		});
	}

	function showLoginDialog(callback, type) {
		loginCallback = callback;

		var dialog = util.dialog({
			selector: ".login-dialog",
			onClosing: function() {
				loginCallback = null;
				setWeixinLoginCheck(false);
			},
		});

		type = type || "account";

		$('.switch .' + type, dialog).click();
		if(type == "account") {
			$('.email', dialog).focus();
		}
	}

	function initLoginDialog() {
		var dialog = $('.login-dialog');
		var scan = $('.scan', dialog);

		$('.switch li', dialog).on('click', function() {
			var li = $(this);
			var action = li.data("action");
			var tab = $('.tab-' + action, dialog);

			util.toggleActive(tab, 'div');
			util.toggleActive(li);

			if(action == "weixin") {
				setWeixinLoginCheck(true);
			} else {
				$('.email', dialog).focus();
				setWeixinLoginCheck(false);
			}
		});

		$('.login-btn', dialog).on('click', doLogin);

		$('.qrcode', dialog).hover(function(e) {
			if(dialog.is(':animated') || scan.is(':animated')) {
				return;
			}
			
			scan.addClass("active").css({
				left: 160,
				opacity: 0
			}).animate({
				left: 340,
				opacity: 1,
			}, 400, "easeOutExpo");
		}, function(e) {
			if(dialog.is(':animated') || scan.is(':animated')) {
				return;
			}

			scan.animate({
				left: 440,
				opacity: 0,
			}, 400, "easeOutExpo", function() {
				scan.removeClass("active");
			});
		});

		$('form', dialog).on('keyup', function(e) {
			if(e.keyCode != 13) {
				return;
			}

			if(!$(".tab-account", dialog).hasClass("active")) {
				return;
			}

			$(".login-btn", dialog).trigger("click");
		});
	}

	function doLogin() {
		var dialog = $('.login-dialog');
		$.ajax({
			type: 'POST',
			url: '/auth/login',
			dataType: 'json',
			data: {
				email: $('.email', dialog).val(),
				password: $('.password', dialog).val()
			},
		}).done(function(result){
			if (result.code == 0) {
				//登录成功
				util.message(result.message);
				$('.x-dialog-close', dialog).click();

				userInfo = result.data;
				doUpdateUser();
				doLoginCallback();
				EventManager.trigger("user", "login");
			} else if (result.code == 1) {
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

		var dialog = $('.login-dialog');
		var doCheck = function() {
			var key = $('.qrcode-key', dialog).val();
			$.ajax({
				type: 'POST',
				url: '/auth/login/weixin',
				data: {
					key: key,
				},
				dataType: 'json',
			}).done(function(result) {
				if (result.code == 0) {
					//登录成功
					userInfo = result.data;
					setWeixinLoginCheck(false);
					$('.x-dialog-close', dialog).click();
					util.message(result.message);

					doUpdateUser();
					doLoginCallback();
					EventManager.trigger("user", "login");
				} else if (result.code == 1) {
					//已经登录
					userInfo = result.data;
					setWeixinLoginCheck(false);
					doUpdateUser();
				} else {
					//登录失败

				}
			});
		};

		loginCheckTimer = setInterval(doCheck, 3000);
	}

	function doLoginCallback() {
		loginCallback && loginCallback();
	}

	function initUserDialog() {
		var user = $('.user-info');
		var userMenu = $('.user-menu', user);

		var hideMenu = function() {
			userMenu.hide();
		}

		userMenu.on('mouseleave', hideMenu);
		user.on('mouseleave', hideMenu);

		$('.wrap', user).on('mouseover', function() {
			userMenu.show();
		});

		$('ul > li', userMenu).on('click', onMenuClick);

		if(user.hasClass("active")) {
			$('.top-menu').css({
				'margin-right': user.width(),
			});
		}
	}

	function initCopyright() {
		var copyright = $('.copyright');

		var hideCopyright = $.cookie("hideCopyright");
		if(!hideCopyright) {
			copyright.addClass("active");
			$('.close-btn', copyright).on('click', function() {
				copyright.fadeOut(function() {
					copyright.remove();
					$.cookie("hideCopyright", true);
				});
			});
		} else {
			copyright.remove();
		}
	}

	function onMenuClick(e) {
		var li = $(this);
		var action = li.data('action');
		switch(action) {
			case "share":
				util.message("敬请期待");
				break;
			case "setting":
				util.message("敬请期待");
				break;
			case "logout":
				window.location.href = "/logout";
				break;
		}
	}

	function doUpdateUser() {
		var user = $('.user-info');
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

	function onLogoClick(e) {
		authCheck(function(success) {
			success ? util.message("你已登录") : showLoginDialog(null, "weixin");
		});
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
