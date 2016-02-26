const inputId = document.getElementById('gist-id');
const inputMatches = document.getElementById('url-matches');
const btnSave = document.getElementById('add-gist');
const gistlist = document.getElementById('gist-list');

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
	const pArr = sdefs.map(def=>lookupGist(def.id));
	Promise.all(pArr).then(data=> {
		const metadata = data.map(item=>{
			const tmp = JSON.parse(item.responseText);
			const ref = sdefs.shift();
			return Object.assign(tmp, ref);
		});
		buildList(metadata);
	});
}

function buildList(list) {
	gistlist.innerHTML = '';
	for( const item of list ) {
		const { description, files, id, owner, matches } = item;
		const htmlString = `
			<li>
				<h4><a href="http://gist.github.com/${id}" target="_blank">${id}</a></h4>
				<p>${description}</p>
				<p>Files: 
					${files.join(',')}
				</p>
				<p>Matches: 
					${matches}
				</p>
				<div><small>${owner}</small></div>
			</li>
		`;
		// ugh, chrome extensions are stupid and I cannot inline any js. :/
		// I should just do this all with something sane.. will redo later. it's just DOM right? 
		// fuck.. 
		const tmp = document.createElement('div');
		tmp.innerHTML = htmlString;
		const li = tmp.children[0];
		const btnRemove = document.createElement('button');
		btnRemove.textContent = ' x ';
		btnRemove.onclick = removeGist.bind(null, id);
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