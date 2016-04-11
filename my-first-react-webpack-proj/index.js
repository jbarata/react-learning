var React = require('react');
var ReactDOM = require('react-dom');

var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Button = require('react-bootstrap/lib/Button');
var Grid = require('react-bootstrap/lib/Grid');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var ListGroup = require('react-bootstrap/lib/ListGroup');
var ListGroupItem = require('react-bootstrap/lib/ListGroupItem');
var Jumbotron = require('react-bootstrap/lib/Jumbotron');
var Label = require('react-bootstrap/lib/Label');
var Badge = require('react-bootstrap/lib/Badge');
var PanelGroup = require('react-bootstrap/lib/PanelGroup');
var Panel = require('react-bootstrap/lib/Panel');
var ResponsiveEmbed = require('react-bootstrap/lib/ResponsiveEmbed');


var GovernanceDashboard = React.createClass({

  render: function() {
    return (
      <div className="dashboard">
          <Grid>
              <Row className="show-grid">
                <Col><MainTitle title={this.props.title} totalPercent={this.props.totalPercent}/></Col>
              </Row>

              <Row className="show-grid">
                <Col md={12} lg={12}><Goals goals={this.props.goals}/></Col>
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
              <h1>Governance <Label bsStyle={labelStyle}>{this.props.totalPercent}%</Label></h1>
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
            var itemStyle = _this.getLabelStyleFor(goal.percent);
            var panelName = (
                <span>
                    {goal.name}
                    <Badge pullRight={true}>{goal.percent}%</Badge>
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

        this.props.items.forEach(function(item) {
            rows.push(
                <ListGroupItem bsStyle="default">
                    {item.name} <Badge pullRight={true}>{item.total}</Badge>
                </ListGroupItem>
            );
        });

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
var goals=[
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
    <GovernanceDashboard
        totalPercent={92}
        goals={goals}
    />
    , document.getElementById('root'));
