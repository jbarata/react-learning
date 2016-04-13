
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



var GovernanceDashboard = React.createClass({
    calculateTotalPercent: function(){
        this.setState({totalPercent:94});
    },
    loadGoals: function(){
        var _this = this;

        //TODO JBARATA isto há ser uma pesquisa ES
        $.getJSON("goals-search-result.json", function(json) {
            console.log(json); // this will show the info it in firebug console

            var goals = []; //há-de ser um array com goals e cada um com os seus goals filhos até ao 3 nivel
                            // [{id:123, details:{_source}, goals:[{idem mas do nivel 2}]},...]
            json.hits.hits.forEach(function(hit){
                var goal={};

                goal.id = hit._id;
                goal.details = hit._source;
                goal.goals = [];

                //TODO JBARATA hack temporario para por o total e o peso de cada goal
                goal.total = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
                goal.peso = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar

                if(goal["nível"]==1){
                    goals.push(goal);

                }else if(goal["nível"]==2){

                }

            })


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
                <Col md={12} lg={12}><Goals goals={this.state.goals}/></Col>
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



var xxxgoals=[
    {
        name:"Obectivo 1",
        peso:50,
        percent:27,
        items:[
            {name:"obj1 - item1", total:"12"},
            {name:"obj1 - item2", total:"1212"},
            {name:"obj1 - item3", total:"1312"}
        ]
    },
    {name:"Obectivo 2", percent:55, peso:35, items:[]},
    {name:"Obectivo 3", percent:70, peso:10, items:[]},
    {name:"Obectivo 4", percent:94, peso:5, items:[]}
];

ReactDOM.render(
    <GovernanceDashboard />
    , document.getElementById('root'));
