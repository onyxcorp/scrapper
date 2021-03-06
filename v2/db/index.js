var Waterline = require('waterline'),
    Promise = require('bluebird'),
    mysqlAdapter = require('sails-mysql'),
    collections = require('./models'),
    data = require('./data'),
    types = require('../utils/types'),
    waterline = new Waterline();

waterline.loadCollection(collections.product);
waterline.loadCollection(collections.productPriceHistory);
waterline.loadCollection(collections.store);
waterline.loadCollection(collections.storeScrapper);
waterline.loadCollection(collections.tag);
waterline.loadCollection(collections.log);

// set up the storage configuration for waterline
var config = {

    adapters: {
        mysql: mysqlAdapter
    },

    connections: {
        localhost: {
            adapter: 'mysql',
            host: 'localhost',
            database: 'scrapper',
            user: 'root',
            password: 'root'
        }
    }
};

module.exports = {
    initialize: function (callback) {
        waterline.initialize(config, function (err, db) {

            if (err) {
                callback(err, null);
                return false;
            }

            var Store = db.collections.store;
            var StoreScrapper = db.collections.storescrapper;
            var Log = db.collections.log;

            Log.error = function (errorObject) {
                if (!types.isObject(errorObject)) throw new TypeError('Log.error argument should be an object');
                // TODO must check for invalid keys, here are checking only if the keys exists
                if (
                    !errorObject.service ||
                    !errorObject.error ||
                    !errorObject.message ||
                    !errorObject.extraInformation
                ) throw new Error('Log.error errorObject malformed, allowed keys are service, error, message and extraInformation');

                console.error(errorObject.error);
                console.error(errorObject.message);
                Log.create(errorObject)
                .catch( function (err) {
                    console.error('Error while executing Log.create method');
                });
            };

            Promise.each(data.store, function (storeData) {

                // this return is what makes the Promise.each works as expected
                return Store.findOrCreate(
                    { slug: storeData.slug },   // find criteria
                    {
                        name: storeData.name,   // data to save
                        slug: storeData.slug,
                        robots: storeData.robots,
                        sitemap: storeData.sitemap,
                        link: storeData.link,
                    }

                )
                .then( function (stores) {

                    // stores are an array of the data found or a single one
                    // but since on the first argument we are searching using
                    // a field that is set as UNIQUE we can be sure that the
                    // stores are actually a single store
                    var currentStoreScrapper = data.storeScrapper[stores.slug];

                    // now that we have the store saved, lets save also its
                    // scrapper data configuration, we also have to return it
                    // so the outermost .then is called (the one being used with the Promise.each)
                    // 2ND LEVEL OF SAVING DATA
                    return StoreScrapper.findOrCreate(
                        { store: stores.id },   // find criteria
                        {
                            name: currentStoreScrapper.name,    // data to save
                            link: currentStoreScrapper.link,
                            image: currentStoreScrapper.image,
                            description: currentStoreScrapper.description,
                            price: currentStoreScrapper.price,
                            externalId: currentStoreScrapper.externalId,
                            store: stores.id
                        }
                    )
                    .then( function (storeScrappers) {

                        // we saved the store and the storeScrappers information and now
                        // we just want to associate the new storeScrappers saved back to the
                        // store on the Store table in the database
                        stores.storescrapper = storeScrappers.id;
                        // return Store.update(
                        //     { id: storeScrappers.store },   // find criteria
                        //     {
                        //         storescrapper: storeScrappers.id // data to save
                        //     }
                        // )
                        return stores.save()
                        .catch( function (err) {
                            Log.create({
                                service: 'Database - waterline.initialize',
                                error: err.name,
                                message: err.message,
                                extraInformation: 'Este erro originou enquanto tentava-se atualizar a Store com o ID de sua respectivo StoreScrapper'
                            })
                            .catch( function (err) {
                                console.error('Error while trying to set a log');
                            });
                        });

                    })
                    .catch( function (err) {
                        Log.error({
                            service: 'Database - waterline.initialize',
                            error: err.name,
                            message: err.message,
                            extraInformation: 'Este erro originou enquanto tentava-se adicionar informações a collection StoreScrapper'
                        });
                    });

                })
                .catch( function (err) {
                    Log.error({
                        service: 'Database - waterline.initialize',
                        error: err.name,
                        message: err.message,
                        extraInformation: 'Este erro originou enquanto tentava-se adicionar informações a Store'
                    });
                });
            })
            .then( function (result) {
                callback(null, db);
            })
            .catch( function (err) {
                Log.error({
                    service: 'Database - waterline.initialize',
                    error: err.name,
                    message: err.message,
                    extraInformation: 'Este erro originou enquanto executava-se o Loop que adiciona informações a Store'
                });
            });
        });
    }
};
