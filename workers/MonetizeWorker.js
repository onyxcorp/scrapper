/*
    
    Este arquivo tem por objetivo pegar todos os arquivos espalhados pelo banco de dados
    e conectar eles como sendo membros entre si, no caso as taxonomias que pertencem
    aos produtos, categorias e produtos entre si, etc.
    
*/

var async = require('async'),
    Buscape = require('../utils/BuscapeAPI'),
    productsData = require('../data/ProductsData'),
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
    buscape,
    debug = function (message) { console.log(message); };

buscape = new Buscape();

function updateFiltersMembers(updateCallback) { 
    
    logsData.save('Monetize', 'Update Monetize Started', function (err) {
        run();
    });
    
    function callCallback(err) {
        // everything finished, if there is a callback, apply it
        if (updateCallback && lodash.objects.isFunction(updateCallback)) {
            var message;
            
            if (err) {
                message = 'Update Monetize Finished - Errors';
            } else {
                message = 'Update Monetize Finished - Success';
            }
            
            logsData.save('MonetizeWorker', message, function () {
                updateCallback(err);
            });
        }   
    }
    
    
    function run() {
        // GET ALL PRODUCTS
        productsData.db.getAll(function (products) { 
            
            function update() {}
            
            // order the async call and the requests order
            async.parallel([
                update
            ], function (err) {
                if(err) {
                    debug('MonetizeWorker.js - An error ocurred while trying to create a model');
                } else {
                    debug('MonetizeWorker.js - Everything went just fine');
                }
                callCallback(err);
            });
        });
    }
}

module.exports = updateFiltersMembers;