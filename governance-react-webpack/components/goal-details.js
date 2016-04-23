//DEV deps
//var marked = require('marked');
//DEV deps

import React from 'react';
import ReactDOM  from 'react-dom';

import {Alert} from 'react-bootstrap'


const GoalDetails = React.createClass({
    getMarkup: function(text) {
        var rawMarkup = marked(text.toString(), {sanitize: true});
        return { __html: rawMarkup };
    },

    render: function() {
        var goal = this.props.goal;
        var details;

        if(!goal.detalhe_do_goal || !goal.detalhe_do_goal[0]){
            details = (<span>Este Goal não tem detalhes ...</span>);
        }else{
            details = (<span dangerouslySetInnerHTML={this.getMarkup(goal.detalhe_do_goal)} />);
        }

        return(
            <Alert onDismiss={this.props.onHideGoalDetails} closeLabel="" style={{"color":"black", "background-color":"#fff","border-color":"#ddd"}}>
                {details}
            </Alert>
        );
    }
});

export default GoalDetails;
