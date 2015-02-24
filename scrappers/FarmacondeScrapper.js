
var lodash = {
        objects: {
            values: require('lodash-node/modern/objects/values'),
            merge: require('lodash-node/modern/objects/merge'),
            isFunction: require('lodash-node/modern/objects/isFunction')
        },
        string: require('underscore.string'),
        collections: {
            pick: require('lodash-node/modern/objects/pick'),
            pluck: require('lodash-node/modern/collections/pluck'),
            find: require('lodash-node/modern/collections/find'),
            forEach: require('lodash-node/modern/collections/forEach'),
            map: require('lodash-node/modern/collections/map')
        }
    },
    helpers = require('../utils/Helpers'),
    debug = function (msg) { console.log(msg); };

function FarmacondeScrapper(error, result, $) {

    var productData,
        productInfo,
        title,
        conteudoDosagemTotal,
        principioAtivo,
        productCode,
        normalPrice,
        currentPrice;

    productData = {};
    productInfo = $('div.conteudo-full');

    // productInfo
    title = conteudoDosagemTotal = productInfo.find('h1').text();

    // receitaInfo
    principioAtivo = '';
    productCode = productInfo.find('div.pop_produto_lab').text();

    // price info
    normalPrice = productInfo.find('div.pop_produto_de').text();
    currentPrice = productInfo.find('div.pop_produto_total').text();

    productData.title = title ? lodash.string(title.toLowerCase()).trim().capitalize().value() : '';
    productData.conteudoDosagemTotal = conteudoDosagemTotal ? lodash.string(conteudoDosagemTotal.toLowerCase()).trim().capitalize().value() : '';
    productData.principioAtivo = principioAtivo; // this info is not avaialble...
    productData.productCode = productCode ? helpers.numbersOnly(productCode) : 0;
    productData.normalPrice = normalPrice ? helpers.priceNumbersOnly(normalPrice) : 0.00;
    productData.currentPrice = currentPrice ? helpers.priceNumbersOnly(currentPrice) : 0.00;

    // return all collected and formatted data
    debug('scrapped from farmaconde');
    debug(productData);
    return productData;
}

module.exports = FarmacondeScrapper;
