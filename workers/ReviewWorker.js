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

            logsData.save('ReviewWorker', message, function () {
                updateCallback(err);
            });
        }
    }

    function findProductsUserRatings(categoryProducts, callback) {
        debug('findProductsUserRatings');
        // TODO preciso pegar os ratings dos usuários ainda
        logsData.save('ReviewWorker', 'findProductRatings ainda não finalizado', function (err) {
            callback(null, categoryProducts);
        });
        // Buscape.viewUserRatings(productId);
        //      |- acessar o firebase e salvar com as informações coletadas
        //         somente salvar produtos novos e atualizar os products rating

    }

    // order the async call and the requests order
    function runAsync() {
        async.waterfall([
            findProductsUserRatings
        ], function (err, categoryProducts) {     // callback when all requests are done

            throw new Error('Finish on review on purpose');
            
            var productsModels,
                queueSave;

            function saveProductsData(categoryData, callback) {

                // retorna as collections após criar elas
                productsModels = products.create(categoryData.products);

                if (productsModels) {
                    // update procuts
                    products.db.saveAll(callback);

                } else {
                    logsData.save('ReviewWorker', 'An error ocurred while trying to create the models', function (err) {
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

module.exports = updateProductsReview;
