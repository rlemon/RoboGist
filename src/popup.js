const gistListElm = document.getElementById('gist-list');
const optionsPageBtn = document.getElementById('open-options');
const syncKey = 's_defs'; // globals, mmm, ( ͡° ͜ʖ ͡°)

chrome.runtime.sendMessage({'gistChanged':'no'})

gistListElm.addEventListener('click', e=> {
	// delegate checkbox 'activates' 
	if( e.target.classList.contains('checkbox') ) {
		toggleGist(e.target.previousElementSibling.dataset.id);
	}
});	

optionsPageBtn.addEventListener('click', e=>{
	chrome.runtime.openOptionsPage(window.close.bind(window));
});

main();

function main() {
	getSync().then((syncData = []) => {
		clearElement(gistListElm);
		// we only wanna show the items applicable to the current tab
		chrome.tabs.query({currentWindow: true, active: true}, tabs => {
			for( const item of syncData ) {
				// shut up
				if( !item || !(new RegExp(item.matches).test(tabs[0].url)) ) {
					continue;
				}
				const html = `
					<tr>
						<td>
							<input type="checkbox" ${item.active ? 'checked' : ''} id="checkbox-${item.id}" data-id="${item.id}" /><label class="checkbox" for="checkbox-${item.id}"></label>
						</td>
						<td>${item.name}</td>
						<td>${item.id}</td>
						<td>${new Date(item.updated).toLocaleString() || 'unknown'}</td>
					</tr>
				`;
				// no really, shut up. it is what it is
				gistListElm.innerHTML += html;
			}
		});
	});
}

function toggleGist(id) {
	getSync().then((data = []) =>{
		data = data.map(item=>{
			if( item.id === id ) {
				item.active = !item.active;
			}
			return item;
		});
		return saveSync(data);
	}).then(main);
}

// I really need browserify or something
function clearElement(element) {
	while(element.hasChildNodes()) {
		element.removeChild(element.lastChild);
	}
}
function saveSync(data = []) {
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