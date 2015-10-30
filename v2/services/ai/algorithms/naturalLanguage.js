
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

var firstProductTokens = tokenizer.tokenize(slug('SUPER WHEY 100% PURE 907 G BODY SIZE - 4 sports life'));
var secondProductTokens = tokenizer.tokenize(slug('100% Pure Whey (900g) - Probiótica'));

// console.log(firstProductTokens);
// console.log(secondProductTokens);

// console.log(NGrams.trigrams(firstProductTokens));

// console.log(natural.JaroWinklerDistance(firstProductTokens, secondProductTokens));

natural.BayesClassifier.load('./classifiers/supplier.json', null, function(err, classifier) {
  // console.log(classifier.getClassifications('SUPER WHEY 100% PURE 907 G BODY SIZE - 4 sports life'));
  // firstProductTokens.forEach(function (token) {
  //   console.log(token, classifier.classify(token));
  //   console.log(classifier.getClassifications(token));
  // });
});

natural.BayesClassifier.load('./classifiers/type.json', null, function(err, classifier) {
  console.log(classifier.getClassifications(slug('100% WHEY GOLD STANDARD 2 LBS - OPTIMUM NUTRITION')));
  // console.log(classifier.getClassifications(slug('Amino Power Plus (150tabs) Probiótica')));
  // firstProductTokens.forEach(function (token) {
  //   console.log(token, classifier.classify(token));
  //   console.log(classifier.getClassifications(token));
  // });
});
