var React = require('react');
var ReactDOM = require('react-dom');

import $ from "jquery";
var marked = require('marked');
import { Sparklines, SparklinesLine } from 'react-sparklines';

var ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');
var Button = require('react-bootstrap/lib/Button');
var Grid = require('react-bootstrap/lib/Grid');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var Badge = require('react-bootstrap/lib/Badge');
var PanelGroup = require('react-bootstrap/lib/PanelGroup');
var Panel = require('react-bootstrap/lib/Panel');
var Well = require('react-bootstrap/lib/Well');
var Alert = require('react-bootstrap/lib/Alert');
var Label = require('react-bootstrap/lib/Label');



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
        var controlsComponent;
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

        if(this.state.currentGoal && this.state.showGoalDetails){
            goalDetails = (<GoalDetails goal={this.state.currentGoal} onHideGoalDetails={this.handleHideGoalDetails} />)
        }

        if(this.state.currentLevel >3 ){
            controlsComponent = ( <GoalControls goal={this.state.currentGoal} key={this.state.currentGoal.id}/> );
        }

        return (

                <Well bsSize="large" style={{"margin":"10px 40px"}}>
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
                              {controlsComponent}
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

        if(this.props.currentLevel > 1){
            title = this.props.currentGoal.nome;
            showDetailsBtn = (<Button bsStyle="link" onClick={this.props.onShowGoalDetails}>
                                    <i className="icon-question-sign" style={{"vertical-align": "middle"}}></i>
                             </Button>);
        }

        return(
            <div>
                <h1 style={{"display": "inline-block"}} >{title}</h1>
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
    loadGoals: function(level, parentGoalId){
        var _this = this;

        $.ajax({
          url: "/recordm/recordm/definitions/search/103?q=*",
          xhrFields: { withCredentials: true },
          dataType: 'json',
          cache: false,
          success: function(json) {
              var goals = [];
              json.hits.hits.forEach(function(hit){
                  var goal = hit._source;

                  //TODO JBARATA hack temporario para por o total e o peso de cada goal
                  goal.total = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
                  goal.peso = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
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

                //TODO JBARATA hack temporario para por o total e o peso de cada goal
                goal.total = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
                goal.peso = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
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
                delta = (<span style={{"color":"red"}}>({goal.delta}%)</span>);
            }else if (goal.delta > 0){
                delta = (<span>(+ {goal.delta}%)</span>);
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

                        {delta}
                        <span>&nbsp;(Peso: {goal.peso})</span>
                        <span style={{"font-weight":"bold","font-size": "1.3em"}}>&nbsp;{goal.total}%</span>
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

    loadControls: function(goalId){
        var _this = this;

        $.ajax({
          url: "/recordm/recordm/definitions/search/96?q=goal.raw:"+goalId,
          xhrFields: { withCredentials: true },
          dataType: 'json',
          cache: false,
          success: function(json) {
              var controls = [];
              json.hits.hits.forEach(function(hit){
                  var control = hit._source;

                  //TODO JBARATA hack temporario para por o peso de cada control
                  control.peso = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar

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

                //TODO JBARATA hack temporario para por o peso de cada control

                control.peso = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar

                if(parseInt(control["goal"][0],10) == goalId){
                    controls.push(control);
                }
            });

            window.console.log('xxx',controls);

            _this.setState({controls: controls});

        });

    },
    getInitialState: function() {
        return {controls: []};
    },
    componentDidMount: function() {
        //this.loadControls(this.props.goal.id);
        this.loadControlsFromFile(this.props.goal.id);
    },

    render: function() {
        var rows = [];
        var _this = this;
        var emptyRow;

        this.state.controls.forEach(function(control) {
            var panelName = (
                    <span>
                        {control["código"]}: {control.nome}
                        <Badge pullRight={true}>Peso: {control.peso}</Badge>
                    </span>
                );

            rows.push(
                <Panel collapsible header={panelName} key={control.id}>
                    <ControlDetails control={control} />
                </Panel>
            );
        });

        if(rows.length == 0){
            emptyRow = (<Well bsSize="small">Não há Controls definidos para este Goal</Well>);
        }

        var ControlsHeader = (<h1>Controls do Goal - <em>{this.props.goal.nome}</em></h1>);

        return(

            <Grid>
                <Row>
                  <Col md={11} lg={11}>
                      <Panel header={ControlsHeader}>
                          <PanelGroup>
                              {emptyRow}
                              {rows}
                          </PanelGroup>
                      </Panel>
                  </Col>
                </Row>
            </Grid>


        );
    }
});


var ControlDetails = React.createClass({
    getMarkup: function(text) {
        var rawMarkup = marked(text.toString(), {sanitize: true});
        return { __html: rawMarkup };
    },
    render: function() {
        var control = this.props.control;

        return(
            <div>
                <h5>Origem:</h5>
                <Well bsSize="small">{control["origem"]}</Well>
                <h5>Severidade:</h5>
                <Well bsSize="small">{control["severidade"]}</Well>
                <h5>Responsável:</h5>
                <Well bsSize="small">{control["nome_responsável"]}</Well>

                <h5>Descrição:</h5>
                <Panel collapsible header="...">
                    <span dangerouslySetInnerHTML={this.getMarkup(control["descrição"])} />
                </Panel>

            </div>
        );
    }
});

{/*
var GoalItems = React.createClass({

    render: function() {
        var rows = [];
        var title;

        if(this.props.title){
            title = (<h3> {this.props.title} </h3>);
        }

        if(this.props.items){
            this.props.items.forEach(function(item) {
                rows.push(
                    <ListGroupItem bsStyle="default">
                        {item.name} <Badge pullRight={true}>{item.total}</Badge>
                    </ListGroupItem>
                );
            });
        }

        return(
            <div>
                {title}
                <ListGroup>
                  {rows}
                </ListGroup>
            </div>
        );
    }
});

var GoalGraphics = React.createClass({

    render: function() {
        var rows = [];

        return(
            <div style={{height: 'auto'}}>
                <ResponsiveEmbed a16by9>
                    <embed type="application/pdf" src="103_ADENE_SCE_SCE0000081420823.pdf" />
                </ResponsiveEmbed>
            </div>
        );
    }
});

*/}

/**************** Main stuff ******************/
var stateHistory=[]; //array to hold the dashboard states as we navigate so we can easaly go back

ReactDOM.render(
    <GovernanceDashboard stateHistory={stateHistory} />
    , document.getElementById('governance-dashboard-container')
);
