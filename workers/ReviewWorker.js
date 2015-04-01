/*

    Pegar os produtos a partir das categorias salvas no banco de dados.

    Realizará um loop por todas as categorias, salvando os produtos e os dados
    extras que devem ser scrapeds do site (já que a API está passando informações incompletas)


*/
var Transmuter = require('transmuter'),
    products = require('../data/ProductsData'),
    async = require('async'),
    validUrl = require('valid-url'),
    logsData = require('../data/LogsData'),
    lodash = {
        objects: {
            isFunction: require('lodash-node/modern/objects/isFunction')
        },
        collections: {
            forEach: require('lodash-node/modern/collections/forEach')
        }
    },
    debug = function (message) { console.log(message); },
    connections;

connections = {
    max: {
        saveProductsData: 40
    }
};

function updateProductsReview(updateCallback) {

    logsData.save('ReviewWorker', 'Update Products Started', function (err) {
        findProductsReviews();
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

            logsData.save('ReviewWorker', message, function () {
                updateCallback(err);
            });
        }
    }

    function findProductsReviews() {

        function findProductsUserRatings(product, queueCallback) {

            // TODO preciso pegar os ratings dos usuários ainda
            logsData.save('ReviewWorker', 'findProductRatings ainda não finalizado', function (err) {
                queueCallback(false);
            });
            // Buscape.viewUserRatings(productId);
            //      |- acessar o firebase e salvar com as informações coletadas
            //         somente salvar produtos novos e atualizar os products rating

        }

        // get all products, a collection will be returned
        products.db.getAll(function (productsList) {

            var queueProductReview;

            if (productsList.length) {

                queueProductReview = async.queue(findProductsUserRatings, connections.max.saveProductsData);

                productsList.forEach( function (product) {
                    queueProductReview.push(product, function (res) {
                        if (res) {
                            err = true;
                        }
                    });
                });

                // assign a callback when all queues are done
                queueProductReview.drain = function() {
                    // products.db.saveAll(callCallback);
                    callCallback();
                };

            } else {
                logsData.save('ReviewWorker', 'Sem category ou length para categoryProducts', function (err) {
                    callCallback();
                });
            }
        });
    }
}

module.exports = updateProductsReview;
