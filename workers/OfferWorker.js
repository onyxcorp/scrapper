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
        buscapeOffer: require('../scrappers/BuscapeOfferScrapper'),
        buscape: require('../scrappers/BuscapeScrapper'),
        netfarma: require('../scrappers/NetfarmaScrapper'),
        ultrafarma: require('../scrappers/UltrafarmaScrapper'),
        farmaconde: require('../scrappers/FarmacondeScrapper'),
    },
    Done = require('../utils/DoneState'),
    doneStateManager,
    debug = function (message) { console.log(message); },
    buscape,
    crawler,
    connections;

connections = {
    max: {
        crawler: 40,
        extraProductInformation: 40,
        getOffers: 40
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
                message = 'Update Product Finished - Errors';
            } else {
                message = 'Update Product Finished - Success';
            }

            logsData.save('OfferWorker', message, function () {
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


        // Retrive some product offer information
        function getOffers(product, queueCallback) {

            var buscapeProductId,
                externalLinks,
                externalLinksList,
                doneStateManager,
                list;

            // shortcut to buscape id present at the model
            buscapeProductId = product.get('id_buscape');
            // shortcut to buscape id present at the model
            externalLinks = product.get('external_links');
            if (externalLinks) {
                externalLinksList = Object.keys(externalLinks);
            }

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

                    debug('drainDone is done, continue...');

                    if (Object.keys(list).length) {

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

                        queueCallback(list);

                    } else {
                        logsData.save('OfferWorker', 'No data found while looking for scraped data for ' + product.get('title'), function (err) {
                           queueCallback(list);
                        });
                    }
                } else {
                    debug('drainDone not done yet...');
                }
            }

            // if there are no externalLinks, externalLinksList or buscapeId just return the empty offer list
            if (!buscapeProductId && (!externalLinks || !externalLinksList.length)) {
                drainDone();
            }

            //
            if (buscapeProductId) {

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
                startDrain('buscape');
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
                            drainDone();
                        });
                    }
                });
            }

            if (externalLinks && externalLinksList.length) {
                externalLinksList.forEach(function (link) {
                    // start all done states references, since the loop wil run faster
                    // then the callbacks will be called, it will not cause a bug
                    // of returning earlier than all done's were set
                    doneStateManager.startDoneState(externalLinks[link]);
                    crawler.queue([{
                        uri: externalLinks[link],
                        userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
                        callback: function (error, result, $) {

                            if (error || !result) {
                                debug('an error has ocurred');
                            } else {

                                if (!scrappers[link] || typeof scrappers[link] !== 'function') {
                                    throw new Error('Invalid scrapper link or it is not a function: ' + link);
                                }

                                list.offers.offers_by_seller[link] = scrappers[link](error, result, $);
                            }
                            drainDone(externalLinks[link]);
                        }
                    }]);
                });
            }
        }

        // Retrive product extra data information from product page
        function extraProductInformation(product, queueCallback) {

            var list,
                crawlerLink,
                requiredData,
                buscapeProductId;

            buscapeCrawlerLink =  product.get('original_link');
            buscapeProductId = product.get('id_buscape');
            list = {};

            // if there is a valid buscapeProductId, crawler link and valid url we can start scraping
            if(buscapeProductId && buscapeCrawlerLink && validUrl.isUri(buscapeCrawlerLink.url)) {

                crawler.queue([{
                    uri: buscapeCrawlerLink.url,   // the product page link
                    userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
                    callback: function (error, result, $) {

                        if (error || !result) {
                            logsData.save('OfferWorker', 'Invalid URL provided for scrapping for product ' + product.get('title'), function (err) {
                               queueCallback(list);
                            });
                        } else {
                            list = scrappers.buscape(error, result, $);
                            queueCallback(list);
                        }
                    }
                }]);

            } else {
                logsData.save('OfferWorker', 'No data to look for extraProductInformation for product: ' + product.get('title'), function (err) {
                   queueCallback(list);
                });
            }
        }

        function next() {
            if (queueScrapeDone && queueOfferDone) {

                debug('queueScrapeDone and queueOfferDone, continue saving...');

                // update procuts with the offers and scraping data
                products.db.saveAll(callCallback);
            }
        }

        // get all products, a collection will be returned
        products.db.getAll(function (productsList) {

            var queueScrape,
                queueOfferExternal,
                queueOffer;

            if (productsList.length) {

                // what function to run to scrape the product page
                queueScrape = async.queue(extraProductInformation, connections.max.extraProductInformation);

                // what funciton to run to get the offers
                queueOffer = async.queue(getOffers, connections.max.getOffers);

                // iterate over each product from the database
                productsList.forEach( function (product) {

                    queueScrape.push(product, function (res) {
                        if (res) {
                            product.set('filters', res);
                            // ugly as fuck, merge the current product with the new data
                            // lodash.objects.merge(productsWithExtraData[product.get('id')], res);
                        } else {
                            // The error were already registered before the callback
                        }
                    });

                    // prepare worker product for offers update
                    queueOffer.push(product, function (res) {
                        if (res) {
                            product.set('offers', res.offers);
                        } else {
                            // The error were already registered before the callback
                        }
                    });

                });

                // assign a callback when all queues are done
                queueScrape.drain = function () {
                    debug('scrape done');
                    queueScrapeDone = true;
                    next();
                };

                queueOffer.drain = function () {
                    debug('offer done');
                    queueOfferDone = true;
                    next();
                };

            } else {
                logsData.save('OfferWorker', 'Sem category ou length para categoryProducts', function (err) {
                    queueScrapeDone = true;
                    queueOfferDone = true;
                    next();
                });
            }
        });
    }
}

module.exports = updateProductsOffers;
