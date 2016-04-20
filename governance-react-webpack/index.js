//DEV deps
var marked = require('marked');
import $ from "jquery";
//DEV deps

var React = require('react');
var ReactDOM = require('react-dom');

import { Sparklines, SparklinesLine } from 'react-sparklines';

import {
    Button,
    Grid, Row, Col,
    PanelGroup, Panel,
    Well,
    Alert
} from 'react-bootstrap'


var GovernanceDashboard = React.createClass({
    calculateTotalPercent: function(){
        this.setState({totalPercent:94});
    },
    getInitialState: function() {
        return {
            totalPercent: undefined,
            currentLevel:1,
            parentGoalId: undefined,
            currentGoal:undefined,
            showGoalDetails:false
        };
    },
    componentDidMount: function() {
        this.calculateTotalPercent();
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

        if(this.state.currentLevel > 1){
            backBtn = (<Button bsStyle="link" onClick={this.handleGoBackLevel}>
                            <i className="icon-level-up" style={{"vertical-align": "middle"}}></i>
                       </Button>);
        }

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

        return (

                <Well bsSize="large" className="governance-inner-container" >
                  <Grid>
                      <Row>
                        <Col md={12} lg={12}>
                            <MainTitle
                                currentLevel={this.state.currentLevel}
                                currentGoal={this.state.currentGoal}
                                totalPercent={this.state.totalPercent}
                                onShowGoalDetails={this.handleShowGoalDetails}
                             />

                            </Col>
                      </Row>

                      <Row key={this.state.currentLevel}>  {/* esta key é o que permite fazer o re-render completo qundo se muda o currentLevel */}
                        <Col md={12} lg={12}>
                            <h2>{backBtn}</h2>
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

var MainTitle = React.createClass({
    render: function() {
        var goalEvolutionData = [5, 10, 5, 20, 8, 15, 5, 10, 5, 20, 8, 15];
        var title = "Governance";
        var showDetailsBtn;

        if(this.props.currentLevel > 1 && this.props.currentLevel < 5){
            title = this.props.currentGoal.nome;
            showDetailsBtn = (<Button bsStyle="link" onClick={this.props.onShowGoalDetails}>
                                    <i className="icon-question-sign" style={{"vertical-align": "middle"}}></i>
                             </Button>);
        }

        return(
            <div>
                <h1 style={{"display": "inline-block", "max-width":"70%"}} >{title}</h1>
                {showDetailsBtn}

                <div style={{"float": "right"}} >
                    <Sparklines data={goalEvolutionData} limit={15} width={100} height={50} margin={5}>
                      <SparklinesLine />
                    </Sparklines>
                    <h1 style={{"display": "inline-block", "vertical-align": "top"}}>{this.props.totalPercent}%</h1>
                </div>
            </div>
        );
    }
});

var Goals = React.createClass({
    loadGoals: function(level, parentGoalId, sortBy, sortAsc){
        var _this = this;
        var query = "nível.raw:" + level;

        if(level >1 ){
            query += " AND nível_" + (level-1) + ".raw:" + parentGoalId;
        }


        var sort = "&sort="+(sortBy||"nome");
        if(sortAsc != undefined){
            sort += "&ascending=" + sortAsc;
        } else{
            sort += "&ascending=true"
        }

        $.ajax({
          url: "/recordm/recordm/definitions/search/103?q=" + encodeURIComponent(query) + sort,
          xhrFields: { withCredentials: true },
          dataType: 'json',
          cache: false,
          success: function(json) {
              var goals = [];
              json.hits.hits.forEach(function(hit){
                  var goal = hit._source;

                  //TODO JBARATA hack temporario para por o total
                  goal.total = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
                  goal.delta = Math.floor(Math.random() * 200) -100 ; //TODO JBARATA implementar

                  goals.push(goal);

              });

              window.console.log(goals);

              _this.setState({goals: goals});
          }
        });
    },
    loadGoalsFromFile: function(level, parentGoalId){
        var _this = this;

        //TODO JBARATA isto há ser uma pesquisa ES

        $.getJSON("goals-search-result.json", function(json) {
            var goals = [];
            json.hits.hits.forEach(function(hit){
                var goal = hit._source;

                //TODO JBARATA hack temporario para por o total
                goal.total = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
                goal.delta = Math.floor(Math.random() * 200) -100 ; //TODO JBARATA implementar

                if(parseInt(goal["nível"],10) == level){
                    if(level == 1 ||
                        (level == 2 && goal["nível_1"] == parentGoalId) ||
                        (level == 3 && goal["nível_2"] == parentGoalId) ){

                        goals.push(goal);
                    }
                }
            });

            window.console.log(goals);

            _this.setState({goals: goals});

        });

    },
    loadSparklineData: function(){
        //TODO implementar pesquisa e fazer um set state com os da

        this.setState({goalEvolutionData: [5, 10, 5, 20, 8, 15, 5, 10, 5, 20, 8, 15]});

    },

    getInitialState: function() {
        return {
            goals: [],
            goalEvolutionData:[]
        };
    },
    componentDidMount: function() {
        //this.loadGoals(this.props.level, this.props.parentGoalId);
        this.loadGoalsFromFile(this.props.level, this.props.parentGoalId);
        this.loadSparklineData();
    },
    goLevelClick:function(goal){
        this.props.onGoToLevel(this.props.level + 1, goal);
    },
    render: function() {
        var rows = [];
        var _this = this;
        var emptyRow;

        this.state.goals.forEach(function(goal) {
            var delta =(<span>(=)</span>);
            if(goal.delta < 0){
                delta = (<span style={{"color":"red"}}>{goal.delta}</span>);
            }else if (goal.delta > 0){
                delta = (<span>+{goal.delta}</span>);
            }

            rows.push(
                <Panel  key={goal.id}>
                    <Button bsStyle="link" bsSize="large" style={{"font-size":"1.2em"}}
                            onClick={ () => _this.goLevelClick(goal) }>
                        {goal.nome}
                    </Button>

                    <div style={{"float": "right"}} >
                        <Sparklines data={_this.state.goalEvolutionData} limit={15} width={100} height={20} margin={5}>
                            <SparklinesLine />
                        </Sparklines>


                        <div style={{"display":"inline","width":"50px"}}><span>Peso:{goal.peso}</span></div>
                        <div style={{"display":"inline","width":"50px"}}><span style={{"font-weight":"bold","font-size": "1.4em"}}>&nbsp;{goal.total}%</span></div>
                        <div style={{"display":"inline","width":"50px"}}>&nbsp;{delta}</div>
                    </div>

                </Panel>
            );
        });

        if(rows.length == 0){
            emptyRow = (<Well bsSize="small">Não há goals definidos neste nível</Well>);
        }

        return(
            <PanelGroup>
                {emptyRow}
                {rows}
            </PanelGroup>
        );
    }
});


var GoalDetails = React.createClass({
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



var GoalControls = React.createClass({

    loadControls: function(goalId, sortBy, sortAsc){
        var _this = this;
        var sort = "&sort="+(sortBy||"nome");
        if(sortAsc != undefined){
            sort += "&ascending=" + sortAsc;
        } else{
            sort += "&ascending=true"
        }

        $.ajax({
          url: "/recordm/recordm/definitions/search/96?q=goal.raw:" + goalId + sort,
          xhrFields: { withCredentials: true },
          dataType: 'json',
          cache: false,
          success: function(json) {
              var controls = [];
              json.hits.hits.forEach(function(hit){
                  var control = hit._source;

                  //TODO JBARATA hack temporario para por o total de cada control
                  control.total = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
                  control.delta = Math.floor(Math.random() * 200) -100 ; //TODO JBARATA implementar

                  controls.push(control);

              });

              window.console.log(controls);

              _this.setState({controls: controls});
          }
        });

    },
    loadControlsFromFile: function(goalId){
        var _this = this;

        //TODO JBARATA isto há ser uma pesquisa ES
        $.getJSON("controls-search-results.json", function(json) {
            var controls = [];
            json.hits.hits.forEach(function(hit){
                var control = hit._source;

                //TODO JBARATA hack temporario para por o total de cada control
                control.total = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
                control.delta = Math.floor(Math.random() * 200) -100 ; //TODO JBARATA implementar


                if(parseInt(control["goal"][0],10) == goalId){
                    controls.push(control);
                }
            });

            window.console.log('xxx',controls);

            _this.setState({controls: controls});

        });

    },
    loadSparklineData: function(){
        //TODO implementar pesquisa e fazer um set state com os da

        this.setState({controlEvolutionData: [5, 10, 5, 20, 8, 15, 5, 10, 5, 20, 8, 15]});

    },
    getInitialState: function() {
        return {
            controls: [],
            controlEvolutionData:[]
        };
    },
    componentDidMount: function() {
        //this.loadControls(this.props.goal.id);
        this.loadControlsFromFile(this.props.goal.id);
        this.loadSparklineData();
    },

    render: function() {
        var rows = [];
        var _this = this;
        var emptyRow;

        this.state.controls.forEach(function(control) {
            var delta =(<span>(=)</span>);
            if(control.delta < 0){
                delta = (<span style={{"color":"red"}}>{control.delta}</span>);
            }else if (control.delta > 0){
                delta = (<span>+{control.delta}</span>);
            }

            var viewControlUrl = "/recordm/index.html#/instance/" + control.id;
            var searchAssessmentsUrl = "/recordm/index.html#/definitions/111/q=" + encodeURIComponent("id_control.raw:" + control.id);
            var searchFindingsUrl = "/recordm/index.html#/definitions/97/q=" + encodeURIComponent("control.raw:" + control.id);


            rows.push(
                <Panel  key={control.id} >

                    <div style={{"display":"inline"}}>
                        <span style={{"font-size":"1.2em"}}>{control.nome}</span>
                        <br/>
                        <Button bsStyle="link" target="_blank" href={viewControlUrl}>
                            Detalhes
                        </Button>
                        <Button bsStyle="link" target="_blank" href={searchAssessmentsUrl}>
                            Assessments
                        </Button>
                        <Button bsStyle="link" target="_blank" href={searchFindingsUrl}>
                            Findings
                        </Button>
                    </div>

                    <div style={{"float": "right"}} >
                        <Sparklines data={_this.state.controlEvolutionData} limit={15} width={100} height={20} margin={5}>
                            <SparklinesLine />
                        </Sparklines>


                        <div style={{"display":"inline","width":"50px"}}><span>(Peso:{control.peso})</span></div>
                    <div style={{"display":"inline","width":"50px"}}><span style={{"font-weight":"bold","font-size": "1.4em"}}>&nbsp;{control.total}%</span></div>
                        <div style={{"display":"inline","width":"50px"}}>&nbsp;{delta}</div>
                    </div>

                </Panel>
            );
        });

        if(rows.length == 0){
            emptyRow = (<Well bsSize="small">Não há controls definidos para este Goal</Well>);
        }

        return(
            <PanelGroup>
                {emptyRow}
                {rows}
            </PanelGroup>
        );
    }

});



/**************** Main stuff ******************/
var stateHistory=[]; //array to hold the dashboard states as we navigate so we can easaly go back

ReactDOM.render(
    <GovernanceDashboard stateHistory={stateHistory} />
    , document.getElementById('governance-dashboard-container')
);
