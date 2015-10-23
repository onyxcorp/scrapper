module.exports = {

    identity: 'product',

    connection: 'localhost',

    attributes: {

        name: 'string',

        link: {
            type: 'string',
            unique: true
        },

        image: 'string',    // TODO maybe create as array?

        description: 'string',

        price: 'float',

        // unique identifier that can be located at the external source, could be an ID, permalink, etc
        // this is not a unique in database constraint because it's identification can be shared
        // between other stores
        externalId: 'string',

        // Add a reference to productpricehistory (has-Many)
        productpricehistory: {
            collection: 'productpricehistory',
            via: 'owner'
        },

        // Add a reference to tag (Many-to-Many)
        owners: {
            collection: 'tag',
            via: 'products'
        },

        // Add a reference to store (has-one)
        owner: {
            collection: 'store',
            via: 'products'
        }
    }
};
