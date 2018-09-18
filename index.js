/*
 * Primary file for API
*/

// Dependencies for API

var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// Define handlers
var handlers = {};

// Define hello handler
handlers.hello = function(data, callback) {
	// callback
	callback(200, {message: 'Hello there, welcome to my first API'});

};

handlers.notFound = function(data, callback) {
	callback(404);
}

var router = {
	'hello': handlers.hello
}

// Start by creating an http server
var server = http.createServer(function(req,res) {
	// get url -> parse it
	// get the current path of the url
	// send a res
	var parsedUrl = url.parse(req.url, true);
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,''); // regex to get rid of any trailing / 

	// lets get the query string qnd parse it as an obj
	var queryStringObject = parsedUrl.query;

	// store the method used
	var method = req.method.toLowerCase();
	// get the headers
	var headers = req.headers


	var decoder = new StringDecoder('utf-8');
	var buffer = '';

	req.on('data', function(data) {
		buffer += decoder.write(data);
	});

	req.on('end', function() {
		buffer += decoder.end();

		// chose handler this req should go to. If one is not found use the notFound handler
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// let's construct the data object so we can pull from it later
		var data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'payload': buffer
		};

		// route the request to the router specified in the handler
		chosenHandler(data, function(statusCode, payload) {
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
			payload = typeof(payload) == 'object' ? payload : {};

			// send string back, convert payload to string
			var payloadString = JSON.stringify(payload);
			// set header to application/json

			res.setHeader('Content-Type', 'application/json');

			// return result
			res.writeHead(statusCode);
			res.end(payloadString);

			console.log('Returning this:\n' + 'Status Code: ', statusCode, '\nPayload String: ', payloadString)
		});
	});
});
server.listen(3000, function() {
	console.log('listening to port 3000\n');
});


