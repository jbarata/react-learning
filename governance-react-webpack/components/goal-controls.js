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
                  //control.total = Math.floor(Math.random() * 100) + 1; //TODO JBARATA implementar
                  //control.delta = Math.floor(Math.random() * 200) -100 ; //TODO JBARATA implementar

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
                  });

                  _this.loadAssessmentCount(control.id, function(count){
                      control.assessmentCount = count;

                      _this.setState({controls: controls}); // render controls totals as they arrive
                  });

                  _this.loadFindingsCount(control.id, function(count){
                      control.findingsCount = count;

                      _this.setState({controls: controls}); // render controls totals as they arrive
                  });
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
                  lastTotal = sparklineData[0].toFixed(1);
                  lastDelta = lastTotal;
              }else{
                  lastTotal = sparklineData[dataLength-1].toFixed(1);
                  lastDelta = (lastTotal - sparklineData[dataLength-2]).toFixed(1);

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
    loadAssessmentCount: function(controlId, onSuccess){
        var _this = this;
        var searchAssessmentsUrl = "/recordm/recordm/definitions/search/111?q=" + encodeURIComponent("id_control.raw:" + controlId);

        $.ajax({
          url: searchAssessmentsUrl,
          xhrFields: { withCredentials: true },
          dataType: 'json',
          cache: false,
          success: function(json) {
              onSuccess(json.hits.total);
          }
        });

    },
    loadFindingsCount: function(controlId, onSuccess){
        var _this = this;
        var searchFindingsUrl = "/recordm/recordm/definitions/search/97?q=" + encodeURIComponent("control.raw:" + controlId);

        $.ajax({
          url: searchFindingsUrl,
          xhrFields: { withCredentials: true },
          dataType: 'json',
          cache: false,
          success: function(json) {
              onSuccess(json.hits.total);
          }
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

            var viewControlHref = "/recordm/index.html#/instance/" + control.id;
            var searchAssessmentsHref = "/recordm/index.html#/definitions/111/q=" + encodeURIComponent("id_control.raw:" + control.id);
            var searchFindingsHref = "/recordm/index.html#/definitions/97/q=" + encodeURIComponent("control.raw:" + control.id);


            rows.push(
                <Panel  key={control.id} >

                    <div style={{"display":"inline"}}>
                        <span style={{"font-size":"1.2em"}}>{control.nome}</span>
                        <br/>
                        <Button bsStyle="link" target="_blank" href={viewControlHref}>
                            Detalhes
                        </Button>
                        <Button bsStyle="link" target="_blank" href={searchAssessmentsHref}>
                            Assessments ({control.assessmentCount})
                        </Button>
                        <Button bsStyle="link" target="_blank" href={searchFindingsHref}>
                            Findings ({control.findingsCount})
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
