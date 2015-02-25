
var lodash = {
        objects: {
            omit: require('lodash-node/modern/objects/omit'),
            transform: require('lodash-node/modern/objects/transform')
        },
        collections: {
            pluck: require('lodash-node/modern/collections/pluck'),
            forEach: require('lodash-node/modern/collections/forEach')
        }
    };

function BuscapeOfferScrapper(data) {

    var pluckedOffers,
        bestOffer,
        worstOffer,
        bestDiscount,
        toRemove,
        offers;

    offers = {
        offers_by_seller: {}
    };

    /**
     *  SET offers_by_seller_id
     */

    // we are removing all the unecessary data the API returns
    // and using only the offer field and childrens
    pluckedOffers = lodash.collections.pluck(data, 'offer');

    if (pluckedOffers.length) {
        // data that we dont want to save from the selller
        toRemove = [
            'oneclickbuy', 'oneclickbuyvalue', 'advertiserid',
            'cpcdifferentiated', 'contacts', 'istrustedstore',
            'pagamentodigital', 'extra'
        ];

        // now just iterate over each offer and add it to the model field
        // it will all be ready for saving
        lodash.collections.forEach(pluckedOffers, function (offer, key) {

            var offerId = offer.seller.id;

            // set the current offer as an empty object
            offers.offers_by_seller[offerId] = {};

            // filter data that we don't want (remove)
            offers.offers_by_seller[offerId].seller = lodash.objects.omit(offer.seller, function (value, key) {
                return toRemove.indexOf(key) !== -1;
            });

            // pluck the link property
            offers.offers_by_seller[offerId].seller.links = lodash.collections.pluck(offer.seller.links, 'link');

            // fix price type (string to integer)
            // result is the object, key is the property and value is the current value of it
            offers.offers_by_seller[offerId].price = lodash.objects.transform(offer.price, function (result, value, key) {
                // keys => parcel, currency, value
                if (key === 'parcel' && Object.keys(value).length) {
                    // yep, weird shit, but it works
                    value.value = parseFloat(value.value) || value.value;
                    result[key] = value;
                } else if (key === 'value' && value) {
                    result[key] = parseFloat(value) || value;
                } else {
                    result[key] = value;
                }
            });

            offers.offers_by_seller[offerId].links = lodash.collections.pluck(offer.links, 'link');

            // removed uneeded data
            delete offers.offers_by_seller[offerId].seller.id;
        });
        console.log('buscape scrapper offers');
        console.log(offers);
        return offers;
    } else {
        return {};
    }
}

module.exports = BuscapeOfferScrapper;
