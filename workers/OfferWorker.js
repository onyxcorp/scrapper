/*

    Pegar os produtos a partir das categorias salvas no banco de dados.

    Realizará um loop por todas as categorias, salvando os produtos e os dados
    extras que devem ser scrapeds do site (já que a API está passando informações incompletas)


*/
var Buscape = require('../utils/BuscapeAPI'),
    Crawler = require('crawler'),
    Transmuter = require('transmuter'),
    products = require('../data/ProductsData'),
    async = require('async'),
    logsData = require('../data/LogsData'),
    lodash = {
        objects: {
            values: require('lodash-node/modern/objects/values'),
            merge: require('lodash-node/modern/objects/merge'),
            isFunction: require('lodash-node/modern/objects/isFunction')
        },
        collections: {
            min: require('lodash-node/modern/collections/min'),
            max: require('lodash-node/modern/collections/max'),
            forEach: require('lodash-node/modern/collections/forEach')
        }
    },
    scrappers = {
        buscapeOffer: require('../scrappers/BuscapeOfferScrapper'),
        onofre: require('../scrappers/OnofreScrapper'),
        netfarma: require('../scrappers/NetfarmaScrapper'),
        ultrafarma: require('../scrappers/UltrafarmaScrapper'),
        farmaconde: require('../scrappers/FarmacondeScrapper'),
    },
    Done = require('../utils/DoneState'),
    debug = function (message) { console.log(message); },
    buscape,
    crawler,
    connections;

connections = {
    max: {
        crawler: 40,
        getOffers: 40,
        extraLinksOffers: 40
    }
};

// Run all constructors
buscape = new Buscape();

