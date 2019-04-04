import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import _ from 'lodash';

export default class PieChart extends Component {
  constructor(props) {
    super(props);

    const filteredData = this.props.data.map((item) => {
      // Get filtered sections
      let strCap = item.smcap.slice(1, item.smcap.length - 2);
      let newSmcap = item.smcap.charAt(item.smcap.length - 1) === "B" ? +strCap * 1000000000 : +strCap * 1000000;

      return { ...item, smcap: newSmcap }
    });

    // console.log(filteredData);

    const catIndustry = _.uniq(filteredData.map((item) => item.stock_industry));

    // console.log(catIndustry)

    const catIndustrySorted = _.sortBy(filteredData, [(d) => d.smcap]);

    // console.log(catIndustrySorted)


    this.state = {
      filteredData,
      totalWidth: 100,
      totalHeight: 100
    };
  }

  componentDidMount() {
    this.drawChart();
  }

  drawChart() {
    let data = [12,23,21,34,23,43,54,65,32]
    // Calculate the max radius
    const maxRadius = Math.min(this.state.totalWidth, this.state.totalHeight) / 2;

    // Init svg
    const svg = d3.select("#pieChart" + this.props.chartName)
                  .append("svg")
                  .attr("max-width", this.state.totalWidth)
                  .attr("max-height", this.state.totalHeight)
                  .append("g")
                    .attr("transform", "translate(" + (this.state.totalWidth/2) + "," + (this.state.totalHeight/2) + ")");
    
    // Color scale
    const colorScale = d3.scaleOrdinal(['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b']);

    // Init pie
    const pie = d3.pie().value((d) => d)

    // Init arc
    const arc = d3.arc()
                  .innerRadius(0)
                  .outerRadius(maxRadius - 5);

    // Drawdata
    svg.datum(data)
       .selectAll("path")
       .data(pie)
       .enter()
       .append("path")
       .attr("fill", (d, i) => colorScale(i))
       .attr("d", arc)
  }

  render() {
    return (
      <div>
        <div id={"pieChart" + this.props.chartName}/>
      </div>
    );
  }
}

PieChart.propTypes = {
  chartName: PropTypes.string.isRequired
};
