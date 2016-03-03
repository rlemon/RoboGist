var fs = require('fs');
var filename = __dirname + '/src/manifest.json';
fs.readFile(filename, 'utf8', function(err, data) {
	var obj = JSON.parse(data);
	var newVersion = increment(obj.version);
	obj.version = newVersion;
	fs.writeFile(filename, JSON.stringify(obj), function(err,data) {
		if( err ) return console.error(err);
		console.log('version updated:', newVersion);
	});
});
function increment(str) {
	var parts = str.split('.');
	parts[2]++;
	return parts.join('.');
}