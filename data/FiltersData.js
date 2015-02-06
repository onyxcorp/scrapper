var Collection = require('collection'),
    Model = require('model'),
    async = require('async'),
    db = require('./DB').filters,
    logsData = require('./LogsData'),
    ShapeModel,
    SupplierModel,
    VolumeModel,
    WeightModel,
    PackageModel,
    ShapeCollection,
    SupplierCollection,
    VolumeCollection,
    WeightCollection,
    PackageCollection,
    collections,
    Filter,
    debug = function (message) { console.log(message); };

FilterModel = Model.extend({
    _schema: {
        id: '/Supplier',
        properties: {
            id: { type: 'string' },     // the firebase key
            id_buscape: { type: 'integer' },
            name: { type: 'string' },
            slug: { type: 'string' },
            members: { type: 'object' }
        }
    }
});

ShapeModel = FilterModel.extend({});
SupplierModel = FilterModel.extend({});
VolumeModel = FilterModel.extend({});
WeightModel = FilterModel.extend({});
PackageModel = FilterModel.extend({});

ShapeCollection = Collection.extend({
    model: ShapeModel
});

SupplierCollection = Collection.extend({
    model: SupplierModel
});

VolumeCollection = Collection.extend({
    model: VolumeModel
});

WeightCollection = Collection.extend({
    model: WeightModel
});

PackageCollection = Collection.extend({
    model: PackageModel
});

collections = {};
collections.shape = new ShapeCollection();
collections.supplier = new SupplierCollection();
collections.volume = new VolumeCollection();
collections.weight = new WeightCollection();
collections.package = new PackageCollection();

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
    db.child(this.filterName).getAll(null, callback);
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
