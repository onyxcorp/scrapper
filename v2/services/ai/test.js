
var natural = require('natural'),
    slug = require('slug'),
    tokenizer = new natural.WordTokenizer(),
    testData = require('./testData/baseTestData');

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

// var findBestMatch = require('./supplier.js');
//
// testData.forEach(function (item) {
//     var bestToken = null,
//         bestSupplier,
//         tokens = tokenizer.tokenize(slug(item.title)),
//         currentMatch;
//
//     tokens.forEach( function (token) {
//         currentMatch = findBestMatch(token);
//
//         // if (currentMatch.value < bestToken.value) {
//         if (currentMatch[0]) {
//             bestToken = currentMatch[0];
//         }
//
//         if (bestToken !== slug(item.supplier)) {
//             console.log(bestToken, 'but should be', slug(item.supplier), 'for product', item.title);
//             console.log(currentMatch);
//         }
//     });

    // if (!bestToken) {
    //     console.log('not found for', item.title);
    //     console.log(tokens);
    // } else {
    //     console.log('best token is', bestToken);
    // }


    // if (bestToken.supplier !== slug(item.supplier)) {
    //     console.log('best token for', slug(item.supplier), 'is');
    //     console.log(bestToken);
    // }
// });

/**
 *
 *      CLASSIFY PRODUCT SUPPLIER (IntegralMedica, Probiotica, New Millen)
 *
 */
natural.BayesClassifier.load('./classifiers/supplier.json', null, function(err, classifier) {
    var correctItems = 0,
        totalItems = 0;

    totalItems = testData.length;

    testData.forEach( function (item) {

        var selectedTokens = [],
            testTokens = tokenizer.tokenize(slug(item.title));

        testTokens.forEach(function (token) {
            var classification = classifier.getClassifications(token);
            // console.log(token);
            // console.log(classification);
            // console.log(classification[0].value, token);
            if (classification[0].value < 1) {
                selectedTokens.push(token);
            }
        });

        console.log(selectedTokens);
    });

    console.log('% of correct matches', correctItems / totalItems);

});

/**
 *
 *      CLASSIFY PRODUCT TYPE (Proteina, Aminoacido, Albumina, Waxy Maize, etc)
 *
 */
natural.LogisticRegressionClassifier.load('./classifiers/type.json', null, function(err, classifier) {

    var correctItems = 0,
        totalItems = 0;

    totalItems = testData.length;

    testData.forEach( function (item) {
        var classification = classifier.getClassifications(item.title);
        if (item.type === classifier.classify(item.title)) {
            correctItems += 1;
        } else {
            console.error(classifier.classify(item.title), 'but should be', item.type, '-', item.title);
            console.log(classification);
        }

        var total = 0;
        classification.forEach(function (item) {
            total += item.value;
        })
        total = total;

        // relationship between the first and second position
        var firstToSecond = classification[1].value / classification[0].value * 100;

        // relationship between the first and the total
        var firstToTotal = classification[1].value / total * 100

        // if (firstToSecond > 50 && firstToTotal > 10) // TODO THRESHOLD WHEN USING NAIVE BAYES
        if (firstToSecond > 90) {  // TODO THRESHHOLD WHEN USING LOGISTIC REGRESSION

            // The items inside this conditional have a great level o uncertaintiy
            // they should be categorized as a separated feature for future human review
            // console.log(item.title, 'accuracy', firstToSecond);
            // console.log(classification);
        } else {
            // console.log('accuracy', firstToSecond);
        }

    });

    console.log('% of correct matches', correctItems / totalItems);

});
