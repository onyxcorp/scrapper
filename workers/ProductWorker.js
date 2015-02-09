/*

    Pegar os produtos a partir das categorias salvas no banco de dados.

    Realizará um loop por todas as categorias, salvando os produtos e os dados
    extras que devem ser scrapeds do site (já que a API está passando informações incompletas)


*/
var Buscape = require('../utils/BuscapeAPI'),
    Crawler = require('crawler'),
    Transmuter = require('transmuter'),
    categories = require('../data/CategoriesData'),
    products = require('../data/ProductsData'),
    productsPriceHistory = require('../data/ProductsPriceHistoryData'),
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
        getProducts: 40,
        scrapeProductPage: 40,
        getOffers: 40,
        saveProductsData: 40
    }
};

// Run all constructors
buscape = new Buscape();
crawler = new Crawler({maxConnections:connections.max.crawler});

function updateProducts(updateCallback) {

    logsData.save('ProductWorker', 'Update Products Started', function (err) {
        runAsync();
    });

    // wrapper to call the callback
    function callCallback(err) {
        // everything finished, if there is a callback, apply it
        if (updateCallback && lodash.objects.isFunction(updateCallback)) {
            var message;

            if (err) {
                message = 'Update Product Finished - Errors';
            } else {
                message = 'Update Product Finished - Success';
            }

            logsData.save('ProductWorker', message, function () {
                updateCallback(err);
            });
        }
    }

    function findProducts(callback) {

        var queueProducts,
            attempts,
            maxErrors,
            categoryProducts;

        maxErrors = 3;
        categoryProducts = {};
        attempts = {};

        function getProducts(idCategory, queueCallback) {

            function findProductList(currentPage, totalPages, productsList, productsPriceHistoryList) {

                currentPage = currentPage || 1;
                totalPages = 1; // totalPages || null;
                productsList = productsList || [];
                productsPriceHistoryList = productsPriceHistoryList || [];

                // we should just leave if the currentPage exceedd by 1 the total pages
                if (currentPage > totalPages) {
                    debug('All fetched');
                    queueCallback({
                        products: productsList,
                        priceHistory: productsPriceHistoryList
                    });
                    return;
                }

                // first try
                if (!attempts[currentPage]) {
                    // set error and try to fetch for the first time
                    attempts[currentPage] = 1;
                    debug('Ammount of attempts: ' + attempts[currentPage] + '. Trying to fetch page: ' + currentPage);
                } else if (attempts[currentPage] == 2) {
                    // second run, try again
                    debug('Ammount of attempts: ' + attempts[currentPage] + '. Trying to fetch page: ' + currentPage);
                } else {
                    // tryed two times and no results, time to move on
                    currentPage += 1;
                    debug('Ammount of attempts: ' + attempts[currentPage] + '. Trying to fetch page: ' + currentPage);
                }

                buscape.findProductList({categoryId:idCategory, page:currentPage, results: 10}, function (res) {

                    if (res instanceof Error) {
                        logsData.save('ProductWorker', 'findProductList error: ' + res.message, function (err) {
                            debug('we got an error');
                            // going to try a second attempt with the same stats
                            attempts[currentPage] = attempts[currentPage] ? attempts[currentPage] + 1 : 1;
                            findProductList(currentPage, totalPages, productsList, productsPriceHistoryList);
                        });
                    } else if (res) {
                        var responseProducts,
                            responseCategory,
                            newProductsList,
                            newProductsPriceHistoryList;

                        responseProducts = res.body.product;
                        responseCategory = res.body.category;

                        // If there is not a total number of pages, set it now
                        if (!totalPages) {
                            totalPages = parseInt(res.body.totalpages);
                        }

                        if (responseProducts) {
                            // get the current page products list
                            newProductsList = lodash.collections.map(res.body.product, function (data, key) {

                                var product,
                                    thumbs,
                                    categories,
                                    pluckThumb,
                                    pluckLink,
                                    link;

                                product = data.product;

                                // should transform something like:
                                // formats:[{
                                //      link: { width: 200, height: 200 ,url:"http://url.com.br" }
                                // }],
                                // width: 300, height: 300, url...
                                // into:
                                // sizeOne:{width:200,height:200,url:"http://url.com.br"},
                                // sizeTwo:{width:300,height:300, url...
                                //
                                thumbs = {
                                    small: {},
                                    medium: {},
                                    large: {}
                                };
                                if (product.thumbnail) {
                                    // pick will return the found properties or just an empty object
                                    thumbs.medium = lodash.collections.pick(product.thumbnail, function(value, key) {
                                      return key != 'formats';
                                    });
                                    pluckThumb = lodash.collections.pluck(product.thumbnail.formats, 'formats');
                                    thumbs.small = lodash.collections.find(pluckThumb, {width:100}) || {};
                                    thumbs.large = lodash.collections.find(pluckThumb, {width:300}) || {};
                                }

                                // should transform something like:
                                // foo = [{ link: { type : "product", url:"http://url.com.br" } }]
                                // into:
                                // { type: "product", url: "http://url.com.br" }
                                //
                                link = {};
                                if (product.links) {
                                    pluckLink = lodash.collections.pluck(product.links, 'link');
                                    if (pluckLink) {
                                        link = lodash.collections.find(pluckLink, {type: "product"}) || {};
                                    }
                                }


                                // set the category list of the product
                                // The format should be
                                // product.category = { 12345 = true, ... }
                                categories = {};
                                categories[lodash.string.slugify(responseCategory.name)] = true;

                                // Blend everything togheter
                                return {
                                    id_buscape: product.id,
                                    thumb: thumbs,
                                    title: product.productname,
                                    slug: lodash.string.slugify(product.productname),
                                    description: '', // will be created in the fure
                                    rating: product.rating.useraveragerating,
                                    categories: categories,
                                    original_link: link,
                                    shape: null,    // will be collected bellow
                                    supplier: null, // will be collected bellow
                                    package: null,  // will be collected bellow
                                    volume: null,   // may be collected bellow
                                    weight: null    // may be collected bellow
                                };
                            });
                            productsList = productsList.concat(newProductsList);

                            // get the current page price history list
                            newProductsPriceHistoryList = lodash.collections.map(res.body.product, function (data, key) {

                                var priceHistory,
                                    product;

                                product = data.product;

                                // set the data history for when this data was collected
                                // use timestamp as the key
                                // The format should be
                                // priceHistory.timestamp = {
                                //  min : 100,
                                //  max : 200
                                // }
                                priceHistory = {};
                                priceHistory[new Date().getTime()] = {
                                    max: product.pricemax ? parseFloat(product.pricemax) || product.pricemax : 0,
                                    min: product.pricemin ? parseFloat(product.pricemin) || product.pricemin : 0
                                };

                                return {
                                    id_buscape: product.id,
                                    days: priceHistory
                                };
                            });
                            productsPriceHistoryList = productsPriceHistoryList.concat(newProductsPriceHistoryList);

                            // check if we are at the last page or not
                            var nextPage = currentPage + 1;
                            findProductList(nextPage, totalPages, productsList, productsPriceHistoryList);

                        } else {
                            logsData.save('ProductWorker', 'No products found today', function (err) {
                                queueCallback(false);
                            });
                        }
                    } else {
                        logsData.save('ProductWorker', 'Problems with BuscapeAPI request on findProductList', function (err) {
                            queueCallback(false);
                        });
                    }
                });
            }

            if (idCategory) {
                findProductList(1);
            } else {
                logsData.save('ProductWorker', 'No category to look for', function (err) {
                    queueCallback(false);
                });
            }
        }


        // get all categories, a collection will be returned
        categories.db.getAll(function (categories) {

            if (categories.length) {

                queueProducts = async.queue(getProducts, connections.max.getProducts);

                categories.forEach(function (category) {
                    // prepare worker product for crawling
                    queueProducts.push(category.get('id_buscape'), function (res) {
                        if (res) {
                            categoryProducts[category.get('id')] = res;
                        }
                    });
                });

                // assign a callback when all queues are done
                queueProducts.drain = function() {
                    debug(categoryProducts);
                    // categoryProducts should be a list of products
                    callback(null, categoryProducts);
                };
            } else {
                logsData.save('ProductWorker', 'No categories found', function (err) {
                    callback(true);
                });
            }

        });
    }

    function findProductsExtraData(categoryProducts, callback) {
        debug('findProducsExtraData');
        var queueScrape,
            queueOffer,
            queueScrapeDone,
            offerAttempts,
            queueOfferDone;

        offerAttempts = {};

        // Retrive some product offer information
        function getOffers(task, queueCallback) {
            var productId;

            // shortcut to buscape id present at the model
            productId = task.id_buscape;

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
                        logsData.save('ProductWorker', 'findOfferList error: ' + res.message, function (err) {
                            getOffers(task, queueCallback);
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
                            logsData.save('ProductWorker', 'No response from the api', function (err) {
                                queueCallback(false);
                            });
                        }
                    } else {
                        logsData.save('ProductWorker', 'Problems with BuscapeAPI request on findProductsExtraData', function (err) {
                            queueCallback(false);
                        });
                    }
                });
            } else {
                logsData.save('ProductWorker', 'Product link/buscape_id not provided or invalid for ' + task.title, function (err) {
                    queueCallback(false);
                });
            }
        }

        // Retrive product extra data information from product page
        function scrapeProductPage(task, queueCallback) {
            var crawlerLink,
                stringReplace,
                requiredData,
                productId;

            crawlerLink = task.original_link.url;
            productId = task.id_buscape;
            stringReplace = {
                'marca' : 'supplier',
                'embalagem' : 'package',
                'forma': 'shape',
                'volume': 'volume',
                'peso' : 'weight'
            };
            requiredData = {
                'supplier': '',
                'package': '',
                'shape': '',
                'volume': '',
                'weight': ''
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
                                if (lodash.objects.has(requiredData, key)) {
                                    productInfoData = {};
                                    productInfoData[key] = value ? value : '';
                                    lodash.objects.merge(list, productInfoData);
                                }
                            }

                            // make sure all required data is set by running default
                            // which will set as empty (object or string) all the data not found on the listing
                            lodash.objects.defaults(list, requiredData);
                            queueCallback(list);
                        } else {
                            logsData.save('ProductWorker', 'No data found while looking for section.product-details for ' + task.title, function (err) {
                               queueCallback(list);
                            });
                        }
                    }
                }]);
            } else {
                logsData.save('ProductWorker', 'Product link/buscape_id not provided or invalid for ' + task.title, function (err) {
                    queueCallback(false);
                });
            }
        }

        function next () {
            debug('next');
            debug(queueScrapeDone);
            debug(queueOfferDone);
            if (queueScrapeDone && queueOfferDone) callback(null, categoryProducts);
        }

        if (categoryProducts && Object.keys(categoryProducts).length) {

            queueScrape = async.queue(scrapeProductPage, connections.max.scrapeProductPage);
            queueOffer = async.queue(getOffers, connections.max.getOffers);

            // iterate over each category of products (suplementos, etc)
            lodash.collections.forEach(categoryProducts, function (categoryData, categoryKey) {

                // iterate over each product inside a category (array)
                lodash.collections.forEach(categoryData.products, function (productData, productKey) {
                    queueScrape.push(productData, function (res) {
                        if (res) {
                            // ugly as fuck, merge the current product with the new data
                            lodash.objects.merge(categoryProducts[categoryKey].products[productKey], res);
                        } else {
                            // The error were already registered before the callback
                        }
                    });

                    // prepare worker product for offers update
                    queueOffer.push(productData, function (res) {
                        if (res) {
                            // ugly as fuck, merge the current product with the new data
                            lodash.objects.merge(categoryProducts[categoryKey].products[productKey], res);
                        } else {
                            // The error were already registered before the callback
                        }
                    });
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
            logsData.save('ProductWorker', 'Sem category ou length para categoryProducts', function (err) {
                queueScrapeDone = true;
                queueOfferDone = true;
                next();
            });
        }
    }

    function findProductsUserRatings(categoryProducts, callback) {
        debug('findProductsUserRatings');
        // TODO preciso pegar os ratings dos usuários ainda
        logsData.save('ProductWorker', 'findProductRatings ainda não finalizado', function (err) {
            callback(null, categoryProducts);
        });
        // Buscape.viewUserRatings(productId);
        //      |- acessar o firebase e salvar com as informações coletadas
        //         somente salvar produtos novos e atualizar os products rating

    }

    // order the async call and the requests order
    function runAsync() {
        async.waterfall([
            findProducts,
            findProductsExtraData,
            findProductsUserRatings
        ], function (err, categoryProducts) {     // callback when all requests are done

            var productsModels,
                productsPriceHistoryModels,
                queueSave;

            function saveProductsData(categoryData, callback) {

                // retorna as collections após criar elas
                productsModels = products.create(categoryData.products);
                productsPriceHistoryModels = productsPriceHistory.create(categoryData.priceHistory);

                if (productsModels && productsPriceHistoryModels) {
                    // update procuts
                    products.db.saveAll(function () {
                        // update products price history and then call final callback
                        productsPriceHistory.db.saveAll(callback);
                    });

                } else {
                    logsData.save('ProductWorker', 'An error ocurred while trying to create the models', function (err) {
                        callback(true); // true because error
                    });
                }
            }

            if (err) {
                callCallback(err);
            } else {

                queueSave = async.queue(saveProductsData, connections.max.saveProductsData);

                lodash.collections.forEach(categoryProducts, function (categoryData, categoryKey) {
                    queueSave.push(categoryData, function (res) {
                        if (res) {
                            err = true;
                        }
                    });
                });

                // assign a callback when all queues are done
                queueSave.drain = function() {
                    callCallback(err);
                };
            }
        });
    }

}

module.exports = updateProducts;
