// GLOBALS ( ͡° ͜ʖ ͡°)
// --------------------
let store = []; // currently active gists
// --------------------

// popup requests data from the page loading it.
chrome.runtime.onMessage.addListener( (request, sender, done) => {
	if( request.getActiveGists ) {
		console.log('done', store);
		done({data:store});
	}
});

getStore('s_defs').then(ret=>run(ret.s_defs));

function run(sdefs = []) {
	const pArr = sdefs.filter(def=>new RegExp(def.matches).test(location.href))
					.map(def=>lookupGist(def.id));

	Promise.all(pArr).then(data=> {
		store = data.map(item=>{
			// so I need the match form the array I build the promises from... 
			// if you know a better way
			// tell me instead of just giving me those
			// judgy eyes. 
			const tmp = JSON.parse(item.responseText);
			tmp.matches = sdefs.shift().matches;
			return tmp;
		});
		console.log(store);
		runScripts();
	});
}

function runScripts() {
	for( const script of store ) {
		for( const fileName in script.files ) {
			const maybeext = fileName.split('.').pop().toLowerCase()
			if( maybeext === 'js') {
				inject('script',script.files[fileName].content);
			} else if (maybeext === 'css' ) {
				inject('style',script.files[fileName].content, true);
			} else {
				console.error('script contains invalid file types.', fileName);
			}
		}
	}
}

function lookupGist(id) {
	return xhr(`https://api.github.com/gists/${id}`);
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

function getStore(itemName) {
	return new Promise((resolve, reject) => {
		try {
			chrome.storage.sync.get(itemName, resolve);
		} catch(e) {
			reject(e);
		}
	});
}
function setStore(name, items) {
	const obj = {};
	obj[name] = items;
	return new Promise((resolve, reject) => {
		try {
			chrome.storage.sync.set(obj, _ => resolve(items));
		} catch(e) {
			reject(e);
		}
	});
}
function inject(type, content, isHead = false) {
 	const s = document.createElement(type);
 	if( type === 'js' ) { // TODO: add wrap options
 		contnet = '(function() {' + content + '}())'
 	}
 	s.textContent = content;
 	document[isHead?'head':'body'].appendChild(s);
}
