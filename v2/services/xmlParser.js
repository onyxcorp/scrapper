var Promise = require('bluebird'),
    xml2jsP = Promise.promisifyAll(require('xml2js')),
    request = require('request-promise');

// GET THE XML AND PARSE IT
function xmlParser(sitemapLink) {

    return request(sitemapLink)
    .then( function(htmlString) {

        return xml2jsP.parseStringAsync(htmlString)
        .then( function (result) {
            console.log('Done');
            console.log(result);
            return result;
        })
        .catch( function (err) {
            console.log('parser.parseString error');
            console.log(err);
            return err;
        });

    })
    .catch(function (err) {
        console.log('catch err on request for xmlParser');
    });
}

// IF THE OBTAINED LINK IS A VALID PRODUCT URL, USE THE scrapper

// IF THE OBTAINED LINK IS ANOTHER XML LINK, USE RECURSION INSIDE IT

module.exports = xmlParser;
