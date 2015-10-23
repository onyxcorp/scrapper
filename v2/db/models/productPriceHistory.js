module.exports = {

    // waterline will have problems if we try to use a camelCase or PascalCase, should be sneak_case or all strtolower
    identity: 'productpricehistory',

    tableName: 'product_price_history',

    connection: 'localhost',

    attributes: {

        day: 'date',

        // Add a reference to product (has-One)
        owner: {
            model: 'product'
        }
    }

};
