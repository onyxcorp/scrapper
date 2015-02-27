/*

    Pegar os produtos a partir das categorias salvas no banco de dados.

    Realizará um loop por todas as categorias, salvando os produtos e os dados
    extras que devem ser scrapeds do site (já que a API está passando informações incompletas)


*/
var Buscape = require('../utils/BuscapeAPI'),
    Crawler = require('crawler'),
    products = require('../data/ProductsData'),
    async = require('async'),
    validUrl = require('valid-url'),
    logsData = require('../data/LogsData'),
    lodash = {
        objects: {
            values: require('lodash-node/modern/objects/values'),
            merge: require('lodash-node/modern/objects/merge'),
            isFunction: require('lodash-node/modern/objects/isFunction'),
            forOwn: require('lodash-node/modern/objects/forOwn')
        },
        collections: {
            min: require('lodash-node/modern/collections/min'),
            max: require('lodash-node/modern/collections/max'),
            forEach: require('lodash-node/modern/collections/forEach')
        }
    },
    scrappers = {
        buscape: require('../scrappers/BuscapeScrapper'),
        farmaconde: require('../scrappers/FarmacondeScrapper')
    },
    Done = require('../utils/DoneState'),
    debug = function (message) { console.log(message); },
    buscape,
    crawler,
    connections;

connections = {
    max: {
        crawler: 40,
        extraProductInformation: 40
    }
};

// Run all constructors
buscape = new Buscape();

function updateProductsOffers(updaterCallback) {

    logsData.save('ExtraDataWorker', 'Update Products Started', function (err) {
        findProductsExtraData();
    });

    // wrapper to call the callback
    function callCallback(err) {
        // everything finished, if there is a callback, apply it
        if (updaterCallback && lodash.objects.isFunction(updaterCallback)) {
            var message;

            if (err) {
                message = 'Update Product Extra Data Finished - Errors';
            } else {
                message = 'Update Product Extra Data Finished - Success';
            }

            logsData.save('ExtraDataWorker', message, function () {
                updaterCallback(err);
            });
        }
    }

    function findProductsExtraData(callback) {

        var queueScrapeDone,
            queueOfferDone,
            offerAttempts;

        offerAttempts = {};

        // crawler will be used by both scrapper and getOffers functions
        crawler = new Crawler({
            maxConnections: connections.max.crawler
        });

        // Retrive product extra data information from product page
        function extraProductInformation(product, queueCallback) {

            var list,
                originalLink,
                buscapeProductId,
                doneStateManager;

            buscapeProductId = product.get('id_buscape');
            originalLink =  product.get('original_link');
            // shortcut to buscape id present at the model

            list = {
                filters: {},
                extraData: {}
            };

            doneStateManager = new Done();

            function startDrain(name) {
                doneStateManager.startDoneState(name);
            }

            function drainDone(name) {

                name = name || null;

                if (name) {
                    doneStateManager.finishDoneState(name, true);
                }

                // if doneState is finished or was never defined...
                if (doneStateManager.getDoneState() || doneStateManager.getDoneState() === null) {
                    if (Object.keys(list).length) {
                        queueCallback(list);
                    } else {
                        logsData.save('ExtraDataWorker', 'No data to look for extraProductInformation for product: ' + product.get('title'), function (err) {
                           queueCallback(list);
                        });
                    }
                } else {
                    debug('drainDone not done yet...');
                }
            }


            // if there is a valid buscapeProductId, crawler link and valid url we can start scraping
            if (originalLink && validUrl.isUri(originalLink.url)) {

                if (originalLink.source === 'buscape') {
                    startDrain('buscape');
                    crawler.queue([{
                        uri: originalLink.url,   // the product page link
                        userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
                        callback: function (error, result, $) {

                            if (error || !result) {
                                logsData.save('ExtraDataWorker', 'Invalid URL provided for scrapping for product ' + product.get('title'), function (err) {
                                    drainDone('buscape');
                                });
                            } else {
                                list.filters = scrappers.buscape(error, result, $);
                                drainDone('buscape');
                            }
                        }
                    }]);
                } else if (originalLink.source === 'farmaconde') {
                    startDrain('farmaconde');
                    crawler.queue([{
                        uri: originalLink.url,
                        userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
                        callback: function (error, result, $) {

                            if (error || !result) {
                                debug('an error has ocurred');
                            } else {
                                scrappers.farmaconde(error, result, $).then(function (productsData) {
                                    list.extraData = productsData;
                                    drainDone('farmaconde');
                                });
                            }
                        }
                    }]);
                } else {
                    // no valid originalLink found for scrapping, just return
                    drainDone();
                }
            } else {
                drainDone();
            }
        }

        // get all products, a collection will be returned
        products.db.getAll(function (productsList) {

            var queueScrape;

            if (productsList.length) {

                // what function to run to scrape the product page
                queueScrape = async.queue(extraProductInformation, connections.max.extraProductInformation);

                // iterate over each product from the database
                productsList.forEach( function (product) {

                    queueScrape.push(product, function (res) {
                        debug(res);
                        if (res && Object.keys(res).length) {

                            if (res.filters) {
                                product.set('filters', res.filters);
                            }

                            // TODO temporary, it's for the farmacondeScrapper only
                            if (res.extraData && Object.keys(res.extraData).length) {
                                product.set('title', res.extraData.title);
                                product.set('code', res.extraData.productCode);
                                product.set('thumb', res.extraData.thumb);
                                product.set('prices', {
                                    minimum: 0.8 * res.extraData.price.value,
                                    old: res.extraData.price.old,
                                    current: res.extraData.price.value
                                });
                            }
                        } else {
                            // The error were already registered before the callback
                        }
                    });
                });

                // assign a callback when all queues are done
                queueScrape.drain = function () {
                    products.db.saveAll(callCallback);
                };

            } else {
                logsData.save('ExtraDataWorker', 'Sem category ou length para categoryProducts', function (err) {
                    callCallback();
                });
            }
        });
    }
}

module.exports = updateProductsOffers;
