module.exports = {
    'corpo-ideal-suplementos': {
        'supplier': 'span.more-brand > span[itemprop="name"] || text()',
        'name': 'div.content > h1[itemprop="name"] || text()',
        'image': 'img.image.Image || attr("src")',
        'description': 'div#LongDescription > div.wd-descriptions-text || text()',
        'price': 'span.instant-price || text()',
        'externalId': 'span[itemprop="productID"] || text()'
    },
    // 'netshoes': {
    //     'supplier': 'meta[itemprop="brand"] || attr("content")',
    //     'name': 'h1.base-title || text()',
    //     'image': 'span.product-img > span.aligner > img || attr("src")',
    //     'description': 'div#caracteristicas || text()',
    //     'price': 'strong.new-price || text()',
    //     'externalId': 'p.sku || text()'
    // },
    // 'megaforma-suplementos': {
    //     'supplier': '.product-description-l > a',
    //     'name': '#content > h1',
    //     'image': '.cloud-zoom > img',
    //     'description': '#tab-description',
    //     'price': '.price',
    //     'externalId': 'input[name='id_produto']'
    // },
    // 'madrugao-suplementos': {
    //     'supplier': '.brand > a',
    //     'name': '.product-name > h1',
    //     'image': '.MagicZoomPlus > img',
    //     'description': '',
    //     'price': '.preco-cor2',
    //     'externalId': 'input[name='product_id']'
    // },
    // 'foo': {
    //     'supplier': '',
    //     'name': '',
    //     'image': '',
    //     'description': '',
    //     'price': '',
    //     'externalId': ''
    // }
};
