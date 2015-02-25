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
            forOwn: require('lodash-node/modern/objects/forOwn'),
            omit: require('lodash-node/modern/objects/omit'),
            transform: require('lodash-node/modern/objects/transform')
        },
        collections: {
            min: require('lodash-node/modern/collections/min'),
            max: require('lodash-node/modern/collections/max'),
            pluck: require('lodash-node/modern/collections/pluck'),
            forEach: require('lodash-node/modern/collections/forEach')
        }
    },
    buscapeScrapper = require('../scrappers/BuscapeScrapper'),
    netfarmaScrapper = require('../scrappers/NetfarmaScrapper'),
    ultrafarmaScrapper = require('../scrappers/UltrafarmaScrapper'),
    farmacondeScrapper = require('../scrappers/FarmacondeScrapper'),
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

            var productId,
                externalLinks,
                doneStateManager,
                list;

            // shortcut to buscape id present at the model
            productId = product.get('id_buscape');
            // shortcut to buscape id present at the model
            externalLinks = product.get('external_links');

            list = {
                offers: {
                    offers_by_seller: {}
                }
            };

            doneStateManager = new Done();

            function drainDone() {

                if (doneStateManager.getDoneState()) {

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

                        debug(list);
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

            if (productId) {

                // if there is no productId yet, means that it is our first attempt
                if (!offerAttempts[productId]) {
                    offerAttempts[productId] = 1;
                    debug('Ammount of attempts: ' + offerAttempts[productId] + '. Trying to fetch product: ' + productId);
                } else if (offerAttempts[productId] === 2 || offerAttempts[productId] === 3) {
                    // we are at the second/third run, try to call getOffers again
                    debug('Ammount of attempts: ' + offerAttempts[productId] + '. Trying to fetch product: ' + productId);
                } else {
                    debug('Ammount of attempts: ' + offerAttempts[productId] + '. No more fetching product: '+ productId);
                    // im tired of this shitty product on this shitty api, next!
                    doneStateManager.finishDoneState('buscape');
                    drainDone();
                    return;
                }

                // simple call the api with some parameters, fetching the product information
                // and it's offers
                // Scrapping Buscape Extra Data Page
                doneStateManager.startDoneState('buscape');
                buscape.findOfferList({productId: productId}, function (res) {
                    if (res instanceof Error) {
                        offerAttempts[productId] = offerAttempts[productId] + 1;
                        logsData.save('OfferWorker', 'findOfferList error: ' + res.message, function (err) {
                            // call getOffers again if there was an error'
                            getOffers(product, queueCallback);
                        });
                    } else if (res) {

                        if (res.ok) { // Response ok

                            // there is offers for this product?
                            if (res.body.offer) {
                                var pluckedOffers,
                                    bestOffer,
                                    worstOffer,
                                    bestDiscount,
                                    toRemove;

                                // this is the field name set in the model that hold sellers informations
                                list.offers.offers_by_seller = {};
                                list.offers.best_offer = {};
                                list.offers.worst_offer = {};
                                list.offers.best_discount = {};
                                list.offers.best_discount_price = {};

                                /**
                                 *  SET offers_by_seller_id
                                 */

                                // we are removing all the unecessary data the API returns
                                // and using only the offer field and childrens
                                pluckedOffers = lodash.collections.pluck(res.body.offer, 'offer');

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
                                        list.offers.offers_by_seller[offerId] = {};

                                        // filter data that we don't want (remove)
                                        list.offers.offers_by_seller[offerId].seller = lodash.objects.omit(offer.seller, function (value, key) {
                                            return toRemove.indexOf(key) !== -1;
                                        });

                                        // pluck the link property
                                        list.offers.offers_by_seller[offerId].seller.links = lodash.collections.pluck(offer.seller.links, 'link');

                                        // fix price type (string to integer)
                                        // result is the object, key is the property and value is the current value of it
                                        list.offers.offers_by_seller[offerId].price = lodash.objects.transform(offer.price, function (result, value, key) {
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

                                        list.offers.offers_by_seller[offerId].links = lodash.collections.pluck(offer.links, 'link');
                                        // removed uneeded data
                                        delete list.offers.offers_by_seller[offerId].seller.id;
                                    });
                                }
                                doneStateManager.finishDoneState('buscape', true);
                                drainDone();
                            } else {
                                // No offers for this product, do nothing
                                doneStateManager.finishDoneState('buscape', true);
                                drainDone();
                            }
                        } else {
                            logsData.save('OfferWorker', 'No response from the api', function (err) {
                                doneStateManager.finishDoneState('buscape', true);
                                drainDone();
                            });
                        }
                    } else {
                        logsData.save('OfferWorker', 'Problems with BuscapeAPI request on findProductsExtraData', function (err) {
                            doneStateManager.finishDoneState('buscape', true);
                            drainDone();
                        });
                    }
                });
            }

            if (externalLinks) {

                var names = Object.keys(externalLinks);
                if (names.length) {

                    names.forEach(function (name) {
                        // start all done states references, since the loop wil run faster
                        // then the callbacks will be called, it will not cause a bug
                        // of returning earlier than all done's were set
                        doneStateManager.startDoneState(externalLinks[name]);
                        crawler.queue([{
                            uri: externalLinks[name],
                            userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
                            callback: function (error, result, $) {

                                if (error || !result) {
                                    debug('an error has ocurred');
                                } else {
                                    switch (name) {
                                        case 'ultrafarma':
                                            list.offers.offers_by_seller.ultrafarma = ultrafarmaScrapper(error, result, $);
                                            break;
                                        case 'farmaconde':
                                            // TODO remove this
                                            // TODO remove from here, farmaconde should be used in other place to set the product data (a temporary thing)
                                            // TODO meh
                                            list.offers.offers_by_seller.farmaconde = farmacondeScrapper(error, result, $);
                                            break;
                                        case 'netfarma':
                                            list.offers.offers_by_seller.netfarma = netfarmaScrapper(error, result, $);
                                            break;
                                        default:
                                            // do nothing
                                            break;
                                    }
                                }

                                doneStateManager.finishDoneState(externalLinks[name], true);
                                drainDone();
                            }
                        }]);
                    });
                } else {
                    // no external links
                    drainDone();
                }
            } else {
                // external links returned undefined
                drainDone();
            }
        }


        // Retrive product extra data information from product page
        function extraProductInformation(product, queueCallback) {

            var list,
                crawlerLink,
                requiredData,
                productId;

            buscapeCrawlerLink =  product.get('original_link');
            buscapeProductId = product.get('id_buscape');
            list = {};

            // if there is a valid productid, crawler link and valid url we can start scraping
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
                            list = buscapeScrapper(error, result, $);
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
