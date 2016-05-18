import React from 'react';
import ReactDOM  from 'react-dom';


import {Well,Button } from 'react-bootstrap';

const ManualAssessmentForm = React.createClass({
    getInitialState: function() {
        return {value: undefined};
    },
    handleValueChange: function(e) {
        this.setState({value: e.target.value});
    },
    handleSubmit: function(e) {
        var _this=this;
        e.preventDefault();
        var value = this.state.value;
window.console.log('xxxxxx');
window.console.log(e);
window.console.log(value);
        if (value == undefined) {
          return;
        }


        //this.props.onAssessmentSubmit({value: value});
        //this.setState({value: undefined});

        var msg = {
            "product":"custom",
            "action":"exec_manual",
            "type":"Assessment Manual",
            "user":cob.app.getCurrentLoggedInUser(),
            "value": value,//Valor inserido pelo utilizador
            "control": this.props.control //_source do Control que origina estes assessments
        };

        $.ajax({
          url: "/integrationm/msgs/",
          data : JSON.stringify(msg),
          dataType: 'json',
          type: "POST",
          xhrFields: { withCredentials: true },
          cache: false,
          success: function() {
              _this.setState({value: undefined});
          }
        });


    },

    render: function() {
        var control = this.props.control;

        var assessmentTool = control["assessment_tool"];

        if(assessmentTool=="Manual"){
            var tipoAss = control["tipo_de_assessment"];
            var title = "Submeter Assessment do tipo ''" +tipoAss + "'";

            if(tipoAss == "Atingimento de valor"){
                return (
                    <Well>
                        <form className="assessment-form" onSubmit={this.handleSubmit}>
                            <span>{title}</span>
                            <br/>
                            <input type="text" style={{"height":"35px","margin-top":"9px"}}
                                value={this.state.value}
                                onChange={this.handleValueChange}
                             />
			&nbsp;&nbsp;
                            <Button type="submit">Submeter</Button>
                        </form>
                    </Well>
                );

            }else if(tipoAss ==  "Avaliação 1 a 10"){
                return (
                    <Well>
                    <form className="assessment-form" onSubmit={this.handleSubmit}>
                        <span>{title}</span>
                        <br/>
                        <select onChange={this.handleValueChange}>
                            <option></option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                            <option>6</option>
                            <option>7</option>
                            <option>8</option>
                            <option>9</option>
                            <option>10</option>
                        </select>
			&nbsp;&nbsp;
			<Button type="submit">Submeter</Button>
                    </form>
                    </Well>
                );

            }else if(tipoAss ==  "OK NOK"){
                return (
                    <Well>
                    <form className="assessment-form" onSubmit={this.handleSubmit}>
                        <span>{title}</span>
                        <br/>
                        <select onChange={this.handleValueChange}>
                            <option></option>
                            <option>OK</option>
                            <option>NOK</option>
                        </select>
			&nbsp;&nbsp;
			<Button type="submit">Submeter</Button>
                    </form>
                    </Well>
                );
            }
        }
    }
});

export default ManualAssessmentForm;