function updateProductsOffers(updaterCallback) {

    logsData.save('OfferWorker', 'Update Products Started', function (err) {
        findProductsExtraData();
    });

    // wrapper to call the callback
    function callCallback(err) {
        // everything finished, if there is a callback, apply it
        if (updaterCallback && lodash.objects.isFunction(updaterCallback)) {
            var message;

            if (err) {
                message = 'Update Products Offer Finished - Errors';
            } else {
                message = 'Update Products Offer Finished - Success';
            }

            logsData.save('OfferWorker', message, function () {
                updaterCallback(err);
            });
        }
    }

    function findProductsExtraData() {

        var queueScrapeDone,
            queueOfferDone,
            offerAttempts;

        offerAttempts = {};

        // crawler will be used by both scrapper and getOffers functions
        crawler = new Crawler({
            maxConnections: connections.max.crawler
        });


        // Retrive some product offer information
        function getOffers(product, queueCallback) {

            var buscapeProductId,
                externalLinks,
                doneStateManager,
                list;

            // shortcut to buscape id present at the model
            buscapeProductId = product.get('id_buscape');
            // shortcut to buscape id present at the model
            externalLinks = product.get('external_links');

            list = {
                offers: {
                    offers_by_seller: {},
                    best_offer: {},
                    worst_offer: {},
                    best_discount: {},
                    best_discount_price: {}
                }
            };

            doneStateManager = new Done();

            function setOffersExtraData() {

                var offersLength = Object.keys(list.offers.offers_by_seller).length;

                // get the current best offer by comparing all the prices
                if (offersLength > 1) {
                    // there are more than one offer
                    list.offers.best_offer = lodash.collections.min(list.offers.offers_by_seller, function (offer) {
                        return Transmuter.toFloat(offer.price.value);
                    });
                    list.offers.worst_offer = lodash.collections.max(list.offers.offers_by_seller, function (offer) {
                        return Transmuter.toFloat(offer.price.value);
                    });

                    // calculate best_discount prices
                    list.offers.best_discount_price = list.offers.worst_offer.price.value - list.offers.best_offer.price.value;
                    var tempDiscount = 1 - list.offers.best_offer.price.value / list.offers.worst_offer.price.value;
                    list.offers.best_discount = parseFloat(tempDiscount.toFixed(3));
                } else if (offersLength === 1) {
                    // there is only one offer, so we have a best_offer but no worst_offer
                    // TODO must remove seller.id
                    list.offers.best_offer = lodash.objects.values(list.offers.offers_by_seller)[0];
                    list.offers.worst_offer = {};
                    list.offers.best_discount_price = false;
                    list.offers.best_discount = false;
                } else {
                    // there are no offers
                    list.offers.best_offer = false;
                    list.offers.worst_offer = false;
                    list.offers.best_discount_price = false;
                    list.offers.best_discount = false;
                }
            }

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
                        setOffersExtraData();
                        queueCallback(list);
                    } else {
                        logsData.save('OfferWorker', 'No data found while looking for scraped data for ' + product.get('title'), function (err) {
                           queueCallback(list);
                        });
                    }
                } else {
                    debug('updateProductsOffers - drainDone not done yet...');
                }
            }

            // if there are no externalLinks, buscapeId just return the empty offer list
            if (!buscapeProductId && !externalLinks) {
                drainDone();
            }

            if (buscapeProductId) {

                startDrain('buscape');

                // if there is no buscapeProductId yet, means that it is our first attempt
                if (!offerAttempts[buscapeProductId]) {
                    offerAttempts[buscapeProductId] = 1;
                    debug('Ammount of attempts: ' + offerAttempts[buscapeProductId] + '. Trying to fetch product: ' + buscapeProductId);
                } else if (offerAttempts[buscapeProductId] === 2 || offerAttempts[buscapeProductId] === 3) {
                    // we are at the second/third run, try to call getOffers again
                    debug('Ammount of attempts: ' + offerAttempts[buscapeProductId] + '. Trying to fetch product: ' + buscapeProductId);
                } else {
                    debug('Ammount of attempts: ' + offerAttempts[buscapeProductId] + '. No more fetching product: '+ buscapeProductId);
                    // im tired of this shitty product on this shitty api, next!
                    drainDone('buscape');
                    return;
                }

                // simple call the api with some parameters, fetching the product information
                // and it's offers
                // Scrapping Buscape Extra Data Page
                buscape.findOfferList({productId: buscapeProductId}, function (res) {
                    if (res instanceof Error) {
                        offerAttempts[buscapeProductId] = offerAttempts[buscapeProductId] + 1;
                        logsData.save('OfferWorker', 'findOfferList error: ' + res.message, function (err) {
                            // call getOffers again if there was an error'
                            getOffers(product, queueCallback);
                        });
                    } else if (res) {

                        if (res.ok) { // Response ok

                            // there is offers for this product?
                            if (res.body.offer) {
                                lodash.objects.merge(list.offers, scrappers.buscapeOffer(res.body.offer));
                            }
                            drainDone('buscape');
                        } else {
                            logsData.save('OfferWorker', 'No response from the api', function (err) {
                                drainDone('buscape');
                            });
                        }
                    } else {
                        logsData.save('OfferWorker', 'Problems with BuscapeAPI request on findProductsExtraData', function (err) {
                            drainDone('buscape');
                        });
                    }
                });
            }

            function getExternalLinksData(data, queueCallback) {

                crawler.queue([{
                    uri: data.link,
                    timeout: 5000,
                    userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
                    callback: function (error, result, $) {

                        if (error || !result) {
                            queueCallback(error || null);
                        } else {

                            if (!scrappers[data.name] || typeof scrappers[data.name] !== 'function') {
                                throw new Error('Invalid scrapper link or it is not a function: ' + link);
                            }

                            queueCallback(scrappers[data.name](error, result, $, data.link));
                        }
                    }
                }]);
            }

            if (externalLinks) {

                var queueExternalLinks;

                queueExternalLinks = async.queue(getExternalLinksData, connections.max.extraLinksOffers);

                startDrain('external_links');

                lodash.collections.forEach(externalLinks, function (link, name) {
                    queueExternalLinks.push({link: link, name: name}, function (res) {
                        if (res instanceof Error) {
                            debug('Returned with an error');
                        } else if (res) {
                            list.offers.offers_by_seller[name] = res;
                        } else {
                            debug('no information returned');
                        }
                    });
                });

                queueExternalLinks.drain = function () {
                    drainDone('external_links');
                };
            }

        }

        // get all products, a collection will be returned
        products.db.getAll(function (productsList) {

            var queueOffer;

            if (productsList.length) {

                // what funciton to run to get the offers
                queueOffer = async.queue(getOffers, connections.max.getOffers);

                // iterate over each product from the database
                productsList.forEach( function (product) {

                    // prepare worker product for offers update
                    queueOffer.push(product, function (res) {
                        if (res) {
                            product.set('offers', res.offers);
                        } else {
                            // The error were already registered before the callback
                        }
                    });

                });

                queueOffer.drain = function () {
                    products.db.saveAll(callCallback);
                };

            } else {
                logsData.save('OfferWorker', 'Sem category ou length para categoryProducts', function (err) {
                    callCallback();
                });
            }
        });
    }
}

module.exports = updateProductsOffers;
