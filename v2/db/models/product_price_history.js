module.exports = {

    // waterline will have problems if we try to use a camelCase or PascalCase, should be sneak_case
    identity: 'product_price_history',

    connection: 'localhost',

    attributes: {

        day: 'date',

        // Add a reference to product (has-One)
        owner: {
            model: 'product'
        }
    }

};
