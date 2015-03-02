
var Collection = require('collection'),
    Model = require('model'),
    products = require('./ProductsData'),
    async = require('async'),
    db = require('./DB').products_price_history,
    logsData = require('./LogsData'),
    lodash = {
        collections: {
            forEach: require('lodash-node/modern/collections/forEach'),
            pluck: require('lodash-node/modern/collections/pluck')
        },
        arrays: {
            last: require('lodash-node/modern/arrays/last')
        },
        objects : {
            assign: require('lodash-node/modern/objects/assign'),
            pick: require('lodash-node/modern/objects/pick'),
            keys: require('lodash-node/modern/objects/keys'),
            isFunction: require('lodash-node/modern/objects/isFunction'),
            isArray: require('lodash-node/modern/objects/isArray'),
            isObject: require('lodash-node/modern/objects/isObject'),
            values: require('lodash-node/modern/objects/values')
        }
    },
    ProductPriceHistoryModel,
    ProductPriceHistoryCollection,
    ProductPriceHistory,
    collection,
    productsDatabaseCollection,
    debug = function (message) { console.log(message); };

ProductPriceHistoryModel = Model.extend({

    _schema: {
        id: '/ProductPriceHistory',
        properties: {
            id: { type: 'string' },        // the productId this history references to
            days: { type : 'object' }    // array of objects containing { timestamp : { min, max } }
        }
    }

});

ProductPriceHistoryCollection = Collection.extend({
    model: ProductPriceHistoryModel
});

// internal use collection (for saving data on the DB)
collection = new ProductPriceHistoryCollection();

ProductPriceHistory = {
    create : function (data) {
        return collection.add(data);
    },
    collection: collection,
    db: {   // In a flux architecture everything here would be in the API folder
        getAll: function (callback) {
            db.getAll(null, function (data) {
                collection.reset(data);
                callback(collection);
            });
        },
        saveAll: function(callback) {

            var queue;

            // get the current list of products
            products.db.getAll( function (productsCol) {

                // assign received data to a global file variable
                productsDatabaseCollection = productsCol;

                // task receberá as informações de um produto específico
                queue = async.queue(function (task, queueCallback) {
                    ProductPriceHistory.db.save(task, queueCallback);
                }, 20);

                // add all products to the queue
                collection.forEach( function (model) {
                    if (model.isValid()) {
                        queue.push(model, function (err) {
                            if (err) {
                                debug('ProductsPriceHistoryData', 'Product price history could not be saved, there are errors');
                                debug(err);
                            }
                        });
                    } else {
                        debug('ProductsPriceHistoryData', 'Invalid model - ' + model.get('id'));
                        debug(model.validationError);
                    }
                });

                // assign the main callback once all saves were done
                queue.drain = callback;

            });

        },
        save: function (id, callback) {

            var model,
                snapshot;

            function saveProduct(productsCol) {

                var identificationAttribute;

                // get the product price history model we want to save an price history of
                model = collection.get(id);
                identificationAttribute = model.get('id');

                // check if exists
                if (model) {

                    db.findByKey(identificationAttribute, function (res) {

                        // we have a price history for this product, update it
                        if (res) {

                            var priceHistoryRef,
                                productPriceHistoryData,
                                lastDayModel,
                                lastDayDatabase,
                                isSameDay,
                                keysOfDaysModel,
                                keysOfDaysDatabase;

                            productPriceHistoryData = lodash.objects.values(res)[0];

                            // Get latest day from model
                            if(model.get('days')) {
                                keysOfDaysModel = lodash.objects.keys(model.get('days'));
                                if (keysOfDaysModel && lodash.objects.isArray(keysOfDaysModel)) {
                                    keysOfDaysModel.sort( function (a,b) {
                                        return parseInt(a) - parseInt(b);
                                    });
                                    lastDayModel = new Date(parseInt(lodash.arrays.last(keysOfDaysModel)));
                                }
                            }

                            // Get latest day from database
                            if (productPriceHistoryData.days) {
                                keysOfDaysDatabase = lodash.objects.keys(productPriceHistoryData.days);
                                if (keysOfDaysDatabase && lodash.objects.isArray(keysOfDaysDatabase)) {
                                    keysOfDaysDatabase.sort( function (a,b) {
                                        return parseInt(a) - parseInt(b);
                                    });
                                    lastDayDatabase = new Date(parseInt(lodash.arrays.last(keysOfDaysDatabase)));
                                }
                            }

                            if (lastDayModel instanceof Date && lastDayDatabase instanceof Date) {

                                // Compare latest day from model with latest day from database
                                isSameDay = (
                                    lastDayModel.getDate() == lastDayDatabase.getDate() &&
                                    lastDayModel.getMonth() == lastDayDatabase.getMonth() &&
                                    lastDayModel.getFullYear() == lastDayDatabase.getFullYear()
                                );

                                // If not same day, let's merge both data and save it to the database
                                if (!isSameDay) {
                                    var childKey,
                                        days;
                                    // where to save in the database
                                    childKey = lodash.objects.keys(res)[0];
                                    days = model.get('days') || {};

                                    if (lodash.objects.isObject(days)) {
                                        // merge the current model data with the database data
                                        // the preference (info to keep) is given to the current
                                        // model data
                                        lodash.objects.assign(days, productPriceHistoryData.days);
                                        model.set('days', days);
                                        db.child(childKey).save(model, callback);
                                    } else {
                                        // not a valid object, maybe some wrong data on database?
                                        // TODO untested
                                        logsData.save(
                                            'ProductsPriceHistoryData',
                                            'The model with id of: ' + identificationAttribute + ' has an invalid type of days attribute',
                                            function (err) {
                                                callback(null);
                                            }
                                        );
                                    }
                                } else {
                                    // if we are at the same day, just lets go to the next one
                                    callback(null);
                                }
                            } else {
                                // not an instanceof date
                                // TODO untested
                                logsData.save(
                                    'ProductsPriceHistoryData',
                                    'lastDayModel or lastDayDatabase were invalid instances of Date for the model id: ' + identificationAttribute,
                                    function (err) {
                                        callback(null);
                                    }
                                );
                            }
                        } else {
                            // new product price history, let's add it
                            var productFound;
                            // encontrar o produto através do id dele
                            productFound = productsCol.findWhere({id:identificationAttribute});
                            if(productFound) {
                                db.child(productFound.get('id')).save(model, callback);
                            }
                        }
                    });

                } else {
                    debug('No model found');
                }
            }

            // pegar uma lista atualizada de produtos, vai sobrescrever
            // a lista de collections atualmente disponível em ProductsData
            if (!productsDatabaseCollection || !productsDatabaseCollection.length) {
                products.db.getAll(saveProduct);
            } else {
                saveProduct(productsDatabaseCollection);
            }
        }
    }
};

module.exports = ProductPriceHistory;
