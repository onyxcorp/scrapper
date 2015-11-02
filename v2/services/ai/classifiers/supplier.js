var natural = require('natural'),
    classifier = new natural.BayesClassifier(),
    suppliers = require(__dirname + '/../data/suppliers.js');

suppliers.forEach(function (supplier) {
    classifier.addDocument(supplier, 'Supplier');
});

classifier.train();

classifier.save(__dirname + '/supplier.json', function(err, classifier) {
    if (err) {
      console.error(err);
    } else {
      console.log('Supplier classifier trained model saved');
    }
});
//
//
// var slug = require('slug'),
//     tokenizer = new natural.WordTokenizer();
//
// var testText = [
//     'Protein Crisp Bar (12unid) Integral Medica',
//     'Protein Crisp Bar (12unid) Integral Médica',
//     'Iron Man Protein Bar 40% Proteína (12unid) New Millen',
//     'Protein Crisp Bar (*UNIDADE*) Integral Médica',
//     'Fit Whey Bar (12 Unidades/30g) Probiótica',
//     'Carb Rite (12unid) Doctor',
//     'Carnivor Bar (*UNIDADE*) MuscleMeds',
//     'BCAA + (125tabs) 4 Plus Nutrition',
//     'Wafer Protein Bar (45g/12unid) Pró Premium Line'
// ];
//
// testText.forEach(function (title) {
//
//     var selectedTokens = [];
//     var testTokens = tokenizer.tokenize(slug(title));
//
//     testTokens.forEach(function (token) {
//         var classification = classifierBayes.getClassifications(token);
//         // console.log(token);
//         // console.log(classification);
//         if (classification[0].value < 1) {
//             selectedTokens.push(token);
//         }
//     });
//
//     console.log(selectedTokens);
// });

/**
 *  CLASSIFIER BY LOGISC REGRESSION
 *
 */
 // TODO GARBAGE FOR LOW DATA
// suppliersList.forEach(function (supplier) {
//     classifierLogistic.addDocument(supplier, 'Supplier');
// })
//
// classifierLogistic.train();
//
// testText.forEach(function (title) {
//
//     var selectedTokens = [];
//     var testTokens = tokenizer.tokenize(slug(title));
//
//     testTokens.forEach(function (token) {
//         var classification = classifierLogistic.getClassifications(token);
//         // console.log(token);
//         // console.log(classification);
//         if (classification[0].value < 1) {
//             selectedTokens.push(token);
//         }
//     });
//
//     console.log('found tokens for Logistic Regression');
//     console.log(selectedTokens);
// });

/**
 *
 *      USING TRIE TO FOUND MATCH
 *
 */

// var Trie = natural.Trie,
//     trie = new Trie();
//     trie.addStrings(suppliersList);
//
// function findBestMatch(token) {

    // var currentFound = {
    //         supplier: '',
    //         value: 100
    //     },
    //     stringDistance = 0;

    // console.log('testing trie');
    // console.log(trie.findPrefix(token));

    // return
    // return trie.keysWithPrefix(token);
    // suppliersList.forEach(function (supplier) {
    //
    //     // since we are dealing with possible abreviations of suppliers names like
    //     // pró meaning probiotica, we should increase the cost of the deletion_cost
    //     // and substitution while keeping the insertion_cost default
    //     // (that was the best results showed by the tests)
    //     stringDistance = levenshteinDistance(token, supplier, {
    //         insertion_cost: 1,
    //         deletion_cost: 2,
    //         substitution_cost: 2
    //     });
    //     if (stringDistance < currentFound.value) {
    //         currentFound.value = stringDistance;
    //         currentFound.supplier = supplier;
    //     }
    // });

    // return currentFound;
// }
