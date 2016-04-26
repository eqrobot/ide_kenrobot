define(['vendor/jquery', './EventManager', './util', './user', './hardware', './software', './board', './logcat', './sidebar'], function(_, EventManager, util, user, hardware, software, board, logcat, sidebar) {
	//项目模版
	var projectTemplate = '<li data-project-id="{{id}}" data-view="software"><div class="title"><i class="kenrobot ken-icon-folder icon"></i><span class="name">{{project_name}}</span><i class="kenrobot arrow"></i></div><div class="view"><div><i class="kenrobot ken-icon-code icon"></i><span class="name">{{project_name}}</span>.ino</div></div></li>';
	var tabTemplate = '<li data-project-id="{{id}}"><span class="name">{{project_name}}</span><i class="kenrobot ken-close close-btn"></i></li>';
	var shareTemplate = '我是{{name}}，这是我的{{project_name}}项目{{project_url}}，快来看看吧^_^';

	//我的项目
	var myProjects = [];
	//已打开的项目
	var openedProjects = [];

	function init() {
		$('.project .operation li').on('click', onProjectActionClick);

		EventManager.bind("project", "viewChange", onViewChange);
		EventManager.bind("project", "share", onShare);
		EventManager.bind("user", "login", onLogin);
		EventManager.bind("software", "editorChange", onEditorChange);

		$(window).on('hashchange', function(e) {
			load();	
		});
	}

	function getHashKeyValue(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.hash.substr(1).match(reg);

		return r != null ? unescape(r[2]) : null;
	}

	function loadMyProject() {
		var promise = $.Deferred();
		user.authCheck(function(success) {
			if(!success) {
				promise.resolve();
				return;
			}

			$.ajax({
				type: 'POST',
				url: '/api/projects/user',
				data: {
					user_id: user.getUserId(),
				},
				dataType: 'json',
			}).done(function(result) {
				$(".project .list ul").empty();

				addProject(result.data);
				promise.resolve();
			});
		});

		return promise;
	}

	function load() {
		var hash = getHashKeyValue('project');
		hash = /^[0-9a-zA-Z]{6}$/.test(hash) ? hash : "";
		if(hash) {
			getProjectInfoByHash(hash)
				.done(function(projectInfo) {
					openProject(projectInfo);
				})
				.fail(function() {
					window.location.hash = "";
				});
		} else {
			if(window.location.hash != "") {
				window.location.hash = "";
				return;
			}

			if(openedProjects.length > 0) {
				return;
			}

			var projectInfo = myProjects.length > 0 ? myProjects[myProjects.length - 1] : getDefaultProject();
			openProject(projectInfo);
		}
	}

	function getProjectInfoByHash(hash) {
		var promise = $.Deferred();

		for(var i = 0; i < myProjects.length; i++) {
			if(myProjects[i].hash == hash) {
				return promise.resolve(myProjects[i]);
			}
		}

		$.ajax({
			type: 'POST',
			url: '/api/project/get',
			data: {
				user_id: user.getUserId(),
				hash: hash,
			},
			dataType: 'json',
		}).done(function(result) {
			result.status == 0 ? promise.resolve(convertProject(result.data)) : promise.reject();
		});

		return promise;
	}

	function convertProject(projectInfo) {
		if(typeof projectInfo.project_data == "string") {
			try {
				projectInfo.project_data = JSON.parse(projectInfo.project_data);
			} catch(ex) {
				projectInfo.project_data = {};
			}
		}

		return projectInfo;
	}

	function openProject(projectInfo) {
		var ul = $('.top-tabs > ul');
		var targetTab = ul.find('> li[data-project-id="' + projectInfo.id + '"]');
		if(targetTab.length == 0) {
			openedProjects.push(projectInfo);

			targetTab = $(tabTemplate.replace(/\{\{project_name\}\}/g, projectInfo.project_name).replace(/\{\{id\}\}/g, projectInfo.id));
			targetTab.appendTo(ul);
			bindTabEvent();
		}

		targetTab.click();
	}

	function addProject(projects) {
		var ul = $(".project .list ul");
		for(var i = 0; i < projects.length; i++) {
			var projectInfo = projects[i];
			projectInfo = convertProject(projectInfo);

			if(projectInfo.status === undefined) {
				projectInfo.status = 1;
			}
			
			ul.append(getProjectHtml(projectInfo));
			myProjects.push(projectInfo);
		}
		bindProjectEvent();
	}

	function build() {
		var callback = function() {
			var info = getCurrentProject();
			var id = info.id;
			if(id == 0) {
				showSaveDialog(info, true);
				return;
			}

			var isBuilding = true;
			var dialog = util.dialog({
				selector: '.building-dialog',
				content: "正在编译，请稍候...",
				onClosing: function() {
					return !isBuilding;
				}
			});

			var doBuild = function() {
				$.ajax({
					type: "POST",
					url: "/api/project/build",
					dataType: "json",
					data: {
						id: id,
						user_id: user.getUserId(),
					},
				}).done(function(result) {
					isBuilding = false;
					var projectInfo = getProjectById(openedProjects, id);
					if(result.status == 0) {
						projectInfo.status = 2;
						projectInfo.url = result.url;
					} else {
						delete projectInfo.url;
						logcat.show();
						logcat.clear();
						logcat.append(result.output.join("\n"));
					}

					$('.x-dialog-content', dialog).text(result.message);
				});
			};

			if(info.status == 0) {
				doProjectSave(info, false, false, false, false, doBuild);
			} else {
				doBuild();
			}
		};

		user.authCheck(function(success) {
			success ? checkOwn(callback) : user.showLoginDialog();
		});
	}

	function isBuild(callback) {
		var checkBuild = function() {
			var projectInfo = getCurrentProject();
			var status = projectInfo.status;
			if(!status || status == 0) {
				util.message("请先保存");
			} else if(status == 1) {
				util.message("请先编译");
			} else {
				callback(projectInfo.url);
			}
		};

		user.authCheck(function(success) {
			success ? checkOwn(checkBuild) : user.showLoginDialog();
		});
	}

	function download() {
		isBuild(function(url) {
			window.location.href = url;
		});
	}

	function save() {
		var doSave = function() {
			var projectInfo = getCurrentProject();
			var id = projectInfo.id;
			if(id == 0) {
				showSaveDialog(projectInfo, true);
			} else {
				doProjectSave(projectInfo);
			}
		};

		user.authCheck(function(success) {
			success ? checkOwn(doSave) : user.showLoginDialog();
		});
	}

	function checkOwn(callback) {
		var projectInfo = getCurrentProject();
		var user_id = user.getUserId();
		if(projectInfo.user_id != user_id) {
			showCopyDialog(function() {
				showSaveDialog(projectInfo, true, true);
			});
		} else {
			callback && callback();
		}
	}

	function onViewChange(view) {
		doSwitchView(view);
	}

	function onLogin() {
		// load();
		loadMyProject();
	}

	function onShare() {
		var doShare = function() {
			var projectInfo = getCurrentProject();
			if(projectInfo.public_type != 2) {
				util.message("你的项目未完全公开，不能分享");
				return;
			}

			var name = user.getUserName();
			var project_name = projectInfo.project_name;
			var project_url = "http://" + window.location.host + "/#project=" + projectInfo.hash;
			var content = shareTemplate.replace("{{name}}", user.getUserName()).replace("{{project_name}}", project_name).replace("{{project_url}}", project_url);
			var dialog;

			dialog = util.dialog(".share-dialog");
			$('.share-content', dialog).text(content);
		};
		
		checkOwn(doShare);
	}

	function onEditorChange() {
		var projectInfo = getCurrentProject();
		projectInfo && (projectInfo.status = 0);
	}

	function onProjectTitleClick(e) {
		var li = $(this).parent();
		util.toggleActive(li, null, true);
	}

	function onProjectFileClick(e) {
		var li = $(this).parent().parent();
		var id = li.data('project-id');
		var projectInfo = getProjectById(myProjects, id);

		openProject(projectInfo);
	}

	function onProjectActionClick(e) {
		var li = $(this);
		var action = li.data("action");
		switch(action) {
			case "new":
				onProjectNewClick();
				break;
			case "edit":
				onProjectEditClick();
				break;
			case "delete":
				onProjectDeleteClick();
				break;
		}
	}

	function onProjectNewClick(e) {
		user.authCheck(function(success) {
			success ? showSaveDialog(getDefaultProject(), true) : user.showLoginDialog();
		});
	}

	function onProjectEditClick(e) {
		var id = $('.project .list li.active').data('project-id');
		var projectInfo = getProjectById(myProjects, id);
		if(!projectInfo) {
			return;
		}

		user.authCheck(function(success) {
			success ? showSaveDialog(projectInfo) : user.showLoginDialog();
		});
	}

	function onProjectDeleteClick(e) {
		var id = $('.project .list li.active').data('project-id');
		var projectInfo = getProjectById(myProjects, id);
		if(!projectInfo) {
			return;
		}

		var id = projectInfo.id;
		var showDeleteDialog = function() {
			var dialog = util.dialog({
				selector: ".delete-project-dialog",
				onConfirm: function() {
					doProjectDelete(id);
				},
			});

			$('.name', dialog).text(projectInfo.project_name);
		}

		if(id == 0) {
			showDeleteDialog();
			return;
		}
		
		user.authCheck(function(success) {
			success ? showDeleteDialog() : user.showLoginDialog();
		});
	}

	function showSaveDialog(projectInfo, isNew, isCopy) {
		sidebar.hide();

		var text = isNew ? "创建项目" : "保存项目";
		
		var dialog = util.dialog('.save-dialog');
		var form = $('form', dialog);
		$('input[name="name"]', form).val(projectInfo.project_name);
		$('textarea[name="intro"]', form).val(projectInfo.project_intro);
		$('input[name="public-type"][value="' + projectInfo.public_type + '"]', form).attr("checked", true);
		$('input[name="save"]', form).val(text);

		$('.save-btn', dialog).off('click').on('click', function() {
			doProjectSave(projectInfo, true, isNew, isCopy);
		});
	}

	function doProjectSave(projectInfo, isEdit, isNew, isCopy, showMessage, callback) {
		var id = projectInfo.id;
		var project;
		showMessage = showMessage != false;
		if(isEdit) {
			var dialog = $('.save-dialog');
			var form = $('form', dialog);
			var project_name = $('input[name="name"]', form).val();
			project = {
				id: isCopy ? 0: id,
				project_name: project_name,
				user_id: user.getUserId(),
				project_intro: $('textarea[name="intro"]', form).val(),
				project_data: JSON.stringify(getProjectData()),
				public_type: $("input[name='public-type']:checked", form).val(),
			};

			$('.x-dialog-close', dialog).click();
		} else {
			project = {
				id: isCopy ? 0: id,
				user_id: user.getUserId(),
				project_data: JSON.stringify(getProjectData()),
			}
		}
		
		showMessage && util.message("正在保存，请稍候...");
		$.ajax({
			type: 'POST',
			url: '/api/project/save',
			data: project,
			dataType: 'json',
		}).done(function(result) {
			showMessage && util.message(result.message);
			if(result.status == 0) {
				if(isEdit) {
					$.ajax({
						type: 'POST',
						url: '/api/project/get',
						data: {
							user_id: user.getUserId(),
							id: result.data.project_id,
						},
						dataType: 'json',
					}).done(function(res) {
						doUpdateProject(id, isCopy, res);
					});
				} else {
					var projectInfo = getProjectById(openedProjects, id);
					projectInfo.status = 1;
					callback && callback();
				}
			}
		});
	}

	function doUpdateProject(id, isCopy, result) {
		if(result.status != 0) {
			util.message(result.message);
			return;
		}

		var projectInfo = result.data;
		projectInfo.status = 1;
		convertProject(projectInfo);

		var list = $('.project .list > ul');
		if(id == 0 || isCopy) {
			//new
			list.find('> li[data-project-id="' + id + '"]').remove();
			$('.top-tabs > ul > li[data-project-id="' + id + '"]').remove();
			deleteProjectById(openedProjects, id);
			
			addProject([projectInfo]);
			openProject(projectInfo);
		} else {
			//save
			var index = getProjectIndex(openedProjects, projectInfo.id);
			index >= 0 && (openedProjects[index] = projectInfo);

			index = getProjectIndex(myProjects, projectInfo.id);
			index >= 0 && (myProjects[index] = projectInfo);

			list.find('> li[data-project-id="' + projectInfo.id + '"]').find(".name").text(projectInfo.project_name);
			$('.top-tabs ul li[data-project-id="' + projectInfo.id + '"]').find(".name").text(projectInfo.project_name);
		}
	}

	function doProjectDelete(id) {
		var doDelete = function() {
			$('.top-tabs > ul > li[data-project-id="' + id + '"]').remove();
			$('.project .list > ul > li[data-project-id="' + id + '"]').remove();

			deleteProjectById(myProjects, id);
			deleteProjectById(openedProjects, id);

			if(openedProjects.length == 0) {
				var projectInfo = getDefaultProject();
				openProject(getDefaultProject());
			} else {
				var list = $('.top-tabs > ul > li');
				list.eq(list.length - 1).click();
			}
		};

		if(id == 0) {
			doDelete();
			return;
		}

		$.ajax({
			type: "POST",
			url: "/api/project/delete",
			data: {
				id: id,
				user_id: user.getUserId(),
			},
			dataType: "json",
		}).done(function(result){
			util.message(result.message);
			if (result.status == 0) {
				doDelete();
			}
		});
	}

	function showCopyDialog(callback) {
		util.dialog({
			selector: '.copy-dialog',
			onConfirm: callback,
		});
	}

	function bindProjectEvent() {
		var titles = $('.project .list .title').off('click').on('click', onProjectTitleClick);
		$('.project .list .view > div').off('click').on('click', onProjectFileClick);
	}

	function bindTabEvent() {
		$('.top-tabs > ul > li').off('click').on('click', onTabClick);
		$('.top-tabs > ul > li .close-btn').off('click').on('click', onTabCloseClick);
	}

	function onTabClick(e) {
		var li = $(this);
		var view = li.data('view');
		var active = li.hasClass("active");

		if(!active) {
			var currentLi = li.parent().find("li.active");
			if(currentLi.length > 0) {
				var currentId = currentLi.data("project-id");
				doSaveView(currentId);
				currentLi.removeClass("active");
			}

			li.addClass("active");
		}
		var projectInfo = getCurrentProject();
		var project_data = projectInfo.project_data;

		board.setData(project_data.board);
		hardware.setData(project_data.hardware);
		software.setData(project_data.software);

		doSwitchView(view);
	}

	function doSwitchView(view) {
		var projectInfo = getCurrentProject();
		var id = projectInfo.id;
		var project_data = projectInfo.project_data

		view = view || "software";
		if(view == "hardware") {
			project_data.software = software.getData();
			hardware.setData(project_data.hardware);
		} else {
			software.gen();
			project_data.hardware = hardware.getData();
		}

		$('.top-tabs > ul > li[data-project-id="' + id + '"]').data("view", view);

		EventManager.trigger("sidebar", "viewChange", view);
	}

	function doSaveView(id) {
		var projectInfo = getProjectById(openedProjects, id);
		software.gen();
		projectInfo.project_data = getProjectData();
	}

	function onTabCloseClick(e) {
		var li = $(this).parent();
		var id = li.data('project-id');
		if(li.siblings().length == 0) {
			return false;
		}

		var active = li.hasClass("active");
		
		var index = li.index() - 1;
		index = index < 0 ? 0 : index;

		doSaveView(id);
		li.remove();
		for(var i = 0; i < openedProjects.length; i++) {
			if(openedProjects[i].id == id) {
				openedProjects.splice(i, 1);
				break;
			}
		}

		if(active) {
			var list = $('.top-tabs > ul > li');
			if(list.length == 0) {
				$('.main-tabs .tab').removeClass("active");
			} else {
				setTimeout(function() {
					list.eq(index).click();
				}, 10);
			}
		}
		
		return false;
	}

	function getProjectData() {
		return {
			board: board.getData(),
			hardware: hardware.getData(),
			software: software.getData(),
		};
	}

	function getProjectHtml(projectInfo) {
		return projectTemplate.replace(/\{\{project_name\}\}/g, projectInfo.project_name)
							  .replace(/\{\{id\}\}/g, projectInfo.id);
	}

	function getDefaultProject() {
		return {
			id: 0,
			user_id: user.getUserId(),
			project_name: "我的项目",
			project_intro: "我的项目简介",
			public_type: 0,
			project_data: {},
			author: user.getUserName(),
			status: 0,
		};
	}

	function getCurrentProject() {
		var id = $('.top-tabs > ul > li.active').data('project-id');
		return getProjectById(openedProjects, id);
	}

	function getProjectIndex(projects, id) {
		var index = -1;
		for(var i = 0; i < projects.length; i++){
			var info = projects[i];
			if(info.id == id) {
				index = i;
				break;
			}
		}
		return index;
	}

	function getProjectById(projects, id) {
		for(var i = 0; i < projects.length; i++){
			var info = projects[i];
			if(info.id == id) {
				return info;
			}
		}
	}

	function deleteProjectById(projects, id) {
		for(var i = 0; i < projects.length; i++){
			var info = projects[i];
			if(info.id == id) {
				projects.splice(i, 1);
				break;
			}
		}
	}

	return {
		init: init,
		load: load,
		isBuild: isBuild,
		build: build,
		save: save,
		download: download,
		getCurrentProject: getCurrentProject,
		loadMyProject: loadMyProject,
	}
});