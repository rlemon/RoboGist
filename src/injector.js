const xhr = require('./modules/xhr.js');
const syncStore = require('./modules/syncStore.js');
const [log, error] = require('./modules/logger.js');
const dataStore = [];

main();

function main() {
	syncStore.get().then(data => dataStore = data).then(_=> {
		const gistInfo = dataStore.filter( item => {
			return item.active && new RegExp(item.matches).test(location.href);
		});
		const promisedInfo = gistInfo.map(item=>xhr(`https://api.github.com/gists/${item.id}`)); // returns hr object for all after evaluation -rlemon
		Promise.all(promisedInfo).then(hrs => { // I need access to the gistInfo values as well as the promisedInfo data... so I've introduced this anti-pattern -rlemon
			hrs.forEach((hr, index) => {
				const data = JSON.parse(hr.responseText);
				const myTime = new Date(Number(gistInfo[index].updated));
				const gistTime = new Date(data.updated_at).getTime();
				if( myTime !== gistTime ) {
					gistInfo[index].updated = gistTime;
					if( gistTime > myTime ) {
						gistInfo[index].active = false;
						return chrome.runtime.sendMessage({'gistChanged':'yes'});
					}
				}
				injector(data.files);
			});
		});
		return syncStore.set(dataStore);
	});
}

function injector(files) {
	for( const fileName in files ) {
		const maybeTheExtension = fileName.split('.').pop().toLowerCase();
		if( maybeTheExtension === 'js' ) {
			log(`injecting script ${fileName}`);
			inject('script', files[fileName].content, true);
		} else if ( maybeTheExtension === 'css' ) {
			log(`injecting stylesheet ${fileName}`);
			inject('style', files[fileName].content);
		} else {
			error(`file ${fileName} is not JavaScript or CSS. Please only include JavaScript or CSS files for injection.`);
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