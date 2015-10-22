var db = require('./db');

db.initialize( function (databaseInstance) {

    console.log('everything just loaded');

    var Store = databaseInstance.collections.store;

    Store.create({
        name: 'Loja teste',
        link: 'http://lojateste.com.br'
    })
    .then(function (store) {
        console.log(store);
    })
    .catch(console.error);

    // everything initialized correctly, tee hee

    // TODO send the db to somewhere, maybe use a callback function.. i dont know..

});
