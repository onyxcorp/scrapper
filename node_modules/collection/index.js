var lodash = {
        objects : {
            assign: require('lodash-node/modern/objects/assign'),
            defaults: require('lodash-node/modern/objects/defaults'),
            has: require('lodash-node/modern/objects/has'),
            clone: require('lodash-node/modern/objects/clone'),
            isArray: require('lodash-node/modern/objects/isArray'),
            isString: require('lodash-node/modern/objects/isString'),
            isFunction: require('lodash-node/modern/objects/isFunction'),
            isObject: require('lodash-node/modern/objects/isObject'),
            pairs: require('lodash-node/modern/objects/pairs')
        },
        functions: require('lodash-node/modern/functions'),
        arrays: require('lodash-node/modern/arrays'),
        collections: require('lodash-node/modern/collections')
    },
    Model = require('model'),
    extend = require('backbone-extend-standalone'),
    Collection;

// Onyx.Collection (based on Backbone.Collection)
// -------------------

// If models tend to represent a single row of data, a Onyx Collection is
// more analogous to a table full of data ... or a small slice or page of that
// table, or a collection of rows that belong together for a particular reason
// -- all of the messages in this particular folder, all of the documents
// belonging to this particular author, and so on. Collections maintain
// indexes of their models, both in order, and for lookup by `id`.

// Create a new **Collection**, perhaps to contain a specific type of `model`.
// If a `comparator` is specified, the Collection will maintain
// its models in sort order, as they're added and removed.
Collection = function (models, options) {
    options = options || {};
    if (options.model) {
        this.model = options.model;
    }
    if (options.comparator !== void 0) {
        this.comparator = options.comparator;
    }
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) {
        this.reset(models, lodash.objects.assign({silent: true}, options));
    }
};

