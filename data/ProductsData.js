
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
            code: { type: 'integer' },
            prices: { type: 'object' },
            offers: { type: 'object' },
            thumb: { type: 'object' },
            title: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            tipo: { type: 'string' },
            original_link: { type: 'object' },
            external_links: { type: 'object' },
            rating: { type: 'object' },
            filters: { type: 'object' }
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
        // Save may add new products from buscape or update already existing products
        save: function (model, callback) {

            var identificationAttribute;

            identificationAttribute = model.get('id_buscape');

            // This first case scenario is from when the product is being added
            // from the buscape api
            if (identificationAttribute) {
                // check if exists, if exist update otherwise set
                db.findByChild('id_buscape', identificationAttribute, function (res) {
                    // atualizar o produto com as novas informações (update?);
                    if (res instanceof Error) {
                        logsData.save('ProductsData', 'Firebase error: Invalid identificationAttribute', function (err) {
                            callback(false);
                        });
                    } else if (!res) {
                        // the product was not found by it's id_buscape, add it
                        db.push().create(model, callback);
                    } else if (res) {
                        // could be model.get('id') but res.id is safer
                        // that way we make sure the reference is the same that was checked before
                        // also we update here only the days field
                        db.child(res.id).save(model, callback);
                    }
                });
            } else {
                // There are no id_buscape, it means the product were directly
                // added to the database and have no correlation with buscape

                // if there is an id, let's just update it, we should not
                identificationAttribute = model.get('id');
                if (identificationAttribute) {

                    db.child(identificationAttribute).save(model, callback);

                } else {
                    // if there is no id and the product is not from buscape
                    // if means that we should leave and not create a new product
                    logsData.save('ProductsData', 'No valid attribute data found', function(err) {
                        callback(false);
                    });
                }
            }
        },
        remove: db.remove
    }

};

module.exports = Product;
