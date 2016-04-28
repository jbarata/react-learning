import React from 'react';
import ReactDOM  from 'react-dom';

import { Sparklines, SparklinesLine } from 'react-sparklines';


const EvolutionBar = React.createClass({

    calculateTotal : function(sparklineData){
        var dataLength = sparklineData.length;

        if(dataLength > 0){
            return sparklineData[dataLength-1].toFixed(1);
        }

        return 0;

    },
    calculateDelta : function(sparklineData){
        var dataLength = sparklineData.length;
        var delta;

        if(dataLength == 0){
            delta = 0;
        }else if(dataLength == 1){
            delta = sparklineData[0].toFixed(1);
        }else{
            delta = (sparklineData[dataLength-1] - sparklineData[0]).toFixed(1);
        }

        return delta;

    },
    render: function() {
        var total = this.calculateTotal(this.props.sparklineData);
        var delta = this.calculateDelta(this.props.sparklineData);

        var deltaHtml =(<span>(=)</span>);
        if(delta < 0){
            deltaHtml = (<span className="negative-delta" style={{"color":"red"}}>{delta}</span>);
        }else if (delta > 0){
            deltaHtml = (<span>+{delta}</span>);
        }

        var weightHtml;
        if(this.props.weight != undefined){
            weightHtml =(<td className="evolution-data-weight" style={{"width":"50px","font-size": "0.8em"}}>Peso:{this.props.weight}</td>)
        }

        return(
            <div className="evolution-bar">

                <Sparklines data={this.props.sparklineData}
                            limit={this.props.sparklineLimit || 10}
                            width={this.props.sparklineWitdh || 100}
                            height={this.props.sparklineHeight || 20}
                            margin={5}>
                    <SparklinesLine />
                </Sparklines>

                <table style={{"display":"inline"}}>
                    <tbody>
                        <tr>
                            <td className="evolution-data-total"><span style={{"font-weight":"bold","font-size": "1.4em"}}>{total}%</span></td>
                            <td className="evolution-data-delta">{deltaHtml}</td>
                            {weightHtml}
                        </tr>
                    </tbody>
                </table>

            </div>
        );
    }
});


export default EvolutionBar;
