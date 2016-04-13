
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
    loadGoals: function(){
        var _this = this;

        //TODO JBARATA isto há ser uma pesquisa ES
        $.getJSON("goals-search-result.json", function(json) {
            console.log(json); // this will show the info it in firebug console

            var goals = [];
            json.hits.hits.forEach(function(hit){
                var goal = hit._source;

                //TODO JBARATA hack temporario para por o total e o peso de cada goal
                goal.total = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
                goal.peso = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar

                if(goal["nível"]=="1"){
                    goals.push(goal);
                }
            });


            _this.setState({goals: goals});

        });

    },
    getInitialState: function() {
        return {goals: []};
    },
    componentDidMount: function() {
        this.calculateTotalPercent();
        this.loadGoals();
    },

  render: function() {
    return (
      <div className="dashboard">
          <Grid>
              <Row className="show-grid">
                <Col><MainTitle title="Governance LIDL" totalPercent={this.state.totalPercent}/></Col>
              </Row>

              <Row className="show-grid">
                <Col md={12} lg={12}><h3>Goals Nível 1</h3><Goals goals={this.state.goals}/></Col>
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
    getLabelStyleFor: function(percentage){
        if(percentage <30) return "danger";
        if(percentage <50) return "warning";
        if(percentage <90) return "info";
        return "success";
    },
    render: function() {
        var rows = [];
        var _this = this;

        this.props.goals.forEach(function(goal) {
            var itemStyle = _this.getLabelStyleFor(goal.total);
            var panelName = (
                    <span>
                        {goal.nome}
                        <Badge pullRight={true}>{goal.total}%</Badge>
                        <Badge pullRight={true}>Peso: {goal.peso}</Badge>
                    </span>
                );

            rows.push(
                <Panel collapsible bsStyle={itemStyle} header={panelName}>
                    <Grid>
                        <Row>
                          <Col md={11} lg={11}><GoalDetails goal={goal}/></Col>
                        </Row>
                        <Row>
                          <Col md={5} lg={5}><GoalItems items={goal.items} title="Controls"/></Col>
                          <Col md={6} lg={6}><GoalGraphics/></Col>
                        </Row>
                    </Grid>
                </Panel>
            );
        });

        return(
            <PanelGroup>
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
        var title;

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


ReactDOM.render(
    <GovernanceDashboard />
    , document.getElementById('root'));
