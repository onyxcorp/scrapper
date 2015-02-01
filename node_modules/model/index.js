var lodash = {
        arrays: {
            remove: require('lodash-node/modern/arrays/remove'),
            difference: require('lodash-node/modern/arrays/difference'),
        },
        collections: {
            forEach: require('lodash-node/modern/collections/forEach'),
            find: require('lodash-node/modern/collections/find'),
            filter: require('lodash-node/modern/collections/filter')
        },
        objects: require('lodash-node/modern/objects'),
        utils: require('lodash-node/modern/utilities')
    },
    SchemaValidator = require('jsonschema').Validator,
    Formatter = require('formatter'),
    Transmuter = require('transmuter'),
    extend = require('backbone-extend-standalone'),
    ModelValidator;

ModelValidator = new SchemaValidator();

// Onyx.Model (based on Backbone.Model)
// --------------

// Onyx **Models** are the basic data object that, ideally, represent some information
// from the database, like a row in a table. A discrete chunk of data and a bunch
// of useful, related methods for performing computations and transformations on that data.

// Create a new model with the specified attributes. A client id (`cid`)
// is automatically generated and assigned for you.
var Model = function(attributes, options) {
    // defensive copying (make sure we don't change the attributes origin)
    var attrs = attributes || {};
    // if options is empty create an empty object literal
    options = options || {};
    // set an unique id for this model
    this.cid = lodash.utils.uniqueId('c');
    this.attributes = {};

    // save a reference to the collection this model belongsTo
    if (options.collection) {
        this.collection = options.collection;
    }

    // ovewrite the default values with the ones passed in the attributes
    attrs = lodash.objects.defaults({}, attrs, lodash.utils.result(this, 'defaults'));

    // set the data in the model
    this.set(attrs, options);

    // keep track of what have changed on the model data
    this.changed = {};

    // run default init function
    this.initialize.apply(this, arguments);
};

