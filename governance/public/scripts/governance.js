
var ButtonGroup = ReactBootstrap.ButtonGroup;
var DropdownButton = ReactBootstrap.DropdownButton;
var MenuItem = ReactBootstrap.MenuItem;
var Button = ReactBootstrap.Button;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var Jumbotron = ReactBootstrap.Jumbotron;
var Label = ReactBootstrap.Label;
var Badge = ReactBootstrap.Badge;
var PanelGroup = ReactBootstrap.PanelGroup;
var Panel = ReactBootstrap.Panel;
var ResponsiveEmbed = ReactBootstrap.ResponsiveEmbed;
var Well = ReactBootstrap.Well;


var GovernanceDashboard = React.createClass({
    calculateTotalPercent: function(){
        this.setState({totalPercent:94});
    },
    getInitialState: function() {
        return {
            totalPercent: undefined,
            currentLevel:1,
            parentGoalId: undefined
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
            parentGoalId: parentGoalId
        } );
    },
    handleGoBackLevel: function(){
        //just set previous state
        this.setState( this.props.stateHistory.pop() );
    },

  render: function() {
    var backBtn;
    if(this.state.currentLevel > 1){
            backBtn = (<Button bsStyle="link" onClick={this.handleGoBackLevel}>Nível {this.state.currentLevel-1}</Button>);
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
                    <Goals level={this.state.currentLevel} parentGoalId={this.state.parentGoalId} onGoToLevel={this.handleGoToLevel}/>
                </Col>
              </Row>
          </Grid>
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
            <Jumbotron>
              <h1>{this.props.title} <Label bsStyle={labelStyle}>{this.props.totalPercent}%</Label></h1>
            </Jumbotron>
        );
    }
});

var Goals = React.createClass({
    loadGoals: function(level, parentGoalId){
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
        this.loadGoals(this.props.level, this.props.parentGoalId);
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
                    <Grid>
                        <Row>
                          <Col md={11} lg={11}><GoalDetails goal={goal} onGoToLevel={_this.props.onGoToLevel}/></Col>
                        </Row>
                    </Grid>
                </Panel>
            );
        });

        if(rows.length == 0){
            rows.push(<Well bsSize="small">Não há goals definidos neste nível</Well>)
        }

        return(
            <PanelGroup >
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
    render: function() {
        var goal = this.props.goal;

        var level = parseInt(goal["nível"], 10);
        var nextLevel = (level + 1);
        var btnLabel = "Goals Nível " + nextLevel;
        var btnNextLevel;

        if(nextLevel > 1){
            btnNextLevel = (<Button bsStyle="primary" bsSize="small" value={nextLevel} onClick={this.goLevelClick}>{btnLabel}</Button>);
        }

        return(
            <div>
                <h5>Departamento:</h5>
                <Well bsSize="small">{goal.departamento}</Well>
                <h5>Descrição:</h5>
                <Well bsSize="small">{goal.descrição}</Well>
                <h5>Detalhes:</h5>
                <Panel collapsible header="...">
                    <span dangerouslySetInnerHTML={this.getMarkup(goal.detalhe_do_goal)} />
                </Panel>

                <br/>
                {btnNextLevel}
            </div>
        );
    }
});





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



/**************** Main stuff ******************/
var stateHistory=[]; //array to hold the dashboard states as we navigate so we can easaly go back

ReactDOM.render(
    <GovernanceDashboard stateHistory={stateHistory} />
    , document.getElementById('root'));
