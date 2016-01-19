modulex.add("dd",["util","base","ua","node","event-dom/gesture/basic","event-dom/gesture/pan"],function(e,t,r){var n,a,o,i,s,d,l=e("util"),u=e("base"),g=e("ua"),c=e("node"),v=e("event-dom/gesture/basic"),f=e("event-dom/gesture/pan");n=function(e){function t(e){var t=e.get("activeDrag").get("activeHandler"),r="auto";t&&(r=t.css("cursor")),"auto"===r&&(r=e.get("dragCursor")),e._shim.css({cursor:r,display:"block"}),b&&E.call(e)}function r(e){var t=e.get("drops");e.setInternal("validDrops",[]),t.length&&f.each(t,function(e){e._active()})}function n(e){var t=e.get("drops");e.setInternal("validDrops",[]),t.length&&f.each(t,function(e){e._deActive()})}function a(e){var t=e.offset();return{left:t.left,right:t.left+(e.__ddCachedWidth||e.outerWidth()),top:t.top,bottom:t.top+(e.__ddCachedHeight||e.outerHeight())}}function o(e,t){return e.left<=t.left&&e.right>=t.left&&e.top<=t.top&&e.bottom>=t.top}function i(e){return e.top>=e.bottom||e.left>=e.right?0:(e.right-e.left)*(e.bottom-e.top)}function s(e,t){var r=Math.max(e.top,t.top),n=Math.min(e.right,t.right),a=Math.min(e.bottom,t.bottom),o=Math.max(e.left,t.left);return{left:o,right:n,top:r,bottom:a}}function d(e,t){return o(a(e),t)}function v(e){e&&(e.__ddCachedWidth=e.outerWidth(),e.__ddCachedHeight=e.outerHeight())}var f=l,h=u,p=g,_=c,m=window,D=m.document,T=_(D),C=_(m),b=6===p.ie,N=30,y=999999,E=f.throttle(function(){var e,t=this;(e=t.get("activeDrag"))&&e.get("shim")&&t._shim.css({width:T.width(),height:T.height()})},N),S=function(e){e._shim=_('<div style="background-color:red;position:'+(b?"absolute":"fixed")+";left:0;width:100%;height:100%;top:0;cursor:"+e.get("dragCursor")+";z-index:"+y+';"></div>').prependTo(D.body||D.documentElement).css("opacity",0),S=t,b&&C.on("resize scroll",E,e),t(e)},I=h.extend({addDrop:function(e){this.get("drops").push(e)},removeDrop:function(e){var t=this,r=t.get("drops"),n=f.indexOf(e,r);-1!==n&&r.splice(n,1)},start:function(e,t){var n=this;n.setInternal("activeDrag",t),t.get("shim")&&S(n),n.__needDropCheck=0,t.get("groups")&&(r(n),n.get("validDrops").length&&(v(t.get("node")),n.__needDropCheck=1))},addValidDrop:function(e){this.get("validDrops").push(e)},_notifyDropsMove:function(e,t){var r,n=this,o=n.get("validDrops"),l=t.get("mode"),u=0,g=0,c=a(t.get("node")),v=i(c);f.each(o,function(r){if(r.get("disabled"))return void 0;var n,o=r.getNodeFromTarget(e,t.get("dragNode")[0],t.get("node")[0]);if(!o)return void 0;if("point"===l)d(o,t.mousePos)&&(n=i(a(o)),u?g>n&&(u=r,g=n):(u=r,g=n));else if("intersect"===l)n=i(s(c,a(o))),n>g&&(g=n,u=r);else if("strict"===l&&(n=i(s(c,a(o))),n===v))return u=r,!1;return void 0}),r=n.get("activeDrop"),r&&r!==u&&(r._handleOut(e),t._handleOut(e)),n.setInternal("activeDrop",u),u&&(r!==u?u._handleEnter(e):u._handleOver(e))},move:function(e,t){var r=this;r.__needDropCheck&&r._notifyDropsMove(e,t)},end:function(e){var t=this,r=t.get("activeDrop");t._shim&&t._shim.hide(),n(t),r&&r._end(e),t.setInternal("activeDrop",null),t.setInternal("activeDrag",null)}},{ATTRS:{dragCursor:{value:"move"},activeDrag:{},activeDrop:{},drops:{valueFn:function(){return[]}},validDrops:{valueFn:function(){return[]}}}}),P=new I;return P.inRegion=o,P.region=a,P.area=i,P.cacheWH=v,P.PREFIX_CLS="ks-dd-",e=P}(),a=function(e){function t(e){return function(){this._isValidDrag&&e.apply(this,arguments)}}function r(){b.body.onselectstart=d,b.body.releaseCapture&&b.body.releaseCapture()}function a(){d=b.body.onselectstart,b.body.onselectstart=i,b.body.setCapture&&b.body.setCapture()}function o(e){e.preventDefault()}function i(){return!1}function s(e){this._isValidDrag=0,this.onGestureStart(e)}var d,h=v,p=n,_=u,m=f,D=l,T=g,C=c,b=document,N=C(b),y=D.each,E=T.ie,S=p.PREFIX_CLS,I=t(function(e){this._start(e)}),P=t(function(e){this._move(e)}),X=t(function(e){this._end(e)}),A=_.extend({initializer:function(){var e=this;e.addTarget(p),e._allowMove=e.get("move")},_onSetNode:function(e){var t=this;t.setInternal("dragNode",e)},onGestureStart:function(e){var t=this,r=e.target;if(t._checkDragStartValid(e)){if(!t._checkHandler(r))return;t._prepare(e)}},getEventTargetEl:function(){return this.get("node")},start:function(){var e=this,t=e.getEventTargetEl();t&&t.on(m.PAN_START,I,e).on(m.PAN,P,e).on(m.PAN_END,X,e).on(h.START,s,e).on("dragstart",o)},stop:function(){var e=this,t=e.getEventTargetEl();t&&t.detach(m.PAN_START,I,e).detach(m.PAN,P,e).detach(m.PAN_END,X,e).detach(h.START,s,e).detach("dragstart",o)},_onSetDisabled:function(e){var t=this,r=t.get("dragNode");r&&r[e?"addClass":"removeClass"](S+"-disabled"),t[e?"stop":"start"]()},_checkHandler:function(e){var t=this,r=t.get("handlers"),n=0;return y(r,function(r){return r[0]===e||r.contains(e)?(n=1,t.setInternal("activeHandler",r),!1):void 0}),n},_checkDragStartValid:function(e){var t=this;return t.get("primaryButtonOnly")&&1!==e.which?0:1},_prepare:function(e){var t=this;t._isValidDrag=1,E&&(a(),N.on(h.END,{fn:r,once:!0})),t.get("halt")&&e.stopPropagation(),"mouse"===e.gestureType&&e.preventDefault(),t._allowMove&&t.setInternal("startNodePos",t.get("node").offset())},_start:function(e){var t=this;"touch"===e.gestureType&&e.preventDefault(),t.mousePos={left:e.pageX,top:e.pageY},p.start(e,t),t.fire("dragstart",{drag:t,gestureType:e.gestureType,startPos:e.startPos,deltaX:e.deltaX,deltaY:e.deltaY,pageX:e.pageX,pageY:e.pageY}),t.get("dragNode").addClass(S+"dragging")},_move:function(e){var t=this,r=e.pageX,n=e.pageY;"touch"===e.gestureType&&e.preventDefault(),t.mousePos={left:r,top:n};var a={drag:t,gestureType:e.gestureType,startPos:e.startPos,deltaX:e.deltaX,deltaY:e.deltaY,pageX:e.pageX,pageY:e.pageY},o=t._allowMove;if(o){var i=t.get("startNodePos"),s=i.left+e.deltaX,d=i.top+e.deltaY;a.left=s,a.top=d,t.setInternal("actualPos",{left:s,top:d}),t.fire("dragalign",a)}var l=1;t.fire("drag",a)===!1&&(l=0),p.move(e,t),t.get("preventDefaultOnMove")&&e.preventDefault(),l&&o&&t.get("node").offset(t.get("actualPos"))},stopDrag:function(){this._isValidDrag&&this._end()},_end:function(e){e=e||{};var t,r=this;r._isValidDrag=0,r.get("node").removeClass(S+"drag-over"),r.get("dragNode").removeClass(S+"dragging"),(t=p.get("activeDrop"))?r.fire("dragdrophit",{drag:r,drop:t}):r.fire("dragdropmiss",{drag:r}),p.end(e,r),r.fire("dragend",{drag:r,gestureType:e.gestureType,startPos:e.startPos,deltaX:e.deltaX,deltaY:e.deltaY,pageX:e.pageX,pageY:e.pageY})},_handleOut:function(){var e=this;e.get("node").removeClass(S+"drag-over"),e.fire("dragexit",{drag:e,drop:p.get("activeDrop")})},_handleEnter:function(e){var t=this;t.get("node").addClass(S+"drag-over"),t.fire("dragenter",e)},_handleOver:function(e){this.fire("dragover",e)},destructor:function(){this.stop()}},{name:"Draggable",ATTRS:{node:{setter:function(e){return e instanceof C?void 0:C(e)}},dragNode:{},shim:{value:!1},handlers:{valueFn:function(){return[]},getter:function(e){var t=this;return e.length||(e[0]=t.get("node")),y(e,function(r,n){"function"==typeof r&&(r=r.call(t)),"string"==typeof r&&(r=t.get("node").one(r)),r.nodeType&&(r=C(r)),e[n]=r}),t.setInternal("handlers",e),e}},activeHandler:{},mode:{value:"point"},disabled:{value:!1},move:{value:!1},primaryButtonOnly:{value:!0},halt:{value:!0},groups:{value:!0},startNodePos:{},actualPos:{},preventDefaultOnMove:{value:!0}},inheritedStatics:{DropMode:{POINT:"point",INTERSECT:"intersect",STRICT:"strict"}}});return e=A}(),o=function(e){var t=n,r=a,o=t.PREFIX_CLS,i=c;return e=r.extend({_onSetNode:function(){},_onSetDisabled:function(e){var t=this,r=t.get("container");r&&(r[e?"addClass":"removeClass"](o+"-disabled"),t[e?"stop":"start"]())},getEventTargetEl:function(){return this.get("container")},onGestureStart:function(e){var t,r,n=this;if(n._checkDragStartValid(e)){var a=n.get("handlers"),o=i(e.target);t=a.length?n._getHandler(o):o,t&&(r=n._getNode(t)),r&&(n.setInternal("activeHandler",t),n.setInternal("node",r),n.setInternal("dragNode",r),n._prepare(e))}},_getHandler:function(e){for(var t=this,r=t.get("container"),n=t.get("handlers");e&&e[0]!==r[0];){for(var a=0;a<n.length;a++){var o=n[a];if(e.test(o))return e}e=e.parent()}return null},_getNode:function(e){return e.closest(this.get("selector"),this.get("container"))}},{ATTRS:{container:{setter:function(e){return i(e)}},selector:{},handlers:{valueFn:function(){return[]},getter:0}}})}(),i=function(e){function t(e,t){if(t===!0)return 1;for(var r in e)if(t[r])return 1;return 0}var r=c,a=n,o=u,i=a.PREFIX_CLS,s=l;return e=o.extend({initializer:function(){var e=this;e.addTarget(a),a.addDrop(this)},getNodeFromTarget:function(e,t,r){var n=this.get("node"),a=n[0];return a===t||a===r?null:n},_active:function(){var e=this,r=a.get("activeDrag"),n=e.get("node"),o=e.get("groups"),s=r.get("groups");t(o,s)?(a.addValidDrop(e),n&&(n.addClass(i+"drop-active-valid"),a.cacheWH(n))):n&&n.addClass(i+"drop-active-invalid")},_deActive:function(){var e=this.get("node");e&&e.removeClass(i+"drop-active-valid").removeClass(i+"drop-active-invalid")},__getCustomEvt:function(e){return s.mix({drag:a.get("activeDrag"),drop:this},e)},_handleOut:function(){var e=this,t=e.__getCustomEvt();e.get("node").removeClass(i+"drop-over"),e.fire("dropexit",t)},_handleEnter:function(e){var t=this,r=t.__getCustomEvt(e);r.drag._handleEnter(r),t.get("node").addClass(i+"drop-over"),t.fire("dropenter",r)},_handleOver:function(e){var t=this,r=t.__getCustomEvt(e);r.drag._handleOver(r),t.fire("dropover",r)},_end:function(){var e=this,t=e.__getCustomEvt();e.get("node").removeClass(i+"drop-over"),e.fire("drophit",t)},destructor:function(){a.removeDrop(this)}},{name:"Droppable",ATTRS:{node:{setter:function(e){return e?r(e):void 0}},groups:{valueFn:function(){return{}}},disabled:{}}})}(),s=function(e){function t(){var e=this,t=e.get("container"),r=[],n=e.get("selector");t.all(n).each(function(e){a.cacheWH(e),r.push(e)}),e.__allNodes=r}var r=c,a=n,o=i,s=l,d=o.extend({initializer:function(){a.on("dragstart",t,this)},getNodeFromTarget:function(e,t,r){var n={left:e.pageX,top:e.pageY},o=this,i=o.__allNodes,d=0,l=Number.MAX_VALUE;return i&&s.each(i,function(e){var o=e[0];if(o!==r&&o!==t){var i=a.region(e);if(a.inRegion(i,n)){var s=a.area(i);l>s&&(l=s,d=e)}}}),d&&(o.setInternal("lastNode",o.get("node")),o.setInternal("node",d)),d},_handleOut:function(){var e=this;e.callSuper(),e.setInternal("node",0),e.setInternal("lastNode",0)},_handleOver:function(e){var t=this,r=t.get("node"),n=d.superclass._handleOut,a=t.callSuper,o=d.superclass._handleEnter,i=t.get("lastNode");i[0]!==r[0]?(t.setInternal("node",i),n.apply(t,arguments),t.setInternal("node",r),o.call(t,e)):a.call(t,e)},_end:function(e){var t=this;t.callSuper(e),t.setInternal("node",0)}},{ATTRS:{lastNode:{},selector:{},container:{setter:function(e){return r(e)}}}});return e=d}(),d=function(e){var t=n,r=a,d=o,l=s,u=i;return e={version:"1.0.1",Draggable:r,DDM:t,Droppable:u,DroppableDelegate:l,DraggableDelegate:d}}(),r.exports=d});