// Define the Collection's inheritable methods.
lodash.objects.assign(Collection.prototype, {

    // The default model for a collection is just a **Onyx.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function () {},

    // The JSON representation of a Collection is an array of the
    // models' attributes
    toJSON: function () {
        return this.map( function (model) {
            return model.toJSON();
        });
    },

    // The JSON representation of a Collection as an object with the index key
    // being the model key
    toObjectJSON: function (index) {
        var modelsAttributes,
            modelsData,
            modelsKeys;

        modelsAttributes = this.toJSON();
        modelsKeys = lodash.collections.pluck(modelsAttributes, index || this.model.prototype.idAttribute || 'id');
        modelsData = {};

        // assign the keys to the values
        lodash.collections.forEach(modelsKeys, function (name, index) {
            // if it is a new model being assigned, just set the key and data
            if ( !Object.prototype.hasOwnProperty.call(modelsData, name) ) {
                modelsData[name] = modelsAttributes[index];
            } else {
                // the model already exists in modelsData

                // if the modelsData is an array, push the attributes
                if ( modelsData[name] instanceof Array ) {
                    modelsData[name].push( modelsAttributes[index] );
                } else {
                    // modelsData should be an object here, assign the key and value
                    var val = modelsData[name];
                    modelsData[name] = [val, modelsAttributes[index]];
                }
            }
        });

        return modelsData;
    },

    // Add a model, or list of models to the set.
    add: function (models, options) {
        return this.set(models, lodash.objects.assign({merge: false}, options, {add: true, remove: false}));
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function (models, options) {
        var singular,
            id,
            model,
            attrs,
            existing,
            sort,
            sortable,
            sortAttr,
            toAdd,
            toRemove,
            modelMap,
            order,
            orderChanged,
            i;

        options = lodash.objects.defaults({}, options, {add: true, remove: true, merge: true});

        // check if is a single model collection
        singular = !lodash.objects.isArray(models);

        models = singular ? (models ? [models] : []) : models.slice();
        if (options.at < 0) {
            options.at += this.length + 1;
        }
        sortable = this.comparator && (options.at == null) && options.sort !== false;
        sortAttr = lodash.objects.isString(this.comparator) ? this.comparator : null;

        // initial setup of arrays and objects
        toAdd = [];
        toRemove = [];
        modelMap = {};
        orderChanged = false;

        // Turn bare objects into model references, and prevent invalid models
        // from being added.
        for (i = 0, length = models.length; i < length; i++) {
            attrs = models[i];

            // If a duplicate is found, prevent it from being added and
            // optionally merge it into the existing model.
            existing = this.get(attrs);

            if (existing) {
                if (options.remove) {
                    modelMap[existing.cid] = true;
                }
                // if options are set to merge the model and the attrs are different
                // from the current ones passed, updadte the model data
                if (options.merge && attrs !== existing) {
                    attrs = this._isModel(attrs) ? attrs.attributes : attrs;
                    existing.set(attrs, options);
                    if (sortable && !sort && existing.hasChanged(sortAttr)) {
                        sort = true;
                    }
                }
                models[i] = existing;

                // If this is a new, valid model, push it to the `toAdd` list.
            } else if (options.add) {
                model = models[i] = this._prepareModel(attrs, options);
                if (!model) continue;
                toAdd.push(model);
                this._addReference(model, options);
            }

            // Do not add multiple models with the same `id`.
            model = existing || model;
            if (!model) continue;
            id = this.modelId(model.attributes);
            order = !sortable && options.add && options.remove ? [] : false;
            if (order && (model.isNew() || !modelMap[id])) {
                order.push(model);
                // Check to see if this is actually a new model at this index.
                orderChanged = orderChanged || !this.models[i] || model.cid !== this.models[i].cid;
            }

            modelMap[id] = true;
        }

        // Remove nonexistent models if appropriate.
        if (options.remove) {
            for (i = 0, length = this.length; i < length; i++) {
                if (!modelMap[(model = this.models[i]).cid]) {
                    toRemove.push(model);
                }
            }
            if (toRemove.length) {
                this.remove(toRemove, options);
            }
        }

        // See if sorting is needed, update `length` and splice in new models.
        if (toAdd.length || orderChanged) {
            if (sortable) {
                sort = true;
            }
            this.length += toAdd.length;
            if (options.at !== null) {
                for (i = 0, length = toAdd.length; i < length; i++) {
                    this.models.splice(options.at + i, 0, toAdd[i]);
                }
            } else {
                if (order) {
                    this.models.length = 0;
                }
                var orderedModels = order || toAdd;
                for (i = 0, length = orderedModels.length; i < length; i++) {
                    this.models.push(orderedModels[i]);
                }
            }
        }

        // Sort the collection if appropriate.
        if (sort) {
            this.sort();
        }

        // Return the added (or merged) model (or models).
        return singular ? models[0] : models;
    },

    // Remove a model, or a list of models from the set.
    remove: function (models, options) {
        var singular,
            model,
            index,
            id,
            i;

        // check if is a single or multiple model
        singular = !lodash.objects.isArray(models);

        // create a new array with index 0 or clone the models
        models = singular ? [models] : lodash.objects.clone(models);

        // default set for options
        options = options || {};

        for (i = 0, length = models.length; i < length; i++) {
            model = models[i] = this.get(models[i]);
            if (!model) continue;
            id = this.modelId(model.attributes);
            if (id !== null) {
                delete this._byId[id];
            }
            delete this._byId[model.cid];
            index = this.indexOf(model);
            this.models.splice(index, 1);
            this.length--;
            this._removeReference(model, options);
        }
        return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models
    // Useful for bulk operations and optimizations.
    reset: function (models, options) {
        options = options ? lodash.objects.clone(options) : {};
        for (var i = 0, length = this.models.length; i < length; i++) {
          this._removeReference(this.models[i], options);
        }
        options.previousModels = this.models;
        this._reset();
        models = this.add(models, lodash.objects.assign({silent: true}, options));
        return models;
    },

    // Get a model from the set by id. Obj can either be the entire model attributes
    // or just the id of the model
    get: function (obj) {
        var id;

        // TODO create a better comparative to check if id is valid or not (maybe just if(id) ?)
        if (obj == null) {
            return void 0;
        }

        // if model get id from attributes, otherwise we already have the id
        id = this.modelId(this._isModel(obj) ? obj.attributes : obj);

        return this._byId[obj] || this._byId[id] || this._byId[obj.cid];
    },

    // Create a new collection with an identical list of models as this one.
    clone: function () {
        return new this.constructor(this.models, {
            model: this.model,
            comparator: this.comparator
        });
    },

    // Define how to uniquely identify models in the collection.
    modelId: function (attrs) {
        return attrs[this.model.prototype.idAttribute || 'id'];
    },

    // Should be called by the model inside this collection in order to update
    // the indexes, if necessary
    modelUpdate: function (model) {
        var prevId,
            id;
        prevId = this.modelId(model.previousAttributes());
        id = this.modelId(model.attributes);
        if (prevId !== id) {
            // TODO create a better comparative to check if id is valid or not (maybe just if(id) ?)
            if (prevId != null) delete this._byId[prevId];
            if (id != null) this._byId[id] = model;
        }
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function () {
        this.length = 0;
        this.models = [];
        this._byId = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function (attrs, options) {
        // if it is a model, save a reference of the collection and add it
        if (this._isModel(attrs)) {
          if (!attrs.collection) {
              attrs.collection = this;
          }
          return attrs;
        } else {
            var model;
            // if this is just a hash of attributes, create a new instance of the model
            // of this collection
            options = options ? lodash.objects.clone(options) : {};
            options.collection = this;
            return new this.model(attrs, options);
        }
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function (model, options) {
        var id;
        this._byId[model.cid] = model;
        id = this.modelId(model.attributes);
        // TODO create a better comparative to check if id is valid or not (maybe just if(id) ?)
        if (id != null) {
            this._byId[id] = model;
        }
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function (model, options) {
        if (this === model.collection) {
            delete model.collection;
        }
    },

    // Method for checking whether an object should be considered a model for
    // the purposes of adding to the collection.
    _isModel: function (model) {
        return model instanceof Model;
    },

    // Add a model to the end of the collection.
    push: function (model, options) {
        return this.add(model, lodash.objects.assign({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function (options) {
        var model = this.at(this.length - 1);
        this.remove(model, options);
        return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function (model, options) {
        return this.add(model, lodash.objects.assign({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function (options) {
        var model = this.at(0);
        this.remove(model, options);
        return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function () {
        return [].slice.apply(this.models, arguments);
    },

    // Get the model at the given index on the collection
    at: function (index) {
        if (index < 0) {
            index += this.length;
        }
        return this.models[index];
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function (attrs) {
        return this.where(attrs, true);
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function (attrs, first) {
        var matches,
            checkMatch;

        // implementation from underscore
        // https://github.com/jashkenas/underscore/blob/master/underscore.js
        matches = function(attrs) {
            var pairs = lodash.objects.pairs(attrs), length = pairs.length;
            return function(obj) {
              if (obj == null) return !length;
              obj = new Object(obj);
              for (var i = 0; i < length; i++) {
                var pair = pairs[i], key = pair[0];
                if (pair[1] !== obj[key] || !(key in obj)) return false;
              }
              return true;
            };
        };
        checkMatch = matches(attrs);
        // detect which lodash method to use, find or filter based on first parameter
        return lodash.collections[first ? 'find' : 'filter'](this.models, function(model) {
            return checkMatch(model.attributes);
        });
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function (options) {
        if (!this.comparator) {
            throw new Error('Cannot sort a set without a comparator');
        }

        options = options || {};

        // Run sort based on type of `comparator`.
        if (lodash.objects.isString(this.comparator) || this.comparator.length === 1) {
            this.models = this.sortBy(this.comparator, this);
        } else {
            this.models.sort(lodash.functions.bind(this.comparator, this));
        }

        return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function (attr) {
        return lodash.collections.invoke(this.models, 'get', attr);
    }
});

// Lodash methods that we want to implement on the Collection.
// 90% of the core usefulness of Onyx Collections is actually implemented here
// all the aliases were removed (each -> forEach, and things like that)
var methods = ['forEach', 'map', 'reduce', 'reduceRight', 'reject', 'every', 'some',
    'contains', 'invoke', 'max', 'min', 'toArray', 'size', 'first', 'last', 'shuffle',
    'without', 'difference', 'initial', 'rest'];

// Mix in each Lodash method as a proxy to `Collection#models`.
lodash.collections.forEach(methods, function (method) {
    var functionGroup;
    if (!lodash.collections[method] && !lodash.arrays[method]) return;
    Collection.prototype[method] = function () {
        var args = [].slice.call(arguments);
        args.unshift(this.models);
        functionGroup = lodash.collections[method] ? 'collections' : 'arrays';
        return lodash[functionGroup][method].apply(lodash[functionGroup], args);
    };
});

// Lodash methods that take a property name as an argument.
var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

// Use attributes instead of properties.
lodash.collections.forEach(attributeMethods, function (method) {
  if (!lodash.collections[method]) return;
  Collection.prototype[method] = function (value, context) {
    var iterator = lodash.objects.isFunction(value) ? value : function (model) {
      return model.get(value);
    };
    return lodash.collections[method](this.models, iterator, context);
  };
});

// same extend function used by backbone
Collection.extend = extend;

module.exports = Collection;
