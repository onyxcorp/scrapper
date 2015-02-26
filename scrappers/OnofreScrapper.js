
var lodash = {
        string: require('underscore.string')
    },
    helpers = require('../utils/Helpers'),
    debug = function (msg) { console.log(msg); };


function OnofreScrapper(error, result, $) {

    var productData,
        productInfo,
        title,
        conteudoDosagemTotal,
        description, // nothing yet
        principioAtivo,
        productCode,
        productImage,
        normalPrice,
        currentPrice;

    productData = {
        price: {
            old: 0,
            value: 0
        }
    };

    productInfo = $('div#prod_dir');

    title = productInfo.find('span#lblProductName').text();
    conteudoDosagemTotal = productInfo.find('span#lblProductName').text();
    principioAtivo = productInfo.find('span#cphConteudo_lblDescriptionResume').text();
    productCode = productInfo.find('span#cphConteudo_lblCode').text();
    productImage = productInfo.find('img#cphConteudo_imgGrande').attr('src');
    normalPrice = productInfo.find('span.preco_prod_cinza').text();
    currentPrice = productInfo.find('span.preco_por').text();

    // Do all formating / conversion here as needed
    productData.title = title ? lodash.string(title.toLowerCase()).slugify().humanize().value() : '';
    productData.conteudoDosagemTotal = conteudoDosagemTotal ? lodash.string(conteudoDosagemTotal.toLowerCase()).trim().capitalize().value() : '';
    productData.principioAtivo = principioAtivo ? lodash.string(principioAtivo.toLowerCase()).trim().capitalize().value() : '';
    productData.productCode = productCode ? helpers.numbersOnly(productCode) : 0;
    productData.productImage = productImage ? 'http://www.onofre.com.br' + productImage : '';
    productData.price.old = normalPrice ? helpers.priceNumbersOnly(normalPrice) : 0.00;
    productData.price.value = currentPrice ? helpers.priceNumbersOnly(currentPrice) : 0.00;

    // return all collected and formatted data
    return productData;
}

module.exports = OnofreScrapper;
