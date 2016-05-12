import React from 'react';
import ReactDOM  from 'react-dom';

import { Sparklines, SparklinesLine } from 'react-sparklines';

import { Button } from 'react-bootstrap';

import EvolutionBar from './evolution-bar';

const MainTitle = React.createClass({
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
    getInitialState: function() {
        return {
            headerSparklineData:[]
        };
    },
    componentDidMount: function() {
        var _this = this;
        var goalId;
        var headerlevel = this.props.currentLevel - 1;

        if(this.props.currentGoal) goalId = this.props.currentGoal.id;

        this.loadTotals(headerlevel, goalId, function(sparklineData){

            _this.setState({
                headerSparklineData: sparklineData
            });
        })

//TODO JB em testes
        this.setState({
            //headerSparklineData: [6,2,3,4,5,6,7,8,9,4,3,3]
        });

    },

    render: function() {
        var title = "Governance";
        var peso;
        var showDetailsBtn;
        var backBtn;



        if(this.props.currentLevel > 1 && this.props.currentLevel < 5){
            title = this.props.currentGoal.nome;
            peso = this.props.currentGoal.peso;

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
                    <EvolutionBar sparklineData={this.state.headerSparklineData}
                                  sparklineLimit={10}
                                  sparklineWitdh={150}
                                  sparklineHeight={35}
                                  weight={peso}
                                  size="big"/>
                </div>
            </div>
        );
    }
});


export default MainTitle;
