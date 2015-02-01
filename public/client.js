var React = require('react'),
    App = require('./components/app.jsx');

window.React = React; // For chrome dev tool support

// Snag the initial state that was passed from the server side
var initialState = JSON.parse(document.getElementById('initial-state').innerHTML)

React.render(
    <App initialState={initialState} />,
    document.getElementById('main'), function() {
        console.log('React initialized');
    });
    
    
    