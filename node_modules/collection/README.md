# Collection

Collections management for javascript based on Backbone.collections, created
to be used with Flux Architecture.

The main differences from Backbone.collections are:

* No auto-sync with database, thus separating how the data is created/updated
and how it should be done with the server (ideally through an external API file);
* No internal event system, in order to keep all the events to flow only through a central dispatcher;
* Implemented with [lodash-node](https://www.npmjs.com/package/lodash-node "lodash node") instead of underscore;

## Methods/attributes overview

### Attributes
* model

### Methods
* initialize - initialization method
* toJSON - returns the attributes of the models as an numbered index (array)
* toObjectJSON - returns the attributes of the models with the primary attribute as the key (dictionary array)
* add - to add a new model to the collection (pre-configured shortcut to set)
* remove - to remove a model from the collection (pre-configured shortcut to set)
* set - to add/update/remove any model from the collection
* reset - reset the collection to it's default state, accept a new list of models to repopulate the collection
* get - get a model from the collection by the model or it's index
* clone - clone the entire collection with it's current data
* modelId - get some model ID
* modelUpdate - method that is normally used by the models in the collection when it's data is updated. This is used to keep the collection references (_byId) updated
* push - add a model to the bottom of the collection
* pop - remove a model from the bottom of the collection
* unshift - add a model to the beggining of the collection
* shift - remove a model from the beggining of the collection
* slice - remove a sub-array of models from the collectio
* at - get the model at a given index position on the collection
* findWhere - work as a shortcut to where called with the second argument as true
* where - return a model with matching attributes
* sort - force the collection to sort itself
* pluck - pluck an attribute from each model on the collection
* _reset - reset the collection to an empty state
* _prepareModel - prepare a model to be added to the collection
* _addReference - tie a model to the collection and to the _byId reference
* _removeReference - remove a model tie from the collection and from the _byId reference
* _isModel - check if the model being added matches the collection model attribute

### Sorting Methods

The sorting methods work as a shortcut to their respective lodash implementations,
they are automatically used with the collection.models attribute as the data source.
* [groupBy](https://lodash.com/docs#groupBy)
* [countBy](https://lodash.com/docs#countBy)
* [sortBy](https://lodash.com/docs#sortBy)
* [indexBy](https://lodash.com/docs#indexBy)

### Lodash methods

Those methods work as a shortcut to their respective lodash implementations, they
are automatically used with the collection.models attribute as the data source.

* [forEach](https://lodash.com/docs#forEach)
* [map](https://lodash.com/docs#map)
* [reduce](https://lodash.com/docs#reduce)
* [reduceRight](https://lodash.com/docs#reduceRight)
* [reject](https://lodash.com/docs#reject)
* [every](https://lodash.com/docs#every)
* [some](https://lodash.com/docs#some)
* [contains](https://lodash.com/docs#contains)
* [invoke](https://lodash.com/docs#invoke)
* [max](https://lodash.com/docs#max)
* [min](https://lodash.com/docs#min)
* [toArray](https://lodash.com/docs#toArray)
* [size](https://lodash.com/docs#size)
* [first](https://lodash.com/docs#first)
* [last](https://lodash.com/docs#last)
* [shuffle](https://lodash.com/docs#shuffle)
* [without](https://lodash.com/docs#without)
* [difference](https://lodash.com/docs#difference)
* [initial](https://lodash.com/docs#initial)
* [rest](https://lodash.com/docs#rest)
