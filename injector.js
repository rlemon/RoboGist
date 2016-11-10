getSync().then(store => {
	const {list} = store;
	const usable = list.filter(item => {
		return item.active && new RegExp(item.matches).test(location.href)
	});
	const promises = usable.map(item=>xhr(`https://api.github.com/gists/${item.id}`));
	Promise.all(promises).then( returns => {
		const gistObjects = returns.map(ret => JSON.parse(ret.responseText));
		for( let index = 0; index < gistObjects.length; index++ ) {
			const gistObject = gistObjects[index];
			const refObject = usable[index];
			if( gistObject.updated_at !== refObject.updated ) {
				chrome.runtime.sendMessage({'gistChanged':'yes'}); 
				console.log(`${refObject.name} has been updated. please re-activate it from the options page.`)
				Object.assign(list.find(item => item.id === refObject.id), {updated: gistObject.updated_at, active: false, hasUpdated: true});
				return saveSync({list});
			}
			injector(gistObject.files, refObject.name);
		}
	});
});

function injector(files, name) {
	console.groupCollapsed(`%cRoboGist -> ${name}`, 'color: #FF4136; font-size: normal;')
	for( const fileName in files ) {
		const maybeExtension = fileName.split('.').pop().toLowerCase();
		console.log(`load ${fileName}`);
		if( maybeExtension === 'js' ) {
			inject('script', files[fileName].content, true);
		} else if (maybeExtension === 'css' ) {
			inject('style', files[fileName].content);
		} else {
			console.error('RoboGist encountered an error', 
				`file ${fileName} is not JavaScript or CSS. Please only include JavaScript or CSS files for injection.`);
		}
	}
	console.groupEnd();
}

function inject(type, content, isHead = false) {
	const s = document.createElement(type);
	if( type === 'js' ) { // TODO: add wrap options
		contnet = '(function() {' + content + '}())'
	}
	s.textContent = content;
	document[isHead?'head':'body'].appendChild(s);
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