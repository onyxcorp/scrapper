# Model

Model is module created to help manage data with Javascript. It is based on
Backbone.model. It was primarely created to be used in the Flux architecture.

The main differences from Backbone.model are:

* No auto-sync with database, thus separating how the data is created/updated locally
and how it should be done with the server;
* No internal event system;
* Implemented with [lodash](https://www.npmjs.com/package/lodash "lodash") instead of underscore;
* Completely differente validation system, this model is used toghether with [jsonschema module](https://www.npmjs.com/package/jsonschema "jsonschema"), in order to allow for better validation and control of data

## Methods/attributes overview

### Attributes
* _validTypes
* changed
* validationError
* idAttribute


### Methods
* initialize
* toJSON
* has
* find
* to
* clone
* isNew
* get
* set
* unset
* clear
* hasChanged
* previous
* previousAttributes
* isValid
* _checkSchema
