
var lodash = {
        string: require('underscore.string')
    },
    Model = require('model'),
    helpers = require('../utils/Helpers'),
    debug = function (msg) { console.log(msg); },
    NetfarmaOfferModel,
    netfarmaOffer;

NetfarmaOfferModel = Model.extend({

    _schema: {
        id: '/NetfarmaOfferModel',
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

netfarmaOffer = new NetfarmaOfferModel({
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
                url: 'http://www.netfarma.com.br'
            }
        },
        rating: {
            useraveragerating: {
                numcomments: 0,
                rating: 0.0
            }
        },
        sellername: 'Netfarma'
    },
    price: {
        currency: {
            abbreviation: 'BRL'
        },
        old: 0,
        value: 0
    }
});

function NetfarmaScrapper(error, result, $, originalLink) {

    var normalPrice,
        currentPrice;

    normalPrice = $('span#PrecoProduto').text();
    currentPrice = $('span#PrecoPromocaoProduto').text();

    netfarmaOffer.setOldPrice(normalPrice ? helpers.priceNumbersOnly(normalPrice) : 0.00);
    netfarmaOffer.setCurrentPrice(currentPrice ? helpers.priceNumbersOnly(currentPrice) : 0.00);
    netfarmaOffer.setOriginalUrl(originalLink);

    return netfarmaOffer.toJSON();
}

module.exports = NetfarmaScrapper;
