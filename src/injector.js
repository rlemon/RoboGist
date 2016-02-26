// GLOBALS ( ͡° ͜ʖ ͡°)
// --------------------
let store = []; // currently active gists
// --------------------

chrome.runtime.onMessage.addListener( (request, sender, done) => {
	if( request.getActiveGists ) {
		done({data:store});
	}
});

getStore('s_defs').then(ret=>run(ret.s_defs));

function run(sdefs = []) {
	const pArr = sdefs.filter(def=>new RegExp(def.matches).test(location.href))
					.map(def=>lookupGist(def.id));

	Promise.all(pArr).then(data=> {
		store = data.map(item=>{
			const tmp = JSON.parse(item.responseText);
			const ref = sdefs.shift();
			return Object.assign(tmp, ref);
		});
		runScripts();
	});
}

function runScripts() {
	for( const script of store ) {
		console.log(script);
		for( const file of script.files ) {
			xhr(`https://gist.githubusercontent.com/${script.owner}/${script.id}/raw/${file}`)
				.then(hr=>inject(hr.responseText, false));
		}
	}
}

function lookupGist(id) {
	return xhr(`https://gist.github.com/${id}.json`);
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
function inject(content, isHead = false) {
 	const s = document.createElement('script');
 	s.textContent = '(function() {' + content + '}())';
 	document[isHead?'head':'body'].appendChild(s);
}
