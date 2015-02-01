var React = require('react'),
    Application;

Application =

    React.createClass({

        propTypes: {
            initialState: React.PropTypes.object
        },

        getDefaultProps: function () {
           return {
               initialState: {}
           };
        },

        getInitialState: function () {
           return {
               initialState: this.props.initialState
           };
        },

        componentWillMount: function () {
            // do nothing for now
        },

        componentWillUnmount: function () {
            // do nothing for now
        },
        
        componentDidMount: function () {
            console.log('montei');
            alert('montei');
        },

        render: function () {
            return (
                <div>
                    <h1>App Main, HEllO {this.props.initialState}</h1>
                </div>
            );
        }
});

module.exports = Application;
