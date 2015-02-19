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
            assign: require('lodash-node/modern/objects/assign'),
            defaults: require('lodash-node/modern/objects/defaults'),
            values: require('lodash-node/modern/objects/values'),
            merge: require('lodash-node/modern/objects/merge'),
            isFunction: require('lodash-node/modern/objects/isFunction'),
            forOwn: require('lodash-node/modern/objects/forOwn'),
            has: require('lodash-node/modern/objects/has'),
            omit: require('lodash-node/modern/objects/omit'),
            transform: require('lodash-node/modern/objects/transform')
        },
        string: require('underscore.string'),
        collections: {
            min: require('lodash-node/modern/collections/min'),
            max: require('lodash-node/modern/collections/max'),
            pick: require('lodash-node/modern/objects/pick'),
            pluck: require('lodash-node/modern/collections/pluck'),
            find: require('lodash-node/modern/collections/find'),
            forEach: require('lodash-node/modern/collections/forEach'),
            map: require('lodash-node/modern/collections/map')
        }
    },
    debug = function (message) { console.log(message); },
    buscape,
    crawler,
    connections;

connections = {
    max: {
        crawler: 40,
        scrapeProductPage: 40,
        getOffers: 40
    }
};

// Run all constructors
buscape = new Buscape();
crawler = new Crawler({maxConnections:connections.max.crawler});

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
        debug('findProducsExtraData');
        var queueScrapeDone,
            queueOfferDone,
            offerAttempts;

        offerAttempts = {};

        // Retrive some product offer information
        function getOffers(product, queueCallback) {

            var productId;

            // shortcut to buscape id present at the model
            productId = product.get('id_buscape');

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
                    queueCallback(false);
                    return;
                }

                // simple call the api with some parameters, fetching the product information
                // and it's offers
                buscape.findOfferList({productId: productId}, function (res) {
                    if (res instanceof Error) {
                        offerAttempts[productId] = offerAttempts[productId] + 1;
                        logsData.save('OfferWorker', 'findOfferList error: ' + res.message, function (err) {
                            // call getOffers again if there was an error'
                            getOffers(product, queueCallback);
                        });
                    } else if (res) {
                        var list;
                        list = {};

                        if (res.ok) { // Response ok

                            // there is offers for this product?
                            if (res.body.offer) {
                                var pluckedOffers,
                                    bestOffer,
                                    worstOffer,
                                    bestDiscount,
                                    toRemove;

                                // this is the field name set in the model that hold sellers informations
                                list.offers = {};
                                list.offers.offers_by_seller_id = {};
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
                                        list.offers.offers_by_seller_id[offerId] = {};

                                        // filter data that we don't want (remove)
                                        list.offers.offers_by_seller_id[offerId].seller = lodash.objects.omit(offer.seller, function (value, key) {
                                            return toRemove.indexOf(key) !== -1;
                                        });

                                        // pluck the link property
                                        list.offers.offers_by_seller_id[offerId].seller.links = lodash.collections.pluck(offer.seller.links, 'link');

                                        // fix price type (string to integer)
                                        // result is the object, key is the property and value is the current value of it
                                        list.offers.offers_by_seller_id[offerId].price = lodash.objects.transform(offer.price, function (result, value, key) {
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

                                        list.offers.offers_by_seller_id[offerId].links = lodash.collections.pluck(offer.links, 'link');
                                        // removed uneeded data
                                        delete list.offers.offers_by_seller_id[offerId].seller.id;
                                    });

                                    /**
                                     * SET best_offer and worst_offer
                                     * TODO functional programming this shit
                                     */
                                     var offersLength = Object.keys(list.offers.offers_by_seller_id).length;

                                    // get the current best offer by comparing all the prices
                                    if (offersLength > 1) {
                                        // there are more than one offer
                                        list.offers.best_offer = lodash.collections.min(list.offers.offers_by_seller_id, function (offer) {
                                            return Transmuter.toFloat(offer.price.value);
                                        });
                                        list.offers.worst_offer = lodash.collections.max(list.offers.offers_by_seller_id, function (offer) {
                                            return Transmuter.toFloat(offer.price.value);
                                        });

                                        // calculate best_discount prices
                                        list.offers.best_discount_price = list.offers.worst_offer.price.value - list.offers.best_offer.price.value;
                                        var tempDiscount = 1 - list.offers.best_offer.price.value / list.offers.worst_offer.price.value;
                                        list.offers.best_discount = parseFloat(tempDiscount.toFixed(3));
                                    } else if (offersLength === 1) {
                                        // there is only one offer, so we have a best_offer but no worst_offer
                                        // TODO must remove seller.id
                                        list.offers.best_offer = lodash.objects.values(list.offers.offers_by_seller_id)[0];
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
                                    queueCallback(false);
                                }

                            } else {
                                // No offers for this product, do nothing
                                queueCallback(false); // list is initially set as {}
                            }
                        } else {
                            logsData.save('OfferWorker', 'No response from the api', function (err) {
                                queueCallback(false);
                            });
                        }
                    } else {
                        logsData.save('OfferWorker', 'Problems with BuscapeAPI request on findProductsExtraData', function (err) {
                            queueCallback(false);
                        });
                    }
                });
            } else {
                logsData.save('OfferWorker', 'Product link/buscape_id not provided or invalid for ' + product.get('title'), function (err) {
                    queueCallback(false);
                });
            }
        }

        // Retrive product extra data information from product page
        function scrapeProductPage(product, queueCallback) {

            var crawlerLink,
                stringReplace,
                requiredData,
                productId;

            crawlerLink =  product.get('original_link').url;
            productId = product.get('id_buscape');

            stringReplace = {
                'apresentacao': 'presentation',
                'concentracao': 'concentration',
                'substancia-ativa': 'medicine',
                'nome': 'name',
                'quantidade': 'quantity',
                'marca' : 'supplier',
                'embalagem' : 'package',
                'forma': 'shape',
                'volume': 'volume',
                'peso' : 'weight'
            };

            // if there is a valid productid, crawler link and valid url we can start scraping
            if(productId && crawlerLink && validUrl.isUri(crawlerLink)) {

                // Get product link and scrap the page
                crawler.queue([{
                    uri: crawlerLink, // the product page link
                    callback: function (error, result, $) {

                        var detalhes,
                            list,
                            data,
                            i;

                        detalhes = [];
                        list = {};
                        data = $('section.product-details').find('li').children('span');

                        if (data.length) {
                           // cheerio built in each loop function
                            data.each( function (index, element) {
                                var text;
                                // remove all extra white spaces and slugify the result
                                text = lodash.string.slugify(lodash.string.clean($(this).text()));
                                // iterate over the replacement data and replace it accordingly
                                lodash.objects.forOwn(stringReplace, function (value, key) {
                                    // key are the original value we are going to replace
                                    // value are the current wanted value to replace
                                    text = text.replace(key, value);
                                });
                                detalhes.push(text);
                            });
                            // loop throught all the found product details
                            for (i = 0; i < detalhes.length; i += 2) {
                                var productInfoData,
                                    key,
                                    value;

                                key = detalhes[i];      // all even array indexes (0,2,4,...)
                                value = detalhes[i+1];  // all odd array indexes (1,3,5,...)

                                // if the current key exists as a required (and wanted) data
                                productInfoData = {};
                                productInfoData[key] = value ? value : '';
                                lodash.objects.merge(list, productInfoData);
                            }

                            queueCallback(list);
                        } else {
                            logsData.save('OfferWorker', 'No data found while looking for section.product-details for ' + product.get('title'), function (err) {
                               queueCallback(list);
                            });
                        }
                    }
                }]);
            } else {
                logsData.save('OfferWorker', 'Product link/buscape_id not provided or invalid for ' + product.get('title'), function (err) {
                    queueCallback(false);
                });
            }
        }

        function next () {
            if (queueScrapeDone && queueOfferDone) {
                debug('queueScrapeDOne and queueOfferDone, continue saving...');
                // update procuts with the offers and scraping data
                products.db.saveAll(callCallback);
            }
        }

        // get all products, a collection will be returned
        products.db.getAll(function (productsList) {

            var queueScrape,
                queueOffer;

            if (productsList.length) {

                // what function to run to scrape the product page
                queueScrape = async.queue(scrapeProductPage, connections.max.scrapeProductPage);

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
                queueScrape.drain = function() {
                    debug('scrap drain');
                    queueScrapeDone = true;
                    next();
                };

                queueOffer.drain = function () {
                    debug('offer drain');
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
        //
        //
        // if (categoryProducts && Object.keys(categoryProducts).length) {
        //
        //
        //
        // } else {
        //
        // }
    }
}

module.exports = updateProductsOffers;
