/*
*   Main file for the API
*/

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const config = require('./../config');

// Container
const server = {};

// Instantiate & start http server
server.httpServer = http.createServer((req, res) => server.unifiedServer(req,res));

// Instantiate & start https server
server.httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem') 
};
server.httpsServer = https.createServer(server.httpsServerOptions ,(req,res) => server.unifiedServer(req, res));

// Server logic
server.unifiedServer = (req,res) => {

    // Get the parsedUrl and trim it
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    
    // Get query object
    const queryObject = parsedUrl.query;

    // Get Headers
    const headers = req.headers;

    // Get method
    const method = req.method;

    // Get the payload
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => buffer += decoder.write(data));

    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler based on router
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Data to be passed to handler
        const data = {
            'trimmedPath' : trimmedPath,
            'queryObject' : queryObject,
            'headers' : headers,
            'method' : method,
            'payload' : buffer
        };

        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log("Returned response: ",statusCode, payloadString);
        });
    });
};

// Handlers
const handlers = {};

// Hello handler
handlers.hello = (data, callback) => { callback(200, {'message': 'A message in JSON format'}) };

// NotFound Handler
handlers.notFound = (data, callback) => { callback(404) };

// Router
const router = {
  'hello': handlers.hello
};

// Init
server.init = () => {
  // Start the http server
  server.httpServer.listen(config.httpPort, () => console.log("The serve is listening on port "+config.httpPort));

  // Start the https server
  server.httpsServer.listen(config.httpsPort, () => console.log("The serve is listening on port "+config.httpsPort));

};

// Export the module
module.exports = server;