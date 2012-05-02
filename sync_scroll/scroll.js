sync_scroll = {
	port: chrome.extension.connect({name: "sync_scroll"}),
	focused: true
}

window.addEventListener('scroll', function () {
	if(!sync_scroll.focused) {
		return;
	}
	var x = window.scrollX;
	var y = window.scrollY;
	console.log('tab sends scrollXY:' + x + ',' + y);
	sync_scroll.port.postMessage({
		window_scrollX: x,
		window_scrollY: y
	});
});

window.addEventListener('focus', function () {
	console.log('tab onfocus');
	sync_scroll.focused = true;
});

window.addEventListener('blur', function () {
	console.log('tab onblur');
	sync_scroll.focused = false;
});


sync_scroll.port.onMessage.addListener(function (msg) {
	if (msg.window_scrollY && !sync_scroll.focused) {
		var x = msg.window_scrollX;
		var y = msg.window_scrollY;
		console.log('tab receives scrollXY:' + x + ',' + y);
		window.scroll(x, y);
	}
});