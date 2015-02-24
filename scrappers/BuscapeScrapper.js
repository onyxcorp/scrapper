
var lodash = {
        objects: {
            merge: require('lodash-node/modern/objects/merge'),
            forOwn: require('lodash-node/modern/objects/forOwn')
        },
        string: require('underscore.string')
    },
    debug = function (message) { console.log(message); };

function BuscapeScrapper(error, result, $) {

    var detalhes,
        stringReplace,
        list,
        data,
        i;

    detalhes = [];
    list = {};
    data = $('section.product-details').find('li').children('span');

    stringReplace = {
        'apresentacao': 'presentation',
        'concentracao': 'concentration',
        'substancia-ativa': 'medicine',
        'nome': 'name',
        'quantidade': 'quantity',
        'marca' : 'supplier',
        'embalagem' : 'package',
        'forma': 'shape',
        'volume': 'volume',
        'peso' : 'weight'
    };

    if (data.length) {
       // cheerio built in each loop function
        data.each( function (index, element) {
            var text;
            // remove all extra white spaces and slugify the result
            text = lodash.string.slugify(lodash.string.clean($(this).text()));
            // iterate over the replacement data and replace it accordingly
            lodash.objects.forOwn(stringReplace, function (value, key) {
                // key are the original value we are going to replace
                // value are the current wanted value to replace
                text = text.replace(key, value);
            });
            detalhes.push(text);
        });

        // loop throught all the found product details
        for (i = 0; i < detalhes.length; i += 2) {
            var productInfoData,
                key,
                value;

            key = detalhes[i];      // all even array indexes (0,2,4,...)
            value = detalhes[i+1];  // all odd array indexes (1,3,5,...)

            // if the current key exists as a required (and wanted) data
            productInfoData = {};
            productInfoData[key] = value ? value : '';
            lodash.objects.merge(list, productInfoData);
        }
    }

    return list;
}

module.exports = BuscapeScrapper;
