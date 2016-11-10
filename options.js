const gistListElm = document.getElementById('gist-list');
const addGistElm = document.getElementById('add-gist');
const overlayElm = document.getElementById('overlay');
const modalElm = document.getElementById('modal');
const saveElm = document.getElementById('save');
const inputName = document.getElementById('gist-name');
const inputID = document.getElementById('gist-id');
const inputMatches = document.getElementById('gist-matches');


saveElm.addEventListener('click', saveGist);
addGistElm.addEventListener('click', showModal);

gistListElm.addEventListener('click', event => {
	const {target} = event;
	if( target.classList.contains('trash') ) {
		return deleteGist(target.dataset);
	}
	if( target.classList.contains('checkbox') ) {
		return toggleGist(target.previousElementSibling.dataset.id);
	}
	if( target.classList.contains('reload') ) {
		return reloadGist(target.dataset.id);
	}
});

window.onload = buildlist;
chrome.runtime.sendMessage({'gistChanged':'no'});

function buildlist() {
	while(gistListElm.hasChildNodes()) {
		gistListElm.removeChild(gistListElm.lastChild);
	}
	getSync().then(store => {
		const {list} = store;
		for( const item of list ) {
			gistListElm.innerHTML += `
				<tr>
					<td>
						<input type="checkbox" ${item.active ? 'checked' : ''} id="checkbox-${item.id}" data-id="${item.id}" /><label class="checkbox" for="checkbox-${item.id}" title="toggle active"></label>
					</td>
					<td>${item.name}</td>
					<td><a href="http://gist.github.com/${item.id}" target="_blank">${item.id}</a></td>
					<td>${item.matches}</td>
					<td>${item.updated}</td>
					<td><button class="reload" data-id="${item.id}" title="recheck updated time">&#8635;</button>  <button class="trash" data-id="${item.id}" data-name="${item.name}" title="delete gist">&#128465;</button></td>
				</tr>
			`;
		}
	});
}

function toggleGist(id) {
	getSync().then(store => {
		const {list} = store;
		// maybe I should be pulling a new date on this action if toggling on??
		return saveSync({list: list.map(item => {
			if( item.id === id ) item.active = !item.active;
			return item;
		})});
	}).then(buildlist);
}

function deleteGist({id, name}) {
	if( !confirm(`are you sure you want to delete ${name}`) ) return;

	getSync().then(store => {
		const {list} = store;
		return saveSync({list:list.filter(item => item.id !== id)});
	}).then(buildlist);	
}

function reloadGist(id) {
	getSync().then(store => {
		const {list} = store;
		return xhr(`https://api.github.com/gists/${id}`).then(hr => {
			const data = JSON.parse(hr.responseText);
			const updated = data.updated_at;
			Object.assign(list.find(item => item.id === id ), {updated});
			return saveSync({list})
		});
	}).then(buildlist);
}

function saveGist(event) {
	event.preventDefault();
	
	const [name, id, matches] = [inputName, inputID, inputMatches].map(elm=>elm.value.trim());
	getSync().then(store => {
		const {list} = store;
		if( list.some(item => item.id === id) ) {
			return Promise.reject('duplicate ids');
		}
		return xhr(`https://api.github.com/gists/${id}`).then(hr => {
			const data = JSON.parse(hr.responseText);
			const updated = data.updated_at;
			console.log( name, id, matches, updated ); // all the info we need, assume active on add
			list.push({name, id, matches, updated, active: true });
			return saveSync({list})
		});
	}).then(hideModal).then(buildlist);
}


function showModal() {
	overlayElm.addEventListener('click', hideModal);
	modalElm.querySelector('.close').addEventListener('click', hideModal);
	overlay.hidden = modalElm.hidden = false;
}
function hideModal() {
	overlayElm.removeEventListener('click', hideModal);
	modalElm.querySelector('.close').removeEventListener('click', hideModal);
	overlay.hidden = modalElm.hidden = true;
	[inputName, inputID, inputMatches].map(elm=>elm.value='');
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