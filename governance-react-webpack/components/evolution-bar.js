import React from 'react';
import ReactDOM  from 'react-dom';

import { Sparklines, SparklinesLine } from 'react-sparklines';


const EvolutionBar = React.createClass({
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
        var delta =(<span>(=)</span>);
        if(this.props.evolutionData.delta < 0){
            delta = (<span className="negative-delta" style={{"color":"red"}}>{this.props.evolutionData.delta}</span>);
        }else if (this.props.evolutionData.delta > 0){
            delta = (<span>+{this.props.evolutionData.delta}</span>);
        }

        return(
            <div className="evolution-bar">

                <Sparklines data={this.props.evolutionData.sparkline-data}
                            limit={this.props.evolutionData.sparkline-limit || 10}
                            width={this.props.evolutionData.sparkline-witdh || 100}
                            height={this.props.evolutionData.sparkline-height || 20}
                            margin={5}>
                    <SparklinesLine />
                </Sparklines>

                <table style={{"display":"inline"}}>
                    <tbody>
                        <tr>
                            <td className="evolution-data-total" style={{"width":"60px"}}><span style={{"font-weight":"bold","font-size": "1.4em"}}>{goal.total}%</span></td>
                            <td className="evolution-data-delta" style={{"width":"30px","font-size": "0.8em"}}>{delta}</td>
                            <td className="evolution-data-weight" style={{"width":"50px","font-size": "0.8em"}}>Peso:{goal.peso}</td>
                        </tr>
                    </tbody>
                </table>

            </div>
        );
    }
});


export default EvolutionBar;
