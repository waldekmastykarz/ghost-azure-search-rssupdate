var express = require('express'),
	fs = require('fs'),
	config = require('./config'),
    bodyParser = require('body-parser'),
    router = require('./search/searchController.js');

if (!process.env.SearchServiceName) {
    throw('SearchServiceName not set');
}

if (!process.env.SearchIndexName) {
    throw('SearchIndexName not set');
}

if (!process.env.BlogRssUrl) {
    throw('BlogRssUrl not set');
}

if (!process.env.SearchAdminKey) {
    throw('SearchAdminKey not set');
}

if (!process.env.AppKey) {
    throw('AppKey not set');
}
    
var app = express();
app.use(bodyParser.json());
app.use('/api/search', router);

if (process.env.WEBSITE_SITE_NAME) {
	var http = require('http');
    var httpServer = http.createServer(app);
    httpServer.listen(config.port);
}
else {
    var https_options = {
        key: fs.readFileSync('./localhost-key.pem'),
        cert: fs.readFileSync('./localhost-cert.pem')
    };
	var https = require('https');
    var httpsServer = https.createServer(https_options, app);
    httpsServer.listen(config.port, 'localhost');
}
console.log('Web server listening on %s...', config.appRootUrl);