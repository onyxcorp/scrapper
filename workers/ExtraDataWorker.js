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
        buscape: require('../scrappers/BuscapeScrapper')
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
                            logsData.save('ExtraDataWorker', 'Invalid URL provided for scrapping for product ' + product.get('title'), function (err) {
                               queueCallback(list);
                            });
                        } else {
                            list = scrappers.buscape(error, result, $);
                            queueCallback(list);
                        }
                    }
                }]);

            } else {
                logsData.save('ExtraDataWorker', 'No data to look for extraProductInformation for product: ' + product.get('title'), function (err) {
                   queueCallback(list);
                });
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
                        if (res) {
                            product.set('filters', res);
                            // ugly as fuck, merge the current product with the new data
                            // lodash.objects.merge(productsWithExtraData[product.get('id')], res);
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
