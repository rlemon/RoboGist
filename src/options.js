const xhr = require('./modules/xhr.js');
const syncStore = require('./modules/syncStore.js');
const element = require('./modules/element.js');
const [log, error] = require('./modules/logger.js');
// DOM elements
const gistListElm = document.getElementById('gist-list');
const addGistElm = document.getElementById('add-gist');
const overlayElm = document.getElementById('overlay');
const modalElm = document.getElementById('modal');
const saveElm = document.getElementById('save');
const inputName = document.getElementById('gist-name');
const inputID = document.getElementById('gist-id');
const inputMatches = document.getElementById('gist-matches');
// event handling
addGistElm.addEventListener('click', showModal);
saveElm.addEventListener('click', saveGist);
gistListElm.addEventListener('click', e=> {
	if( e.target.classList.contains('trash') ) {
		removeGist(e.target.dataset.id);
	}
	if( e.target.classList.contains('checkbox') ) {
		toggleGist(e.target.previousElementSibling.dataset.id);
	}
});	
chrome.runtime.sendMessage({'gistChanged':'no'}); // we get it

main();

function main() {
	syncStore.get().then((data = []) => {
		element.clear(gistListElm);
		for( const item of data ) {
			// TODO:: use a real DOM library or write one.
			const html = `
				<tr>
					<td>
						<input type="checkbox" ${item.active ? 'checked' : ''} id="checkbox-${item.id}" data-id="${item.id}" /><label class="checkbox" for="checkbox-${item.id}"></label>
					</td>
					<td>${item.name}</td>
					<td><a href="http://gist.github.com/${item.id}" target="_blank">${item.id}</a></td>
					<td>${item.matches}</td>
					<td>${new Date(Number(item.updated)).toLocaleString()}</td>
					<td><button class="trash" data-id="${item.id}">&#128465;</button></td>
				</tr>
			`;
			gistListElm.innerHTML += html;
		}
	});
}

function saveGist(event) {
	event.preventDefault();
	const [name, id, matches] = [inputName, inputID, inputMatches].map(elm=>elm.value.trim());
}