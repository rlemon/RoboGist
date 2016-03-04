function makeElement(type, properties) {
	const tmp = document.createElement(type);
	return Object.assign(tmp, properties);
}
function clearElement(element) {
	while(element.hasChildNodes()) {
		element.removeChild(element.lastChild);
	}
}
module.exports = {
	make: makeElement,
	clear: clearElement
};