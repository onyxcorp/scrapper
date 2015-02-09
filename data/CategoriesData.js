
var Collection = require('collection'),
    Model = require('model'),
    async = require('async'),
    db = require('./DB').categories,
    logsData = require('./LogsData'),
    CategoryModel,
    CategoryCollection,
    Category,
    collection,
    debug = function (message) { console.log(message); };

CategoryModel = Model.extend({

    _schema: {
        id: '/Category',
        properties: {
            id: { type: 'string' },             // the key from firebase
            id_buscape: { type: 'integer' },
            id_parent: { type: 'integer' },
            thumbnail: { type: 'string' },
            name: { type: 'string' },   // readable name
            slug: { type: 'string' },
            filters: { type: 'object'},
            members: { type: 'object' } // id_products list
        }
    }

});

CategoryCollection = Collection.extend({
    model: CategoryModel
});

collection = new CategoryCollection();

Category = {
    create: function (data) {
        return collection.add(data);
    },
    collection: collection,
    db: {
        getAll: function (callback) {
            db.getAll(null, function (data) {
                collection.reset(data);
                callback(collection);
            });
        },
        saveAll: function(callback) {

            var queue;

            // task receberá as informações de um produto específico
            queue = async.queue(function (task, queueCallback) {
                Category.db.save(task, queueCallback);
            }, 5);


            // add all products to the queue
            collection.forEach( function (model) {
                if (model.isValid()) {
                    queue.push(model, function (err) {
                        if (err) {
                            debug(err);
                        }
                    });
                } else {
                    debug('CategoriesData.js - Invalid model - ' + model.get('id') || model.get('slug') || model.get('id_buscape') + '. Validation Error: ' + model.validationError);
                }
            });

            // assign the main callback once all saves were done
            queue.drain = callback;

        },
        save: function (id, callback) {

            var model,
                identificationAttribute;

            // get the model to be set
            model = collection.get(id);

            identificationAttribute = model.get('id') || model.get('slug');

            if (identificationAttribute) {
                // check if exists, if exist update otherwise set
                db.findByKey(identificationAttribute, function (res) {
                    // atualizar o produto com as novas informações (update?);
                    if (res instanceof Error) {
                        logsData.save('CategoriesData', 'Firebase error: Invalid identificationAttribute', function (err) {
                            callback(false);
                        });
                    } else if (!res) {
                        // there was an error or it was not found, return true
                        db.child(identificationAttribute).create(model, callback);
                    } else if (res) {
                        // could be model.get('id') but res.key() is safer
                        // that way we make sure the reference is the same that was checked before
                        // also we update here only the days field
                        db.child(res.id).save(model, callback);
                    }
                });
            } else {
                logsData.save('CategoriesData', 'No valid attribute data found', function(err) {
                    callback(false);
                });
            }
        },
        remove: db.remove
    }
};

module.exports = Category;
