
var Collection = require('collection'),
    Model = require('model'),
    async = require('async'),
    db = require('./DB').weights,
    logsData = require('./LogsData'),
    lodash = {
        collections: {
            pluck: require('lodash-node/modern/collections/pluck')
        },
        objects : {
            isFunction: require('lodash-node/modern/objects/isFunction')
        }  
    },
    WeightModel,
    WeightCollection,
    Weight,
    collection,
    debug = function (message) { console.log(message); };

WeightModel = Model.extend({
    
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

WeightCollection = Collection.extend({
    model: WeightModel
});

collection = new WeightCollection();

Weight = {
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
                Weight.db.save(task, queueCallback);
            }, 1);
            
            // add all packages to the queue
            collection.forEach( function (model) {
                if (model.isValid()) {
                    queue.push(model, function (err) {
                        if (err) {
                            debug('WeightsData.js - Save failed, there are errors');
                        }
                    });
                } else {
                    debug('WeightsData.js - Invalid model - ' + model.get('id') || model.get('slug') || model.get('id_buscape'));
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
            Weight.db.find(model, function (res) {
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
            
            // procurar se o produto existe caso a fonte de informação seja um lugar 
            // diferente do banco, como a API do buscapé, não setamos a propriedade id inicialmente 
            // já que ela é reservada para referenciar informações que já estão salvas no banco
            // (no caso do firebase são as keys de identificação), logo precisamos realizar uma 
            // busca com algum termo que permita identificar o objeto (slug neste caso)
            identificationAttribute = model.get('id') || model.get('slug');
            
            if (identificationAttribute) {
                try {
                    // firebase will throw an error if no valid identification is sent
                    modelRef = db.child(identificationAttribute);
                    modelRef.once('value', callback);
                } catch (err) {
                    logsData.save('WeightsData', 'Invalid identificationAttribute', function () {
                        callback(false);
                    });
                    debug(err);
                }
            } else {
                logsData.save('WeightsData', 'No valid attribute data found', function () {
                    callback(false);
                });
            }
        },
        remove: db.remove
    }
};

module.exports = Weight;