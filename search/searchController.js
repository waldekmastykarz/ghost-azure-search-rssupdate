var express = require('express'),
	router = express.Router(),
    https = require('https'),
    Xml2Js = require('xml2js');
    
router.post('/', function(apiRequest, apiResponse) {
    if (apiRequest.body.appKey !== process.env.AppKey) {
        console.error(apiRequest.body.appKey + ' doesn\'t match the AppKey ' + process.env.AppKey + ' configured for this API.');
        apiResponse.status(401).send('Unauthorized');
        return;
    }
    
    var url = process.env.BlogRssUrl.match(/https?:\/\/([^\/]+)(\/.*)/);

    var rssRequest = https.request({
        host: url[1],
        path: url[2],
        method: 'GET'
    }, (rssResponse) => {
        rssResponse.setEncoding('utf8');
        var rssFeed = '';
        rssResponse.on('data', (chunk) => {
            rssFeed += chunk;
        });
        rssResponse.on('end', () => {
            var parser = new Xml2Js.Parser();
            var jsonFeed = {};
            parser.parseString(rssFeed, (err, json) => {
                if (err) {
                    console.error(err);
                    apiResponse.status(500).send('Internal server error');
                    return;
                }
                
                jsonFeed = json;
                
                var posts = [];
                jsonFeed.rss.channel[0].item.forEach((item) => {
                    posts.push({
                        '@search.action': 'mergeOrUpload',
                        id: item.guid[0]._,
                        title: item.title[0],
                        content: item['content:encoded'][0].replace(/<[^>]+>/g, ' '),
                        url: item.link[0],
                        pubDate: new Date(item.pubDate[0])
                    })
                });
                
                var requestData = {
                    value: posts
                };

                var requestString = JSON.stringify(requestData);

                var searchRequest = https.request({
                    host: process.env.SearchServiceName + '.search.windows.net',
                    path: '/indexes/' + process.env.SearchIndexName + '/docs/index?api-version=2015-02-28',
                    method: 'POST',
                    headers: {
                        'Connection': 'Close',
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(requestString),
                        'api-key': process.env.SearchAdminKey
                    },
                    secureOptions: require('constants').SSL_OP_NO_TLSv1_2,
                    ciphers: 'ECDHE-RSA-AES256-SHA:AES256-SHA:RC4-SHA:RC4:HIGH:!MD5:!aNULL:!EDH:!AESGCM',
                    honorCipherOrder: true
                }, (searchResponse) => {
                    searchResponse.setEncoding('utf8');
                    searchResponse.on('data', (chunk) => {
                        // console.log('Response: ' + chunk);
                    });
                    searchResponse.on('end', () => {
                        console.log('Updated index from RSS ' + new Date());
                        apiResponse.status(200).send();
                    })
                }).on('error', (e) => {
                    console.error(e);
                    apiResponse.status(500).send('Internal server error');
                });

                searchRequest.write(requestString);
                searchRequest.end();
            });
        })
    }).on('error', (e) => {
        console.error(e);
        apiResponse.status(500).send('Internal server error');
    });

    rssRequest.end();
});

module.exports = router;