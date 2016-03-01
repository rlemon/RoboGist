let dataStore = []; // holds the sync store
let gistStore = []; // holds the gist metadata and code
const syncKey = 's_defs'; // globals, mmm, ( ͡° ͜ʖ ͡°)

main();

function main() {
	getSync().then(data => dataStore = data).then(_=>{
		// gets only the matched gists which are currently active
		const arr = dataStore.filter(item=>item.active&&new RegExp(item.matches).test(location.href));
		// now get the metadata
		for( const item of arr ) {
			xhr(`https://api.github.com/gists/${item.id}`).then(hr => {
				const metadata = JSON.parse(hr.responseText);
				if( new Date(item.updated) < new Date(metadata.updated_at) ) { // we've been updated
					
				}
			})
		}
		// check the updated

		// set inactive if updated recently

		// update the records

		// inject the active scripts.

	});
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

function inject(type, content, isHead = false) {
	const s = document.createElement(type);
	if( type === 'js' ) { // TODO: add wrap options
		contnet = '(function() {' + content + '}())'
	}
	s.textContent = content;
	document[isHead?'head':'body'].appendChild(s);
}


function saveSync(data) {
	const tmp = {};
	tmp[syncKey] = data;
	return new Promise( (resolve, reject) => {
		chrome.storage.sync.set(tmp, _ => resolve(data));
	});
}
function getSync() {
	return new Promise( (resolve, reject) => {
		chrome.storage.sync.get(syncKey, ret => {resolve(ret[syncKey])});
	});
}