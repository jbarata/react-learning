import React from 'react';
import ReactDOM  from 'react-dom';

import { Sparklines, SparklinesLine } from 'react-sparklines';

import {
    Button,
    PanelGroup, Panel,
    Well
} from 'react-bootstrap'

import EvolutionBar from './evolution-bar';

const Goals = React.createClass({
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

                  goals.push(goal);
              });

              window.console.log(goals);

              _this.setState({goals: goals}); // render goals right away

              goals.forEach(function(goal){
                  _this.loadTotals(level, goal.id, function(sparklineData){
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

              //NOTA IMPORTANTE: segundo o mimes é possivel que as 2 keys seguintes mudem caso a query seja alterada (com mais aggs ou assim)
              var aggregationsKey  = "2";
              var bucketsKey  = "1";


              json.aggregations[aggregationsKey].buckets.forEach(function(bucket){
                  var value = bucket[bucketsKey].value;

                  if(value!=null) sparklineData.push(value)
              });

              onSucess(sparklineData);
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
                _this.loadTotalsFromFile(level, goal.id, function(sparklineData){
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

            //NOTA IMPORTANTE: segundo o mimes é possivel que as 2 keys seguintes mudem caso a query seja alterada (com mais aggs ou assim)
            var aggregationsKey  = "2";
            var bucketsKey  = "1";


            json.aggregations[aggregationsKey].buckets.forEach(function(bucket){
                var value = bucket[bucketsKey].value;

                if(value!=null) sparklineData.push(value)
            });

            //JB mais facil martelar os dados para testes.....
            sparklineData= [6,2,3,4,5,6,7,8,9,4,3,3]

            onSucess(sparklineData);

        });

    },

    getInitialState: function() {
        return {
            goals: []
        };
    },
    componentDidMount: function() {
        //this.loadGoals(this.props.level, this.props.parentGoalId);
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

            rows.push(
                <Panel key={goal.id}>
                    <Button bsStyle="link" bsSize="large" style={{"font-size":"1.2em"}}
                            onClick={ () => _this.goLevelClick(goal) }>
                        {goal.nome}
                    </Button>

                    <div style={{"float": "right"}} >
                        <EvolutionBar sparklineData={goal.sparklineData}
                                      weight={goal.peso}/>
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


export default Goals;
