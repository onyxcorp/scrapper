/*

    Pegar os produtos a partir das categorias salvas no banco de dados.

    Realizará um loop por todas as categorias, salvando os produtos e os dados
    extras que devem ser scrapeds do site (já que a API está passando informações incompletas)


*/
var products = require('../data/ProductsData'),
    logsData = require('../data/LogsData'),
    lodash = {
        objects: {
            isFunction: require('lodash-node/modern/objects/isFunction')
        },
        collections: {
            min: require('lodash-node/modern/collections/min'),
            forEach: require('lodash-node/modern/collections/forEach')
        }
    },
    debug = function (message) { console.log(message); };

function autoPricingWorker(updaterCallback) {

    logsData.save('AutoPricingWorker', 'Update Products Started', function (err) {
        setProductsPrice();
    });

    // wrapper to call the callback
    function callCallback(err) {
        // everything finished, if there is a callback, apply it
        if (updaterCallback && lodash.objects.isFunction(updaterCallback)) {
            var message;

            if (err) {
                message = 'Update Product Auto Pricing Finished - Errors';
            } else {
                message = 'Update Product Auto Pricing Finished - Success';
            }

            debug(message);
            logsData.save('AutoPricingWorker', message, function () {
                updaterCallback(err);
            });
        }
    }

    function setProductsPrice(callback) {

        var maxDiscount = 0.03;

        // get all products, a collection will be returned
        products.db.getAll(function (productsList) {

            productsList.forEach(function (product) {

                var offers,
                    prices;

                // an object { name : {offer} }
                offers = product.get('offers');
                // an object { current, minimum, old }
                prices = product.get('prices');

                // check best offer, if we don't have the currently best offer
                // or the current best offer is the same value as ours
                if (prices) {
                    if (prices.current >= offers.best_offer.price.value) {

                        // decrement the price by 1 real if the best offer is bigger than the minimum
                        if (offers.best_offer.price.value > prices.minimum) {

                            // the new price should be the best offer price - 3% of it's current value
                            prices.current = offers.best_offer.price.value - (offers.best_offer.price.value * maxDiscount);

                            // check if the new price is bigger than the allowed minimum
                            if (prices.current < prices.minimum) {
                                prices.current = prices.minimum;
                            }
                        } else {
                            // if the best offer is lower than the minimum, set the price to it's minimum possible value
                            prices.current = prices.minimum;
                        }
                    // now if we already have the best current offer
                    } else if (prices.current < offers.best_offer.price.value) {

                        // could we increase the current price of our product? maybe we are too low related to other companys
                        var newPossiblePrice = offers.best_offer.price.value - (offers.best_offer.price.value * maxDiscount);
                        // yep, we can increase the value
                        if (newPossiblePrice > prices.current) {
                            // we increase it but we still make sure that we have the best price by the same
                            // margin determined by the maxDiscount
                            prices.current = newPossiblePrice;
                        }
                    }
                    // check worst offer
                    product.set('prices', prices);
                }
            });

            // all done, update products prices and finish this method
            products.db.saveAll(callCallback);

        });
    }
}

module.exports = autoPricingWorker;
