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
    const colorScale = d3.scaleOrdinal(['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b']);

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
                      .attr("transform", "translate(" + (maxRadius + 20) + "," + (-this.state.totalHeight/2 + 16) + ")");
    
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
    console.log(this.state.data)
    console.log(Object.values(this.state.data));
    console.log(Object.keys(this.state.data));
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
       .on("mousemove", (d) => {
         tip.transition()
            .duration(200)
            .style("opacity", .9)
         tip.html(() => {
           let text = `<strong>Country: </strong><span>$ {d.country}<span></br>`;
           text += `<strong>Income: </strong><span>${d.income} <span></br>`;
           text += `<strong>Life Expectancy: </strong><span>$ {d.life_exp}<span></br>`;
           text += `<strong>Population: </strong><span>$ {d.population}<span></br>`;
           return text;
         })
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 60) + "px");
         })
       .on("mouseout", (d) => {
           tip.transition()
               .duration(500)
               .style("opacity", 0);
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

//TODO: Add legends
