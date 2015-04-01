/*

    Tem por objetivo pegar as categorias desejadas e colocadas aqui e pegar
    todas as informações delas referentes a parte de filtros e detalhes (fornecedores,
    pesos, etc)

*/
var Buscape = require('../utils/BuscapeAPI'),
    categoriesData = require('../data/CategoriesData'),
    filtersData = require('../data/FiltersData'),
    logsData = require('../data/LogsData'),
    async = require('async'),
    lodash = {
        arrays: {
            flatten: require('lodash-node/modern/arrays/flatten'),
            uniq: require('lodash-node/modern/arrays/uniq'),
            union: require('lodash-node/modern/arrays/union')
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
    Done = require('../utils/DoneState'),
    buscape,
    categoriesListId,
    suplementDataNameList,
    remedyDataNameList,
    filtersDataNameList,
    doneStateManager,
    debug = function (msg) { console.log(msg); };

categoriesListId = [
    4029   // buscape suplement id
    // 9575    // buscape remedy id
];

buscape = new Buscape();

// TODO find an use for this
suplementDataNameList = [
    'category',
    'supplier',
    'package',
    'weight',
    'shape',
    'volume'
];

// TODO find an use for this
remedyDataNameList = [
    'category',
    'quantity',
    'farmaceuticalForm',
    'holder',
    'reference',
    'medicine',
    'presentation'
];

filtersDataNameList = lodash.arrays.union(suplementDataNameList, remedyDataNameList);

// ** WARNING ** ATENÇÃO **
// setting a global doneStateManager for all taxonomies, this can cause some sistemic
// errors, but for now it is working (maybe one taxonomy failed while another didn't)
// but the doneStateManager will trigger an NOT DONE response for all
doneStateManager = new Done();

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
            queueTaxonomies,
            taxonomie;

        queueTaxonomies = async.queue(findCategoryList, 1);

        // iterate over each category of products (suplementos, etc)
        lodash.collections.forEach(categoriesListId, function (taxonomyId) {
            queueTaxonomies.push(taxonomyId, function (err) {
                if (err) {
                    // there is an error
                    debug('Some error ocurred');
                } else {
                    // everything went ok
                    debug('No error ocurred');
                }
            });
        });

        // assign a callback when all queues are done (all taxonomies were scrapped)
        queueTaxonomies.drain = function() {
            debug('drain done');
            var finalDoneState = doneStateManager.getDoneState();

            if (finalDoneState instanceof Error) {
                callCallback(true); // there is an error, callback
            } else if (finalDoneState) {
                // we set all as true, so everything went fine, just callback
                callCallback(false); // no error
            }

            callCallback(false);
        };

        function findCategoryList(taxonomyId, findCategoryListCallback) {

            // TODO maybe this is the correct way of doing this, for now it works because doneState
            // will make sure that all the taxonomies searched for will be ready
            // var doneStateManager = new Done();

            buscape.findCategoryList({categoryId:taxonomyId}, function (res) {

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

                        // all possible name translations
                        stringReplace = {
                            'nome': 'name',
                            'marca': 'supplier',
                            'embalagem': 'package',
                            'peso': 'weight',
                            'forma': 'shape',
                            'volume': 'volume',
                            'concentracao': 'concentration',
                            'quantidade': 'quantity',
                            'formaFarmaceutica': 'pharmaceuticalForm',
                            'detentor': 'holder',
                            'referencia': 'reference',
                            'medicamento': 'medicine',
                            'apresentacao': 'presentation'
                        };

                        categoryFilters = {};
                        taxonomies = {};

                        if (data.filters) {

                            filtersList = lodash.collections.pluck(data.filters, 'filter');

                            // loop por todos os filtros obtidos da categoria e separar eles
                            // para serem salvos como uma referência ao estilo firebase { $something : true }
                            lodash.collections.forEach(filtersList, function (filter) {

                                // the filterName is the equivalent of table name in the firebase database
                                filterName = lodash.string.camelize(lodash.string.slugify(filter.name), true);
                                if (stringReplace[filterName]) {

                                    // iterate over the replacement data and replace it accordingly
                                    lodash.objects.forOwn(stringReplace, function (value, key) {
                                        // key are the original value we are going to replace
                                        // from the stringReplace object and
                                        // value are the current wanted value to replace
                                        var pattern = new RegExp(key + '\\b');  // create regex because we want to change whole words only
                                        filterName = filterName.replace(pattern, value);
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

                            // Try to save the categories to the database
                            doneStateManager.startDoneState('category');
                            if (categoriesData.create(categories)) {
                                categoriesData.db.saveAll(function (err) {
                                    if (err) {
                                        doneStateManager.finishDoneState('category', new Error(err));
                                    } else {
                                        doneStateManager.finishDoneState('category', true);
                                    }
                                });
                            } else {
                                doneStateManager.finishDoneState('category', false);
                            }

                            // save the filter list with current gathered data
                            filtersDataNameList.forEach( function (filterName) {
                                // check if the filterName exists on taxonomy
                                if (taxonomies[filterName]) {
                                    doneStateManager.startDoneState(filterName);
                                    // if exists let's try to create the filterData and save it to the database
                                    var tempFilter = filtersData.create(filterName, taxonomies[filterName]);
                                    if (tempFilter.collection.length) {
                                        tempFilter.saveAll(function (err) {
                                            if (err) {
                                                doneStateManager.finishDoneState(filterName, new Error(err));
                                            } else {
                                                doneStateManager.finishDoneState(filterName, true);
                                            }
                                        });
                                    } else {
                                        doneStateManager.finishDoneState(filterName, false);
                                    }
                                }
                            });

                            // all done, call callback with the current doneState
                            findCategoryListCallback(doneStateManager.getDoneState());

                        } else {
                            logsData.save('TaxonomyWorker', 'No filters found today, maybe some problem with the BuscapeAPI', function (err) {
                                findCategoryListCallback(true);
                            });
                        }
                    } else {
                        logsData.save('TaxonomyWorker', 'Some error while trying to fetch data from Buscape.findCategoryList', function (err) {
                            findCategoryListCallback(true); // error
                        });
                    }
                } else {
                    // some problems with the API call on buscape
                    logsData.save('TaxonomyWorker', 'Problems with BuscapeAPI request on updateCategories', function (err) {
                        findCategoryListCallback(true); // error
                    });
                }
            });
        }
    }
}

module.exports = updateCategories;
