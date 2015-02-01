
var Collection = require('collection'),
    Model = require('model'),
    async = require('async'),
    db = require('./DB').suppliers,
    logsData = require('./LogsData'),
    lodash = {
        collections: {
            pluck: require('lodash-node/modern/collections/pluck')
        },
        objects : {
            isFunction: require('lodash-node/modern/objects/isFunction')
        }  
    },
    SupplierModel,
    SupplierCollection,
    Supplier,
    collection,
    debug = function (message) { console.log(message); };

SupplierModel = Model.extend({
    
    _schema: {
        id: '/Supplier',
        properties: {
            id: { type: 'string' },
            id_buscape: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' },
            members: { type: 'object' }
        }
    }

});

SupplierCollection = Collection.extend({
    model: SupplierModel
});

collection = new SupplierCollection();

Supplier = {
    create: function (data) {
        return collection.add(data);
    },
    collection: collection,
    db: {
        getAll: function (callback) { db.getAll(collection, callback) },
        saveAll: function(callback) {
            
            var queue;
            
            // task receberá as informações de um produto específico
            queue = async.queue(function (task, queueCallback) {
                Supplier.db.save(task, queueCallback);
            }, 1);
            
            // add all packages to the queue
            collection.forEach( function (model) {
                if (model.isValid()) {
                    queue.push(model, function (err) {
                        if (err) {
                            debug('SuppliersData.js - Save failed, there are errors');
                        }
                    });
                } else {
                    debug('SuppliersData.js Invalid model ' + model.get('id') || model.get('slug') || model.get('id_buscape'));
                    debug(model.validationError);
                }
            });
            
            // assign the main callback once all saves were done
            queue.drain = callback;
            
        },
        save: function (id, callback) {
            var model,
                modelRef;
            
            // get the model to be set
            model = collection.get(id);
            
            // check if exists, if exist update otherwise set
            Supplier.db.find(model, function (res) {
                // atualizar o produto com as novas informações (update?);
                if (!res) {
                    // there was an error, return true
                    callback(true);
                } else if (res.val()) {
                    modelRef = db.child(res.key());
                    // could be model.get('id') but res.key() is safer 
                    // that way we make sure the reference is the same that was checked before
                    // also we update here only the days field
                    db.save(modelRef, model, callback);
                } else { // simplesmente adicionar o produto ao banco
                    db.createWithKey(res.key(), model, callback);
                }
            });
        },
        find: function (model, callback) {
            var modelRef,
                identificationAttribute;
            
            // this method need an obrigatory callback
            if (!callback || !lodash.objects.isFunction(callback)) return;
            
            identificationAttribute = model.get('id') || model.get('slug');
            
            if (identificationAttribute) {
                try {
                    // firebase will throw an error if no valid identification is sent
                    modelRef = db.child(identificationAttribute);
                    modelRef.once('value', callback);
                } catch (err) {
                    logsData.save('SuppliersData', 'Firebase error: Invalid identificationAttribute', function (err) {
                        callback(false);
                    });
                    debug(err);
                }
            } else {
                logsData.save('SuppliersData', 'No valid attribute data found', function(err) {
                    callback(false);    
                });
            }
            // procurar se o produto existe através da propriedade id dele
            
        },
        remove: db.remove
    }
};

module.exports = Supplier;
