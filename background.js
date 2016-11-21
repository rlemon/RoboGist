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

chrome.runtime.onMessageExternal.addListener((request, sender, callback) => {
	if( 'checkInstalled' in request ) {
		const id = request.checkInstalled;
		getSync().then(store => {
			const {list} = store;
			const installed = list.some(item => item.id === id );
			callback({installed});
		});
	} else {
		const {id, name, matches} = request.gistInformation;
		saveGist(name, id, matches);
		callback({message: 'done'})
	}
	return true;
});

function saveGist(name, id, matches) {
	getSync().then(store => {
		const {list} = store;
		if( list.some(item => item.id === id) ) {
			return Promise.reject('duplicate ids');
		}
		return xhr(`https://api.github.com/gists/${id}`).then(hr => {
			const data = JSON.parse(hr.responseText);
			const updated = data.updated_at;
			list.push({name, id, matches, updated, active: true, hasUpdated: false });
			return saveSync({list})
		});
	})
}

function xhr(url, type = 'GET', data = null) {
	return new Promise((resolve, reject) => {
		const hr = new XMLHttpRequest();
		hr.open(type, url, true);
		hr.onload = _ => resolve(hr);
		hr.onerror = reject;
		hr.send(data)
	});
}

function getSync() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get({list: []}, resolve);
	});
}

function saveSync(data = {list:[]}) {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.set(data, _ => resolve(data));
	});
}