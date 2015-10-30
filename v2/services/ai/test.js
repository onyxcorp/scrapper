
var natural = require('natural'),
    slug = require('slug'),
    NGrams = natural.NGrams,
    tokenizer = new natural.WordTokenizer();

slug.defaults.modes['rfc3986'] = {
    replacement: '-',      // replace spaces with replacement
    symbols: true,         // replace unicode symbols or not
    remove: null,          // (optional) regex to remove characters
    lower: true,           // result in lower case
    charmap: slug.charmap, // replace special characters
    multicharmap: slug.multicharmap // replace multi-characters
};

slug.defaults.mode = 'rfc3986';

/**
 *      CLASSIFY PRODUCT SUPPLIER (Integralmedica, Probiotica, etc)
 *
 */


/**
 *      CLASSIFY PRODUCT TYPE (Proteina, Aminoacido, Albumina, Waxy Maize, etc)
 *
 */
natural.BayesClassifier.load('./classifiers/type.json', null, function(err, classifier) {
    var testData = require('./trainers/typeTestData.js'),
        correctItems = 0,
        totalItems = 0;

    totalItems = testData.length;

    testData.forEach( function (item) {
        if (item.type === classifier.classify(item.title)) {
            correctItems += 1;
        } else {
            console.log(classifier.classify(item.title), 'but should be', item.type, '-', item.title)
        }
    });

    console.log('% of correct matches', correctItems / totalItems);

});
