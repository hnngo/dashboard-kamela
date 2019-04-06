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
      data: undefined
    };

    this.drawData = this.drawData.bind(this);
  }

  componentWillMount() {
    // Init the data by type then draw chart
    this.setState({ 
      data: _.countBy(this.props.data, (d) => d[this.props.sortType]) 
    }, () => this.drawChart());
  }

  componentWillReceiveProps(newProps) {
    // Check if pie chart receive new sort type props
    if (this.props.sortType !== newProps.sortType) {
      this.setState({ 
        data: _.countBy(this.props.data, (d) => d[newProps.sortType]) 
      }, () => this.drawData());
    }
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
    
    const svgInfo = { svg, pie, arc, colorScale, tip, maxRadius };

    this.setState({ svgInfo }, () => this.drawData());
    // this.props.saveSVG(svgInfo, PIECHART_FS);
  }

  drawData(newSortType=undefined) {
    // console.log(this.props.sortType)
    // console.log("drawing datwa", this.state)
    const {
      svg, pie, arc,
      colorScale, tip, maxRadius
    } = this.state.svgInfo;

    let data;
    if (newSortType) {
      data = _.countBy(this.props.data, (d) => d[this.props.sortType]);
    } else {
      data = this.state.data;
    }
    console.log(data)

    // Calculating percentage for tooltips
    const sum = Object.values(data).reduce((acc, cur) => acc + cur);
    const percentageArr = Object.values(data).map((item) => item * 100 / sum);

    // Remove old legends
    d3.selectAll(`.${this.props.chartName}circle`).remove();
    d3.selectAll(`.${this.props.chartName}text`).remove();

    // Add new legends
    const legend = svg.append("g")
                      .attr("transform", "translate(" + (maxRadius + 20) + "," + (-this.state.totalHeight/2 + 20) + ")");

    Object.keys(data).forEach((item, i) => {
      const legendRow = legend.append("g")
                              .attr("transform", "translate(0," + (i * 20) + ")");
      
      legendRow.append("circle")
               .attr("cx", 2)
               .attr("cx", 0)
               .attr("r", 6)
               .attr("class", this.props.chartName + "circle")
               .style("fill", colorScale(i))
               .attr("stroke", "#867979")
               .attr("stroke-width", 0.5)
               .style("cursor", "pointer");
      
      legendRow.append("text")
                .attr("x", 10)
                .attr("y", 6)
                .style("color", "black")
                .attr("class", this.props.chartName + "text")
                .text(item)
    });


    // Draw data
    const path = svg.selectAll("path")
                    .data(pie(Object.values(data)));

    path.enter()
       .append("path")
       .attr("fill", (d, i) => colorScale(i))
       .attr("d", arc)
       .on("mousemove", (d, i) => {
         // Tips showing
         tip.transition().duration(200).style("opacity", .9);
         tip.html(() => {
            let res= `<svg height="15" width="15" style="margin: 10px 10px">`;
            res += `<rect width="15" height="15" style="fill:${colorScale(i)};" />`;
            res += `<span>${Object.keys(data)[i]}</span>`;
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
