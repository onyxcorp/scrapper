module.exports = {

    // waterline will have problems if we try to use a camelCase or PascalCase, should be sneak_case
    identity: 'store_config',

    connection: 'localhost',

    attributes: {

        robots: 'string',

        sitemap: 'string',

        // scrapper configuration, contains the html markupt that the scrapper
        // will use to fetch information
        scrapper: {
            name: 'string',
            link: 'string',
            image: 'string',
            description: 'string',
            price: 'string',
            externalId: 'string'
        },

        // Add a referente to store (has-One)
        store: {
            model: 'store'
        }
    }
};
