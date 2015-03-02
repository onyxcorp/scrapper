/*

    Pegar os produtos a partir das categorias salvas no banco de dados.

    Realizará um loop por todas as categorias, salvando os produtos e os dados
    extras que devem ser scrapeds do site (já que a API está passando informações incompletas)


*/
var products = require('../data/ProductsData'),
    productsPriceHistory = require('../data/ProductsPriceHistoryData'),
    async = require('async'),
    logsData = require('../data/LogsData'),
    lodash = {
        objects: {
            isFunction: require('lodash-node/modern/objects/isFunction')
        }
    },
    debug = function (message) { console.log(message); },
    connections;

connections = {
    max: {
        getPriceHistory: 40
    }
};

function updateProductsPriceHistory(updaterCallback) {

    logsData.save('ProductPriceHistoryWorker', 'Update Products Started', function (err) {
        findProductPriceHistory();
    });

    // wrapper to call the callback
    function callCallback(err) {
        // everything finished, if there is a callback, apply it
        if (updaterCallback && lodash.objects.isFunction(updaterCallback)) {
            var message;

            if (err) {
                message = 'Update Product Price History Finished - Errors';
            } else {
                message = 'Update Product Price History Finished - Success';
            }

            debug(message);
            logsData.save('ProductPriceHistoryWorker', message, function () {
                updaterCallback(err);
            });
        }
    }

    function findProductPriceHistory() {

        function getPriceHistory(product, queueCallback) {

            var productId,
                offers,
                priceHistory;

            // get the current page price history list
            offers = product.get('offers');
            productId = product.get('id');

            // set the data history for when this data was collected
            // use timestamp as the key
            // The format should be
            // priceHistory.timestamp = {
            //  min : 100,
            //  max : 200
            // }
            priceHistory = {};
            priceHistory[new Date().getTime()] = {
                max: offers.worst_offer.price.value ? parseFloat(offers.worst_offer.price.value) || offers.worst_offer.price.value : 0,
                min: offers.best_offer.price.value ? parseFloat(offers.best_offer.price.value) || offers.best_offer.price.value : 0
            };

            queueCallback(priceHistory);
        }

        // get all products, a collection will be returned
        products.db.getAll(function (productsList) {

            var queuePriceHistory;

            if (productsList.length) {

                // what funciton to run to get the offers
                queuePriceHistory = async.queue(getPriceHistory, connections.max.getPriceHistory);

                // iterate over each product from the database
                productsList.forEach( function (product) {

                    // prepare worker product for offers update
                    queuePriceHistory.push(product, function (res) {
                        if (res) {
                            debug('criando product price history');
                            debug(res);
                            productsPriceHistory.create({
                                id: product.get('id'),
                                days: res
                            });
                        } else {
                            // The error were already registered before the callback
                        }
                    });

                });

                queuePriceHistory.drain = function () {
                    productsPriceHistory.db.saveAll(callCallback);
                };

            } else {
                logsData.save('ProductPriceHistoryWorker', 'Sem category ou length para categoryProducts', function (err) {
                    callCallback();
                });
            }
        });
    }
}

module.exports = updateProductsPriceHistory;
