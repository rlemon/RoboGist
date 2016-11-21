const ide = document.createElement('script');
ide.textContent = `
	const runtimeid = "${chrome.runtime.id}";
	if( typeof runtimeLoaded !== 'undefined' ) runtimeLoaded();
`;
document.body.appendChild(ide);