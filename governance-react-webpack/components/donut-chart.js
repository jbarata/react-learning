var React = require('react');
var ReactDOM = require('react-dom');

var classNames = require( 'classnames' );

var DonutChart = React.createClass({
  propTypes: {
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    outerRadius: React.PropTypes.number,
    outerRadiusHover: React.PropTypes.number,
    innerRadius: React.PropTypes.number,
    innerRadiusHover: React.PropTypes.number,
    emptyWidth: React.PropTypes.number,
    total: React.PropTypes.number,
    defaultLabel: React.PropTypes.string,
    defaultValue: React.PropTypes.string,
    series: React.PropTypes.oneOfType([
      React.PropTypes.arrayOf(React.PropTypes.number),
      React.PropTypes.arrayOf(React.PropTypes.shape({
      	data: React.PropTypes.number.isRequired,
      	className: React.PropTypes.string
    	}))
    ])
  },
  getDefaultProps() {
    return {
      height: 150,
      width: 150,
      outerRadius: 0.95,
      outerRadiusHover: 1,
      innerRadius: 0.85,
      innerRadiusHover: 0.85,
      emptyWidth: .06,
      total: 0,
      defaultLabel: 'TEST',
      defaultValue: '75',
      onSelected: function(item) {},
      series: []
    };
  },
  render() {
    var { width, height } = this.props;

    return <svg className="Chart Chart--donut" viewBox={`0 0 ${width} ${height}`}>
      {this.renderPaths()}
      {this.renderText()}
    </svg>;
  },

  renderPaths() {
    var total = this.props.total;
    var size = this.props.series.reduce((memo, item) => memo + item.data, 0);
    var angle  = 0;

    var series = this.props.series.map(item => {
      var path = item.selected ? this.renderSelectedPath(item, angle) : this.renderPath(item, angle);

      angle += (item.data / total) * 360;

      return path;
    });

    if (size < total) {
      series.push(this.renderEmptyPath({ data: total - size }, angle));
    }

    return series;
  },

  renderText() {
    var series = this.props.series.filter(item => item.selected);
    var selected = series.length ? series[0] : null;
    var label = selected ? selected.label : this.props.defaultLabel;
    var value = selected ? selected.value : this.props.defaultValue;

    return <g>
      <text className="Chart-text" x="50%" y="50%" text-align="middle">
        <tspan dx="0" textAnchor="middle">{label}</tspan>
   	  </text>
      <text className="Chart-text" x="50%" y="50%" text-align="middle">
      	<tspan dy="25" textAnchor="middle">{value}</tspan>
   	  </text>
    </g>;
  },

  renderPath(item, startAngle) {
    var {className, props} = item;
    var classes = { 'Chart-path': true };
		var d = this.getPathData(item.data, this.props.total, startAngle, this.props.width, this.props.innerRadius, this.props.outerRadius);

    if (className) { classes[className] = true; }

  	return <path onClick={this.handleClick.bind(this, item)} className={classNames(classes)} {...props} d={d}></path>;
  },

	renderSelectedPath(item, startAngle) {
    var {className, props} = item;
		var classes = { 'Chart-path': true, 'Chart-path--selected': true };
		var d = this.getPathData(item.data, this.props.total, startAngle, this.props.width, this.props.innerRadiusHover, this.props.outerRadiusHover);

    if (className) { classes[className] = true; }

  	return <path className={classNames(classes)} {...props} d={d}></path>;
  },

  renderEmptyPath(item, startAngle) {
    var {className, props} = item;
    var classes = { 'Chart-path': true, 'Chart-path--empty': true };
		var d = this.getPathData(item.data, this.props.total, startAngle, this.props.width, this.props.innerRadius + 0.03, this.props.outerRadius - 0.03);

    if (className) { classes[className] = true; }

  	return <path className={classNames(classes)} {...props} d={d}></path>;
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

  handleClick(item, e) {
    this.props.onSelected(item);
  }
});


export default DonutChart;


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
      <DonutChart {...this.state} onSelected={this.handleSelected} />
    </div>;
  }
});
*/
