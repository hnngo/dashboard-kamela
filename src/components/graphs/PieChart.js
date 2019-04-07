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
      data: undefined,
      toggleDraw: false,
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
    // Then re-draw the data before rendering
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

    // Init pie
    const pie = d3.pie().value((d) => d).sort(null)

    // Init arc
    const arc = d3.arc()
                  .innerRadius(maxRadius - 40)
                  .outerRadius(maxRadius - 5);
              
    // Init legends
    const legend = svg.append("g")
    .attr("transform", "translate(" + (maxRadius + 20) + "," + (-this.state.totalHeight/2 + 20) + ")");

    // Tooltip
    const tip = d3.select('body')
                  .append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0);
    
    const svgInfo = { svg, pie, arc, tip, maxRadius, legend };

    this.setState({ svgInfo }, () => this.drawData());
    // this.props.saveSVG(svgInfo, PIECHART_FS);
  }

  drawData(newSortType=undefined) {
    // console.log(this.props.sortType)
    // console.log("drawing datwa", this.state)
    const {
      svg, pie, arc, legend, tip
    } = this.state.svgInfo;

    let data;
    if (newSortType) {
      data = _.countBy(this.props.data, (d) => d[this.props.sortType]);
    } else {
      data = this.state.data;
    }
    console.log(data)
    console.log(Object.keys(data))
    console.log(Object.values(data))

    // Color scale
    const colorScale = d3.scaleOrdinal()
                         .domain(Object.keys(data))
                         .range(this.props.colorCode);

    Object.keys(data).forEach((item) => console.log(`%c ${item}`, `background: ${colorScale(item)}`));

    // Calculating percentage for tooltips
    const sum = Object.values(data).reduce((acc, cur) => acc + cur);
    const percentageArr = Object.values(data).map((item) => item * 100 / sum);

    // Remove old legends
    legend.selectAll(`.${this.props.chartName}circle`).remove();
    legend.selectAll(`.${this.props.chartName}text`).remove();

    // Add new legends
    Object.keys(data).forEach((item, i) => {
      const legendRow = legend.append("g")
                              .attr("transform", "translate(0," + (i * 20) + ")");
      
      legendRow.append("circle")
               .attr("cx", 2)
               .attr("cx", 0)
               .attr("r", 6)
               .attr("class", this.props.chartName + "circle")
               .style("fill", colorScale(Object.keys(data)[i]))
               .attr("stroke", "#867979")
               .attr("stroke-width", 0.5)
               .style("cursor", "pointer")
               .on("click", () => {
                console.log("index: " + i);
                let notShow = [];

                // Re-formating the circle fill color
                let selectCircle = d3.select("." + this.props.chartName + "circle");
                if (selectCircle.style("fill") === "white" || selectCircle.style("fill") === "rgb(0, 0, 0)") {
                  // fill data
                  selectCircle.style("fill", colorScale(i));

                  // Update notShow
                  // notShow = [...this.state.notShow];
                  // notShow.splice(notShow.indexOf(i), 1);
                } else {
                  // un-fill data
                  selectCircle.style("fill", "white");
                  
                  // Update notShow
                  // notShow = [...this.state.notShow, i];
                }
                
                this.setState({ toggleDraw: !this.state.toggleDraw });
              });

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
                 
    // Update existing arcs
    path.transition().duration(300).attrTween("d", arcTween)
    
    // Enter new arcs
    path.enter()
        .append("path")
        .attr("fill", (d, i) => colorScale(Object.keys(data)[i]))
        .attr("d", arc)
        .attr("stroke", "white")
        .attr("stroke-width", "4px")
        .each(function(d) { this._current = d; })
        .on("mousemove", (d, i) => {
          // Tips showing
          tip.transition().duration(200).style("opacity", .9);
          tip.html(() => {
             let res= `<svg height="15" width="15"  style="margin: 10px 10px">`;
             res += `<rect width="15" height="15"  style="fill:${colorScale(i)};" />`;
             res += `<span>${Object.keys(data)[i]}</span>`;
             res += `<span style="margin-left:5px">${percentageArr[i]}%</span></svg>`;
 
             return res;
          }).style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 40) + "px");
          })
        .on("mouseout", (d) => {
          // Tips dimming
          tip.transition().duration(500).style("opacity", 0);
        });

    function arcTween(a) {
      const i = d3.interpolate(this._current, a);
      this._current = i(1);
      return (t) => arc(i(t));
    }
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
