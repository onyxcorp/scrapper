/*

    Este arquivo tem por objetivo pegar todos os arquivos espalhados pelo banco de dados
    e conectar eles como sendo membros entre si, no caso as taxonomias que pertencem
    aos produtos, categorias e produtos entre si, etc.

*/

var async = require('async'),
    productsData = require('../data/ProductsData'),
    categoriesData = require('../data/CategoriesData'),
    filtersData = require('../data/FiltersData'),
    logsData = require('../data/LogsData'),
    lodash = {
        arrays: {
            flatten: require('lodash-node/modern/arrays/flatten'),
            uniq: require('lodash-node/modern/arrays/uniq'),
            without: require('lodash-node/modern/arrays/without')
        },
        objects: {
            isFunction: require('lodash-node/modern/objects/isFunction'),
            keys: require('lodash-node/modern/objects/keys')
        },
        string: require('underscore.string'),
        collections: {
            pluck: require('lodash-node/modern/collections/pluck'),
            forEach: require('lodash-node/modern/collections/forEach'),
            map: require('lodash-node/modern/collections/map')
        }
    },
    debug = function (message) { console.log(message); };

function updateFiltersMembers(updateCallback) {

    logsData.save('MemberWorker', 'Update Members Started', function (err) {
        run();
    });

    function callCallback(err) {
        // everything finished, if there is a callback, apply it
        if (updateCallback && lodash.objects.isFunction(updateCallback)) {
            var message;

            if (err) {
                message = 'Update Member Finished - Errors';
            } else {
                message = 'Update Member Finished - Success';
            }

            logsData.save('MemberWorker', message, function () {
                updateCallback(err);
            });
        }
    }

    function logSuccess(message, callback) {
        logsData.save('MemberWorker', message, function (err) {
            callback(null); // return callback without error
        });
    }

    function logError(message, callback) {
        logsData.save('MemberWorker', message, function (err) {
            callback(true); // return callback with error
        });
    }

    // filterName will be categories/package/suppliers, etc
    // products are an list of products from the database
    function updateList(data, filterName, products) {

        var items = [];

        // Iterate over each category
        items = data.map(function (item) {

            var itemData = null,
                members = {},
                productItemAttribute;

            // for each category iterate over each product
            products.forEach( function (product, key) {

                debug(product);
                // get the category attribute from the product
                productItemAttribute = product.get(filterName);

                // if the product.categories attribute has the current item being iterated...
                if (productItemAttribute && (productItemAttribute === item || productItemAttribute[item])) {
                    members[product.id] = true;
                }

            });

            // assign the members to the item
            if (item && members) {
                itemData = {
                    slug: item,
                    members: members
                };
            }

            return itemData;
        });

        // remove null elements
        items = lodash.arrays.without(items, null);

        return items;
    }

    function run() {
        // GET ALL PRODUCTS
        productsData.db.getAll(function (products) {

            function updateCategories(callback) {
                var categoryList,
                    categories,
                    categoriesModels;

                // get all categories from all products and creates a list (array)
                categoryList = products.pluck('categories').map( function (category) {
                    return lodash.objects.keys(category);
                });
                categoryList = lodash.arrays.uniq(lodash.arrays.flatten(categoryList));

                categories = updateList(categoryList, 'categories', products);

                if (categories.length) {
                    categoriesModels = categoriesData.create(categories);
                    if(categoriesModels) {
                        categoriesData.db.saveAll(callback);
                    } else {
                        logError('An error ocurred while updating categories members', callback);
                    }
                } else {
                    logSuccess('No categories to update today', callback);
                }
            }

            // filterName will be something like 'package', 'shape'
            function abstractUpdateFilters(filterName, callback) {
                var list,
                    filters,
                    filtersModels;

                if (!filterName) {
                    throw new Error('abstract upate filter needs a name');
                }

                // get all packages from all products and creates an unique list (array)
                list = lodash.arrays.uniq(products.pluck(filterName));

                //
                filters = updateList(list, filterName, products);

                if (filters.length) {
                    var currentFilter = filtersData.create(filterName, filters);
                    if(currentFilter.collection.length) {
                        currentFilter.saveAll(callback);
                    } else {
                        logError('An error ocurred while updating ' + filterName + ' members', callback);
                    }
                } else {
                    logSuccess('No ' + filterName + ' to update today', callback);
                }
            }


            function updatePackages(callback) {
                abstractUpdateFilters('package', callback);
            }

            function updateShapes(callback) {
                abstractUpdateFilters('shape', callback);
            }

            function updateSuppliers(callback) {
                abstractUpdateFilters('supplier', callback);
            }

            function updateVolumes(callback) {
                abstractUpdateFilters('volume', callback);
            }

            function updateWeights(callback) {
                abstractUpdateFilters('weight', callback);
            }

            // order the async call and the requests order
            async.parallel([
                updateCategories,
                updatePackages,
                updateShapes,
                updateSuppliers,
                updateVolumes,
                updateWeights
            ], function (err) {
                if(err) {
                    debug('FiltersWorker.js - An error ocurred while trying to create a model');
                } else {
                    debug('FiltersWorkers.js - Everything went just fine');
                }
                callCallback(err);
            });
        });
    }
}

module.exports = updateFiltersMembers;
