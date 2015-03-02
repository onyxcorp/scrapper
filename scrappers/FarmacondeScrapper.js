
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
    url = require('url'),
    http = require('http'),
    Q = require('q'),
    sizeOf = require('image-size'),
    helpers = require('../utils/Helpers'),
    debug = function (msg) { console.log(msg); },
    productImageData;

function createFarmacondeProductObject(title, productCode, productImageLink, productImageData, normalPrice, currentPrice) {

    var productData;

    productData = {
        title: null,
        productCode: 0,
        thumb: {
            large: {}
        },
        price: {
            old: 0,
            value: 0
        }
    };

    productData.title = title ? lodash.string(title.toLowerCase()).slugify().humanize().value() : '';
    productData.productCode = productCode ? helpers.numbersOnly(productCode) : 0;
    if(productImageLink && productImageData) {
        productData.thumb.large = {
            height: productImageData.height,
            url: productImageLink,
            width: productImageData.width
        };
    } else {
        productData.thumb.large = {
            url: productImageLink
        };
    }
    productData.price.old = normalPrice ? helpers.priceNumbersOnly(normalPrice) : 0.00;
    productData.price.value = currentPrice ? helpers.priceNumbersOnly(currentPrice) : 0.00;

    // return all collected and formatted data
    return productData;
}

function FarmacondeScrapper(error, result, $) {

    var deferred,
        productInfo,
        title,
        productCode,
        productImageLink,
        productImageData,
        normalPrice,
        currentPrice,
        dataToReturn;

    deferred = Q.defer();

    productInfo = $('div.conteudo-full');

    // productInfo
    title = conteudoDosagemTotal = productInfo.find('h1').text();

    // receitaInfo
    productCode = productInfo.find('div.pop_produto_lab').text();

    // price info
    normalPrice = productInfo.find('div.pop_produto_de').text();
    currentPrice = productInfo.find('div.pop_produto_total').text();

    // image
    productImageLink = productInfo.find('div.pop_produto_img img').attr('src');

    if (productImageLink) {

        // the default data will come with a lot of link information and the image link only will be between url_image= and &size=someSize
        productImageLink = 'http://www.farmaconde.com.br/' + lodash.string.strLeftBack(lodash.string.strRightBack(productImageLink, "url_image="), '&size');

        // http is something default from node
        http.get(url.parse(productImageLink), function (response) {
            var imageChunksData = [];
            response
            .on('data', function (imageChunk) {
                imageChunksData.push(imageChunk);
            })
            .on('end', function () {
                // Buffer is something default from node
                productImageData = sizeOf(Buffer.concat(imageChunksData));
                deferred.resolve(createFarmacondeProductObject(title, productCode, productImageLink, productImageData, normalPrice, currentPrice));
            });
        });
    } else {
        deferred.resolve(createFarmacondeProductObject(title, productCode, productImageLink, productImageData, normalPrice, currentPrice));
    }

    return deferred.promise;
}

module.exports = FarmacondeScrapper;
