define(['jquery', 'eventcenter', 'html2canvas', 'hljs'], function($, eventcenter, _, hljs) {    var myCanvas = "";    var showGuide = null;    function setShowGuid(show) {        showGuide = show;    }    function initNavSecond() {        $(".nav-second li").click(function() {            if ($(this).attr("class").indexOf("active") == -1) {                //加抽屉效果                $(this).parent().find(".active").removeClass("active");                $(this).addClass("active");            } else {                $(this).removeClass("active");            }        });    }    function initTabs() {        $('.tabs li').click(function() {            var className = $(this).attr("class");            if (className && className.indexOf("active") > -1) {                return false;            }            $(this).parent().find(".active").removeClass("active");            $(this).addClass("active");            var index = $(this).index();            html2canvas($("#hardware-container"), {                onrendered: function(canvas) {                    myCanvas = canvas                    $(".mod").hide();                    $(".mod:eq(" + index + ")").show();                    switch (index) {                        case 0:                            eventcenter.delaytrigger('hardware', 'init_container');                            break;                        case 1:                            eventcenter.delaytrigger('flowchart', 'init_container');                            if ($(myCanvas).attr("width") != 0) {                                $("#yjlj-content").html(myCanvas)                                $("#yjlj-content canvas").css("width", "180px");                            }                            if (showGuide)                                showGuide(3);                            break;                    }                }            });        });    }    function initLogin() {        $('.login li a.loginBtn').click(function(e) {            $('#login_dialog').dialog({                title: "登录",                draggable: false,                modal: true,                show: {                    effect: "blind",                    duration: 200                },                hide: {                    effect: "blind",                    duration: 200                },                close: function(event, ui) {                    $('.login li a.loginBtn').blur();                }            });        });        $('.qrLoginBtn, .baseLoginBtn').click(function(e) {            var action = $(this).attr("data-action");            if(action == "qrLogin") {                $(".qrLoginBtn, .qrLogin").removeClass("active");                $(".baseLoginBtn, .baseLogin").addClass("active");                $(".qrLoginBtn").css({display: "none"});                $(".baseLoginBtn").css({display: "block"});            } else {                $(".baseLoginBtn, .baseLogin").removeClass("active");                $(".qrLoginBtn, .qrLogin").addClass("active");                $(".baseLoginBtn").css({display: "none"});                $(".qrLoginBtn").css({display: "block"});            }        });        $('#login_dialog .closeBtn').click(function(e){            $('#login_dialog').dialog('close');        });        var time1 = setInterval(function() {            var key =$('#qrcode_key').val();            $.get('/weixinlogin?key='+key, function(ret) {                if (ret == 2) {                    clearInterval(time1);                };                if (ret == 1) {                    clearInterval(time1);                    window.location.href = "/";                };            });        }, 3000);        $('.submitBtn').click(function(){             $.post('/snspostlogin',             {                email: $('#email').val(),                password: $('#password').val()             },              function(ret) {                if (ret == 1) {                    window.location.href = "/";                };            });        });    }    function init() {        $(document).ready(function() {            initTabs();            initNavSecond();            initLogin();            $('.tabs li:first-child').click();            $('pre code').each(function(i, block) {                hljs.highlightBlock(block);            });        });    }    return {        init: init,        setShowGuid: setShowGuid    }});