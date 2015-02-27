
var lodash = {
        string: require('underscore.string')
    },
    Model = require('model'),
    helpers = require('../utils/Helpers'),
    debug = function (msg) { console.log(msg); },
    OnofreOfferModel,
    onofreOffer;

OnofreOfferModel = Model.extend({

    _schema: {
        id: '/OnofreOfferModel',
        properties: {
            links: { type: 'object' },
            price: { type: 'object' },
            seller: { type: 'object' }
        }
    },

    set: function(attributes, options) {
        // just call the parent method...
        Model.prototype.set.apply(this, arguments);
    },

    setOldPrice: function (oldPrice) {
        this.attributes.price.old = parseFloat(oldPrice);
    },

    setCurrentPrice: function (currentPrice) {
        this.attributes.price.value = parseFloat(currentPrice);
    },

    setOriginalUrl: function (url) {
        this.attributes.links[0].url = url;
    }

});

onofreOffer = new OnofreOfferModel({
    links: {
        0: {
            type: 'offer',
            url: ''
        }
    },
    seller: {
        id: 0,
        links: {
            0: {
                type: 'seller',
                url: 'http://www.onofre.com.br'
            }
        },
        rating: {
            useraveragerating: {
                numcomments: 0,
                rating: 0.0
            }
        },
        sellername: 'Onofre'
    },
    price: {
        currency: {
            abbreviation: 'BRL'
        },
        old: 0,
        value: 0
    }
});

function OnofreScrapper(error, result, $, originalLink) {

    var productInfo,
        normalPrice,
        currentPrice;

    productInfo = $('div#prod_dir');
    normalPrice = productInfo.find('span.preco_prod_cinza').text();
    currentPrice = productInfo.find('span.preco_por').text();

    onofreOffer.setOldPrice(normalPrice ? helpers.priceNumbersOnly(normalPrice) : 0.00);
    onofreOffer.setCurrentPrice(currentPrice ? helpers.priceNumbersOnly(currentPrice) : 0.00);
    onofreOffer.setOriginalUrl(originalLink);

    return onofreOffer.toJSON();
}

module.exports = OnofreScrapper;
