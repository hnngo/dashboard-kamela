import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import _ from 'lodash';

export default class PieChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      totalWidth: 600,
      totalHeight: 200,
      svgInfo: undefined,
      data: _.countBy(this.props.data, (d) => d[this.props.sortType])
    };
  }

  componentDidMount() {
    this.drawChart();
  }

  drawChart() {
    // Calculate the max radius
    const maxRadius = Math.min(this.state.totalWidth, this.state.totalHeight) / 2;

    // Init svg
    const svg = d3.select("#pieChart" + this.props.chartName)
                  .append("svg")
                  .style("width", this.state.totalWidth)
                  .style("height", this.state.totalHeight)
                  .append("g")
                    .attr("transform", "translate(" + (maxRadius) + "," + (this.state.totalHeight/2) + ")");
    
    // Color scale
    const colorScale = d3.scaleOrdinal(this.props.colorCode);

    // Init pie
    const pie = d3.pie().value((d) => d)

    // Init arc
    const arc = d3.arc()
                  .innerRadius(maxRadius - 40)
                  .outerRadius(maxRadius - 5);

    // Tooltip
    const tip = d3.select('body')
                  .append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0);

    const legend = svg.append("g")
                      .attr("transform", "translate(" + (maxRadius + 20) + "," + (-this.state.totalHeight/2 + 20) + ")");
    
    Object.keys(this.state.data).forEach((item, i) => {
      const legendRow = legend.append("g")
                              .attr("transform", "translate(0," + (i * 20) + ")");
      
      legendRow.append("circle")
               .attr("cx", 2)
               .attr("cx", 0)
               .attr("r", 6)
               .style("fill", colorScale(i))
               .attr("stroke", "#867979")
               .attr("stroke-width", 0.5)
               .style("cursor", "pointer");
      
      legendRow.append("text")
                .attr("x", 10)
                .attr("y", 6)
                .style("color", "black")
                .text(item)
    })

    const svgInfo = { svg, pie, arc, colorScale, tip };

    this.setState({ svgInfo }, () => this.drawData())
  }

  drawData() {
    // Calculating percentage for tooltips
    const sum = Object.values(this.state.data).reduce((acc, cur) => acc + cur);

    const percentageArr = Object.values(this.state.data).map((item) => item * 100 / sum);

    const {
      svg, pie, arc,
      colorScale, tip
    } = this.state.svgInfo;

    // Drawdata
    svg.datum(Object.values(this.state.data))
       .selectAll("path")
       .data(pie)
       .enter()
       .append("path")
       .attr("fill", (d, i) => colorScale(i))
       .attr("d", arc)
       .on("mousemove", (d, i) => {
         // Tips showing
         tip.transition().duration(200).style("opacity", .9);
         tip.html(() => {
            let res= `<svg height="15" width="15" style="margin: 10px 10px">`;
            res += `<rect width="15" height="15" style="fill:${colorScale(i)};" />`;
            res += `<span>${Object.keys(this.state.data)[i]}</span>`;
            res += `<span style="margin-left:5px">${percentageArr[i]}%</span></svg>`;

            return res;
         }).style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY - 40) + "px");
         })
       .on("mouseout", (d) => {
         // Tips dimming
         tip.transition().duration(500).style("opacity", 0);
       })
  }

  render() {
    // // Update data
    // this.drawData();

    return (
      <div className="pl-1">
        <div id={"pieChart" + this.props.chartName}/>
      </div>
    );
  }
}

PieChart.propTypes = {
  chartName: PropTypes.string.isRequired
};

//TODO: Show tooltips inside pie chart
