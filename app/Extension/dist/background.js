chrome.app.runtime.onLaunched.addListener(function(){chrome.app.window.create("index.html",{resizable:!1,bounds:{width:670,height:440}})}),chrome.runtime.onMessageExternal.addListener(function(e,n,i){e&&"ping"==e&&i({action:"ping",result:"pong"})});