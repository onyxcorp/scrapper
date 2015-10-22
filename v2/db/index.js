var Waterline = require('waterline'),
    mysqlAdapter = require('sails-mysql'),
    collections = require('./models'),
    data = require('./data'),
    waterline = new Waterline();

waterline.loadCollection(collections.product);
waterline.loadCollection(collections.productPriceHistory);
waterline.loadCollection(collections.store);
waterline.loadCollection(collections.storeConfig);
waterline.loadCollection(collections.tag);

// set up the storage configuration for waterline
var config = {

    adapters: {
        mysql: mysqlAdapter
    },

    connections: {
        localhost: {
            adapter: 'mysql',
            host: '127.0.0.1',
            database: 'scrapper',
            user: 'root',
            password: ''
        }
    }
};


module.exports = {
    initialize: function (callback) {
        waterline.initialize(config, function (err, db) {
            if (err) {
                return console.error(err);
            }

            var Store = db.collections.store;
            var StoreConfig = db.collections.storeConfig;

            data.store.forEach(function (storeData) {
                Store.findOrCreate({
                    name: storeData.name,
                    link: storeData.link
                });
            });

            data.storeConfig.forEach( function (storeConfigData) {
                StoreConfig.findOrCreate({
                    robots: storeConfigData.robots,
                    sitemap: storeConfiData.sitemap,
                    scrapper: storeConfigData.scrapper
                });
            });
            callback(db);
        });
    }
};
