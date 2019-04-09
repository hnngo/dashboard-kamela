import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import axios from 'axios';
import {
  SINGLE_HEIGHT,
  TI_DEMA,
  TI_EMA,
  TI_RSI,
  TI_SMA,
  TI_WMA
} from '../../constants';

export default class LineIndicators extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: undefined,
      loaded: true, // Temporarily
      margin: {
        top: 10,
        left: 10,
        right: 10,
        bottom: 10,
      },
      totalWidth: 800,
      totalHeight: 200,
      cooldownTime: 60,
      cooldownInterval: undefined,
    }
  }

  componentWillMount() {
    // Getting data and draw when data is loaded fully
    this.getData(this.drawChart.bind(this));
  }



  getData = (callback) => {
    const dataSet = [TI_RSI, TI_SMA, TI_WMA];

    // Get data from stock API
    const data = [];
    dataSet.forEach(async (item, i) => {
      let res = await axios.get(item);

      // Check if result is valid data or error
      // If fail, then re-attempt to get the data after 1 mins, free API maximum 5 calls per min
      if ((Object.keys(res.data).includes("Error Message")) || (Object.keys(res.data).includes("Note"))) {
        // Set interval for counting down for every second
        const cooldownInterval = setInterval(() => this.setState({ cooldownTime: this.state.cooldownTime - 1 }), 1000);

        // Set time out for the next attempt
        setTimeout(() => {
          clearInterval(this.state.cooldownInterval);
          this.getData(this.drawChart.bind(this));
        }, 60000);

        this.setState({ loaded: false, cooldownInterval });
      } else {
        // Store data
        data.push(res.data);

        // Init chart after getting data fully
        if (data.length === dataSet.length) {
          this.setState({ data, loaded: true }, () => callback());
        }
      }
    });
  }

  drawChart() {
    // Setup data
    let lineNames = [];
    let yData = [];

    this.state.data.forEach((item, i) => {
      lineNames.push(item[Object.keys(item)[0]]["2: Indicator"]);

      let temp = Object.values(item[Object.keys(item)[1]]).slice(0, 100);
      yData.push(temp.map((item) => +item[Object.keys(item)[0]]))
    });
    
    console.log(lineNames);
    console.log(yData);
    
    // Setup margin
    const { margin, totalWidth, totalHeight } = this.state;

    let wSvg, hSvg;
    wSvg = totalWidth - margin.left - margin.right;
    hSvg = totalHeight - margin.top - margin.bottom;

    // if (this.props.showAxis) {
    //   wSvg = totalWidth - margin.left - margin.right;
    //   hSvg = totalHeight - margin.top - margin.bottom;
    // } else {
    //   wSvg = totalWidth;
    //   hSvg = totalHeight - margin.top;
    // }

    // Init svg
    const svg = d3.select("#lineChart" + this.props.chartName)
                  .append("svg")
                  .attr("width", "100%")
                  .attr("height", hSvg)
                  .attr("viewBox", "0 0 " + totalWidth + " " + totalHeight)
                  .attr("preserveAspectRatio", "none")
                  .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    // const timeParse = d3.timeParse("%Y-%m-%d %H:%M:%S");
    const xScale = d3.scaleTime()
                     .domain([0, 100])
                     .range([0, wSvg]);

    // Y scale

    const maxY = d3.max([d3.max(yData[0]), d3.max(yData[1]), d3.max(yData[2])]);
    const minY = d3.min([d3.min(yData[0]), d3.min(yData[1]), d3.min(yData[2])]);


    const yScale = d3.scaleLinear()
                     .domain([minY, maxY])
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
                   .x((d, i) => xScale(i))
                   .y((d) => yScale(d))
                   .curve(d3.curveMonotoneX);

    // Create area below line
    // const area = d3.area()
    //                .x((d, i) => xScale(i))
    //                .y0(hSvg)
    //                .y1((d) => yScale(d))
    //                .curve(d3.curveMonotoneX);
 
    // Init path
    yData.forEach((item) => {
      svg.append("path")
      .attr("class", "lineChart")
      .attr("fill", "none")
      .attr("stroke", this.props.lineColor)
      .attr("stroke-width", "4px")
      .attr("d", line(item))
    })
        

    // svg.append("path")
    //    .attr("class", "lineChart")
    //    .attr("fill", this.props.areaColor)
    //    .attr("d", area(yData[0]));

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

  // Render "please waiting" when no data is retrieved from Stock API
  renderWaitingForData() {
    return (
      <div className="line-nodata-container text-center">
        <h4 className="pt-5">Please wait...</h4>
        <div className="text-center w-100">
          <div className="spinner-grow text-success" role="status">
            <span className="sr-only" />
          </div>
          <div className="spinner-grow text-success" role="status">
            <span className="sr-only" />
          </div>
          <div className="spinner-grow text-success" role="status">
            <span className="sr-only" />
          </div>
        </div>
        <h3 className="pt-3 pb-2">{this.state.cooldownTime}<span className="p">s</span></h3>
        <p className="px-5 pb-5 text-muted">Due to limitation of 5 times getting stock data per minute, please patiently wait, thank you!</p>
      </div>
    );
  }

  render() {
    if (this.state.loaded) {
      return (
        <div className="li-container">
          {/* <div>
            <h5 className="pt-4 pl-4">
              <p className="text-muted s-15">Last Refreshed: {this.state.data["Meta Data"]["3. Last Refreshed"]}</p>
            </h5>
          </div> */}
          {/* <div className="line-extraInfo">
            <h3 className="d-inline" style={{ "color": this.props.titleColor }}>{this.props.stockSymbol}</h3>
            <h5 className="d-inline"> - {this.props.chartName.split('-')[1]}</h5>
          </div> */}
          <div id={"lineChart" + this.props.chartName}/>
        </div>
      );
    } else {
      return this.renderWaitingForData();
    }
  }
}

// LineIndicators.propTypes = {
//   chartName: PropTypes.string.isRequired,
//   offsetTop: PropTypes.number,
//   stockSymbol: PropTypes.string.isRequired,
//   maxNumberOfData: PropTypes.number.isRequired,
//   dataType: PropTypes.string,
//   showAxis: PropTypes.bool,
//   lineColor: PropTypes.string,
//   areaColor: PropTypes.string,
//   titleColor: PropTypes.string,
// };

//TODO: Tooltip pending
//TODO: Check if need wait bc of demo key
