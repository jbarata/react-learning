//DEV deps
//var marked = require('marked');
//import $ from "jquery";
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

        return (

                <Well bsSize="large" className="governance-inner-container" >
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

var MainTitle = React.createClass({
    loadTotals: function(headerlevel, goalId, onSucess){
        var _this = this;
        //NOTA: query base construidaa partir de uma query kibana tipo:
        //http://prod2.lidl:8080/kibana/?#/visualize/create?_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'id_goal_n%C3%ADvel_2.raw:10004')),vis:(aggs:!((id:'1',params:(value:resultado_assessment.raw,weight:peso_goal_n%C3%ADvel_2.raw),schema:metric,type:weighted-mean),(id:'2',params:(customInterval:'2h',extended_bounds:(),field:data.date,interval:m,min_doc_count:1),schema:bucket,type:date_histogram)),listeners:(),params:(perPage:10,showMeticsAtAllLevels:!f,showPartialRows:!f,spyPerPage:10),type:table))&indexPattern=recordm-112&type=table&_g=(refreshInterval:(display:Off,pause:!f,section:0,value:0),time:(from:now-6h,mode:relative,to:now))
        var baseQueryGlobal = '{"size":0,"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":{"bool":{"must":[{"range":{"data.date":{"gte":__LOWER_DATE__,"lte":__UPPER_DATE__}}}],"must_not":[]}}}},"aggs":{"2":{"date_histogram":{"field":"data.date","interval":"__DATE_INTERVAL__","pre_zone":"+00:00","pre_zone_adjust_large_interval":true,"min_doc_count":1,"extended_bounds":{"min":__LOWER_DATE__,"max":__UPPER_DATE__}},"aggs":{"1":{"weighted-mean":{"value":"resultado_assessment.raw","weight":"peso_global.raw"}}}}}}';
        var baseQueryGoal = '{"size":0,"query":{"filtered":{"query":{"query_string":{"query":"id_goal_nível___NIVEL__.raw:__GOALID__","analyze_wildcard":true}},"filter":{"bool":{"must":[{"range":{"data.date":{"gte":__LOWER_DATE__,"lte":__UPPER_DATE__}}}],"must_not":[]}}}},"aggs":{"2":{"date_histogram":{"field":"data.date","interval":"__DATE_INTERVAL__","pre_zone":"+00:00","pre_zone_adjust_large_interval":true,"min_doc_count":1,"extended_bounds":{"min":__LOWER_DATE__,"max":__UPPER_DATE__}},"aggs":{"1":{"weighted-mean":{"value":"resultado_assessment.raw","weight":"peso_goal_nível___NIVEL__.raw"}}}}}}';

        var aggsQuery;

        if(headerlevel==0){
            aggsQuery= baseQueryGlobal.replace(/__LOWER_DATE__/g, '\"now-1w/d\"')
                                   .replace(/__UPPER_DATE__/g, '\"now\"')
                                   .replace(/__DATE_INTERVAL__/g, '1m'); //TODD JOBARATA ver o intervalo : 1w ou 1d ou 1h ou 1m

        }else {
            aggsQuery= baseQueryGoal.replace(/__NIVEL__/g, headerlevel)
                                   .replace(/__GOALID__/g, goalId)
                                   .replace(/__LOWER_DATE__/g, '\"now-1w/d\"')
                                   .replace(/__UPPER_DATE__/g, '\"now\"')
                                   .replace(/__DATE_INTERVAL__/g, '1m'); //TODD JOBARATA ver o intervalo : 1w ou 1d ou 1h ou 1m

        }


        $.ajax({
          url: "/recordm/recordm/definitions/search/advanced/112", //tem de ser advanced para se conseguir enfiar a query do kibana :)
          data : aggsQuery,
          type: "POST",
          xhrFields: { withCredentials: true },
          cache: false,
          success: function(json) {
              var sparklineData = [];
              var lastTotal;
              var lastDelta;

              //NOTA IMPORTANTE: segundo o mimes é possivel que as 2 keys seguintes mudem caso a query seja alterada (com mais aggs ou assim)
              var aggregationsKey  = "2";
              var bucketsKey  = "1";


              json.aggregations[aggregationsKey].buckets.forEach(function(bucket){
                  var value = bucket[bucketsKey].value;

                  if(value!=null) sparklineData.push(value)
              });

              var dataLength = sparklineData.length;

              if(dataLength == 0){
                  lastTotal = 0;
                  lastDelta = 0;
              }else if(dataLength == 1){
                  lastTotal =  sparklineData[0].toFixed(1);
                  lastDelta = lastTotal;
              }else{
                  lastTotal =  sparklineData[dataLength-1].toFixed(1);
                  lastDelta =  (lastTotal - sparklineData[dataLength-2]).toFixed(1);

              }

              onSucess(lastTotal, lastDelta, sparklineData);
          }
        });
    },
    getInitialState: function() {
        return {
            headerTotal: undefined,
            headerDelta: undefined,
            headerSparklineData:[]
        };
    },
    componentDidMount: function() {
        var _this = this;
        var goalId;
        var headerlevel = this.props.currentLevel - 1;

        if(this.props.currentGoal) goalId = this.props.currentGoal.id;

        this.loadTotals(headerlevel, goalId, function(total, delta, sparklineData){

            _this.setState({
                headerTotal: total,
                headerDelta: delta,
                headerSparklineData: sparklineData
            });
        })

    },

    render: function() {
        var title = "Governance";
        var showDetailsBtn;
        var backBtn;

        if(this.props.currentLevel > 1 && this.props.currentLevel < 5){
            title = this.props.currentGoal.nome;
            showDetailsBtn = (<Button bsStyle="link" onClick={this.props.onShowGoalDetails}>
                                    <i className="icon-question-sign" style={{"vertical-align": "middle"}}></i>
                             </Button>);
        }

        if(this.props.currentLevel > 1){
            backBtn = (<Button bsStyle="link" onClick={this.props.onGoBackLevel}>
                            <i className="icon-level-up" style={{"vertical-align": "middle", "font-size":"1.4em"}}></i>
                       </Button>);
        }

        return(
            <div>
                <h1 style={{"display": "inline-block", "max-width":"70%"}} >{backBtn}{title}</h1>
                {showDetailsBtn}

                <div style={{"float": "right"}} >
                    <Sparklines data={this.state.headerSparklineData} limit={15} width={100} height={50} margin={5}>
                      <SparklinesLine />
                    </Sparklines>
                    <h1 style={{"display": "inline-block", "vertical-align": "top"}}>{this.state.headerTotal}%</h1>

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
                 // goal.total = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
                 // goal.delta = Math.floor(Math.random() * 200) -100 ; //TODO JBARATA implementar

                  goals.push(goal);

              });

              window.console.log(goals);

              _this.setState({goals: goals}); // render goals right away

              goals.forEach(function(goal){
                  _this.loadTotals(level, goal.id, function(total, delta, sparklineData){
                      goal.total = total;
                      goal.delta = delta;
                      goal.sparklineData = sparklineData;

                      _this.setState({goals: goals}); // render goal totals as they arrive
                  })
              })
          }
        });
    },
    loadTotals: function(level, goalId, onSucess){
        var _this = this;
        //NOTA: query base construidaa partir de uma query kibana tipo:
        //http://prod2.lidl:8080/kibana/?#/visualize/create?_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'id_goal_n%C3%ADvel_2.raw:10004')),vis:(aggs:!((id:'1',params:(value:resultado_assessment.raw,weight:peso_goal_n%C3%ADvel_2.raw),schema:metric,type:weighted-mean),(id:'2',params:(customInterval:'2h',extended_bounds:(),field:data.date,interval:m,min_doc_count:1),schema:bucket,type:date_histogram)),listeners:(),params:(perPage:10,showMeticsAtAllLevels:!f,showPartialRows:!f,spyPerPage:10),type:table))&indexPattern=recordm-112&type=table&_g=(refreshInterval:(display:Off,pause:!f,section:0,value:0),time:(from:now-6h,mode:relative,to:now))
        var baseQuery = '{"size":0,"query":{"filtered":{"query":{"query_string":{"query":"id_goal_nível___NIVEL__.raw:__GOALID__","analyze_wildcard":true}},"filter":{"bool":{"must":[{"range":{"data.date":{"gte":__LOWER_DATE__,"lte":__UPPER_DATE__}}}],"must_not":[]}}}},"aggs":{"2":{"date_histogram":{"field":"data.date","interval":"__DATE_INTERVAL__","pre_zone":"+00:00","pre_zone_adjust_large_interval":true,"min_doc_count":1,"extended_bounds":{"min":__LOWER_DATE__,"max":__UPPER_DATE__}},"aggs":{"1":{"weighted-mean":{"value":"resultado_assessment.raw","weight":"peso_goal_nível___NIVEL__.raw"}}}}}}';
        var aggsQuery = baseQuery.replace(/__NIVEL__/g, level)
                                .replace(/__GOALID__/g, goalId)
                                .replace(/__LOWER_DATE__/g, '\"now-1w/d\"')
                                .replace(/__UPPER_DATE__/g, '\"now\"')
                                .replace(/__DATE_INTERVAL__/g, '1m'); //TODD JOBARATA ver o intervalo : 1w ou 1d ou 1h ou 1m


        $.ajax({
          url: "/recordm/recordm/definitions/search/advanced/112", //tem de ser advanced para se conseguir enfiar a query do kibana :)
          data : aggsQuery,
          type: "POST",
          xhrFields: { withCredentials: true },
          cache: false,
          success: function(json) {
              var sparklineData = [];
              var lastTotal;
              var lastDelta;

              //NOTA IMPORTANTE: segundo o mimes é possivel que as 2 keys seguintes mudem caso a query seja alterada (com mais aggs ou assim)
              var aggregationsKey  = "2";
              var bucketsKey  = "1";


              json.aggregations[aggregationsKey].buckets.forEach(function(bucket){
                  var value = bucket[bucketsKey].value;

                  if(value!=null) sparklineData.push(value)
              });

              var dataLength = sparklineData.length;

              if(dataLength == 0){
                  lastTotal = 0;
                  lastDelta = 0;
              }else if(dataLength == 1){
                  lastTotal =  sparklineData[0].toFixed(1);
                  lastDelta =  lastTotal;
              }else{
                  lastTotal =  sparklineData[dataLength-1].toFixed(1);
                  lastDelta =  (lastTotal - sparklineData[dataLength-2]).toFixed(1);

              }

              onSucess(lastTotal, lastDelta, sparklineData);
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
                //goal.total = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
            //    goal.delta = Math.floor(Math.random() * 200) -100 ; //TODO JBARATA implementar

                if(parseInt(goal["nível"],10) == level){
                    if(level == 1 ||
                        (level == 2 && goal["nível_1"] == parentGoalId) ||
                        (level == 3 && goal["nível_2"] == parentGoalId) ){

                        goals.push(goal);

                    }
                }
            });

            window.console.log(goals);

            _this.setState({goals: goals}); // render goals right away

            goals.forEach(function(goal){
                _this.loadTotalsFromFile(level, goal.id, function(total, delta, sparklineData){
                    goal.total = total;
                    goal.delta = delta;
                    goal.sparklineData = sparklineData;

                    _this.setState({goals: goals}); // render goal totals as they arrive
                })
            })


        });

    },

    loadTotalsFromFile: function(level, goalId, onSucess){
        var _this = this;

        //TODO JBARATA isto há ser uma pesquisa ES.. como está todos os goals têm os mesmos reusltados

        $.getJSON("aggs-query-result.json", function(json) {
            var sparklineData = [];
            var lastTotal;
            var lastDelta;

            //NOTA IMPORTANTE: segundo o mimes é possivel que as 2 keys seguintes mudem caso a query seja alterada (com mais aggs ou assim)
            var aggregationsKey  = "2";
            var bucketsKey  = "1";


            json.aggregations[aggregationsKey].buckets.forEach(function(bucket){
                var value = bucket[bucketsKey].value;

                if(value!=null) sparklineData.push(value)
            });

            var dataLength = sparklineData.length;

            if(dataLength == 0){
                lastTotal = 0;
                lastDelta = 0;
            }else if(dataLength == 1){
                lastTotal = sparklineData[0];
                lastDelta = lastTotal;
            }else{
                lastTotal = sparklineData[dataLength-1];
                lastDelta = lastTotal - sparklineData[dataLength-2];

            }

            onSucess(lastTotal, lastDelta, sparklineData);

        });

    },

    getInitialState: function() {
        return {
            goals: []
        };
    },
    componentDidMount: function() {
        this.loadGoals(this.props.level, this.props.parentGoalId);
        //this.loadGoalsFromFile(this.props.level, this.props.parentGoalId);
        this.buildCreateGoalUrl();
    },
    goLevelClick:function(goal){
        this.props.onGoToLevel(this.props.level + 1, goal);
    },
    buildCreateGoalUrl : function(){
        var n1='{"opts":{"auto-paste-if-empty":true},"fields":[{"value":"1","fieldDefinition":{"name":"Nível"}}]}'
        var n2='{"opts":{"auto-paste-if-empty":true},"fields":[{"value":"2","fieldDefinition":{"name":"Nível"}},{"value":"__PARENT_GOAL_ID__","fieldDefinition":{"name":"Nível 1"}}]}'
        var n3='{"opts":{"auto-paste-if-empty":true},"fields":[{"value":"3","fieldDefinition":{"name":"Nível"}},{"value":"__PARENT_GOAL_ID__","fieldDefinition":{"name":"Nível 2"}}]}'

        var createGoalUrl = '/recordm/index.html#/instance/create/103/data=';
        if(this.props.level == 1) createGoalUrl += n1;
        if(this.props.level == 2) createGoalUrl += n2.replace(/__PARENT_GOAL_ID__/g,this.props.parentGoalId);
        if(this.props.level == 3) createGoalUrl += n3.replace(/__PARENT_GOAL_ID__/g,this.props.parentGoalId);

        this.setState({createGoalUrl: createGoalUrl});
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

                        <Sparklines data={goal.sparklineData} limit={10} width={100} height={20} margin={5}>
                            <SparklinesLine />
                        </Sparklines>

                        <table style={{"display":"inline"}}>
                            <tbody>
                                <tr>
                                    <td style={{"width":"60px"}}><span style={{"font-weight":"bold","font-size": "1.4em"}}>{goal.total}%</span></td>
                                    <td style={{"width":"30px","font-size": "0.8em"}}>{delta}</td>
                                    <td style={{"width":"50px","font-size": "0.8em"}}>Peso:{goal.peso}</td>
                                </tr>
                            </tbody>
                        </table>

                    </div>

                </Panel>
            );
        });

        if(rows.length == 0){
            emptyRow = (<Well bsSize="small">Não há goals definidos neste nível</Well>);
        }


        var createGoal = (<Button bsStyle="link" target="_blank" href={this.state.createGoalUrl} title="Novo Goal">
                            <i className="icon-plus-sign" style={{"font-size":"1.4em"}}></i>
                        </Button>)

        return(
            <PanelGroup>
                {emptyRow}
                {rows}
                <div style={{"float": "right", "margin-right":"-12px"}}>{createGoal}</div>
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
          url: "/recordm/recordm/definitions/search/96?q=goal_nível_3.raw:" + goalId + sort,
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

              _this.setState({controls: controls}); // render controls right away

              controls.forEach(function(control){
                  _this.loadControlTotals(control.id, function(total, delta, sparklineData){
                      control.total = total;
                      control.delta = delta;
                      control.sparklineData = sparklineData;

                      _this.setState({controls: controls}); // render controls totals as they arrive
                  })
              })
          }
        });

    },
    loadControlTotals: function(controlId, onSucess){
        var _this = this;
        //NOTA: query base construidaa partir de uma query kibana tipo:
        //http://prod2.lidl:8080/kibana/?#/visualize/create?_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'id_control.raw:27816')),vis:(aggs:!((id:'1',params:(value:resultado_assessment.raw,weight:peso_control.raw),schema:metric,type:weighted-mean),(id:'2',params:(customInterval:'2h',extended_bounds:(),field:data.date,interval:m,min_doc_count:1),schema:bucket,type:date_histogram)),listeners:(),params:(perPage:10,showMeticsAtAllLevels:!f,showPartialRows:!f,spyPerPage:10),type:table))&indexPattern=recordm-112&type=table&_g=(refreshInterval:(display:Off,pause:!f,section:0,value:0),time:(from:now-8h,mode:relative,to:now))
        var baseQuery = '{"size":0,"query":{"filtered":{"query":{"query_string":{"query":"id_control.raw:__CONTROL_ID__","analyze_wildcard":true}},"filter":{"bool":{"must":[{"range":{"data.date":{"gte":__LOWER_DATE__,"lte":__UPPER_DATE__}}}],"must_not":[]}}}},"aggs":{"2":{"date_histogram":{"field":"data.date","interval":"__DATE_INTERVAL__","pre_zone":"+00:00","pre_zone_adjust_large_interval":true,"min_doc_count":1,"extended_bounds":{"min":__LOWER_DATE__,"max":__UPPER_DATE__}},"aggs":{"1":{"weighted-mean":{"value":"resultado_assessment.raw","weight":"peso_control.raw"}}}}}}';
        var aggsQuery = baseQuery.replace(/__CONTROL_ID__/g, controlId)
                                .replace(/__LOWER_DATE__/g, '\"now-1w/d\"')
                                .replace(/__UPPER_DATE__/g, '\"now\"')
                                .replace(/__DATE_INTERVAL__/g, '1m'); //TODD JOBARATA ver o intervalo : 1w ou 1d ou 1h ou 1m


        $.ajax({
          url: "/recordm/recordm/definitions/search/advanced/112", //tem de ser advanced para se conseguir enfiar a query do kibana :)
          data : aggsQuery,
          type: "POST",
          xhrFields: { withCredentials: true },
          cache: false,
          success: function(json) {
              var sparklineData = [];
              var lastTotal;
              var lastDelta;

              //NOTA IMPORTANTE: segundo o mimes é possivel que as 2 keys seguintes mudem caso a query seja alterada (com mais aggs ou assim)
              var aggregationsKey  = "2";
              var bucketsKey  = "1";


              json.aggregations[aggregationsKey].buckets.forEach(function(bucket){
                  var value = bucket[bucketsKey].value;

                  if(value!=null) sparklineData.push(value)
              });

              var dataLength = sparklineData.length;

              if(dataLength == 0){
                  lastTotal = 0;
                  lastDelta = 0;
              }else if(dataLength == 1){
                  lastTotal = sparklineData[0];
                  lastDelta = lastTotal;
              }else{
                  lastTotal = sparklineData[dataLength-1];
                  lastDelta = lastTotal - sparklineData[dataLength-2];

              }

              onSucess(lastTotal, lastDelta, sparklineData);
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
    getInitialState: function() {
        return {
            controls: []
        };
    },
    componentDidMount: function() {
        this.loadControls(this.props.goal.id);
        //this.loadControlsFromFile(this.props.goal.id);
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

                        <Sparklines data={control.sparklineData} limit={10} width={100} height={20} margin={5}>
                            <SparklinesLine />
                        </Sparklines>

                        <table style={{"display":"inline"}}>
                            <tbody>
                                <tr>
                                    <td style={{"width":"60px"}}><span style={{"font-weight":"bold","font-size": "1.4em"}}>{control.total}%</span></td>
                                    <td style={{"width":"30px","font-size": "0.8em"}}>{delta}</td>
                                    <td style={{"width":"50px","font-size": "0.8em"}}>Peso:{control.peso}</td>
                                </tr>
                            </tbody>
                        </table>

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
