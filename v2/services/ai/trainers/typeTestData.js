var productList = [
    { type: 'Albumina', supplier: 'Naturovos', title: 'Albumina Chocolate (500g) Naturovos'},
    { type: 'Albumina', supplier: 'Naturovos', title: 'Albumina Pura 83% (500g) Naturovos'},
    { type: 'Albumina', supplier: 'Fama', title: 'Albumina Pura (1000g) Fama'},
    { type: 'Albumina', supplier: 'New Millen', title: 'Albumina (500g) New Millen'},
    { type: 'Albumina', supplier: 'Probiótica', title: 'Super Albumin Millennium (500g) Probiótica'},
    { type: 'Albumina', supplier: 'Integral Médica', title: 'Albumix (120tabs) Integral Médica'},
    { type: 'Albumina', supplier: 'Integral Médica', title: 'Albumix (1000g) Integral Médica'},
    { type: 'Albumina', supplier: 'Body Action', title: 'Albumina W-Tech (500g) Body Action'},
    { type: 'Albumina', supplier: 'Saltos', title: 'Albumina (500g) Saltos'},
    { type: 'Aminoacido', supplier: 'Integral Médica', title: 'Amino BCAA Top 3800mg (240caps) Integral Médica'},
    { type: 'Aminoacido', supplier: 'Max Titanium', title: '4:1:1 BCAA Drink (280g) Max Titanium'},
    { type: 'Aminoacido', supplier: 'Universal Nutrition', title: '100% EGG Aminos (250tabs) Universal Nutrition'},
    { type: 'Aminoacido', supplier: 'BSN', title: 'Amino X (BCAA Efervescente - 364g) BSN'},
    { type: 'Aminoacido', supplier: 'Probiótica', title: 'Amino Power Plus (300tabs) Probiótica'},
    { type: 'Aminoacido', supplier: 'Probiótica', title: 'Amino Power Plus (60tabs) Probiótica'},
    { type: 'Aminoacido', supplier: '4 Plus Nutrition', title: 'BCAA + (125tabs) 4 Plus Nutrition'},
    { type: 'Aminoacido', supplier: 'Vitafor', title: 'Aminofor (30sachês) Vitafor'},
    { type: 'Aminoacido', supplier: 'Max Titanium', title: 'BCAA 2400mg Titanium (100caps) Max Titanium'},
    { type: 'Aminoacido', supplier: 'Integral Médica', title: 'Poliamino Acid 38000 (600ml) Integral Médica'},
    { type: 'Aminoacido', supplier: 'Dymatize', title: 'Super Amino 6000 (500caps) Dymatize'},
    { type: 'Barra Proteina', supplier: 'Met-Rx', title: 'Big 100 (12unidades) Met-Rx'},
    { type: 'Barra Proteina', supplier: 'Muscle Pharm', title: 'Combat Crunch Bar (Unidade-20g) - Muscle Pharm'},
    { type: 'Barra Proteina', supplier: 'Probiótica', title: 'Choko Crunch Protein (12 unid) Pró Premium Line - 30% OFF'},
    { type: 'Barra Proteina', supplier: 'New Millen', title: 'Iron Man Protein Bar 40% Proteína (*UNIDADE*) New Millen'},
    { type: 'Barra Proteina', supplier: 'Met-Rx', title: 'Protein Plus Bar (12barras) Met-Rx'},
    { type: 'Barra Proteina', supplier: 'Integral Médica', title: 'Protein Crisp Bar (12unid) Integral Médica'},
    { type: 'Barra Proteina', supplier: 'New Millen', title: 'Iron Man Protein Bar 40% Proteína (12unid) New Millen'},
    { type: 'Barra Proteina', supplier: 'Integral Médica', title: 'Protein Crisp Bar (*UNIDADE*) Integral Médica'},
    { type: 'Barra Proteina', supplier: 'Probiótica', title: 'Fit Whey Bar (12 Unidades/30g) Probiótica'},
    { type: 'Barra Proteina', supplier: 'Doctor', title: 'Carb Rite (12unid) Doctor'},
    { type: 'Barra Proteina', supplier: 'MuscleMeds', title: 'Carnivor Bar (*UNIDADE*) MuscleMeds'},
    { type: 'Barra Proteina', supplier: 'MuscleMeds', title: 'Carnivor Bar (12unid) MuscleMeds'},
    { type: 'Barra Proteina', supplier: 'Probiótica', title: 'Choko Crunch Protein (*UNIDADE*) Pró Premium Line'},
    { type: 'Barra Proteina', supplier: 'Nutrilatina Age', title: 'Protein Bar (24 unid x 46g) Nutrilatina Age *Grátis 2ª Caixa*'},
    { type: 'Barra Proteina', supplier: 'Nutrilatina Age', title: 'Protein Bar (24 unid x 46g) Nutrilatina Age'},
    { type: 'Barra Proteina', supplier: 'Nutrilatina Age', title: 'Protein Bar (24 unid x 30g) Nutrilatina Age'},
    { type: 'Barra Proteina', supplier: 'Nutrilatina Age', title: 'Protein Bar (Unidade - 46g) Nutrilatina Age'},
    { type: 'Barra Proteina', supplier: 'Quest Nutrition', title: 'Quest Bar (*UNIDADE*) Quest Nutrition'},
    { type: 'Barra Proteina', supplier: 'Quest Nutrition', title: 'Quest Bar (12barras) Quest Nutrition'},
    { type: 'Barra Proteina', supplier: 'Max Titanium', title: 'Top Choco (15 unid.) Max Titanium'},
    { type: 'Barra Proteina', supplier: 'Integral Médica', title: 'VO2 Slim Bar (24 unid) Integral Médica'},
    { type: 'Barra Proteina', supplier: 'Probiótica', title: 'Wafer Protein Bar (45g/12unid) Pró Premium Line'},
    { type: 'Barra Proteina', supplier: 'Probiótica', title: 'Whey Bar (24unid) Probiótica'},
    { type: 'Creatina', supplier: 'Universal Nutrition', title: 'Creatina (1000g) Universal Nutrition'},
    { type: 'Creatina', supplier: 'Labrada', title: 'CreaLean Powder (500g) Labrada'},
    { type: 'Creatina', supplier: 'Nutrilatina Age', title: 'Creatina (120caps) Nutrilatina Age'},
    { type: 'Creatina', supplier: 'Dymatize', title: 'Creatina (300g) Dymatize'},
    { type: 'Creatina', supplier: 'New Millen', title: 'Creatina 100% Pure (150g) New Millen'},
    { type: 'Creatina', supplier: 'Universal Nutrition', title: 'Creatina (50caps) Universal Nutrition'},
    { type: 'Creatina', supplier: 'MuscleMeds', title: 'Creatina Decanate (300g) MuscleMeds'},
    { type: 'Creatina', supplier: 'New Millen', title: 'Creatina Monohidratada (120caps) New Millen'},
    { type: 'Creatina', supplier: 'Arnold Nutrition', title: 'Creatina Creapure (400g) Arnold Nutrition'},
    { type: 'Creatina', supplier: 'Arnold Schwarzenegger', title: 'Creatina Iron Cre3 (127g) Arnold Schwarzenegger'},
    { type: 'Creatina', supplier: 'Max Titanium', title: 'Creatine Titanium (150g) Max Titanium'},
    { type: 'Creatina', supplier: 'Body Action', title: 'Creatina Titanium Series (300g) Body Action'},
    { type: 'Creatina', supplier: 'MHP', title: 'Creatine Peak Perfomance (300g) MHP'},
    { type: 'Creatina', supplier: 'Labrada', title: 'Kre-Alkalyn (120caps) Labrada'},
    { type: 'Creatina', supplier: 'BPI Sports', title: 'PUMP-HD (330g) BPI Sports'},
    { type: 'Creatina', supplier: 'MuscleTech', title: 'Creakic (180caps) MuscleTech'},
    { type: 'Creatina', supplier: 'Body Action', title: 'Creatina 20-Days-Autonomy (70g) Body Action'},
    { type: 'Waxy Maize', supplier: 'Probiótica', title: 'Waxy Maize (1.4kg) Probiótica - 10% OFF'},
    { type: 'Waxy Maize', supplier: 'Body Action', title: 'Waxy Maize Pure (900g) Body Action'},
    { type: 'Waxy Maize', supplier: 'Max Titanium', title: 'Waxy Maize (4kg) Max Titanium'},
    { type: 'Waxy Maize', supplier: 'Nutrilatina Age', title: 'Waxy Maize (900g) Nutrilatina Age'},
    { type: 'Waxy Maize', supplier: 'New Millen', title: 'Waxy Maize Pós Treino (1000g) New Millen'},
    { type: 'Waxy Maize', supplier: 'Integral Médica', title: 'Waxy Maize (1,5kg) Integral Médica'},
    { type: 'Waxy Maize', supplier: 'Probiótica', title: 'Waxy Maize (1.4kg) Probiótica - 10% OFF'},
    { type: 'Proteina', supplier: 'Probiótica', title: 'Waxy Whey (900g) Probiótica'},
    { type: 'Proteina', supplier: 'Probiótica', title: '100% Pure Whey (900g) Probiótica'},
    { type: 'Proteina', supplier: 'MHP', title: '100% Whey Isolate Pro Platinum (1406g) MHP'},
    { type: 'Proteina', supplier: 'New Millen', title: '100% Whey Protein (900g) New Millen'},
    { type: 'Proteina', supplier: 'EAS', title: '100% Whey Protein (907g) EAS'},
    { type: 'Proteina', supplier: 'New Millen', title: 'Combo - Whey 3W NitrO2 (2x 900g) New Millen *Grátis Bcaa'},
    { type: 'Proteina', supplier: 'Dymatize', title: 'Elite Whey Protein (900g) Dymatize'},
    { type: 'Proteina', supplier: 'Dymatize', title: 'Elite Gourmet (2.268g) Dymatize'},
    { type: 'Proteina', supplier: 'Muscle Pharm', title: 'Combat 100% Isolate (2.269g) Muscle Pharm *Grátis Barrinha 20g*'},
    { type: 'Proteina', supplier: 'Probiótica', title: 'DTX Whey Protein Isolate (600g) Probiótica'},
    { type: 'Proteina', supplier: 'Champion Nutrition', title: 'Pure Whey (2200g) Champion Nutrition'},
    { type: 'Proteina', supplier: 'Probiótica', title: 'Pro Whey Millennium (500g) Probiótica'},
    { type: 'Proteina', supplier: 'Saltos', title: 'Whey Protein 80% (500g) Saltos'},
    { type: 'Proteina', supplier: 'MHP', title: 'Maximum Whey (2262g) MHP'},
    { type: 'Proteina', supplier: 'Natures Best', title: 'Isopure Unflavor (1361g) Natures Best'},
    { type: 'Proteina', supplier: 'Probiótica', title: 'Isopro Whey (900g) Probiótica'},
    { type: 'Proteina', supplier: 'Probiótica', title: 'Hiper Whey Millennium (2268g) Probiótica'},
    { type: 'Proteina', supplier: 'Cytosport', title: 'Complete Whey (2268g) Cytosport'},
    { type: 'Proteina', supplier: 'Gaspari', title: 'Intra Pro Whey Isolada (2267g) Gaspari'},
    { type: 'Proteina', supplier: 'Arnold Schwarzenegger', title: 'Iron Whey (2270g) Arnold Schwarzenegger *Grátis Iron Cre3 (127g)*'},
    { type: 'Proteina', supplier: 'Probiótica', title: '100% Pure Whey (15 sachês de 30g) Probiótica'},
    { type: 'Proteina', supplier: 'Syntrax', title: 'Whey Shake (2270g) Syntrax'}
]

module.exports = productList;
