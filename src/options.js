// GLOBALS ( ͡° ͜ʖ ͡°)
// --------------------
const inputId = document.getElementById('gist-id');
const inputMatches = document.getElementById('url-matches');
const btnSave = document.getElementById('add-gist');
const gistlist = document.getElementById('gist-list');
let store = []; // currently active gists
// --------------------

// popup requests data from the page loading it.
chrome.runtime.onMessage.addListener( (request, sender, done) => {
	if( request.getActiveGists ) {
		done({data:store});
	}
});


btnSave.addEventListener('click', _=>{
	const id = inputId.value;
	const matches = inputMatches.value;
	if( !id || !matches ) return;

	getStore('s_defs').then(ret=>{
		const newData = ret.s_defs || [];
		newData.push({id, matches});
		return setStore('s_defs', newData);
	}).then(data => {
		run(data);
	});
});

getStore('s_defs').then(ret=>run(ret.s_defs));

function run(sdefs = []) {
	const pArr = sdefs.map(def=>lookupGist(def.id).catch(err=>{
		console.error('xhr error', err);
	}));
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
		if( store ) buildList(); // handles empty store. 
	});
}

function buildList() {
	// TODO:: this gives me Cancer, fix it. 
	gistlist.innerHTML = '';
	for( const item of store ) {
		const htmlString = `
			<li>
				<h4><a href="${item.url}" target="_blank">${item.id}</a></h4>
				<p>${item.description}</p>
				<p>Files: 
					${Object.keys(item.files).join(',')}
				</p>
				<p>Matches: 
					${item.matches}
				</p>
				<div><small><a href="${item.owner.html_url}">${item.owner.login}</a> updated on ${item.updated_at}</small></div>
			</li>
		`;
		const tmp = document.createElement('div');
		tmp.innerHTML = htmlString;
		const li = tmp.children[0];
		const btnRemove = document.createElement('button');
		btnRemove.textContent = ' remove ';
		btnRemove.onclick = removeGist.bind(null, item.id);
		li.appendChild(btnRemove);
		gistlist.appendChild(li);
	}
}

function removeGist(id) {
	getStore('s_defs').then(ret=>{
		const newData = ret.s_defs || [];
		return setStore('s_defs', newData.filter(item=>item.id !== id));
	}).then(data => {
		run(data);
	});
}

function lookupGist(id) {
	return xhr(`https://api.github.com/gists/${id}`)
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