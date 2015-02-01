var Firebase = require('firebase'),
    lodash = {
        objects: {
            assign: require('lodash-node/modern/objects/assign'),
            isFunction: require('lodash-node/modern/objects/isFunction')
        },
        collections: {
            forEach: require('lodash-node/modern/collections/forEach')
        }
    },
    
    // Test
    // baseUrl = 'https://blinding-torch-729.firebaseio.com/',
    // authKey = 'UIhQX4xHqS9LuXx1xovNf7t3x1ZwZHUrpksMUOQT',
    
    // Production
    baseUrl = 'https://glowing-torch-4538.firebaseio.com/',
    authKey = 'PCEpiBg4lVOJjSeCZqCIgUitMDmuemq2tjtJ1i6v',
    
    // common
    refs,
    debug = function (message) { console.log(message); },
    tables;
    
tables = [
    'products', 
    'suppliers', 
    'packages', 
    'categories', 
    'products_price_history',
    'weights',
    'shapes',
    'volumes',
    'logs'
];
refs = {};

lodash.objects.assign(Firebase.prototype, {
    getAll: function(collection, callback) {
       // default implementation to get data from firebase
        this.once('value', function (snapshot) {
            // snapshot should contain a list of products
            if (snapshot.val() != null) {
                var rows,
                    childData;
                rows = [];
                // loop through the snapshot data object
                snapshot.forEach( function(childSnapshot) {
                    
                    // childData will be the actual contents of the child
                    childData = childSnapshot.val() || {};
                    // set the key as the firebase key, needed because
                    // firebase has no support for arrays and our collection/model
                    // object need this for correct data manipulation
                    // also we run pareInt because integer type data arrive from DB
                    // as a string, so we need to perform this check
                    childData.id = parseInt(childSnapshot.key()) || childSnapshot.key();
                    // add the product to the list to be added to the collection
                    rows.push(childData);
                });
                try {
                    collection.reset(rows);
                    callback(collection);
                } catch (err) {
                    debug('An error has ocurred while trying to set the collection with the data got from the DB');
                    debug(err);
                    callback(false);
                }
            } else {
                callback(false);
            }
        });  
    },
    createWithKey: function (key, model, callback) {
        
        var modelData,
            modelRef;
        
        modelData = {};
        
        modelData[key] = false;  
        
        try {
            // first let's create an empty key in the database
            this.update(modelData, function (err) {
                if (!err) {
                    // if no errors, let's find the modelRef and than update it with the wanted data
                    // for this matter we delegate to the create method already created bellow
                    modelRef = this.child(key);
                    this.create(modelRef, model, callback);    
                }
            }.bind(this));
        } catch (err) {
            debug('An error has ocurred while trying to update the data in the DB');
            debug(err);
            if (lodash.objects.isFunction(callback)) {
                callback(true);
            }
        }
        
    },
    create: function (reference, model, callback) {
        
        var data;
        
        // let's make sure we are working with a valid Model instance
        if (model && lodash.objects.isFunction(model.toJSON)) {
            data = model.toJSON();
        } else {
            // no model, fuck this shit
            throw new Error('Invalid model or no toJSON method found', 'DB.js', 73);
        }
        
        // we never save the id because in firebase the ID is the key of the data, not another attribute
        if (data && data.id) {
            delete data.id;
        }
        
        try {
            // just set the data at the reference sended
            reference.set(data, lodash.objects.isFunction(callback) ? callback : function (err) {});    
        } catch (err) {
            debug('An error has ocurred while trying to update the data in the DB');
            debug(err);
            callback(true);
        }
        
    },
    save: function (reference, model, callback) {
        
        var data;
        
        if (model && lodash.objects.isFunction(model.toJSON)) {
            data = model.toJSON();
        } else {
            throw new Error('Invalid model or no toJSON method found', 'DB.js', 73);
        }
        
        // we never save the id because in firebase the ID is the key of the data, not another attribute
        if (data && data.id) {
            delete data.id;
        }
        
        try {
            reference.update(data, lodash.objects.isFunction(callback) ? callback : function (err) {});    
        } catch (err) {
            debug('An error has ocurred while trying to update the data in the DB');
            debug(err);
            callback(true);
        }
    },
    remove: function (reference, model, callback) {
        
        var modelKey;
        
        if (model && lodash.objects.isFunction(model.toJSON)) {
            modelKey = model.get('id');    
        } else {
            throw new Error('Invalid model or no get method found', 'DB.js', 100);
        }
        
        if (modelKey) {  // modelId can either be modelId or undefined
            try {
                reference.child(modelKey).remove(lodash.objects.isFunction(callback) ? callback : function (err) {});    
            } catch (err) {
                debug('An error has ocurred while trying to remove a model from the DB');
                debug(err);
                callback(true);
            }
        }
    }
});

// set the base url
refs.base = new Firebase(baseUrl);
if (authKey) {
    refs.base.authWithCustomToken(authKey, function (error, result)  {
        if (error) {
            debug(error);
            throw new Error('Could not authenticate with firebase');
        }
    });
}

// set all the others
if (tables.length) {
    lodash.collections.forEach(tables, function (value) {
        refs[value] = refs.base.child(value);
    });
}

module.exports = refs;
