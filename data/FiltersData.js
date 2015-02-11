var Collection = require('collection'),
    Model = require('model'),
    async = require('async'),
    db = require('./DB').filters,
    logsData = require('./LogsData'),
    filterModels,
    filterCollections,
    collections,
    Filter,
    debug = function (message) { console.log(message); };

FilterModel = Model.extend({
    _schema: {
        id: '/Filter',
        properties: {
            id: { type: 'string' },     // the firebase key
            id_buscape: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' },
            members: { type: 'object' }
        }
    }
});

collections = {};
filterModels = {};
filterCollections = {};

var filtersList = [
    'name',
    'supplier',
    'package',
    'weight',
    'shape',
    'volume',
    'concentration',
    'quantity',
    'pharmaceuticalForm',
    'holder',
    'reference',
    'medicine',
    'presentation'
];

function createFilter(filterName) {
    filterModels[filterName] = FilterModel.extend({});
    filterCollections[filterName] = Collection.extend({
        model: filterModels[filterName]
    });
    collections[filterName] = new filterCollections[filterName]();
}

filtersList.forEach(function (value) {
    createFilter(value);
});

// constructor filter
function Filter(filter, data) {

    if (typeof filter !== 'string') {
        throw new TypeError('Collection name must be of type string');
    }

    if (!collections[filter]) {
        throw new Error('No collection found for: ' + filter);
    } else {
        this.filterName = filter;
        this.collection = collections[filter];

        if (data && Object.keys(data).length) {
            this.collection.add(data);
        }
    }
}

Filter.prototype.getAll = function (callback) {
    db.child(this.filterName).getAll(null, function (data) {
        this.collection.reset(data);
        callback(this.collection);
    }.bind(this));
};

Filter.prototype.saveAll = function (callback) {

    var queue;

    // task receberá as informações de um produto específico
    queue = async.queue(function (task, queueCallback) {
        this.save(task, queueCallback);
    }.bind(this), 10);

    // add all packages to the queue
    this.collection.forEach( function (model) {
        if (model.isValid()) {
            queue.push(model, function (err) {
                if (err) {
                    debug('FiltersData.js - ' + this.filterName + ' - Save failed, there are errors or the model was not found');
                }
            }.bind(this));
        } else {
            debug('FiltersData.js - ' + this.filterName + ' - Invalid model - ' + model.get('id') || model.get('slug') || model.get('id_buscape'));
            debug(model.validationError);
        }
    });

    // assign the main callback once all saves were done
    queue.drain = callback;
};

Filter.prototype.save = function (id, callback) {

    var model,
        identificationAttribute;

    // get the model to be set
    model = this.collection.get(id);

    identificationAttribute = model.get('id') || model.get('slug');

    if (identificationAttribute) {

        // check if exists, if exist update otherwise set
        db.findByKey(model.get('slug'), function (res) {
            // atualizar o produto com as novas informações (update?);
            if (res instanceof Error) {
                logsData.save(this.filterName, 'Firebase error: Invalid identificationAttribute', function (err) {
                    callback(false);
                });
            } else if (!res) {
                // there was an error or it was not found, return true
                db.child(this.filterName).child(model.get('slug')).create(model, callback);
            } else if (res) {
                // could be model.get('id') but res.key() is safer
                // that way we make sure the reference is the same that was checked before
                // also we update here only the days field
                db.child(this.filterName).child(res.id).save(model, callback);
            }
        }.bind(this));
    } else {
        logsData.save(this.filterName, 'No valid attribute data found', function (err) {
            callback(false);
        });
    }
};

Filter.prototype.remove = function () {
    return db.child(this.filterName).remove;
};

FilterCreator = {
    create: function (collection, data) {
        return new Filter(collection, data);
    }
};

module.exports = FilterCreator;
