var Promise = require('bluebird'),
    objectAssign = require('object-assign'),
    xml2jsP = Promise.promisifyAll(require('xml2js')),
    validUrl = require('valid-url'),
    request = require('request-promise');

var requestSitemap = Promise.method( function (sitemapLink) {

    // request a sitemap link
    return request(sitemapLink)

    // will receive an htmlString from the request and parse it as a json
    .then( function (htmlString) {

        return xml2jsP.parseStringAsync(htmlString)
        .then( function (result) {
            // if its a valid XML, let's get all it's links
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

            return links;
        })
        .catch( function (err) {

            // invalid xml
            throw new TypeError('Invalid XML');

        });
    })

    .catch( function (err) {
        console.log('An error ocurred while processing the Link or XML on requestSitemap');
        throw err;
    });

});

var recursiveXml = Promise.method( function (link, links) {

    // test the first link
    return requestSitemap(link)
    .then(function (newLinks) {

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
                // the errors might be caused by network problems, irresponsive site, etc
                console.log('inner catch - try again');
                console.log(link);

            });

        }, { concurrency: 10 });    // max 2 requests each time

    })
    .catch(function (err) {
        // this will run in the first execution only if the base sitemap
        // from the store is already the links of the products

        // TODO
        // We also need to make sure that this catch entered due to an invalid
        // XML and not necessarily due to Network problems
        return links;
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
                        products: links
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
