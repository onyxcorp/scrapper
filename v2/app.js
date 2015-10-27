require('./utils/global.js');

var Promise = require('bluebird'),
    Crawler = require('crawler'),
    services = require('./services'),
    db = require('./db');

db.initialize( function (databaseInstance) {

    console.log('everything just loaded');

    var Store = databaseInstance.collections.store;
    var Log = databaseInstance.collections.log;

    Store.find()
    .populate('storescrapper')
    .then(services.xmlParser)
    .then(services.cacheLinks)
    .then(services.scrapper)
    .catch( function (err) {
        Log.error({
            service: 'App - waterline.initialize callback',
            error: err.name,
            message: err.message,
            extraInformation: err.extraInformation || 'Este erro originou ao tentar retornar os Sitemaps e Scrappear as informações das Stores'
        });
    });
});
