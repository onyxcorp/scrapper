var natural = require('natural'),
    types = require(__dirname + '/../data/types.js'),
    classifier = new natural.LogisticRegressionClassifier();

/**
 *      ACIDO LINOLEICO
 */
types.linoleicAcid.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Acido Linoleico');
});


/**
 *      ALBUMINA
 */
types.albumina.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Albumina');
});


/**
 *      AMINOACIDO
 */
types.aminoacido.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Aminoacido');
});


/**
 *      BARRA PROTEINA
 */
types.proteinBar.forEach( function (keyword){
    classifier.addDocument(keyword, 'Barra Proteina');
});


/**
 *      CARBOIDRATOS
 */
types.carbohydrate.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Carboidrato');
});


/**
 *      CREATINA
 */
types.creatine.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Creatina');
});


/**
 *      GLUTAMINA
 */
types.glutamine.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Glutamina');
});


/**
 *      PROTEINA
 */
types.protein.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Proteina');
});


/**
 *      PRE-HORMONAL
 */
types.preHormonal.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Pre-Hormonal');
});


/**
 *      POLIVITAMINICOS
 */
types.vitamins.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Polivitaminico');
});


/**
 *      TERMOGENICOS
 */
types.thermogenics.forEach( function(keyword) {
    classifier.addDocument(keyword, 'Termogenico');
});

classifier.train();

classifier.save(__dirname + '/type.json', function(err, classifier) {
    if (err) {
      console.error(err);
    } else {
      console.log('Type classifier trained model saved');
    }
});
