module.exports = {

    identity: 'store',

    connection: 'localhost',

    attributes: {

        name: {
            type: 'string',
            unique: true
        },

        link: {
            type: 'string',
            unique: true
        },

        // Add a reference to storeConfig (one-to-one)
        store_config: {
            model: 'store_config'
        },

        // Add a reference to products (has-Many)
        products: {
            collection: 'product',
            via: 'owner'
        }
    }
};
