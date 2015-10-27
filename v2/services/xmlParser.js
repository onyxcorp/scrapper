var Promise = require('bluebird'),
    objectAssign = require('object-assign'),
    xml2jsP = Promise.promisifyAll(require('xml2js')),
    validUrl = require('valid-url'),
    request = require('request-promise'),
    lodash = require('lodash'),
    types = require('../utils/types.js');

var parser = Promise.method( function (htmlString) {

    return xml2jsP.parseStringAsync(htmlString)
    .then( function (result) {

        // Valid XML, let's get all it's links
        var links = [],
            flattenedResult = JSON.flatten(result);

        Object.keys(flattenedResult).forEach(function (key) {
            if (
                validUrl.isUri(flattenedResult[key]) &&
                !flattenedResult[key].toLowerCase().containsOr(
                    'www.sitemaps.org',     // those are commonly found in all sitemaps
                    'www.w3.org',           // and they are references to where the xml format is based on
                    'www.google.com/schemas/',
                    '.jpg',  // we also dont want any images
                    '.png',
                    '.jpeg',
                    'www.youtube.com',
                    'www.vimeo.com'
                )
            ) {
                links.push(flattenedResult[key]);
            }
        });

        // Valid links that may point to new xml or products
        return links;
    })
    .catch( function (err) {

        // invalid xml, maybe a product page already?
        return new TypeError('Not a valid xml');

    });

});

var requestSitemap = Promise.method( function (sitemapLink) {

    // request a sitemap link
    return request(sitemapLink)

    // will receive an htmlString from the request and parse it as a json
    .then(parser)

    // this catch will be exclusive to handle errors from the request module
    // this is suposed to catch network problems or stuffs like that
    .catch( function (err) {
        console.log('An error ocurred while processing the Link on requestSitemap');
        throw err;
    });

});

var recursiveXml = Promise.method( function (link, links) {

    // test the first link
    return requestSitemap(link)
    .then(function (newLinks) {

        if (!types.isError(newLinks)) {

            // so we have a xml again, we need to run a loop on the links list
            // and try to fetch their data
            return Promise.map(links, function (link) {

                // We have to run the same external logic inside the loop (the test one)
                // because that is the part respnsible for fetching the data
                return requestSitemap(link)
                .then(function (newLinks) {

                    return recursiveXml(newLinks[0], newLinks);

                })
                .catch(function (err) {

                    // if the request fails it will be caught here
                    // the thing is, the only elements caugh here will be the ones
                    // that suposedly belonged to a valid XML list, so we should
                    // retry feching their data here

                    return requestSitemap(link)
                    .then(function (newLinks) {

                        return recursiveXml(newLinks[0], newLinks);

                    })
                    .catch( function (err) {

                        // the request failed again, we should just give up
                        // on trying to get the links from this one...
                        // return an emnpty string (it can be filtered out later)
                        return '';
                    });

                });

            }, { concurrency: 5 });    // max 5 requests each time

        } else {

            // error's means we should return the links, they are all product pages (hope so)
            return links;

        }

    })
    .catch(function (err) {
        // if we got here that might mean network problems
        console.log('recursiveXml - an error ocurred');
        throw err;
    });

});


// GET THE XML AND PARSE IT
var xmlParser = Promise.method( function(stores) {

    console.log('services.xmlParser');

    // Loop through all stores
    return Promise.map(stores, function (store) {

        // get the initial store sitemap
        return requestSitemap(store.sitemap)
        .then(function (firstLinks) {

            // test the links from the base sitemap to see if they are
            // xml links or products links
            return recursiveXml(firstLinks[0], firstLinks)
            .then(function (links) {

                // this .then should run only once per store
                console.log('done');

                return objectAssign(
                    {},
                    {
                        name: store.name,
                        slug: store.slug,
                        storescrapper: store.storescrapper,
                        products: lodash.flatten(lodash.without(links, ''))
                    }
                );
            });

        })
        .catch(function (err) {
            console.log('some error on the store sitemap');
            throw err;
        });

    });

});

module.exports = xmlParser;
