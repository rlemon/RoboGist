const syncKey = 's_defs';

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

module.exports = {
	get: getSync,
	set: saveSync
};