// Attach all inheritable methods to the Model prototype.
lodash.objects.assign(Model.prototype, {

    // Holds any custom method that can be used to validate the attributes of the model
    // The function must return empty for the attribute to be considered valid
    _validTypes: {},

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: '',

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function () {
        if (!this._schema) {
            throw new Error('You forgot to set a _schema for the model', 'index.js', 80);
        }
    },

    // Return a copy of the model attribute as a JSON string
    toJSON: function () {
        return lodash.objects.cloneDeep(this.attributes);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function (attr) {
        return this.get(attr) != null;
    },

    // Returns data from an attribute that matches the current search
    // The attribute can be an object|array|string
    find: function (attr, data, first) {
        var attribute;

        first = first || true;
        attribute = this.attributes[attr];

        if (!lodash.objects.isNumber(attribute)) {
            return lodash.collections[first ? 'find' : 'filter'](this.attributes[attr], data);
        } else {
            throw new Error('Find can only be performed on String, Array or Object type attribute', 'index.js', 106);
        }
    },

    // How the data should be send when "get" is used. It's worth mentioning that
    // this method should never perform data transmutation, it should only format
    // it and never change it's type so the data will always be send throught the
    // get with the same type it was initially set
    // For a list of all available methods check utils/Formatter.js
    to: function (type, attr) {

        type = Formatter.camelize(type);

        // crate array from arguments
        var args = [].slice.call(arguments);

        // remove the known attributes
        lodash.arrays.remove(args, function(value) {
            return value === type || value === attr;
        });

        // set the attribute to change as the first element on the array
        args.unshift(this.attributes[attr]);

        if (this[type]) {
            // make sure the context in the called function is the current object
            return this[type].apply(this, args);
        } else if (Formatter[type]) {
            return Formatter[type].apply(null, args);
        } else {
            throw new Error('Formatting function not found: ' + type + '.', 'index.js', 135);
        }
    },

    // Create a new model with identical attributes to this one.
    clone: function () {
        return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    // Normally used to check if the model is being created or updated
    isNew: function () {
        return !this.has(this.idAttribute);
    },

    // Get the value of an attribute.
    get: function (attr) {
        if (this._schema.properties[attr]) {
            // even if there is no attribute we cant send other values
            // like if there is no id send the cid would cause problems since
            // using this.has('id') would make the model think it have the attribute
            // or that it's not a new model (when using isNew)
            return this.attributes[attr];
        } else {
            throw new Error('Trying to get the attribute: ' + attr + ', but it was not found at the current model _schema', 'index.js', 160);
        }
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    // TODO set an state of the model based on it's current idAttribute (CREATE / UPDATE / PATCH)
    set: function(key, val, options) {
        var attr,
            attrs,
            unset,
            changes,
            value,
            prevAttributes,
            defaultOptions;

        // just leave if there is no key
        if (key == null) return this;

        // Handle both 'key, value, option' or and '{key: value}, option' -style arguments.
        if (typeof key === 'object') {
          attrs = key;
          options = val;
        } else {
          (attrs = {})[key] = val;
        }

        // make sure options exists, if not create an empty object.
        // Also make a defensive copy of it
        defaultOptions = {unset: false};
        options = lodash.objects.defaults({}, options, defaultOptions);

        // perform a check on current model schema with the attributes passed
        if (!this.checkSchema(attrs)) {
            return false;
        }

        // Extract attributes and options.
        unset           = options.unset;
        changes         = [];

        this._previousAttributes = lodash.objects.clone(this.attributes);
        this.changed = {};

        prevAttributes = this._previousAttributes;

        // Check for changes of `id`.
        if (this.idAttribute in attrs) {
            this.id = attrs[this.idAttribute];
        }

        // For each `set` attribute, update or delete the current value.
        for (attr in attrs) {
            value = attrs[attr];
            // check if current value is differente from the new one
            if (!lodash.objects.isEqual(this.attributes[attr], value)) {
                changes.push(attr);
            }
            // check if the previous value is different from the new one
            if (!lodash.objects.isEqual(prevAttributes[attr], value)) {
                // if there is a difference, update the changed attribute
                this.changed[attr] = val;
            } else {
                // same data the attribute wasn't upate in the last iteration
                // let's just remove it
                delete this.changed[attr];
            }

            if (unset) {
                delete this.attributes[attr];
            } else {
                this.attributes[attr] = value;
            }
        }

        if (this.collection) {
            this.collection.modelUpdate(this);
        }

        return this;
    },

    // Remove an attribute from the model
    // Helper wrapper for the set method called with unset: true
    unset: function(attr, options) {
        return this.set(attr, void 0, lodash.objects.assign({}, options, {unset: true}));
    },

    // Clear all attributes on the model
    // Helper wrapper for the set method called with unset: true
    clear: function(options) {
        var attrs,
            key;

        attrs = {};
        for (key in this.attributes) {
            attrs[key] = void 0;
        }
        return this.set(attrs, lodash.objects.assign({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last changed event
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
        if (attr == null) {
            return !lodash.objects.isEmpty(this.changed);
        }
        return lodash.objects.has(this.changed, attr);
    },

    // Get the previous value of an attribute, recorded at the time the last
    // time the attribute was changed
    previous: function (attr) {
        if (attr == null || !this._previousAttributes) {
            return null;
        }
        return this._previousAttributes[attr];
    },

    // Returns a copy of all of the attributes of the model at the time of the previous
    // change event (avoid the reference being modified externally)
    previousAttributes: function () {
        // lets clone to avoid the attributes being modified by reference
        return lodash.objects.clone(this._previousAttributes);
    },

    // Check if the model is currently in a valid state.
    isValid: function () {
        return !Transmuter.toBoolean(this.validationError);
    },

    // check if the attributes passed match with the model schema
    checkSchema: function (attrs) {

        var validatorResult,
            difference;

        // first check and load any custom validation methods for types
        if (this._validTypes) {
            lodash.objects.assign(ModelValidator.attributes, this._validTypes);
        }

        // merge the attributes currently set on the model with the ones being updated
        // also works as a defensive copy to avoid overriding the root data
        attrs = lodash.objects.assign({}, this.attributes, attrs);

        // there is a valid _schema?
        if (!this._schema) {
            throw new Error('You must set a _schema for this model, otherwise validate will always return false', 'index.js', 309);
        } else { // check if the property being set set is correctly declared at the _schema attribute
            difference = lodash.arrays.difference(lodash.objects.keys(attrs), lodash.objects.keys(this._schema.properties));
            if (!lodash.objects.isEmpty(difference)) {
                throw new Error('You are trying to set attributes that are not described on the model _schema:' + difference.toString(), 'index.js', 313);
            } else { // everything is ok, perform a validation
                validatorResult = ModelValidator.validate(attrs, this._schema);
                if (!validatorResult.valid) {
                    this.validationError = validatorResult.toString();
                }
            }
        }
        return this.isValid();
    },
    _previousAttributes : {}
});

// Lodash methods that we want to implement on the Model.
// Those should be used to manipulate the data in the object
// Lodash object methods
lodash.collections.forEach(['transform', 'values', 'pairs', 'invert', 'pick', 'omit'], function (method) {
    if (!lodash.objects[method]) return;
    Model.prototype[method] = function() {
      var args = [].slice.call(arguments);
      args.unshift(this.attributes);
      return lodash.objects[method].apply(lodash.objects, args);
    };
});

// this is the same extend used in backbone
// same extend function used by backbone
Model.extend = extend;

module.exports = Model;
