module.exports = {

    identity: 'tag',

    connection: 'localhost',

    attributes: {

        name: 'string',

        slug: 'string',

        // Add a reference to products (Many-to-Many)
        products: {
            collection: 'product',
            via: 'owners',
            dominant: true
        }
    }

};
