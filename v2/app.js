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
    .then( function (stores) {

        return Promise.each(stores, function (store) {
            return services.xmlParser(store.sitemap);
        });

    })
    .then( function (listOfProducts) {

        console.log('then after xmlParser');

        // GET THE LIST OF PRODUCTS

        // PARSE THE LIST USING THE SCRAPPER FUNCTION

    })
    .catch( function (err) {
        Log.create({
            service: 'App - waterline.initialize callback',
            error: err.name,
            message: err.message,
            extraInformation: 'Este erro originou enquanto tentava-se retornar as Stores e seus respectivos scrappers do banco'
        });
    });
});
