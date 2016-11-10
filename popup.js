const optionsPageBtn = document.getElementById('open-options');
const gistListElm = document.getElementById('gist-list');
optionsPageBtn.addEventListener('click', e=>{
	chrome.runtime.openOptionsPage(window.close.bind(window));
});
getSync().then(store => {
	const {list} = store;
	chrome.tabs.query({currentWindow: true, active: true}, tabs => {
		const listable = list.filter(item => new RegExp(item.matches).test(tabs[0].url));
		for( const item of listable ) {
			gistListElm.innerHTML += `
				<tr${item.hasUpdated ? ' class="hasUpdated"' : ''}>
					<td>
						<input type="checkbox" ${item.active ? 'checked' : ''} disabled id="checkbox-${item.id}" data-id="${item.id}" /><label class="checkbox" for="checkbox-${item.id}" title="toggle active from options page"></label>
					</td>
					<td>${item.name}</td>
					<td><a href="http://gist.github.com/${item.id}" target="_blank">${item.id}</a></td>
					<td>${item.updated}</td>
				</tr>
			`;
		}
	});
});
function getSync() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get({list: []}, resolve);
	});
}