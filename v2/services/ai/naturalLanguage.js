var natural = require('natural'),
    tokenizer = new natural.WordTokenizer();

var NGrams = natural.NGrams;

console.log(NGrams.ngrams('Whey Protein Optimum Nutrition - 100% Gold Standard Optimum', 4));
console.log(NGrams.ngrams('Gold Standard 100% whey protein - 909g - Optimum Nutrition', 4));
