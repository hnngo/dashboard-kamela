import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import axios from 'axios';

export default class LineGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: undefined,
      loaded: false,
      margin: {
        top: this.props.offsetTop || 100,
        left: 60,
        right: 10,
        bottom: 30,
      },
      totalWidth: 576,
      totalHeight: 250
    }
  }

  componentWillMount() {
    // Get data from API stock
    this.getData(this.drawChart.bind(this));
  }

  getData = async (callbackFunc) => {
    let res = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${this.props.stockSymbol}&interval=60min&apikey=KJO1VD3QQ2D7BDOV`);

    if (Object.keys(res.data).includes("Error Message")) {
      this.setState({ loaded: false });
    } else {
      // Init chart after getting data
      this.setState({ 
        loaded: true,
        data: res.data
      }, () => callbackFunc());
    }
  }

  drawChart() {
    // Setup data
    const dataSeries = this.state.data[Object.keys(this.state.data)[1]];
    console.log(dataSeries);
    const xData = Object.keys(dataSeries).slice(0, this.props.maxNumberOfData);
    const yData = xData.map((item) => +dataSeries[item][this.props.dataType]);
    
    // Setup margin
    const { margin, totalWidth, totalHeight } = this.state;

    let wSvg, hSvg;
    if (this.props.showAxis) {
      wSvg = totalWidth - margin.left - margin.right;
      hSvg = totalHeight - margin.top - margin.bottom;
    } else {
      wSvg = totalWidth;
      hSvg = totalHeight - margin.top;
    }

    // Init svg
    const svg = d3.select("#lineChart" + this.props.chartName)
                  .append("svg")
                  .attr("viewBox", "0 0 " + totalWidth + " " + totalHeight)
                  .attr("preserveAspectRatio", "xMinYMin meet")
                  .append("g")
                    .attr("transform", "translate(0," + margin.top + ")");

    // X scale
    const timeParse = d3.timeParse("%Y-%m-%d %H:%M:%S");
    const xScale = d3.scaleTime()
                     .domain([timeParse(xData[0]), timeParse(xData[xData.length - 1])])
                     .range([0, wSvg]);

    // Y scale
    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(yData)])
                     .range([hSvg, 0]);
    
    
    if (this.props.showAxis) {
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
       .attr("stroke", this.props.lineColor)
       .attr("stroke-width", "3px")
       .attr("d", line(yData));

    svg.append("path")
       .attr("class", "lineChart")
       .attr("fill", this.props.areaColor)
       .attr("d", area(yData));

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

  checkRenderr() {
    // In case of unreloaded
    if (this.state.data) {
      try {
        return 
      }
      catch {
        return "";
      }
    }
  }

  render() {
    if (this.state.loaded) {
      return (
        <div className="line-container">
          <div>
            <h5 className="pt-4 pl-4 s-15">
              {this.state.data["Meta Data"]["1. Information"]}
            </h5>
          </div>
          <div className="line-extraInfo">
            <h3>Legend</h3>
          </div>
          <div id={"lineChart" + this.props.chartName}/>
        </div>
      );
    } else {
      return (
        <div/>
      )
    }
  }
}

LineGraph.propTypes = {
  chartName: PropTypes.string.isRequired
};

//TODO: show activity indicators
//TODO: preserve width only
