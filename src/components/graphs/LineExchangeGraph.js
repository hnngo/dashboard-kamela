import React, { Component } from 'react';
import * as d3 from 'd3';

export default class LineExchangeGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      svgInfo: undefined,
      data: this.props.data,
      margin: {
        top: 10,
        bottom: 20,
        left: 50,
        right: 20
      },
      totalWidth: 500,
      totalHeight: 340,
      number: 100
    }
  }

  componentWillMount() {
    this.filterData(this.state.data, () => this.drawChart());
  }

  componentWillReceiveProps(newProps) {
    // Filter data
    if (newProps.data !== this.state.data) {
      this.filterData(newProps.data, () => this.drawChart());
    }   
  }

  filterData(objectData, callback=undefined) {
    if (objectData === undefined) {
      return;
    }

    // Filter data and then callback func if can
    let data = { ...objectData };
    Object.keys(data).forEach(item => {
      if (this.props.chartKey.startsWith("CCE")) {
        data[item] = +objectData[item][Object.keys(objectData[item])[6]];
      } else {
        data[item] = +objectData[item][Object.keys(objectData[item])[3]];
      }
    });

    console.log(data)
    this.setState({ data }, () => {
      if (callback) {
        callback();
      }
    });
  }

  drawChart() {
    // In case of data has not available
    if (this.state.data === undefined) {
      return;
    }

    // If re-draw from old data then remove before re-draw
    if (this.state.svgInfo) {
      d3.select("#lineChart" + this.props.chartKey + " svg").remove();
    }

    // Setup data
    const xData = Object.keys(this.state.data).slice(0, this.state.number).reverse();
    const yData = xData.map((item) => this.state.data[item]);

    console.log(xData);
    console.log(yData);

    // Setup margin
    const { margin, totalWidth, totalHeight } = this.state;
    let wSvg = totalWidth - margin.left - margin.right;
    let hSvg = totalHeight - margin.top - margin.bottom;

    // Init svg
    const svg = d3.select("#lineChart" + this.props.chartKey)
                  .append("svg")
                  .attr("width", "100%")
                  .attr("height", hSvg)
                  .attr("viewBox", "0 0 " + totalWidth + " " + totalHeight)
                  .attr("preserveAspectRatio", "none")
                  .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const timeParse = d3.timeParse("%Y-%m-%d");
    const xScale = d3.scaleTime()
                     .domain([timeParse(xData[0]), timeParse(xData[xData.length - 1])])
                     .range([0, wSvg]);

    // Y scale
    const yScale = d3.scaleLinear()
                    .domain([d3.min(yData), d3.max(yData)])
                    .range([hSvg, 0]);

    // X Axis
    const xAxis = d3.axisBottom(xScale)
                    .tickFormat((d, i) => {
                      // Only show a few axis values
                      if (i % 10 === 0) {
                        return d.toDateString().slice(4, 30);
                      } else {
                        return "";
                      }
                    })

    svg.append("g")
      .call(xAxis)
      .attr("transform", `translate(0, ${hSvg})`)
      .style("stroke-width", 0.2)
      // .selectAll("text")
      //     .attr("x", -8)
      //     .attr("y", 8)
      //     .attr("text-anchor", "end")
      //     .attr("transform", "rotate(-50)")

    // Y Axis
    const yAxis = d3.axisLeft(yScale)       
                    .tickFormat((d, i) => {
                        // Only show a few axis values
                        // let dotIndex = d.indexOf(".") === -1 ? 20 : d.indexOf(".");
                        if (d > 1000) {
                          return d.toFixed(0);
                        } else {
                          return d;
                        }
                      });

    svg.append("g")
      .call(yAxis)
      .style("stroke-width", 0);

    // Store important svg info in state
    const svgInfo = { svg, yScale, xScale, xData, yData, timeParse, hSvg };

    // Set state then trigger draw data
    this.setState({ svgInfo }, () => this.drawData());
  }

  drawData() {
    const { svg, yScale, xScale, xData, yData, timeParse, hSvg } = this.state.svgInfo;

    // Line's generator
    const line = d3.line()
                   .x((d, i) => xScale(timeParse(xData[i])))
                   .y((d) => yScale(d))
                   .curve(d3.curveMonotoneX);

    // Create area below line
    const area = d3.area()
                   .x((d, i) => xScale(timeParse(xData[i])))
                   .y0(hSvg)
                   .y1((d) => yScale(d))
                   .curve(d3.curveMonotoneX);
 
    // Init path
    svg.append("path")
       .attr("class", "lineChart")
       .attr("fill", "none")
       .attr("stroke", "#333")
       .attr("stroke-width", "2px")
       .attr("d", line(yData))
       
    // svg.append("path")
    //    .attr("class", "lineChart")
    //    .attr("fill", this.props.areaColor)
    //    .attr("d", area(yData));
  }

  render() {
    return (
      <div className="pr-3 pb-3">
        <div id={"lineChart" + this.props.chartKey} />
      </div>
    );
  }
}
