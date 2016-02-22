var config = {
    port: process.env.PORT || 8443,
    appRootUrl: null
};

if (process.env.WEBSITE_SITE_NAME) {
    config.appRootUrl = 'https://' + process.env.WEBSITE_SITE_NAME + '.azurewebsites.net';
}
else {
    config.appRootUrl = 'https://localhost:' + config.port;
}

module.exports = config;
