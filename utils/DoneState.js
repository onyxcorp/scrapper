
var lodash = {
        collections: {
            forEach: require('lodash-node/modern/collections/forEach'),
            reduce: require('lodash-node/modern/collections/reduce')
        }
    },
    debug = function(msg) { console.log(msg); };

function Done(doneList) {
    this.doneObject = {};
    this.doneState = null;

    if (doneList && doneList.length) {
        lodash.collections.forEach(doneList, function (value) {
            this.startDoneState(value);
        }.bind(this));
    }
}

Done.prototype.getDoneState = function () {
    return this.doneState;
};

Done.prototype.startDoneState = function(model) {
    // initialize all done state as false (we are not done yet)
    this.doneObject[model] = false;
    // debug('current properties of doneObject');
    // debug(this.doneObject);
};

    // State can accept three types of parameters, be a boolean (true/false) or an obeject of type Error)
Done.prototype.finishDoneState = function(model, state) {

    if (typeof model !== 'string') {
        throw new Error('The first argument of finishDoneState must an string');
    }

    if (typeof state !== 'boolean' && typeof state !== 'object') {
        throw new Error('The second argument of finishDoneState must be either a boolean or an object');
    }

    // state could be true/false/error
    this.doneObject[model] = state;

    this.doneState = lodash.collections.reduce(this.doneObject, function (lastValue, currentValue, currentKey) {
        // if current donestate is an error, return it as an error
        if (currentValue instanceof Error) {
            return new Error(currentKey);
        } else if (lastValue instanceof Error) {
            // do nothing, we already set the error
        } else if (!lastValue) {
            // if last value is false, it mean's we are not finished yet, so just keep returning false
            return false;
        } else {
            // if the current value was set to true, just return true value
            if (currentValue) {
                return true;
            } else {
                // currentValue is false, just return it
                return false;
            }
        }
    }, true);

    return this.doneState;
};

module.exports = Done;
