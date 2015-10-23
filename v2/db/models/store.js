module.exports = {

    identity: 'store',

    connection: 'localhost',

    attributes: {

        name: {
            type: 'string',
            unique: true
        },

        slug: {
            type: 'string',
            unique: true
        },

        robots: {
            type: 'string',
            unique: true
        },

        sitemap: {
            type: 'string',
            unique: true
        },

        link: {
            type: 'string',
            unique: true
        },

        // Add a reference to storescrapperdata (one-to-one)
        storescrapper: {
            model: 'storescrapper'
        },

        // Add a reference to products (has-Many)
        products: {
            collection: 'product',
            via: 'owner'
        }
    }
};
