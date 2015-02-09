/*

    Tem por objetivo pegar as categorias desejadas e colocadas aqui e pegar
    todas as informações delas referentes a parte de filtros e detalhes (fornecedores,
    pesos, etc)

*/
var Buscape = require('../utils/BuscapeAPI'),
    categoriesData = require('../data/CategoriesData'),
    filtersData = require('../data/FiltersData'),
    logsData = require('../data/LogsData'),
    lodash = {
        arrays: {
            flatten: require('lodash-node/modern/arrays/flatten'),
            uniq: require('lodash-node/modern/arrays/uniq')
        },
        objects: {
            isFunction: require('lodash-node/modern/objects/isFunction'),
            keys: require('lodash-node/modern/objects/keys'),
            findKey: require('lodash-node/modern/objects/findKey'),
            forOwn: require('lodash-node/modern/objects/forOwn')
        },
        string: require('underscore.string'),
        collections: {
            pluck: require('lodash-node/modern/collections/pluck'),
            forEach: require('lodash-node/modern/collections/forEach'),
            map: require('lodash-node/modern/collections/map')
        }
    },
    buscape,
    debug = function (msg) { console.log(msg); };

buscape = new Buscape();

function updateCategories(updateCallback) {
    logsData.save('TaxonomyWorker', 'Update Taxonomies Started', function (err) {
        run();
    });

    function callCallback(err) {
        // everything finished, if there is a callback, apply it
        if (updateCallback && lodash.objects.isFunction(updateCallback)) {
            var message;

            if (err) {
                message = 'Update Taxonomies Finished - Errors';
                debug(err);
            } else {
                message = 'Update Taxonomies Finished - Success';
            }

            logsData.save('TaxonomyWorker', message, function (err) {
                updateCallback(err);
            });
        }
    }

    function run() {

        var categories,
            taxonomie,
            done;

        done = {};

        buscape.findCategoryList({categoryId:4029}, function (res) {

            var filtersDataNameList = [
                'supplier', 'package', 'weight', 'shape', 'volume'
            ];

            function next(model, status) {
                done[model] = status;
                // if all keys are found
                if (done.hasOwnProperty('category') &&
                    done.hasOwnProperty('package') &&
                    done.hasOwnProperty('shape') &&
                    done.hasOwnProperty('supplier') &&
                    done.hasOwnProperty('volume') &&
                    done.hasOwnProperty('weight')
                ) {
                    // check if there is an error in any of the keys
                    if (done.category || done.package || done.shape || done.supplier ||
                        done.volume || done.weight) {
                        callCallback(true); // there is error
                    } else {
                        callCallback(false); // no error
                    }
                }
            }

            if (res instanceof Error) {
                logsData.save('TaxonomyWorker', 'findCategoryList error: ' + res.message, function (err) {
                    callCallback(true); // error
                });
            } else if (res) {
                var data,
                    filterName,
                    filterValues,
                    stringReplace,
                    categoryFilters,
                    filtersList;

                data = res.body.category;

                if (data) {

                    stringReplace = {
                        'marca': 'supplier',
                        'embalagem': 'package',
                        'peso': 'weight',
                        'forma': 'shape',
                        'volume': 'volume'
                    };

                    categoryFilters = {};
                    taxonomies = {};

                    if (data.filters) {

                        filtersList = lodash.collections.pluck(data.filters, 'filter');

                        // loop por todos os filtros obtidos da categoria e separar eles
                        // para serem salvos como uma referência ao estilo firebase { $something : true }
                        lodash.collections.forEach(filtersList, function (filter) {

                            // the filterName is the equivalent of table name in the firebase database
                            filterName = lodash.string.slugify(filter.name);

                            if (stringReplace[filterName]) {

                                // iterate over the replacement data and replace it accordingly
                                lodash.objects.forOwn(stringReplace, function (value, key) {
                                    // key are the original value we are going to replace
                                    // from the stringReplace object and
                                    // value are the current wanted value to replace
                                    filterName = filterName.replace(key, value);
                                });

                                /// get the filter name and set it in the cateogry filters
                                categoryFilters[filterName] = {};
                                taxonomies[filterName] = [];

                                filterValues = lodash.collections.pluck(filter.value, 'value');

                                // loop entre todos os valores do filtro e gerar os indexes da tabela

                                lodash.collections.forEach(filterValues, function (value, key) {

                                    var valueKey;

                                    // o key será a versão slugified do nome no value
                                    valueKey = lodash.string.slugify(value.value);

                                    // setar como true apenas
                                    categoryFilters[filterName][valueKey] = true;
                                    taxonomies[filterName].push({
                                        id_buscape: value.id,
                                        name: value.value,
                                        slug: valueKey
                                    });
                                });
                            } else {
                                // console.log('TaxonomyWorker.js - Skipping key ' + filter.name);
                                // do nothing for now
                            }
                        });

                        // retornar todas as informações da categoria para a próxima função
                        categories = {
                            id_buscape: data.id,
                            id_parent: data.parentcategoryid,
                            thumbnail: data.thumbnail.url,
                            name: data.name,
                            slug: lodash.string.slugify(data.name),
                            filters: categoryFilters
                        };

                        // Save the categories to the database
                        if (categoriesData.create(categories)) {
                            categoriesData.db.saveAll(function (err) {
                                next('category', err || false);
                            });
                        } else {
                            next('category', true);
                        }

                        // save the filter list with current gathered data
                        filtersDataNameList.forEach( function (filterName) {
                            var tempFilter = filtersData.create(filterName, taxonomies[filterName]);
                            if (tempFilter.collection.length) {
                                tempFilter.saveAll(function (err) {
                                    next(filterName, err || false);
                                });
                            } else {
                                next(filterName, true);
                            }
                        });


                    } else {
                        logsData.save('TaxonomyWorker', 'No filters found today, maybe some problem with the BuscapeAPI', function (err) {
                            callCallback(true);
                        });
                    }
                } else {
                    logsData.save('TaxonomyWorker', 'Some error while trying to fetch data from Buscape.findCategoryList', function (err) {
                        callCallback(true); // error
                    });
                }
            } else {
                // some problems with the API call on buscape
                logsData.save('TaxonomyWorker', 'Problems with BuscapeAPI request on updateCategories', function (err) {
                    callCallback(true); // error
                });
            }
        });
    }
}

module.exports = updateCategories;
