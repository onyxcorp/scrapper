// add support to jsx react files
require('node-jsx').install({extension: '.jsx'});

// reference the http module so we can create a webserver
var browserify = require('browserify-middleware'),
    express = require('express'),
    React = require('react'),
    AppComponent = React.createFactory(require('./public/components/app.jsx')),
    server;

server = express();

// specify the public files prefix and where should they point to
server.use('/public', express.static(__dirname + '/public'));

// gera um bundle e envia ao client,esta demorando um pouco pois o bundle é gerado em tempo real..
server.get('/client.js', browserify('./public/client.js'));

server.use(function (req, res, next) {
   // some middleware to be executed in all requests
    next();
});

server.get('/', function (req, res) {

    var html,
        state;

    state = {
        hello: "world"
    }

    html = React.renderToString(AppComponent({
        initialState: state
    }));

    // user react para criar a view
    // ao abrir o servidor, enviar uma página contendo:
        // todos os produtos adicionados
        // todos os produtos atualizados

    res.write('<html>');
    res.write('<head>');
    res.write('<link rel="stylesheet" type="text/css" href="/public/style.css">');
    res.write('<meta charset="UTF-8" />');
    res.write('<title>Document</title>');
    res.write('</head>');
    res.write('<body>');
    res.write('<div id="app">' + html + '</div>');
    res.write('<script id="initial-state" type="application/json">' + JSON.stringify(state) + '</script>');
    res.write('<script src="/client.js"></script>');
    res.write('</body>');
    res.write('</html>');
});

server.listen(process.env.PORT);
console.log('Express server started on port %s', process.env.PORT);
