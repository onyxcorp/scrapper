module.exports = {

    // waterline will have problems if we try to use a camelCase or PascalCase, should be sneak_case or all strtolower
    identity: 'storescrapper',

    tableName: 'store_scrapper',

    connection: 'localhost',

    attributes: {

        name: 'string',

        link: 'string',

        image: 'string',

        description: 'string',

        price: 'string',

        externalId: 'string',

        // Add a referente to store (has-One)
        store: {
            model: 'store'
        }
    }
};
