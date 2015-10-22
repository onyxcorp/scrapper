var Xml2js = require('xml2js'),
    parser = new Xml2js.Parser({
        normalize: true,
        trim: true
    });

// GET THE XML AND PARSE IT
function xmlParser(link, callback) {

    http.get(link, function (response) {

        parser.parseString(response, function (err, result) {
            console.dir(result);
            console.log('Done');
            callback(JSON.stringify(response));
        });

    });

}

// IF THE OBTAINED LINK IS A VALID PRODUCT URL, USE THE scrapper

// IF THE OBTAINED LINK IS ANOTHER XML LINK, USE RECURSION INSIDE IT

module.exports = xmlParser;
