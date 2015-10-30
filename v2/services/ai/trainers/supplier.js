var natural = require('natural'),
    classifier = new natural.BayesClassifier();

classifier.addDocument('3vs nutrition', 'supplier');
classifier.addDocument(['4', 'fuel'], 'supplier');
classifier.addDocument(['4', 'sports', 'life'], 'supplier');

//   '4 plus nutrition',
//   'abb performance',
//   'absolute nutrition',
//   'adaptogen science',
//   'ads',
//   'ast',
//   'all max',
//   'allmax',
//   'arnold nutrition',
//   'bngr',
//   'bsn',
//   'barleans',
//   'blender bottle',
//   'body action',
//   'body size',
//   'champion nutrition',
//   'clean bottle',
//   'cytosport',
//   'optimum nutrition',
//   'on',
//   'integral medica',
//   'integralmedica',
//   'probiotica'
// ], 'supplier');

// D
// Designer
// Dymatize
// E
// EAS
// Ethika
// F
// Fama
// G
// Gaspari
// Gat
// Genetics Tech
// H
// Harbinger
// I
// Integral Médica
// L
// Labrada
// Luz
// M
// Millennium
// Muscle Pharm
// N
// Natures Best
// Naturovos
// New Millen (Milly)
// Nutrabolics
// Nutrex
// Nutricé
// Nutrilatina
// Nutrilatina Renovee
// O
// Oh Yeah ISS
// One Sport
// Optimum Nutrition
// P
// Pacific Helth
// Polar Bottle
// Probiótica
// Prolab
// Pró Premium Line
// R
// Revolution
// S
// Salto's
// SportPharma
// Syntrax
// T
// Twinlab
// U
// Universal Nutrition
// V
// VPX Sports
// Vitafor

classifier.train();
classifier.save(__dirname + '/../classifiers/supplier.json', function(err, classifier) {
    if (err) {
      console.error(err);
    } else {
      console.log('Supplier classifier was saved');
    }
});
