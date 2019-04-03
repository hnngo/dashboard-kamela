import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import axios from 'axios';
import {
  DATA_CLOSE,
  DATA_HIGH,
  DATA_LOW,
  DATA_OPEN,
  DATA_VOLUME
} from '../../constants';

const showAxis = false;

export default class LineGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: undefined,
      margin: {
        top: 10,
        left: 60,
        right: 10,
        bottom: 30,
      },
      totalWidth: 500,
      totalHeight: 250
    }
  }

  componentDidMount() {
    // Get data from API stock
    this.getData(this.drawChart.bind(this));
  }

  getData = async (callbackFunc) => {
    let res = await axios.get("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=60min&apikey=KJO1VD3QQ2D7BDOV");

    if (Object.keys(res.data).includes("Error Message")) {
      console.log("Error");
      //TODO: Handle error loading here
    } else {
      // Init chart after getting data
      this.setState({ data: res.data }, () => callbackFunc());
    }
  }

  drawChart() {
    // Setup data
    const dataSeries = this.state.data[Object.keys(this.state.data)[1]];
    console.log(dataSeries);
    const xData = Object.keys(dataSeries);
    const yDataOpen = xData.map((item) => +dataSeries[item][DATA_OPEN]);
    const yDataHigh = xData.map((item) => +dataSeries[item][DATA_HIGH]);
    const yDataLow = xData.map((item) => +dataSeries[item][DATA_LOW]);
    const yDataClose = xData.map((item) => +dataSeries[item][DATA_CLOSE]);
    const yDataVolume = xData.map((item) => +dataSeries[item][DATA_VOLUME]);
    
    // Setup margin
    const { margin, totalWidth, totalHeight } = this.state;
    const wSvg = totalWidth - margin.left - margin.right;
    const hSvg = totalHeight - margin.top - margin.bottom;

    // Init svg
    const svg = d3.select("#lineChart" + this.props.chartName)
                  .append("svg")
                  .attr("viewBox", "0 0 " + totalWidth + " " + totalHeight)
                  .attr("preserveAspectRatio", "xMinYMin meet")
                  .append("g")
                    // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // X scale
    const timeParse = d3.timeParse("%Y-%m-%d %H:%M:%S");
    const xScale = d3.scaleTime()
                     .domain([timeParse(xData[0]), timeParse(xData[xData.length - 1])])
                     .range([0, wSvg]);

    // Y scale
    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(yDataVolume)])
                     .range([hSvg, 0]);
    
    
    if (showAxis) {
      // X Axis
      const xAxis = d3.axisBottom(xScale);
      svg.append("g")
        .call(xAxis)
        .attr("transform", "translate(0," + hSvg + ")");
        
      // Y Axis
      const yAxis = d3.axisLeft(yScale);
      svg.append("g")
        .call(yAxis);
    }
    
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
       .attr("stroke", "red")
       .attr("stroke-width", "3px")
       .attr("d", line(yDataVolume));

    svg.append("path")
       .attr("class", "lineChart")
       .attr("fill", "#fff1ee")
       .attr("d", area(yDataVolume));

    // Draw data dot circle
    // svg.selectAll("circle")
    //    .data(yDataVolume)
    //    .enter()
    //    .append("circle")
    //    .attr("cx", (d, i) => xScale(timeParse(xData[i])))
    //    .attr("cy", (d, i) => yScale(d))
    //    .attr("r", 3)
    //    .attr("fill", "red")
    
  }

  render() {
    return (
      <div>
        <h1>Line Graph</h1>
        <div className="" id={"lineChart" + this.props.chartName}/>
      </div>
    );
  }
}

LineGraph.propTypes = {
  chartName: PropTypes.string.isRequired
};
