sync_scroll = {
    on: true,
    setOn: function (on) {
        sync_scroll.on = on;
        if(sync_scroll.isOn()) {
            chrome.browserAction.setBadgeText({
                text: 'on'
            });
        } else {
            chrome.browserAction.setBadgeText({
                text: 'off'
            });
        }
    },
    isOn: function () {
        return sync_scroll.on;
    },
    toggle: function () {
        sync_scroll.setOn(!sync_scroll.isOn());
    },
    current_id: null,
    current_index: null
}

chrome.browserAction.onClicked.addListener(function (){
    sync_scroll.toggle();
});

var selectedTabs = {};

chrome.tabs.onHighlighted.addListener(function (highlightedInfo) {
	selectedTabs[highlightedInfo.windowId] = highlightedInfo.tabIds;
	console.log('highlighted on windowId:' + highlightedInfo.windowId + ' tabIds:' + highlightedInfo.tabIds.join(','));
});

var ports = {};

chrome.extension.onConnect.addListener(function (port) {
	console.assert(port.name === 'sync_scroll');
	var tab_id = port.sender.tab.id;
	ports[tab_id] = port;
	console.log('port is connected from tabId:' + tab_id);
	port.onMessage.addListener(function emit(msg) {
		if (!sync_scroll.isOn()) {
			return;
		}
		if (msg.window_scrollY) {
			var x = msg.window_scrollX;
			var y = msg.window_scrollY;
			console.log('background receives scrollXY:' + x + ',' + y);
			sendToSelectedTabs(port, msg);
		}
	});
});

function selectedTabIds() {
	var tabIds = [],
		window_id;
	for (window_id in selectedTabs) {
		if (selectedTabs.hasOwnProperty(window_id)) {
			tabIds.push(selectedTabs[window_id]);
		}
	}
	return tabIds;
}

function sendToSelectedTabs(port, msg) {
	var tabIds = selectedTabIds(),
		i;
	for (i = 0; i < tabIds.length; i++) {
		var tab_id = tabIds[i];
		if (ports[tab_id] && ports[tab_id] !== port) {
			ports[tab_id].postMessage(msg);
			console.log('background sends ' + msg.window_scrollX + ',' + msg.window_scrollY + ' to tabId:' + tab_id);
		}
	}
}

sync_scroll.setOn(true);
