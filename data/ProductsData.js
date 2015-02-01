
var Collection = require('collection'),
    Model = require('model'),
    async = require('async'),
    db = require('./DB').products,
    logsData = require('./LogsData'),
    lodash = {
        collections: {
            forEach: require('lodash-node/modern/collections/forEach')
        },
        objects : {
            keys: require('lodash-node/modern/objects/keys'),
            isArray: require('lodash-node/modern/objects/isArray'),
            isFunction: require('lodash-node/modern/objects/isFunction'),
            values: require('lodash-node/modern/objects/values')
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
        getAll: function (callback) { db.getAll(collection, callback) },
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
                    debug(model.validationError)
                }
            });
            
            // assign the main callback once all saves were done
            queue.drain = callback;
        },
        save: function (model, callback) {
            
            var snapshot,
                modelRef;
            
            // check if exists, if exist update otherwise set
            Product.db.find(model, function (res) {
                
                if(!res) {
                    // there was an error, return true
                    callback(true);
                } else {
                    snapshot = res.val();
                    if (snapshot) {
                        var productKeys;
                        productKeys = lodash.objects.keys(snapshot);
                        if (productKeys && lodash.objects.isArray(productKeys)) {
                            modelRef = db.child(productKeys[0]);
                            db.save(modelRef, model, callback);
                        } else {
                            // productKeys was invalid, just go to the next product..
                            // TODO untested
                            logsData.save(
                                'ProductsData', 
                                'An error ocurred while trying to update the product of id_buscape: ' + model.get('id_buscape'), 
                                function (err) {
                                    callback(null);
                            });
                        }
                    } else { // simplesmente adicionar o produto ao banco
                        modelRef = db.push();
                        db.create(modelRef, model, callback);
                    }
                }
                
            });
        },
        find: function (model, callback) {
            
            var modelRef,
                modelIdBuscape;
            
            // this method need an obrigatory callback
            if (!callback || !lodash.objects.isFunction(callback)) return;
            
            // procurar se o produto existe através da propriedade id_buscape dele
            modelIdBuscape = model.get('id_buscape');
            if (modelIdBuscape) {
                try {
                    modelRef = db.orderByChild('id_buscape').equalTo(modelIdBuscape);    
                } catch (err) {
                    // TODO untested
                    logsData.save(
                        'ProductData', 
                        'Invalid attribute id_buscape: ' + model.get('id_buscape'),
                        function (err) {
                            callback(false);
                        }
                    );       
                }
                modelRef.once('value', callback);
            } else {
                // TODO untested
                logsData.save(
                    'ProductsData', 
                    'No model/id_buscape to look for: ' + model.toJSON(),
                    function (err) {
                        callback(false);        
                    }
                );
            }
        },
        remove: db.remove
    }
    
};

module.exports = Product;