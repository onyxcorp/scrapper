
var lodash = {
        string: require('underscore.string')
    },
    Model = require('model'),
    helpers = require('../utils/Helpers'),
    debug = function (msg) { console.log(msg); },
    UltrafarmaOfferModel,
    ultrafarmaOffer;

UltrafarmaOfferModel = Model.extend({

    _schema: {
        id: '/UltrafarmaOfferModel',
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

ultrafarmaOffer = new UltrafarmaOfferModel({
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
                url: 'http://ultrafarma.com.br/'
            }
        },
        rating: {
            useraveragerating: {
                numcomments: 0,
                rating: 0.0
            }
        },
        sellername: 'Ultrafarma'
    },
    price: {
        currency: {
            abbreviation: 'BRL'
        },
        old: 0,
        value: 0
    }
});

function UltrafarmaScrapper(error, result, $, originalLink) {

    var normalPrice,
        currentPrice;

    normalPrice = $('div.div_economize').find('del').text();
    currentPrice = $('div.div_preco_detalhe').text();

    ultrafarmaOffer.setOldPrice(normalPrice ? helpers.priceNumbersOnly(normalPrice) : 0.00);
    ultrafarmaOffer.setCurrentPrice(currentPrice ? helpers.priceNumbersOnly(currentPrice) : 0.00);
    ultrafarmaOffer.setOriginalUrl(originalLink);

    return ultrafarmaOffer.toJSON();
}

module.exports = UltrafarmaScrapper;
