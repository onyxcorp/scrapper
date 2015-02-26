
var Collection = require('collection'),
    Model = require('model'),
    db = require('./DB').logs,
    lodash = {
        collections: {
            forEach: require('lodash-node/modern/collections/forEach'),
            pluck: require('lodash-node/modern/collections/pluck')
        },
        objects : {
            isFunction: require('lodash-node/modern/objects/isFunction')
        }
    },
    LogModel,
    LogCollection,
    Log,
    collection,
    debug = function (message) { console.log(message); };

LogModel = Model.extend({

    _schema: {
        id: '/Log',
        properties: {
            id: { type: 'integer' },         // firebase key()
            BuscapeAPI: { type: 'array' },
            MemberWorker: { type: 'array' },
            ProductWorker: { type: 'array' },
            ExtraDataWorker: { type: 'array' },
            OfferWorker: { type: 'array' },
            ReviewWorker: { type: 'array' },
            TaxonomyWorker: { type: 'array' },
            CategoriesData: { type: 'array' },
            PackagesData: { type: 'array' },
            ProductsData: { type: 'array' },
            ProductsPriceHistoryData: { type: 'array' },
            SellersData: { type: 'array' },
            ShapesData: { type: 'array' },
            SuppliersData: { type: 'array' },
            VolumesData: { type: 'array' },
            WeightsData: { type: 'array' },
            Updater: { type: 'array' }
        }
    }

});

LogCollection = Collection.extend({
    model: LogModel
});

collection = new LogCollection();

Log = {
    save: function (origin, message, callback) { // origin is the worker we want to update

        // ** WARNING **  ATENÇÃO **
        // Se tentar optimizar esta parte, lembrar que pode ocorrer um bug aqui
        // que, quando dentro de um if/else ele duplicará o conteúdo salvo no logs
        db.getAll(null, function (res) {
            collection.reset(res);
            handleMessages();
        });

        function handleMessages() {

            var lastLog,
                lastLogDay,
                today,
                isSameDay;

            // the first on the collection is the first data inputed at firebase
            lastLog = collection.first();
            today = new Date();

            if (lastLog && lastLog.get('id')) {
                lastLogDay = new Date(parseInt(lastLog.get('id')));
                isSameDay = (
                    lastLogDay.getDate() == today.getDate() &&
                    lastLogDay.getMonth() == today.getMonth() &&
                    lastLogDay.getFullYear() == today.getFullYear()
                );
            } else {
                isSameDay = false;
            }

            if (isSameDay) {
                var attribute,
                    modelRef;

                // check current attribute data
                attribute = lastLog.get(origin);

                // if attribute exists we need to add new data to the current worker
                if (attribute) {
                    attribute.push(message);
                    lastLog.set(origin, attribute);
                } else { // don't exists, just add a new one
                    lastLog.set(origin, [message]);
                }
                db.child(lastLog.get('id')).save(lastLog, callback);
            } else {
                var newModel,
                    model;

                newModel = {};
                newModel[origin] = [message];
                model = collection.add(newModel);

                if (model && model.isValid()) {
                    db.child(today.getTime()).save(model, callback);
                }
            }
        }

    },

    remove: db.remove
};

module.exports = Log;
