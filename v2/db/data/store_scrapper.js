module.exports = {
    'corpo-ideal-suplementos': {
        "category": ".wd-browsing-breadcrumbs > ul > li > span[itemprop='title']",
        "supplier": ".more-brand > span[itemprop='name']",
        "name": ".content > h1[itemprop='name']",
        "image": null,
        "description": ".wd-descriptions-text",
        "price": ".instant-price",
        "externalId": "span[itemprop='productID']"
    },
    'megaforma-suplementos': {
        "category": ".breadcrumbs > li > a:second",
        "supplier": ".product-description-l > a",
        "name": "#content > h1",
        "image": ".cloud-zoom > img",
        "description": "#tab-description",
        "price": ".price",
        "externalId": "input[name='id_produto']"
    },
    'madrugao-suplementos': {
        "category": null,
        "supplier": ".brand > a",
        "name": ".product-name > h1",
        "image": ".MagicZoomPlus > img",
        "description": "",
        "price": ".preco-cor2",
        "externalId": "input[name='product_id']"
    }
    // "foo": {
    //     robots: "",
    //     sitemap: {
    //         index: "",
    //         negatives: [],
    //         positives: []
    //     },
    //     scrapper: {
    //         "category": "",
    //         "supplier": "",
    //         "name": "",
    //         "image": "",
    //         "description": "",
    //         "price": "",
    //         "externalId": ""
    //     }
    // }
};
