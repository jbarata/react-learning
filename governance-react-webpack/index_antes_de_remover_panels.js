var React = require('react');
var ReactDOM = require('react-dom');

import $ from "jquery";
var marked = require('marked');

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



var GovernanceDashboard = React.createClass({
    calculateTotalPercent: function(){
        this.setState({totalPercent:94});
    },
    getInitialState: function() {
        return {
            totalPercent: undefined,
            currentLevel:1,
            parentGoalId: undefined,
            showControls:false,
            currentGoal:undefined
        };
    },
    componentDidMount: function() {
        this.calculateTotalPercent();
    },
    handleGoToLevel: function(level, parentGoalId){
        //save previous state for undo later on
        this.props.stateHistory.push(this.state);

        this.setState( {
            currentLevel: level,
            parentGoalId: parentGoalId,
            showControls: false,
            currentGoal:undefined
        } );
    },
    handleGoBackLevel: function(){
        //just set previous state
        this.setState( this.props.stateHistory.pop() );
        this.setState( {
            showControls:false,
            currentGoal:undefined
        } );
    },

    handleShowControls: function(goal){

        this.setState( {
            showControls:true,
            currentGoal:goal
        } );
    },

    render: function() {
        var controlsComponent;
        var backBtn;
        if(this.state.currentLevel > 1){
            backBtn = (<Button bsStyle="link" onClick={this.handleGoBackLevel}>Nível {this.state.currentLevel-1}</Button>);
        }

        if(this.state.showControls){
            controlsComponent = ( <GoalControls goal={this.state.currentGoal} key={this.state.currentGoal.id}/> );
        }

        return (
            <div className="dashboard">
              <Grid>
                  <Row>
                    <Col><MainTitle title="Governance LIDL" totalPercent={this.state.totalPercent}/></Col>
                  </Row>

                  <Row key={this.state.currentLevel}>  {/* esta key é o que permite fazer o re-render completo qundo se muda o currentLevel */}
                    <Col md={12} lg={12}>
                        <h3>Goals Nível {this.state.currentLevel} {backBtn} </h3>
                        <Goals  level={this.state.currentLevel}
                                parentGoalId={this.state.parentGoalId}
                                onGoToLevel={this.handleGoToLevel}
                                onShowControls={this.handleShowControls}
                        />
                    </Col>
                  </Row>
              </Grid>

              {controlsComponent}
          </div>
        );
    }
});

var MainTitle = React.createClass({
    getLabelStyleFor: function(percentage){
        if(percentage <30) return "danger";
        if(percentage <50) return "warning";
        if(percentage <70) return "default";
        if(percentage <90) return "primary";
        return "success";
    },
    render: function() {
        var labelStyle = this.getLabelStyleFor(this.props.totalPercent);

        return(
            <Well bsSize="large">
              <h1>{this.props.title} <Alert className="pull-right" bsStyle={labelStyle}>{this.props.totalPercent}%</Alert></h1>
            </Well>
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

    getInitialState: function() {
        return {goals: []};
    },
    componentDidMount: function() {
        //this.loadGoals(this.props.level, this.props.parentGoalId);
        this.loadGoalsFromFile(this.props.level, this.props.parentGoalId);
    },
    getLabelStyleFor: function(percentage){
        if(percentage <30) return "danger";
        if(percentage <50) return "warning";
        if(percentage <90) return "info";
        return "success";
    },
    render: function() {
        var rows = [];
        var _this = this;
        var emptyRow;

        this.state.goals.forEach(function(goal) {
            var itemStyle = _this.getLabelStyleFor(goal.total);
            var panelName = (
                    <span>
                        {goal.nome}
                        <Badge pullRight={true}>{goal.total}%</Badge>
                        <Badge pullRight={true}>Peso: {goal.peso}</Badge>
                    </span>
                );

            rows.push(
                <Panel collapsible bsStyle={itemStyle} header={panelName} key={goal.id}>
                    <GoalDetails goal={goal}
                                onGoToLevel={_this.props.onGoToLevel}
                                onShowControls={_this.props.onShowControls}
                                />
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
    goLevelClick:function(e){
        this.props.onGoToLevel(e.target.value, this.props.goal.id);
    },
    showControlsClick:function(e){
        this.props.onShowControls(this.props.goal);
    },
    render: function() {
        var goal = this.props.goal;

        var level = parseInt(goal["nível"], 10);
        var nextLevel = (level + 1);
        var btnLabel = "Goals Nível " + nextLevel;
        var btnNextLevel;
        var btnShowControls;

        if(nextLevel > 1){
            btnNextLevel = (<Button bsStyle="primary" bsSize="small" value={nextLevel} onClick={this.goLevelClick}>{btnLabel}</Button>);
        }

        btnShowControls = (<Button bsStyle="primary" bsSize="small" onClick={this.showControlsClick}>Controls</Button>);

        return(
            <div>
                <h5>Departamento:</h5>
                <Well bsSize="small">{goal.departamento}</Well>
                <h5>Descrição:</h5>
                <Well bsSize="small">{goal["descrição"]}</Well>
                <h5>Detalhes:</h5>
                <Panel collapsible header="...">
                    <span dangerouslySetInnerHTML={this.getMarkup(goal.detalhe_do_goal)} />
                </Panel>

                <br/>
                <ButtonToolbar>
                    {btnNextLevel}
                    {btnShowControls}
                </ButtonToolbar>
            </div>
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
