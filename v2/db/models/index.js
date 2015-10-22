var Waterline = require('waterline');

module.exports = {
    product: Waterline.Collection.extend(require('./product.js')),
    productPriceHistory: Waterline.Collection.extend(require('./product_price_history.js')),
    store: Waterline.Collection.extend(require('./store.js')),
    storeConfig: Waterline.Collection.extend(require('./store_config.js')),
    tag: Waterline.Collection.extend(require('./tag.js'))
};
