let dataStore = []; // holds the sync store
const syncKey = 's_defs'; // globals, mmm, ( ͡° ͜ʖ ͡°)

main();

function main() {
	getSync().then(data => dataStore = data).then(_=>{
		// gets only the matched gists which are currently active
		const arr = dataStore.filter(item=>item.active&&new RegExp(item.matches).test(location.href));
		// now get the metadata
		for( const item of arr ) { // we could retain the order of inclusion, 
			//but I do not allow re-ordering right now.. so once I do look into that.
			xhr(`https://api.github.com/gists/${item.id}`).then(parseMetaData.bind(null, item)).then(metadata=>{
				if( item.active ) {
					injector(metadata.files);
				}
			});
		}
	});
}

function parseMetaData(item, hr) {
	const data = JSON.parse(hr.responseText);
	const currentTimestamp = new Date(Number(item.updated));
	const gistTimestamp = new Date(data.updated_at).getTime();
	if( currentTimestamp !== gistTimestamp ) {
		item.updated = gistTimestamp;
		if(gistTimestamp > currentTimestamp) {
			item.active = false;
			chrome.runtime.sendMessage({'gistChanged':'yes'}); // notify the popup change.
		}
		return saveSync().then(_=>data); // save sync then return the metadata
	}
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

function injector(files) {
	for( const fileName in files ) {
		const maybeExtension = fileName.split('.').pop().toLowerCase();
		console.log('injecting', fileName);
		if( maybeExtension === 'js' ) {
			inject('script', files[fileName].content, true);
		} else if (maybeExtension === 'css' ) {
			inject('style', files[fileName].content);
		} else {
			console.error('RoboGist encountered an error', `file ${fileName} is not JavaScript or CSS. Please only include JavaScript or CSS files for injection.`);
		}
	}
}

function inject(type, content, isHead = false) {
	const s = document.createElement(type);
	if( type === 'js' ) { // TODO: add wrap options
		contnet = '(function() {' + content + '}())'
	}
	s.textContent = content;
	document[isHead?'head':'body'].appendChild(s);
}


function saveSync(data = dataStore) {
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