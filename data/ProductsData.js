
var Collection = require('collection'),
    Model = require('model'),
    async = require('async'),
    db = require('./DB').products,
    logsData = require('./LogsData'),
    lodash = {
        collections: {
            forEach: require('lodash-node/modern/collections/forEach')
        }
    },
    ProductModel,
    ProductCollection,
    Product,
    collection,
    debug = function (message) { console.log(message); };

ProductModel = Model.extend({

    _schema: {
        id: '/Product',
        properties: {
            id: { type: 'string' },                 // the key from firebase
            id_buscape: { type: 'integer' },        // id reference from buscape
            categories: { type: 'object' },         // reference to category table
            offers: { type: 'object' },
            thumb: { type: 'object' },
            title: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            tipo: { type: 'string' },
            original_link: { type: 'object' },
            rating: { type: 'object' },
            package: { type: 'string' },     // reference to package table
            shape: { type: 'string' },      // reference to the shapes table
            weight: { type: 'string' },     // reference to the weights table
            supplier: { type: 'string' },   // reference to supplier table
            volume: { type: 'string' }     // reference to the volumes table
        }
    },
    get: function (attr) {
        switch(attr) {
            case 'price':
                return this.to('fixed', attr, 2);
            default:
                return Model.prototype.get.apply(this, arguments);
        }
    }

});

ProductCollection = Collection.extend({
    model: ProductModel
});

// internal use collection (for saving data on the DB)
collection = new ProductCollection();

Product = {
    create: function (data) {
        return collection.add(data);
    },
    collection: collection,
    db: {   // In a flux architecture everything here would be in the API
        getAll: function (callback) {
            db.getAll(null, function (data) {
                collection.reset(data);
                callback(collection);
            });
        },
        saveAll: function (callback) {

            var queue;

            // task receberá as informações de um produto específico
            queue = async.queue(function (task, queueCallback) {
                Product.db.save(task, queueCallback);
            }, 20);


            // add all products to the queue
            lodash.collections.forEach(collection.models, function (model) {
                if (model.isValid()) {
                    queue.push(model, function (err) {
                        if (err) {
                            debug('ProductsData.js - Save failed, there are errors');
                            debug(err);
                        }
                    });
                } else {
                    debug('ProductsData.js - Invalid model - ' + model.get('id') || model.get('slug') || model.get('id_buscape'));
                    debug(model.validationError);
                }
            });

            // assign the main callback once all saves were done
            queue.drain = callback;
        },
        save: function (model, callback) {

            var identificationAttribute;

            identificationAttribute = model.get('id_buscape');

            if (identificationAttribute) {
                // check if exists, if exist update otherwise set
                db.findByChild('id_buscape', identificationAttribute, function (res) {
                    // atualizar o produto com as novas informações (update?);
                    if (res instanceof Error) {
                        logsData.save('ProductsData', 'Firebase error: Invalid identificationAttribute', function (err) {
                            callback(false);
                        });
                    } else if (!res) {
                        // there was an error or it was not found, return true
                        db.push().create(model, callback);
                    } else if (res) {
                        // could be model.get('id') but res.key() is safer
                        // that way we make sure the reference is the same that was checked before
                        // also we update here only the days field
                        db.child(res.id).save(model, callback);
                    }
                });
            } else {
                logsData.save('ProductsData', 'No valid attribute data found', function(err) {
                    callback(false);
                });
            }
        },
        remove: db.remove
    }

};

module.exports = Product;
