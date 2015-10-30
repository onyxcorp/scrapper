var productList = [
    { type: 'Albumina', title: 'Albumina Chocolate (500g) Naturovos'},
    { type: 'Albumina', title: 'Albumina Pura 83% (500g) Naturovos'},
    { type: 'Albumina', title: 'Albumina Pura (1000g) Fama'},
    { type: 'Albumina', title: 'Albumina (500g) New Millen'},
    { type: 'Albumina', title: 'Super Albumin Millennium (500g) Probiótica'},
    { type: 'Albumina', title: 'Albumix (120tabs) Integral Médic'},
    { type: 'Albumina', title: 'Albumix (1000g) Integral Médica'},
    { type: 'Albumina', title: 'Albumina W-Tech (500g) Body Action'},
    { type: 'Albumina', title: 'Albumina (500g) Saltos'},
    { type: 'Aminoacido', title: 'Amino BCAA Top 3800mg (240caps) Integral Médica'},
    { type: 'Aminoacido', title: '4:1:1 BCAA Drink (280g) Max Titanium'},
    { type: 'Aminoacido', title: '100% EGG Aminos (250tabs) Universal Nutrition'},
    { type: 'Aminoacido', title: 'Amino X (BCAA Efervescente - 364g) BSN'},
    { type: 'Aminoacido', title: 'Amino Power Plus (300tabs) Probiótica'},
    { type: 'Aminoacido', title: 'Amino Power Plus (60tabs) Probiótica'},
    { type: 'Aminoacido', title: 'BCAA + (125tabs) 4 Plus Nutrition'},
    { type: 'Aminoacido', title: 'Aminofor (30sachês) Vitafor'},
    { type: 'Aminoacido', title: 'BCAA 2400mg Titanium (100caps) Max Titanium'},
    { type: 'Aminoacido', title: 'Poliamino Acid 38000 (600ml) Integral Médica'},
    { type: 'Aminoacido', title: 'Super Amino 6000 (500caps) Dymatize'},
    { type: 'Barra Proteina', title: 'Big 100 (12unidades) Met-Rx'},
    { type: 'Barra Proteina', title: 'Combat Crunch Bar (Unidade-20g) - Muscle Pharm'},
    { type: 'Barra Proteina', title: 'Choko Crunch Protein (12 unid) Pró Premium Line - 30% OFF'},
    { type: 'Barra Proteina', title: 'Iron Man Protein Bar 40% Proteína (*UNIDADE*) New Millen'},
    { type: 'Barra Proteina', title: 'Protein Plus Bar (12barras) Met-Rx'},
    { type: 'Barra Proteina', title: 'Protein Crisp Bar (12unid) Integral Médica'},
    { type: 'Barra Proteina', title: 'Iron Man Protein Bar 40% Proteína (12unid) New Millen'},
    { type: 'Barra Proteina', title: 'Protein Crisp Bar (*UNIDADE*) Integral Médica'},
    { type: 'Barra Proteina', title: 'Fit Whey Bar (12 Unidades/30g) Probiótica'},
    { type: 'Barra Proteina', title: 'Carb Rite (12unid) Doctor'},
    { type: 'Barra Proteina', title: 'Carnivor Bar (*UNIDADE*) MuscleMeds'},
    { type: 'Barra Proteina', title: 'Carnivor Bar (12unid) MuscleMeds'},
    { type: 'Barra Proteina', title: 'Choko Crunch Protein (*UNIDADE*) Pró Premium Line'},
    { type: 'Barra Proteina', title: 'Protein Bar (24 unid x 46g) Nutrilatina Age *Grátis 2ª Caixa*'},
    { type: 'Barra Proteina', title: 'Protein Bar (24 unid x 46g) Nutrilatina Age'},
    { type: 'Barra Proteina', title: 'Protein Bar (24 unid x 30g) Nutrilatina Age'},
    { type: 'Barra Proteina', title: 'Protein Bar (Unidade - 46g) Nutrilatina Age'},
    { type: 'Barra Proteina', title: 'Quest Bar (*UNIDADE*) Quest Nutrition'},
    { type: 'Barra Proteina', title: 'Quest Bar (12barras) Quest Nutrition'},
    { type: 'Barra Proteina', title: 'Top Choco (15 unid.) Max Titanium'},
    { type: 'Barra Proteina', title: 'VO2 Slim Bar (24 unid) Integral Médica'},
    { type: 'Barra Proteina', title: 'Wafer Protein Bar (45g/12unid) Pró Premium Line'},
    { type: 'Barra Proteina', title: 'Whey Bar (24unid) Probiótica'},
    { type: 'Creatina', title: 'Creatina (1000g) Universal Nutrition'},
    { type: 'Creatina', title: 'CreaLean Powder (500g) Labrada'},
    { type: 'Creatina', title: 'Creatina (120caps) Nutrilatina Age'},
    { type: 'Creatina', title: 'Creatina (300g) Dymatize'},
    { type: 'Creatina', title: 'Creatina 100% Pure (150g) New Millen'},
    { type: 'Creatina', title: 'Creatina (50caps) Universal Nutrition'},
    { type: 'Creatina', title: 'Creatina Decanate (300g) MuscleMeds'},
    { type: 'Creatina', title: 'Creatina Monohidratada (120caps) New Millen'},
    { type: 'Creatina', title: 'Creatina Creapure (400g) Arnold Nutrition'},
    { type: 'Creatina', title: 'Creatina Iron Cre3 (127g) Arnold Schwarzenegger'},
    { type: 'Creatina', title: 'Creatine Titanium (150g) Max Titanium'},
    { type: 'Creatina', title: 'Creatina Titanium Series (300g) Body Action'},
    { type: 'Creatina', title: 'Creatine Peak Perfomance (300g) MHP'},
    { type: 'Creatina', title: 'Kre-Alkalyn (120caps) Labrada'},
    { type: 'Creatina', title: 'PUMP-HD (330g) BPI Sports'},
    { type: 'Creatina', title: 'Creakic (180caps) MuscleTech'},
    { type: 'Creatina', title: 'Creatina 20-Days-Autonomy (70g) Body Action'},
    { type: 'Waxy Maize', title: 'Waxy Maize (1.4kg) Probiótica - 10% OFF'},
    { type: 'Waxy Maize', title: 'Waxy Maize Pure (900g) Body Action'},
    { type: 'Waxy Maize', title: 'Waxy Maize (4kg) Max Titanium'},
    { type: 'Waxy Maize', title: 'Waxy Maize (900g) Nutrilatina Age'},
    { type: 'Waxy Maize', title: 'Waxy Maize Pós Treino (1000g) New Millen'},
    { type: 'Waxy Maize', title: 'Waxy Maize (1,5kg) Integral Médica'},
    { type: 'Waxy Maize', title: 'Waxy Maize (1.4kg) Probiótica - 10% OFF'},
    { type: 'Proteina', title: 'Waxy Whey (900g) Probiótica'},
    { type: 'Proteina', title: '100% Pure Whey (900g) Probiótica'},
    { type: 'Proteina', title: '100% Whey Isolate Pro Platinum (1406g) MHP'},
    { type: 'Proteina', title: '100% Whey Protein (900g) New Millen'},
    { type: 'Proteina', title: '100% Whey Protein (907g) EAS'},
    { type: 'Proteina', title: 'Combo - Whey 3W NitrO2 (2x 900g) New Millen *Grátis Bcaa'},
    { type: 'Proteina', title: 'Elite Whey Protein (900g) Dymatize'},
    { type: 'Proteina', title: 'Elite Gourmet (2.268g) Dymatize'},
    { type: 'Proteina', title: 'Combat 100% Isolate (2.269g) Muscle Pharm *Grátis Barrinha 20g*'},
    { type: 'Proteina', title: 'DTX Whey Protein Isolate (600g) Probiótica'},
    { type: 'Proteina', title: 'Pure Whey (2200g) Champion Nutrition'},
    { type: 'Proteina', title: 'Pro Whey Millennium (500g) Probiótica'},
    { type: 'Proteina', title: 'Whey Protein 80% (500g) Saltos'},
    { type: 'Proteina', title: 'Maximum Whey (2262g) MHP'},
    { type: 'Proteina', title: 'Isopure Unflavor (1361g) Natures Best'},
    { type: 'Proteina', title: 'Isopro Whey (900g) Probiótica'},
    { type: 'Proteina', title: 'Hiper Whey Millennium (2268g) Probiótica'},
    { type: 'Proteina', title: 'Complete Whey (2268g) Cytosport'},
    { type: 'Proteina', title: 'Intra Pro Whey Isolada (2267g) Gaspari'},
    { type: 'Proteina', title: 'Iron Whey (2270g) Arnold Schwarzenegger *Grátis Iron Cre3 (127g)*'},
    { type: 'Proteina', title: '100% Pure Whey (15 sachês de 30g) Probiótica'},
    { type: 'Proteina', title: 'Whey Shake (2270g) Syntrax'}
]

module.exports = productList;