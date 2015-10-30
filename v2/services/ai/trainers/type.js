var natural = require('natural'),
    classifier = new natural.BayesClassifier();


/**
 *      ALBUMINA
 */
var albuminaKeywords = [
    // keywords
    'albumina',
    'albumix',
    'albumax',
    'albumin',
    // titles
    'Albumina Refil (500g)',
    'Albumin Maxxi (500g)',
    'Albumix Plus Refil (1kg)',
    'Albumina 80 Refil (500g)',
    'Albumina (900g)',
    'ALBUMIX 120 TABS',
    'ALBUMIN W - TECH 500 G ',
    'SUPER ALBUMIN MILLENNIUM 500 G',
    'ISO ALBUMIN PROTEIN 250 G',
    'ALBUMAX 100 500 G'
];

albuminaKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Albumina');
});


/**
 *      CRETINA
 */
var creatineKeywords = [
  // keyword
  'creatine',
  'creatina',
  'creapure',
  'crealean',
  'kre-alkalyn',
  'CreaLean Powder',
  // text 
  'CREATINA CREAPURE 150 G',
  'CREAPURE 120 CÁPSULAS',
  'CREATINE MONOHYDRATE 300 G',
  'MASS CREATINE 1,5 KG',
  'CREATINE CHEWS 144 TABS',
  'CREATINA CREAPURE PROFESSIONAL 150 G',
  'CREAFORT POTE C/ 300 G',
  'CREATINE WAY 100 G',
  'CREATINA MONO-HIDRATADA MICRONIZADA MILLENNIUM 420 G',
  '100% CREATINE 100 G',
  'PUMP-HD (330g)',
  'Creakic (180caps)',
  'CreaLean Powder (500g)',
]

creatineKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Creatina');
});


/**
 *      PROTEINA
 */
var wheyProteinKeywords = [
    // keyword
    '3 whey',
    '5 whey',
    'pro whey',
    'whey protein',
    'iso pro whey',
    'hydro beef',
    'ultra whey',
    'whey isolado',
    'whey hidrolizado',
    'whey hydrolyzed',
    'whey concentrado',
    'carnitech',
    // text
    'WHEY PROTEIN 3W 900 G',
    '100% PURE WHEY PROTEIN 900 G',
    'PURE WHEY ADVANCED PROTEIN 100% 480 G',
    'WHEY PROTEIN 1 KG',
    'CARNITECH 100% BEEF PROTEIN 900 G',
    'ISOPRIME 100% BEEF PROTEIN 1,75 LBS',
    'Whey Shake (2270g)',
    'Elite Gourmet (2.268g)',
    'Blend Whey (900g)',
    'Bariatric Whey (250g)',
    'Carnivor (1753g)',
    'Clean Whey Avonlac 282 (5kg)',
    'Clean Whey Concentrada 81% (900g) ',
    'Combat 100% Isolate (2.269g)',
    'Gold ISO Whey Protein Isolado (910g)',
    'Natural Isopure (1361g)',
    'Isopure Zero Carb (3409g)',
    'Isopure Low Carb (3409g)',
    'ULTRA WHEY PRO 909 G',
    'ISO PRO WHEY 2,268 KG',
    'WHEY PRO 2 HYDROLYZED 2LBS',
    'Platinum Hydro Whey (795g)',
    'Rule 1 Protein (1091g)',
    'Protein Complex Premium (1800g)',
    'ISO 100 - 100% Hidrolyzed (856g)',
    'Proto Whey (Power Crunch-910g)',
    'Whey Pro 2 Isolate (908g)',
    'Elite Whey Protein (2268g)',
    'Elite Whey Protein (900g)',
    'ISO 100 - 100% Hidrolyzed (1362g) '
];

wheyProteinKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Proteina');
});


/**
 *      WAXY MAIZE
 */
var waxyMaizeKeywords = [
    // keyword
    'waxy maze',
    'waxy maze',
    'waxy maize',
    'waxymaize',
    'waxymaze',
    // text based
    'WAXY MAIZE D-R 1,5 KG',
    'WAXY MAIZE 1,4 KG',
    'WAXY MAIZE 900 G',
    'WAXY MAIZE 1,4 KG',
    'WAXY MAIZE PRO SERIES 1 KG',
    'WM - WAXY MAIZE 1,4 KG',
    'WAXY MAIZE FOODS 1 KG',
    'WAXYBOLIC 2 KG',
    'WAXIMAIZE 1,5 KG'
];

waxyMaizeKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Waxy Maize');
});


/**
 *      GLUTAMINA
 */
var glutamineKeywords = [
    // keyword
    'glutamina',
    'glutamine',
    'glutamine powder',
    'glutamina powder',
    // text
    'L-GLUTAMINA 300 G',
    'GLUTAMINA POWDER 300 G',
    'GLUTAMINA-SR 1000 G - 12HS. TIMED RELEASE',
    'PERFECT L-GLUTAMINA 600 G',
    'L-GLUTAMINA FOODS 300 G',
    'L-GLUTAMINE 300 G',
    'GLUTAMAX 30 SACHÊS',
    'L-G 300 G'
];

glutamineKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Glutamina');
});


/**
 *      AMINOACIDO
 */

var aminoacidKeywords = [
    // keyword
    'BCAA',
    'amino',
    'aminos',
    'poliamino',
    'BCAA powder',
    'amino BCAA',
    'amino bcaa top',
    'BCAA 2400',
    'BCAA 1000',
    'aminofor',
    'liquid amino',
    'amino fluid',
    'peptide aminos',
    'beef aminos',
    // text
    'BCAA STACK 250 G',
    'Ultimate BCAA 3:1:1 (300g)',
    'BCAA Fix Darkness (400caps)',
    'BCAA 2400 (450 caps)',
    'Amino HD 10:1:1 (300g) - Rodolfo Peres',
    'BCAA Recovery 3-1-1 (120 caps)',
    'BCAA-SR Timed Release 3300 (120 Tabs)',
    'BCAA COM VITAMINA B6 150 CÁPS'
];

aminoacidKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Aminoacido');
});


/**
 *      BARRA PROTEINA
 */

var proteinBarKeywords = [
    // keyword
    'whey bar',
    'vo2 protein',
    'wafer protein',
    'cream crunch',
    'carnivor bar',
    'combat crunch',
    // text
    'barra de proteina',
    'wafer protein',
    'Big 100 (12unidades)',
    'Whey Bar',
    'Whey Bar (24unid)',
    'VO2 Slim Bar (12 unid)',
    'VO2 Slim Bar (24 unid)',
    'VO2 Slim Protein Bar',
    'Protein Crisp Bar',
    'Protein Crisp Bar (12unid)',
    'Protein Plus Bar (12barras)',
    'Quest Bar (12barras)',
    'Protein Bar (Unidade - 46g)',
    'Protein Bar (24 unid x 46g)'
];

proteinBarKeywords.forEach( function (keyword){
    classifier.addDocument(keyword, 'Barra Proteina');
});

/**
 *      TERMOGENICOS
 */

var thermogenicKeywords = [
    // keyword
    'oxy elite',
    'lipodrol',
    'therma pro',
    'thermo pro',
    'ripped',
    'roxy lean',
    'oxylin',
    'fire fury',
    'thermogenic',
    'termogenico',
    'thermogenic liquid',
    'fatloss',
    'lipo cut',
    // text
    'RIPPED EXTREME YELLOW 120 CAPS',
    'FINAL CUT 60 CAPS',
    'LIPODRENE 60 CAPS',
    'THERMOGENIC LIQUID 480 ML',
    'THERMA PRO 480 ML BODY SIZE',
    'BLACK BURN 120 CAPS',
    'THERMOGENIC X-THERM BLACK 60 CAPS',
    'THERMO FOODS POWDER 120 G',
    'RELOAD ENERGY POWDER 300 G',
    'F-DESTROYER 200 G',
    'ULTIMATE FIRE BLACK 120 CAPS',
    'ULTIMATE 2HOT 360 G'
];

thermogenicKeywords.forEach( function(keyword) {
    classifier.addDocument(keyword, 'Termogenico');
});

classifier.train();

classifier.save(__dirname + '/../classifiers/type.json', function(err, classifier) {
    if (err) {
      console.error(err);
    } else {
      console.log('Type classifier was saved');
    }
});
