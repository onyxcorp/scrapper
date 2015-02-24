
var lodash = {
        string: require('underscore.string')
    },
    helpers = require('../utils/Helpers'),
    debug = function (msg) { console.log(msg); };


function NetfarmaScrapper(error, result, $) {

    var productData,
        productInfo,
        title,
        conteudoDosagemTotal,
        description, // nothing yet
        principioAtivo,
        productCode,
        normalPrice,
        currentPrice;

    productData = {};

    productInfo = $('div.prodInfo');
    title = productInfo.find('p.nome').text();
    conteudoDosagemTotal = productInfo.find('p.gramatura').text();
    principioAtivo = productInfo.find('p.pAtivo').text();
    productCode = $('div.codbrand').find('p.codigo').text();
    normalPrice = $('span#PrecoProduto').text();
    currentPrice = $('span#PrecoPromocaoProduto').text();

    // Do all formating / conversion here as needed
    productData.title = lodash.string(title.toLowerCase()).trim().capitalize().value();
    productData.conteudoDosagemTotal = lodash.string(conteudoDosagemTotal.toLowerCase()).trim().capitalize().value();
    productData.principioAtivo = lodash.string(principioAtivo.toLowerCase()).trim().capitalize().value();
    productData.productCode = productCode ? helpers.numbersOnly(productCode) : 0;
    productData.normalPrice = normalPrice ? helpers.priceNumbersOnly(normalPrice) : 0.00;
    productData.currentPrice = currentPrice ? helpers.priceNumbersOnly(currentPrice) : 0.00;

    // return all collected and formatted data
    debug('scrapped from Netfarma');
    debug(productData);
    return productData;
}

module.exports = NetfarmaScrapper;
