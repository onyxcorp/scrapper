var natural = require('natural'),
    classifier = new natural.BayesClassifier();

/**
 *      LISTA DE CATEGORIAS (TYPES) CADASTRADOS
 *
 *      - Acido Linoleico
 *      - Albumina
 *      - Aminoacido
 *      - Barra Proteina
 *      - Carboidratos
 *      - Creatina
 *      - Glutamina
 *      - Proteina
 *      - Pre-hormonal
 *      - Polivitaminco
 *      - Termogenicos
 *
 */

/**
 *      ACIDO LINOLEICO
 */

var linoleicAcidKeywords = [
    // keywords
    'carthamus oil',
    'oleo de cartamo',
    'coconut oil',
    'oleo de coco',
    'linoleic acid',
    'omega 6',
    'omega 12',
    // text
    'CARTHAMUS WAY',
    'CL 1000 MG 100',
    'LIPOWAY REDUCE',
    'BORAPRIM',
    'DEFINITION MAX',
    'L.A. 9000 TOP DEFINITION',
    'L.A. TOP DEFINITION',
    'LINOLEN 1000',
    'CA TONALIN',
    'OLEO DE CARTAMO',
    'CA (LINOLEIC ACID) 1000 MG',
    'TONA LEAN CL'
];

linoleicAcidKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Acido Linoleico');
});

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
    'Albumina Refil',
    'Albumin Maxxi',
    'Albumix Plus Refil',
    'Albumina 80 Refil',
    'Albumin W',
    'Albumina W-Tech',
    'Super Albumin Millenium',
    'ISO Albumin Protein',
    'Albumax 100'
];

albuminaKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Albumina');
});



/**
 *      AMINOACIDO
 */
var aminoacidKeywords = [
    // keyword
    'BCAA',
    'amino',
    'aminos',
    'acido poliaminico',
    'poliamino',
    'Poliamino Acid',
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
    'BCAA Stack 250 G',
    'Ultimate BCAA 3:1:1',
    'BCAA Fix Darkness',
    'BCAA 2400',
    'Amino HD 10:1:1 - Rodolfo Peres',
    'BCAA Recovery 3-1-1',
    'BCAA-SR Timed Release 3300',
    'BCAA com Vitamina B6'
];

aminoacidKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Aminoacido');
});


/**
 *      BARRA PROTEINA
 */
var proteinBarKeywords = [
    // keyword
    'wafer protein',
    'carnivor bar',
    'combat crunch',
    // text
    'barra de proteina',
    'wafer protein',
    'Big 100',
    'Whey Bar',
    'VO2 Slim Bar',
    'VO2 Slim Protein Bar',
    'VO2 Protein Bar',
    'Protein Crisp Bar',
    'Protein Plus Bar',
    'Quest Bar',
    'Protein Bar',
    'Whey Bar Low Carb',
    'Choko Crunch Protein',
    'Fitwhey Bar',
    'Wafer Protein Bar',
    'Cream Crunch',
    'Top choco',
    'Carb Rite'
];

proteinBarKeywords.forEach( function (keyword){
    classifier.addDocument(keyword, 'Barra Proteina');
});


/**
 *      CARBOIDRATOS
 */
var waxyMaizeKeywords = [
    // keyword
    'waxy maze',
    'waxi maze',
    'waxy maize',
    'waxi maize',
    'waxymaize',
    'waxymaze',
    'waximaize',
    'waximaze',
    'maltodextrina',
    'malto dextreina',
    'dextrose',
    'destrose',

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
    classifier.addDocument(keyword, 'Carboidrato');
});


/**
 *      CREATINA
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
  'Creatine Titanium',
  'Creatina Titanium',
  'CreaLean Powder (500g)',
]

creatineKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Creatina');
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
    'L-Glutamina 300 G',
    'Glutamina powder 300 g',
    'Glutamina-SR 1000 G - 12HS. Timed Released',
    'Perfect l-glutamina 600 g',
    'L-Glutamina foods 300 G',
    'L-Glutamine 300 G',
    'Glutamax 30 saches',
    'L-G 300 G'
];

glutamineKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Glutamina');
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
    'isolate whey',
    'iso whey',
    'whey hidrolizado',
    'whey hydrolyzed',
    'whey concentrado',
    'carnitech',
    // text
    'Whey Protein 3W',
    '100% Pure Whey Protein',
    '100% Pure Whey',
    'PURE WHEY ADVANCED PROTEIN 100%',
    'Whey Protein 1 KG',
    'CARNITECH 100% BEEF PROTEIN',
    'ISOPRIME 100% BEEF PROTEIN',
    'Whey Shake',
    'Elite Gourmet',
    'Blend Whey',
    'Bariatric Whey',
    'Carnivor',
    'Clean Whey Avonlac 282',
    'Clean Whey Concentrada 81%',
    'Combat 100% Isolate',
    'Gold ISO Whey Protein Isolado',
    'Natural Isopure',
    'Isopure Zero Carb',
    'Isopure Low Carb',
    'ULTRA WHEY PRO',
    'ISO PRO WHEY',
    'WHEY PRO 2 HYDROLYZED',
    'Platinum Hydro Whey',
    'Rule 1 Protein',
    'Protein Complex Premium',
    'ISO 100 - 100% Hidrolyzed',
    'Proto Whey Power Crunch',
    'Whey Pro 2 Isolate',
    'Elite Whey Protein',
    'ISO 100 - 100% Hidrolyzed'
];

wheyProteinKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Proteina');
});


/**
 *      PRE-HORMONAL
 */
var preHormonalKeywords = [
    // keywords
    'ZMA',
    'HGH',
    'IGF1',
    'testosterona',
    'sublingual',
    //text
    'ZMA TESTO + IGF1',
    'ZMA SIZE',
    'T-BOOST (ZMA FORMULA) ULTRA PREMIUM',
    'IGF1 NO LIMIT',
    'GH MAX',
    'HGH IGF-1 30.000 (120ML - SUBLINGUAL)',
    'HGH ERGOGEL TIME RELEASE GEL-CÁPSULAS',
    'TESTAGEN',
    'TESTO SIZE',
    'Z-FORCE (ZMA)',
    'BIG T 98',
    'TESTO FULL DARKNESS'
];

preHormonalKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Pre-Hormonal');
});

/**
 *      POLIVITAMINICOS
 */

var prolivitaminKeywords = [
    // keyword
    'polivitaminico',
    'vita recovery',
    'suplemento vitaminico',
    'magnesio e zinco',
    'vitamina c',
    // text
    'VITAMINA C EM PÓ CRYSTALS',
    'CA 1000 COM VITAMINA',
    'VITPLEX AGE',
    'VITAMINA D',
    'VITAMINA C MASTIGÁVEL',
    'BETA CAROTENO',
    'CALCIUM MAGNESIUM W/ZINC',
    'ZINC CHELATED 100% IDR'
];

prolivitaminKeywords.forEach( function (keyword) {
    classifier.addDocument(keyword, 'Polivitaminico');
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

classifier.save(__dirname + '/type.json', function(err, classifier) {
    if (err) {
      console.error(err);
    } else {
      console.log('Type classifier was saved');
    }
});
