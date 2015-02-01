var request = require('superagent'),
    logsData = require('../data/LogsData'),
    lodash = {
        forEach: require('lodash-node/modern/collections/forEach'),
        isArray: require('lodash-node/modern/objects/isArray'),
        findIndex: require('lodash-node/modern/arrays/findIndex'),
        assign: require('lodash-node/modern/objects/assign'),
        template : require('lodash-node/modern//utilities/template')
    },
    debug = function (message) { console.log(message); };

function Buscape(options) {

    options = options || {};

    this._service = options.service || 'sandbox.buscape.com';
    this._appId = options.appId || '4631536f65313778564c6f3d';    // the app created in the Web Dev
    this._sourceId = options.sourceId || '22500922';            // the lomadee publisher Id
}


Buscape.prototype._request = function (type, method, query, cb) {
    request
        .get(this._requestUrl(type, method))
        .timeout('15000')
        .query(query)
        .set('Accept', 'application/json')
        .end(function (err, res) {
            if (err) {
                // sometimes the buscape api will become unresponsive, so we must
                // throw an error and sent it correctly to the callback
                if (err.timeout) {
                    cb(new Error('Timeout error'));
                } else {
                    cb(new Error('Generic error'));
                }
            } else {
                cb(res);
            }
        });
};

Buscape.prototype._requestUrl = function (type, method) {
    var data,
        lomadeeEndpoint,
        buscapeEndpoint;

    data = {
        service: this._service,
        method: method ? method : 'findCategoryList',
        id: this._appId,
        country: 'BR'
    };

    lomadeeEndpoint = lodash.template('http://<%=service%>/service/<%=method%>/lomadee/<%=id%>/<%=country%>/');
    buscapeEndpoint = lodash.template('http://<%=service%>/service/<%=method%>/<%=id%>/<%=country%>/');

    if (type === 'buscape') {
        return buscapeEndpoint(data);
    } else {
        return lomadeeEndpoint(data);
    }
};

Buscape.prototype._makeRequestQuery = function (parameters, options) {
    var invalid;
    invalid = false;

    options = options || {};

    lodash.forEach(options, function (value, key) {
        // see if the key existis in the parameters
        if (!lodash.findIndex(parameters, key)) {
            invalid = key;
        }
    });

    if (!invalid) {
        return lodash.assign({}, options, { sourceId: this._sourceId, format: 'json' });
    } else {
        return false;
    }
};

// findCategoryList - retorna informações referentes as categorias
Buscape.prototype.findCategoryList = function (options, callback) {

    var acceptedParameters,
        query;

    options = options || {};

    acceptedParameters = [
        'categoryId', 'keyword'
    ];

    query = this._makeRequestQuery(acceptedParameters, options);

    if (query) {
        this._request('buscape', 'findCategoryList', query, callback);
    } else {
        logsData.save('BuscapeAPI', 'Query com atributos invalidos para findCategoryList', function (err) {
            callback(null);
        });
    }

    // Example
    // http://sandbox.buscape.com/service/findCategoryList/lomadee/564771466d477a4458664d3d/?categoryId=77
    // http://sandbox.buscape.com/service/findCategoryList/lomadee/564771466d477a4458664d3d/?keyword=Smartphone
    // Category 0
    // http://sandbox.buscape.com/service/findCategoryList/lomadee/564771466d477a4458664d3d/?categoryId=0

};

// Retorna lista de produtos por keyword, categoria ou ambas
// para informações de ofertas dos produtos é necessário pesquisar com outros métodos
Buscape.prototype.findProductList = function (options, callback) {

    var acceptedParameters,
        acceptedFilters,
        acceptedAttributes,
        query;

    options = options || {};

    acceptedParameters = [
        'categoryId',
        'keyword'
    ];

    acceptedFilters = [
        'results',  // Int	Number of results per page
        'page',     // Int	Number of page
        'priceMin', // Float	Minimum Price
        'priceMax', // Float	Maximum Price
        'sort',     // String	Ordination - accepts price/dprice || rate/drate
        'specId'    //  Order by filter
    ];

    acceptedAttributes = acceptedParameters.concat(acceptedFilters);
    query = this._makeRequestQuery(acceptedAttributes, options);
    if (query) {
        this._request('buscape', 'findProductList', query, callback);
    } else {
        logsData.save('BuscapeAPI', 'Query com atributos invalidos para findProductList', function (err) {
            callback(null);
        });
    }

    // Example (keyword and id can be merged)
    // http://sandbox.buscape.com/service/findProductList/lomadee/564771466d477a4458664d3d/?categoryId=77
    // http://sandbox.buscape.com/service/findProductList/lomadee/564771466d477a4458664d3d/?keyword=Smartphone

};

