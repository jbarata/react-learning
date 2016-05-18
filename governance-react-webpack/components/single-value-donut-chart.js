var React = require('react');
var ReactDOM = require('react-dom');

var SingleValueDonutChart = React.createClass({
  propTypes: {
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    outerRadius: React.PropTypes.number,
    outerRadiusHover: React.PropTypes.number,
    innerRadius: React.PropTypes.number,
    innerRadiusHover: React.PropTypes.number,
    emptyWidth: React.PropTypes.number,
    total: React.PropTypes.number,
    value: React.PropTypes.number
  },
  getDefaultProps() {
    return {
      height: 50,
      width: 50,
      outerRadius: 0.95,
      outerRadiusHover: 1,
      innerRadius: 0.85,
      innerRadiusHover: 0.85,
      emptyWidth: .06,
      total: 100,
      value:0
    };
  },
  render() {
    var { width, height } = this.props;

    return <svg className="chart--donut" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {this.renderPaths()}
      {this.renderText()}
    </svg>;
  },

  renderPaths() {
    var total = this.props.total;
    var value = this.props.value;
    var angle  = 0;
    var paths  = [];

    paths.push(this.renderPath(value, angle))

    if (value < total) {
      angle += (value / total) * 360;
      var emptyValue = total - value;
      if(emptyValue==total) emptyValue=total-0.0001; //force showing the circle
      
      paths.push(this.renderEmptyPath(emptyValue, angle));
    }

    return paths;
  },

  renderText() {
    var value = Math.floor(100*this.props.value/this.props.total) + " %";

    return <g>
      <text className="Chart-text" x="50%" y="50%" text-align="middle">
        <tspan dx="0" dy="3" textAnchor="middle">{value}</tspan>
   	  </text>

    </g>;
  },

  renderPath(value, startAngle) {
    var d = this.getPathData(value, this.props.total, startAngle, this.props.width, this.props.innerRadius, this.props.outerRadius);

  	return <path className="chart-path" d={d}></path>;
  },

  renderEmptyPath(value, startAngle) {
    var d = this.getPathData(value, this.props.total, startAngle, this.props.width, this.props.innerRadius + 0.03, this.props.outerRadius - 0.03);

    return <path className="chart-path chart-path--empty" d={d}></path>;
  },

   getPathData(data, total, startAngle, width, innerRadius, outerRadius) {
    var activeAngle = data / total * 360;
    var endAngle = startAngle + activeAngle;
    var largeArcFlagSweepFlagOuter = activeAngle > 180 ? '1 1' : '0 1';
    var largeArcFlagSweepFlagInner = activeAngle > 180 ? '1 0' : '0 0';
		var half = width / 2;
    var x1 = half + half * outerRadius * Math.cos(Math.PI * startAngle / 180);
    var y1 = half + half * outerRadius * Math.sin(Math.PI * startAngle / 180);
    var x2 = half + half * outerRadius * Math.cos(Math.PI * endAngle / 180);
    var y2 = half + half * outerRadius * Math.sin(Math.PI * endAngle / 180);
    var x3 = half + half * innerRadius * Math.cos(Math.PI * startAngle / 180);
    var y3 = half + half * innerRadius * Math.sin(Math.PI * startAngle / 180);
    var x4 = half + half * innerRadius * Math.cos(Math.PI * endAngle / 180);
    var y4 = half + half * innerRadius * Math.sin(Math.PI * endAngle / 180);

    return `M${x1},${y1} ${this.getArc(width, outerRadius, largeArcFlagSweepFlagOuter, x2, y2)} L${x4},${y4} ${this.getArc(width, innerRadius, largeArcFlagSweepFlagInner, x3, y3)} z`;
	},

  getArc(canvasSide, radius, largeArcFlagSweepFlag, x, y) {
    var z = canvasSide / 2 * radius;

    return `A${z},${z} 0 ${largeArcFlagSweepFlag} ${x},${y}`;
  },

});


export default SingleValueDonutChart;


/*

var App = React.createClass({
  getInitialState() {
    return {
      total: 100,
      series: [
        { label: 'Food', value: '5%', data: 5, selected: false, className: 'Chart-path--spent' },
        { label: 'House', value: '10%', data: 10, selected: true },
        { label: 'Entertainment', value: '15%', data: 15, selected: false },
        { label: 'Auto', value: '20%', data: 20, selected: false },
        { label: 'Clothes', value: '25%', data: 25, selected: false }
      ]
    };
  },
  handleSelected(item) {
    var series = this.state.series.map(i => {
      i.selected = i.label === item.label;
      return i;
    });

    this.setState({ series });
  },
  render() {
    return <div id="app">
      <DonutChart {...this.state}  />
    </div>;
  }
});
*/
