/*

    Pegar os produtos a partir das categorias salvas no banco de dados.

    Realizará um loop por todas as categorias, salvando os produtos e os dados
    extras que devem ser scrapeds do site (já que a API está passando informações incompletas)


*/
var Buscape = require('../utils/BuscapeAPI'),
    categories = require('../data/CategoriesData'),
    products = require('../data/ProductsData'),
    productsPriceHistory = require('../data/ProductsPriceHistoryData'),
    async = require('async'),
    logsData = require('../data/LogsData'),
    lodash = {
        objects: {
            values: require('lodash-node/modern/objects/values'),
            merge: require('lodash-node/modern/objects/merge'),
            isFunction: require('lodash-node/modern/objects/isFunction')
        },
        string: require('underscore.string'),
        collections: {
            pick: require('lodash-node/modern/objects/pick'),
            pluck: require('lodash-node/modern/collections/pluck'),
            find: require('lodash-node/modern/collections/find'),
            forEach: require('lodash-node/modern/collections/forEach'),
            map: require('lodash-node/modern/collections/map')
        }
    },
    debug = function (message) { console.log(message); },
    buscape,
    connections;

connections = {
    max: {
        getProducts: 40,
        scrapeProductPage: 40,
        getOffers: 40
    }
};

// Run all constructors
buscape = new Buscape();

function updateProducts(updaterCallback) {

    logsData.save('ProductWorker', 'Update Products Started', function (err) {
        findProducts();
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

            logsData.save('ProductWorker', message, function () {
                updaterCallback(err);
            });
        }
    }

    function findProducts() {

        var attempts,
            maxErrors;

        maxErrors = 3;
        attempts = {};

        function getProducts(idCategory, queueCallback) {

            function findProductList(currentPage, totalPages, productsList, productsPriceHistoryList) {

                currentPage = currentPage || 1;
                totalPages = 1; // totalPages || null;
                productsList = productsList || [];
                productsPriceHistoryList = productsPriceHistoryList || [];

                // we should just leave if the currentPage exceedd by 1 the total pages
                if (currentPage > totalPages) {
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
                                    filters: {}
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

            var err,
                categoryProducts,
                queueProducts,
                queueSave;

            categoryProducts = {};
            err = null;

            if (categories.length) {

                // get all the products
                queueProducts = async.queue(getProducts, connections.max.getProducts);

                categories.forEach(function (category) {
                    // prepare worker product for crawling
                    queueProducts.push(category.get('id_buscape'), function (res) {
                        if (res) {
                            // add the products to the collection
                            products.create(res.products);
                            // add the products price history to the collection
                            productsPriceHistory.create(res.priceHistory);
                        }
                    });
                });

                // assign a callback when all queues are done
                queueProducts.drain = function() {

                    products.db.saveAll( function () {
                        // update products price history and then call final callback
                        productsPriceHistory.db.saveAll(callCallback);
                    });

                };

            } else {
                logsData.save('ProductWorker', 'No categories found', function (err) {
                    callCallback(err);
                });
            }
        });
    }
}

module.exports = updateProducts;
