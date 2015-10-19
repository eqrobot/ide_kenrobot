define(["jquery","kenrobotDialog","flowchartInfo"],function($,kenrobotDialog,flowchartInfo){
	
	var current_project=null;

	function getCurrentPorject(){
		return current_project;
	}

	function setCurrentProject(pid){
		current_project = pid;
	}

	function clearCurrentProject(pid){
		if(pid == current_project){
		    current_project = null;
	    }
	}

	function addProject(data,call,arg){
		$.ajax({
			type: "POST",
			url: "./AddProjectInfo.php",
			data: data,
			dataType:"json",
			async:true,//需同步处理完成后才能进行下一步，故此处用async
			success: function(result){
				//设置本地新建项目ID;
				setCurrentProject(result);
				arg.pid=result;
				call(arg);
			}
		});
	}

	function editProject(data,call,arg){
		console.log(data)
		$.ajax({
			type: "POST",
			url: "./EditProjectInfo.php",
			data: data,
			dataType:"json",
			async:true,//需同步处理完成后才能进行下一步，故此处用async
			success: function(result){
				call(arg);
			}
		});
	}

	function deleteProject(data,call){
		$.ajax({
			type: "POST",
			url: "./DeleteProjectInfo.php",
			data: data,
			dataType:"json",
			async:true,//需同步处理完成后才能进行下一步，故此处用async
			success: function(result){
				//设置本地新建项目ID;
				clearCurrentProject(data.id);
				call(data);
				alert("删除成功！");
			}
		});
	}

	function getProjectList(data,call){
		$.ajax({
			type: "POST",
			url: "./GetProjectList.php",
			data: data,
			dataType:"json",
			async:true,//需同步处理完成后才能进行下一步，故此处用async
			success: function(result){
				call(result);
			}
		});
	}

	function getProjectInfo(data,call){
		$.ajax({
			type: "POST",
			url: "./GetProjectInfo.php",
			data: data,
			dataType:"json",
			async:true,//需同步处理完成后才能进行下一步，故此处用async
			success: function(result){
				call(result);
			}
		});
	}

	$("#create_project").click(function(e){
		var name = $("[name=xmmc]").val();
		var desc = $("[name=xmms]").val();
		if(!name){
			alert("请输入项目名称！");
			return;
		};
		if(!desc){
			alert("请输入项目描述！");
			return;
		};
		var data={
			"name":name,
			"scope":1,
			"user_id":1,
			"user_name":"xiaoming",
			"status":1,
			"info":desc
		};
		addProject(data,reqProjectList,data);
		$("[name=xmmc]").val("");
		$("[name=xmms]").val("");
	});


	function reqProjectList(data){
		var data={
			"user_id":data.user_id
		};
		getProjectList(data,drawPorjectList);
	}

	function drawPorjectList(data){
		var li_str = "";
		for (var i = 0; i < data.list.length; i++) {
	        li_str += '<li>'
			//li_str += '<img src="http://kr.zhiyicx.com/data/upload/2015/0719/21/55aba5ed37c01.png" style="width:115px;height:115px;">'
			li_str += '<span>'+data.list[i].name+'</span>'
			li_str += '<div class="operator">'
			li_str += '<div class="btn load" name="'+data.list[i].name+'" value='+data.list[i].id+'>加载</div>'
	        li_str += '<div class="btn del" value='+data.list[i].id+'>删除</div>'
	        li_str += '<div class="btn edit">修改</div></div></li>'
		};
		$(".project_list ul").html(li_str);
		$(".project_list ul li .load").click(function(e){
			setCurrentProject(Number($(this).attr("value")));
			var args={
			"pid":getCurrentPorject()
			}
			flowchartInfo.getFlowchart(args,function(result){
				projectInfo=result;
				alert($(this).attr("name")+"加载成功");
			});
		});
		$(".project_list ul li .del").click(function(e){
			var pid = Number($(this).attr("value"));
			var data = {id:pid,
			            user_id:1};
			deleteProject(data,reqProjectList);
		});
	}

	function drawSaveDialog(data,call){
		var width =  500;
    	var fc_top=$(".mod").offset().top+100;
		var fc_left=$(".mod").offset().left+$(".mod").width()/2-width/2;
    	kenrobotDialog.show(1,{
    		"width":width,
			"top":fc_top,
			"left":fc_left,
			"title":"保存信息",
			"isSplit":0,
			"contents":[
				{
					"title":"项目名称",
					"inputType":"text",
					"inputHolder":"",
					"inputInitValue":data.xmmc_init_value,
					"inputKey":"xmmc"
				},
				{
					"title":"项目描述",
					"inputType":"textarea",
					"inputHolder":"",
					"inputInitValue":data.xmms_init_value,
					"inputKey":"xmms"
				},
			]
		},call);
	}

	function saveProjectInfo(data){
		var name = data.xmmc;
		var desc = data.xmms;
		if(!name){
			alert("请输入项目名称！");
			return;
		};
		if(!desc){
			alert("请输入项目描述！");
			return;
		};
		var data={
			"name":name,
			"scope":1,
			"user_id":1,
			"user_name":"xiaoming",
			"status":1,
			"info":desc
		};
		var pid = getCurrentPorject();
		if(pid==null){
			addProject(data,flowchartInfo.addFlowchart,{"info":projectInfo});
		}else{
			data.id=pid;
			editProject(data,flowchartInfo.addFlowchart,{"pid":pid,"info":projectInfo});
		}
	}

	reqProjectList({'user_id':1})

	return {reqProjectList:reqProjectList,
		    getCurrentPorject:getCurrentPorject,
		    drawSaveDialog:drawSaveDialog,
		    getProjectInfo:getProjectInfo,
		    saveProjectInfo:saveProjectInfo,
	       }

});