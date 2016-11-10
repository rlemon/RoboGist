chrome.runtime.onMessage.addListener((request, sender, done) => {
	if( request.gistChanged === 'yes' ) {
		chrome.browserAction.setIcon({
			path: 'icon-alt.png',
			tabId: sender.tab.id
		});
	} else if( request.gistChanged === 'no' ) {
		chrome.browserAction.setIcon({
			path: 'icon.png',
			tabId: sender.tab.id
		});
	}
});