const gistlist = document.getElementById('gistlist');

chrome.tabs.query({active: true, currentWindow: true}, tabs => {
	chrome.tabs.sendMessage(tabs[0].id, {getActiveGists: true}, res => {
		console.log(res);
		buildList(res.data);
	});
});

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
		gistlist.innerHTML += htmlString;
	}
}