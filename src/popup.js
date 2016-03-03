chrome.runtime.sendMessage({'gistChanged':'no'})

// chrome.tabs.query({active: true, currentWindow: true}, tabs => {
// 	chrome.tabs.sendMessage(tabs[0].id, {getActiveGists: true}, res => {
// 		buildList(res.data);
// 	});
// });

