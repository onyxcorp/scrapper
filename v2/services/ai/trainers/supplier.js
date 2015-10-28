var natural = require('natural'),
    classifier = new natural.BayesClassifier();

classifier.addDocument('optimum nutrition', 'supplier');
classifier.addDocument('integral medica', 'supplier');

classifier.train();

classifier.save('../classifiers/supplier.json', function(err, classifier) {
    // the classifier is saved to the classifier.json file!
    console.log('Supplier classifier was saved');
});
