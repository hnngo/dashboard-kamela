import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import axios from 'axios';
import { SINGLE_HEIGHT } from '../../constants';

export default class LineGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: undefined,
      loaded: false,
      margin: {
        top: this.props.offsetTop || 100,
        left: 10,
        right: 10,
        bottom: 10,
      },
      totalWidth: 500,
      totalHeight: +SINGLE_HEIGHT + 62,
      cooldownTime: 60,
      cooldownInterval: undefined,
    }
  }

  componentWillMount() {
    // Get data from API stock then draw chart from that data
    this.getData(this.drawChart.bind(this));
  }

  getData = async (callbackFunc) => {
    // Get data
    let res = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${this.props.stockSymbol}&interval=60min&apikey=KJO1VD3QQ2D7BDOV`);
    
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
      // Init chart after getting data successfully
      this.setState({ 
        loaded: true,
        data: res.data
      }, () => callbackFunc());
    }
  }

  drawChart() {
    // Setup data
    const dataSeries = this.state.data[Object.keys(this.state.data)[1]];
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
                  .attr("width", "100%")
                  .attr("height", hSvg)
                  .attr("viewBox", "0 0 " + totalWidth + " " + totalHeight)
                  .attr("preserveAspectRatio", "none")
                  // .attr("preserveAspectRatio", "xMinYMin meet")
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
       .attr("stroke-width", "4px")
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
        <div className="line-container">
          <div>
            <h5 className="pt-4 pl-4">
              <p className="text-muted s-15">Last Refreshed: {this.state.data["Meta Data"]["3. Last Refreshed"]}</p>
            </h5>
          </div>
          <div className="line-extraInfo">
            <h3 className="d-inline" style={{ "color": this.props.titleColor }}>{this.props.stockSymbol}</h3>
            <h5 className="d-inline"> - {this.props.chartName.split('-')[1]}</h5>
          </div>
          <div id={"lineChart" + this.props.chartName}/>
        </div>
      );
    } else {
      return this.renderWaitingForData();
    }
  }
}

LineGraph.propTypes = {
  chartName: PropTypes.string.isRequired,
  offsetTop: PropTypes.number,
  stockSymbol: PropTypes.string.isRequired,
  maxNumberOfData: PropTypes.number.isRequired,
  dataType: PropTypes.string,
  showAxis: PropTypes.bool,
  lineColor: PropTypes.string,
  areaColor: PropTypes.string,
  titleColor: PropTypes.string,
};

//TODO: Tooltip pending
//TODO: FIXME: Counter clock is not working
