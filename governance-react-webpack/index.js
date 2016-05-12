//DEV deps
//var marked = require('marked');
//import $ from "jquery";
//DEV deps

var React = require('react');
var ReactDOM = require('react-dom');

import {
    Grid, Row, Col,
    Well
} from 'react-bootstrap'

import MainTitle from './components/main-title';
import Goals from './components/goals';
import GoalDetails from './components/goal-details';
import GoalControls from './components/goal-controls';


var DoughnutChart = require("react-chartjs").Doughnut;
var Chart = require('chart.js')

const GovernanceDashboard = React.createClass({
    getInitialState: function() {
        return {
            currentLevel:1,
            parentGoalId: undefined,
            currentGoal:undefined,
            showGoalDetails:false
        };
    },
    handleGoToLevel: function(level, parentGoal){
        //save previous state for undo later on
        this.props.stateHistory.push(this.state);

        this.setState( {
            currentLevel: level,
            parentGoalId: parentGoal.id,
            currentGoal: parentGoal,
            showGoalDetails:false
        } );
    },
    handleGoBackLevel: function(){
        //just set previous state
        this.setState( this.props.stateHistory.pop() );
        this.setState( {
            showGoalDetails:false
        } );
    },
    handleShowGoalDetails: function(){

        this.setState( {
            showGoalDetails:true
        } );
    },
    handleHideGoalDetails: function(){

        this.setState( {
            showGoalDetails:false
        } );
    },

    render: function() {
        var controls;
        var backBtn;
        var goals;
        var goalDetails;

        if(this.state.currentLevel < 4){
            goals =(<Goals  level={this.state.currentLevel}
                            parentGoalId={this.state.parentGoalId}
                            onGoToLevel={this.handleGoToLevel}
                    />);
        }

        if(this.state.currentLevel < 5 && this.state.currentGoal && this.state.showGoalDetails){
            goalDetails = (<GoalDetails goal={this.state.currentGoal} onHideGoalDetails={this.handleHideGoalDetails} />)
        }

        if(this.state.currentLevel == 4 ){
            controls = ( <GoalControls level={this.state.currentLevel}
                                        goal={this.state.currentGoal}
                                        key={this.state.currentGoal.id}
                                        onGoToLevel={this.handleGoToControlLevel}/> );
        }

        var data = {
            labels: [
                "Total"
            ],
            datasets: [
                {
                    data: [80, 20],
                    backgroundColor: [
                        "grey",
                        "white"
                    ]
                }]
        };
          var chartOptions={
              cutoutPercentage:70,
              animation:{
                  onComplete : function(){

                      var width = this.chart.width,
                          height = this.chart.height;

                      var fontSize = (height / 114).toFixed(2);
                      this.chart.ctx.font = fontSize + "em Verdana";
                      this.chart.ctx.textBaseline = "middle";
                      var text = "82%",
                          textX = Math.round((width - this.chart.ctx.measureText(text).width) / 2),
                          textY = height / 2;

                      this.chart.ctx.fillText(text, textX, textY);
                  }
              }
          };
          Chart.defaults.global.legend.display=false;



        return (

                <Well bsSize="large" className="governance-inner-container" >


<DoughnutChart data={data} options={chartOptions}/>

                  <Grid key={this.state.currentLevel}>
                      <Row style={{"margin-bottom":"20px"}}>
                        <Col md={12} lg={12}>
                            <MainTitle
                                currentLevel={this.state.currentLevel}
                                currentGoal={this.state.currentGoal}
                                onShowGoalDetails={this.handleShowGoalDetails}
                                onGoBackLevel={this.handleGoBackLevel}
                             />

                            </Col>
                      </Row>

                      <Row >
                        <Col md={12} lg={12}>
                            {goals}
                        </Col>
                      </Row>
                  </Grid>

                  <Grid>
                      <Row key={this.state.parentGoalId}>
                          <Col  md={12} lg={12}>
                              {controls}
                          </Col>
                      </Row>
                  </Grid>

                  <Grid>
                      <Row key={this.state.parentGoalId}>
                          <Col  md={12} lg={12}>
                              {goalDetails}
                          </Col>
                      </Row>
                  </Grid>






              </Well>

        );
    }
});


/**************** Main stuff ******************/
var stateHistory=[]; //array to hold the dashboard states as we navigate so we can easaly go back

ReactDOM.render(
    <GovernanceDashboard stateHistory={stateHistory} />
    , document.getElementById('governance-dashboard-container')
);
