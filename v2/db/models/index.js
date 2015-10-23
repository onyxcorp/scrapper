var Waterline = require('waterline');

module.exports = {
    log: Waterline.Collection.extend(require('./log.js')),
    product: Waterline.Collection.extend(require('./product.js')),
    productPriceHistory: Waterline.Collection.extend(require('./productPriceHistory.js')),
    store: Waterline.Collection.extend(require('./store.js')),
    storeScrapper: Waterline.Collection.extend(require('./storeScrapper.js')),
    tag: Waterline.Collection.extend(require('./tag.js'))
};
