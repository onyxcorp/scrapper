
var Helpers;

Helpers = {

    numbersOnly: function (string, first) {

        var regex,
            numbersArray;

        first = first || true;

        regex = /\d+/g;

        numbersArray = string.match(regex);

        if (first) {
            return parseFloat(numbersArray[0]);
        } else {
            return numbersArray;
        }

    },

    priceNumbersOnly: function (string, colon) {

        var regex,
            numbersArray;

        colon = colon || ',';

        if (colon === ',') {
            regex = /[0-9]+(\,[0-9]{1,2})/;
            numbersArray = string.match(regex);
            return parseFloat(numbersArray[0].replace(/,/g, '.'));
        } else {
            regex = /[0-9]+(\.[0-9]{1,2})/;
            numbersArray = string.match(regex);
            return parseFloat(numbersArray[0]);
        }
    }
};

module.exports = Helpers;
