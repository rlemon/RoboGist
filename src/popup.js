const gistlist = document.getElementById('gistlist');

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
	chrome.tabs.sendMessage(tabs[0].id, {getActiveGists: true}, res => {
		buildList(res.data);
	});
});

function buildList(store) {
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
		gistlist.innerHTML += htmlString;
	}
}