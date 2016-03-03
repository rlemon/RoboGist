const gistListElm = document.getElementById('gist-list');
const addGistElm = document.getElementById('add-gist');
const overlayElm = document.getElementById('overlay');
const modalElm = document.getElementById('modal');
const saveElm = document.getElementById('save');
const inputName = document.getElementById('gist-name');
const inputID = document.getElementById('gist-id');
const inputMatches = document.getElementById('gist-matches');
const syncKey = 's_defs'; // globals, mmm, ( ͡° ͜ʖ ͡°)

addGistElm.addEventListener('click', showModal);
saveElm.addEventListener('click', saveGist);
// delegate trash links because 
// a) chrome extensions don't allow inline
// b) I'm too lazy to do the DOM stuff
//    so I'm using strings...
//    exactly like I advocate against...

// fuck.
gistListElm.addEventListener('click', e=> {
	if( e.target.classList.contains('trash') ) {
		removeGist(e.target.dataset.id);
	}
	// delegate checkbox 'activates' 
	if( e.target.classList.contains('checkbox') ) {
		toggleGist(e.target.previousElementSibling.dataset.id);
	}
});	

// tell the background page we've seen the changes. resets the icon.
// this also happens when we open the popup
chrome.runtime.sendMessage({'gistChanged':'no'})

main();

function main() {
	getSync().then((syncData = []) => {
		clearElement(gistListElm);
		for( const item of syncData ) {
			// shut up, this should never hit
			if( !item ) {
				continue;
			}
			const html = `
				<tr>
					<td>
						<input type="checkbox" ${item.active ? 'checked' : ''} id="checkbox-${item.id}" data-id="${item.id}" /><label class="checkbox" for="checkbox-${item.id}"></label>
					</td>
					<td>${item.name}</td>
					<td><a href="http://gist.github.com/${item.id}" target="_blank">${item.id}</a></td>
					<td>${item.matches}</td>
					<td>${new Date(item.updated).toLocaleString() || 'unknown'}</td>
					<td><button class="trash" data-id="${item.id}">&#128465;</button></td>
				</tr>
			`;
			// no really, shut up. it is what it is
			gistListElm.innerHTML += html;
		}
	});
}

function saveGist(e) {
	e.preventDefault();
	// you can pretty much guarentee anything that I write
	// that touches the DOM will be ugly.
	// the DOM is ugly. 
	// so is your face....
	const [name, id, matches] = [inputName, inputID, inputMatches].map(elm=>elm.value.trim());
	getSync().then((data = []) =>{
		if( data.some(item=>item.id === id) ) {
			alert('That ID already is in use'); // TODO:: replace with non blocking notification library
			return -1;
		}
		data.push({name,id,matches,active:true,updated:Date.now()});
		return saveSync(data);
	}).then(data=>{
		if( data === -1 ) return; // yea.. this is how I exit 
		hideModal();
		main();
	});
	// I'm sorry
}

function removeGist(id) {
	// I hate confirms... but I also hate fat fingers. I'll replace with the alert later
	if( !confirm('Are you sure you want to delete this? This operation cannot be undone.') ) return;
	// this is much better
	// because I just filter out the data then run the entire shebang again.
	getSync().then((data = []) =>{
		return saveSync(data.filter(item=>item.id!==id));
	}).then(main);
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

// shows the modal
function showModal() {
	overlayElm.addEventListener('click', hideModal);
	modalElm.querySelector('.close').addEventListener('click', hideModal);
	overlayElm.hidden = modalElm.hidden = false;
}
// hides the modal and clears values from the inputs.
function hideModal() {
	overlayElm.removeEventListener('click', hideModal);
	modalElm.querySelector('.close').removeEventListener('click', hideModal);
	overlayElm.hidden = modalElm.hidden = true;
	[inputName, inputID, inputMatches].map(elm=>elm.value='');
}
// bro, do you even DOM? 
// I don't.. so I made these
// and then still used html strings.
function makeElement(type, properties) {
	const tmp = document.createElement(type);
	return Object.assign(tmp, properties);
}
function clearElement(element) {
	while(element.hasChildNodes()) {
		element.removeChild(element.lastChild);
	}
}

// these titles are misleading, they are not a synchronous function
// they get data from the 'Sync' storage container and return a promise. 
// please don't judge me with those judgy eyes. 
// ...
// ... I said stop it!
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