// findOfferList - retorna uma lista de ofertas (produtos) de diferentes retailers (por categoria, produto, barcode, keyword ou ambos)
Buscape.prototype.findOfferList = function (options, callback) {

    var acceptedParameters,
        acceptedFilters,
        acceptedAttributes,
        query;

    options = options || {};

    acceptedParameters = [
        'categoryId',
        'productId',
        'barcode',
        'keyword',
        'latitude',
        'longitude',
        'radius'
    ];

    acceptedFilters = [
        'results',      // Int	Number of results
        'page',         // Int	Number of page
        'priceMin',     // Float	Minimum Price
        'priceMax',     // Float	Maximum Price
        'sort',         // String	Ordination
        'price/dprice', // Sorting by price - accepts rate/drate || seller/dseller
        'medal' // accept all - diamond - gold - silver - bronze
    ];

    acceptedAttributes = acceptedParameters.concat(acceptedFilters);

    query = this._makeRequestQuery(acceptedAttributes, options);

    if (query) {
        this._request('buscape', 'findOfferList', query, callback);
    } else {
        logsData.save('BuscapeAPI', 'Query com atributos invalidos para findOfferList', function (err) {
            callback(null);
        });
    }

    // Example (keyword and id can be merged)
    // http://sandbox.buscape.com/service/findOfferList/lomadee/564771466d477a4458664d3d/?categoryId=77
    // http://sandbox.buscape.com/service/findOfferList/lomadee/564771466d477a4458664d3d/?productId=490433
    // http://sandbox.buscape.com/service/findOfferList/lomadee/564771466d477a4458664d3d/?keyword=Smartphone
};

// createLinks - Receive product links or shops and transforms into a Lomadeezado link
Buscape.prototype.createLinks = function (options, callback) {

    var acceptedParameters,
        query;

    options = options || {};

    // the url to be lomadeezada where X is the number according to the amount of url's
    // the first url would be link1=http://www.livrariasaraiva.com.br
    acceptedParameters = [
        'linkX'
    ];

    query = this._makeRequestQuery(acceptedParameters, options);

    if (query) {
        this._request('lomadee', 'createLinks', query, callback);
    } else {
        logsData.save('BuscapeAPI', 'Query com atributos invalidos para createLinks', function (err) {
            callback(null);
        });
    }
};

// Retorna as avaliações dos usuários baseados no ID do produto
// TEM UM LIMITE BEM BAIXO DE REQUISIÇÕES POR MINUTO/SEGUNDO whatever
// Preferencia utilizar este
// TODO implementar
Buscape.prototype.viewUserRatings = function (options) {

};

// Retorna detalhes técnicos do produto
// PODE SER QUE SOFRA DA MESMA QUESTÃO DO USER RATINGS (limitações)
// TODO implementar
Buscape.prototype.viewProductDetails = function (options) {

};

// Retorna as informações de um determinado vendedor
// TODO implementação FUTURA
Buscape.prototype.viewSellerDetails = function (options, callback) {
    // do nothing
    var acceptedParameters,
        query;

    options = options || {};

    acceptedParameters = [
        'sellerId'
    ];

    query = this._makeRequestQuery(acceptedParameters, options);

    if (query) {
        this._request('buscape', 'viewSellerDetails', query, callback);
    } else {
        logsData.save('BuscapeAPI', 'Query com atributos invalidos para viewSellerDetails', function (err) {
            callback(null);
        });
    }
};

    // Alguns produtos podem ser aglutinados com um pouco de matemática/
    // Exemplo a aveia que varia bastante os valores e produtos mas é possível
    // descobrir qual o mais barato fazendo uma divisão da gramatura colocada / 100 g,
    // estabelecendo um preço médio

module.exports = Buscape;
