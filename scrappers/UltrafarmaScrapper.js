
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


function UltrafarmaScrapper(error, result, $) {

    var productData,
        productInfo,
        title,
        conteudoDosagemTotal,
        description,
        receitaInfo,
        principioAtivo,
        productCode,
        normalPrice,
        currentPrice;

    productData = {
        price: {
            old: 0,
            value: 0
        }
    };

    productInfo = $('div.desc_produtos');
    receitaInfo = $('div.div_informacoes_receita');
    description = $('div.desc_info_prod').find('font').text();

    // productInfo
    title = productInfo.find('div.div_nome_produto').text();
    conteudoDosagemTotal = productInfo.find('div.div_nome_produto').text();

    // receitaInfo
    var extraInfo = receitaInfo.find('div.ajuste_link_ajuda');
    principioAtivo = extraInfo.eq(0).text();
    productCode = extraInfo.eq(2).text();

    // price info
    normalPrice = $('div.div_economize').find('del').text();
    currentPrice = $('div.div_preco_detalhe').text();

    productData.title = lodash.string(title.toLowerCase()).trim().capitalize().value();
    productData.conteudoDosagemTotal = lodash.string(conteudoDosagemTotal.toLowerCase()).trim().capitalize().value();
    productData.principioAtivo = lodash.string(principioAtivo.toLowerCase()).trim().capitalize().value();
    productData.productCode = productCode ? helpers.numbersOnly(productCode) : 0;
    productData.price.old = normalPrice ? helpers.priceNumbersOnly(normalPrice) : 0.00;
    productData.price.value = currentPrice ? helpers.priceNumbersOnly(currentPrice) : 0.00;

    // return all collected and formatted data
    return productData;
}

module.exports = UltrafarmaScrapper;
