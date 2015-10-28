var Promise = require('bluebird'),
    cheerio = require('cheerio'),
    // Crawler = require('crawler'),
    // url = require('url'),
    // validUrl = require('valid-url'),
    userAgentSpinner = require('../utils/userAgentSpinner'),
    request = require('request-promise');
    // sizeOf = require('image-size'),
    // crawler = new Crawler({
    //     maxConnections: 40
    // });

// EXTRACT INFORMATION FROM THE CURRENT PAGE

var parser = Promise.method( function ($, storeScrapper) {
    console.log('running crawler');
    console.log($('h1[itemprop="name"]').text());

    // TODO when fetching for image, use the google bot image
    // #ref http://www.useragentstring.com/Googlebot-Image1.0_id_1078.php
    // Googlebot-Image/1.0
});

var scrapper = Promise.method( function (stores) {

    console.log('services.scrapper');
    // loop through the stores
    // return Promise.map(stores, function (store) {

        // loop through the products
        // return Promise.map(store.products, function (product) {

        var product = 'http://www.corpoidealsuplementos.com.br/l-g-glutamina-300g-max-titanium-388-p37233';

            // request the product page link
            return request({
                uri: product,
                headers: {
                    'User-Agent': userAgentSpinner()
                },
                transform: function (body) {
                    return cheerio.load(body);
                }
            })
            .then(function ($) {

                console.log('request concluded');

                // crawl the html as jquery
                return parser($, stores[0].storescrapper);

            })
            .catch( function (err) {

                console.log('request error');
                console.log(err);
                // Crawling failed or Cheerio choked...

            });

        // }, { concurrency: 2 });    // max 2 requests each time

    // });

});

// function scrapper(stores) {
//
//     console.log('services.scrapper');
//     console.log(stores);

    // this variables should be in sync with the store_config.js data
    // var name,
    //     link,
    //     image,
    //     description,
    //     price,
    //     externalId;
    //
    // if (!validUrl.isUri(url)) {
    //     console.error('Invalid uri');
    //     return;
    // }
    //
    // crawler.queue([{
    //     uri: url,       // the product page link
    //     userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',  // TODO add a spinning user agent
    //     callback: function (error, result, $) {
    //
    //         if (error || !result) {
    //
    //             console.error('scrapper', 'Invalid URL provided for scrapping for product');
    //             callback(null);
    //
    //         } else {
    //
    //             // IF THE FIELD IS NULL, SKIP THE ATTRIBUTE
    //             name = $(config.name).text();
    //             link = url;
    //             image = $(config.image).attribute('src');
    //             description = $(config.description).text();
    //             price = $(config.price).text();
    //             externalId = $(config.externalId).text();
    //
    //             // ELSE IF THE FIELD IS NOT NULL BUT WASN'T FOUND, SKIP PAGE (probabily we are not dealing with a product page)
    //
    //
    //             // IMAGE SHOULD BE DOWNLOADED, SO WE NEED TO WAIT IT BEFORE RETURNING THE PRODUCT
    //             if (image) {
    //
    //                 // http is something default from node
    //                 http.get(url.parse(image), function (response) {
    //
    //                     var imageChunksData = [];
    //
    //                     response
    //                     .on('data', function (imageChunk) {
    //                         imageChunksData.push(imageChunk);
    //                     })
    //                     .on('end', function () {
    //                         // Buffer is something default from node
    //                         productImageData = sizeOf(Buffer.concat(imageChunksData));
    //                         callback(name, link, image, description, price, externalId);
    //                     });
    //                 });
    //
    //             } else {
    //                 callback(name, link, image, description, price, externalId);
    //             }
    //         }
    //     }
    // }]);
// }

module.exports = scrapper;
