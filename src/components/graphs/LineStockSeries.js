import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import axios from 'axios';
import {
  DATA_LOW,
  DATA_HIGH,
  DATA_CLOSE,
  DATA_OPEN,
} from '../../constants';

export default class LineStockSeries extends Component {
  constructor(props) {
    super(props);

    this.state = {
      svgInfo: undefined,
      data: undefined,
      loaded: false, // Temporarily
      margin: {
        top: 10,
        left: 45,
        right: 20,
        bottom: 100,
      },
      totalWidth: 800,
      totalHeight: 400,
      number: 40,
      resizeEvent: undefined
    }
  }

  componentWillMount() {
    // Getting data and draw when data is loaded fully
    this.getData(this.props.stSeries, () => this.drawChart());
  }

  componentDidMount() {
    // Loop interval for resize checking
    // const resizeEvent = setInterval(() => {
    //   const $tiContainer = document.querySelector(".ti-container");

    //   if ($tiContainer) {
    //     const currentWidth = $tiContainer.clientWidth;

    //     if (this.state.totalWidth !== currentWidth) {
    //       let number = currentWidth > 576 ? this.state.number : 50;

    //       this.setState({ 
    //         totalWidth: $tiContainer.clientWidth,
    //         loaded: false,
    //         number
    //       }, () => this.getData(this.props.tiType, () => this.drawChart()));
    //     }
    //   }
    // }, 200);

    // this.setState({ resizeEvent });
  }

  componentWillUnmount() {
    // clearInterval(this.state.resizeEvent);
  }

  componentWillReceiveProps(newProps) {
    // if (newProps.tiType !== this.props.tiType) {
    //   this.setState({ loaded: false }, () => {
    //     this.getData(newProps.tiType, () => this.drawChart());
    //   })
    // }
  }

  getData = async (APILink, callback) => {
    // Get data from stock API
    let res = await axios.get(APILink);

    // Check if result is valid data or error
    // If fail, then re-attempt to get the data after 1 mins, free API maximum 5 calls per min
    if ((Object.keys(res.data).includes("Error Message")) || (Object.keys(res.data).includes("Note"))) {
      // Set time out for the next attempt
      setTimeout(() => {
        this.getData(this.props.tiType, () => this.drawChart());
      }, 5000);

      this.setState({ loaded: false });
    } else {
      this.setState({
        data: res.data,
        loaded: true
      }, () => callback());
    }
  }

  drawChart() {
    console.log(this.state.data);

    // If re-draw from old data then remove before re-draw
    if (this.state.svgInfo) {
      d3.select("#lineChart" + this.props.chartName + " svg").remove();
    }

    // Setup data
    const dataSeries = this.state.data[Object.keys(this.state.data)[1]];
    const xData = Object.keys(dataSeries).slice(0, this.state.number).reverse();
    const yData = xData.map((item) => dataSeries[item]);

    // Setup margin
    const { margin, totalWidth, totalHeight } = this.state;
    let wSvg = totalWidth - margin.left - margin.right;
    let hSvg = totalHeight - margin.top - margin.bottom;

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
    
    console.log("xData", xData)
    const timeParse = d3.timeParse("%Y-%m-%d %H:%M:%S");
    // const xScale = d3.scaleTime()
    //                  .domain([timeParse(xData[0]), timeParse(xData[xData.length - 1])])
    //                  .range([0, wSvg]);
    const xScale = d3.scaleBand()
                     .domain(xData)
                     .range([0, wSvg])
                     .paddingInner(0.2)
                     .paddingOuter(0.2)

    // Define range of Y-axis
    let yLowArr = [], yHighArr = [];
    xData.forEach((item) => {
      yLowArr.push(+dataSeries[item][DATA_LOW]);
      yHighArr.push(+dataSeries[item][DATA_HIGH]);
    });

    // Y scale
    const yScale = d3.scaleLinear()
                     .domain([d3.min(yLowArr) - 0.1, d3.max(yHighArr) + 0.1])
                     .range([hSvg, 0]);

    // X Axis
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
       .call(xAxis)
       .attr("transform", `translate(0, ${hSvg})`)
       .style("stroke-width", 0.2)
       .selectAll("text")
          .attr("x", -5)
          .attr("y", 10)
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-50)");

    // Y Axis
    const yAxis = d3.axisLeft(yScale);
    svg.append("g")
       .call(yAxis)
       .style("stroke-width", 0.2);

    // Store important svg info in state
    const svgInfo = { svg, yScale, xScale, timeParse, xData, dataSeries, yData };  

    // Set state then trigger draw data 
    this.setState({ svgInfo }, () => this.drawData());
  }

  drawData() {
    // Get svg info from state
    const {
      svg, yScale, xScale,
      timeParse, xData, dataSeries,
      yData
    } = this.state.svgInfo;

    // Line Division for better visuallization
    // let lines = [];
    // let linesTemp = {
    //   pattern: undefined,
    //   points: []
    // };
    // let yData= [];
    // yData.forEach((item, i) => {
    //   if (i === 0) {
    //     linesTemp.pattern = item >= 0 ? "positive" : "negative";
    //     linesTemp.points.push({ x: 0, y: item });
    //   } else if (i === yData.length - 1) {
    //     linesTemp.points.push({ x: i, y: item });
    //     lines.push(linesTemp);
    //   } else if ((item >= 0 && linesTemp.pattern === "positive") || (item < 0 && linesTemp.pattern === "negative")) {
    //     linesTemp.points.push({ x: i, y: item });
    //   } else if ((item >= 0 && linesTemp.pattern === "negative") || (item < 0 && linesTemp.pattern === "positive")) {
    //     // Set the x connector smooth
    //     let x2 = i, y2 = item;
    //     let x1 = i - 1, y1 = linesTemp.points[linesTemp.points.length - 1].y;
    //     let xConnect =  (x2 * y1 - x1 * y2) / (y1 -y2);

    //     linesTemp.points.push({ x: xConnect, y: 0 });
    //     lines.push(linesTemp);

    //     linesTemp = {
    //       pattern: undefined,
    //       points: []
    //     };

    //     linesTemp.pattern = lines[lines.length - 1].pattern === "positive" ? "negative" : "positive";
    //     linesTemp.points = [
    //       { x: xConnect, y: 0 },
    //       { x: i, y: item }
    //     ];
    //   }
    // });

     // Init line
     const line = d3.line()
                    .x((d, i) => xScale(xData[i]))
                    .y((d) => yScale(d))
                    // .curve(d3.curveMonotoneX);

    console.log(yData);
    let yOpen = yData.map((item) => +item[DATA_OPEN])
    let yClose = yData.map((item) => +item[DATA_CLOSE])
    let yHigh = yData.map((item) => +item[DATA_HIGH])
    let yLow = yData.map((item) => +item[DATA_LOW])

    //  svg.append("path")
    //     .attr("class", "lineChart")
    //     .attr("fill", "none")
    //     .attr("d", line(yOpen))
    //     .attr("stroke", "#000")
    //     .attr("stroke-width", "1px")
    console.log(yOpen);
    console.log(yClose);
    svg.selectAll("rect.stsOpenClose")
       .data(yData)
       .enter()
       .append("rect")
       .attr("x", (d, i) => xScale(xData[i]))
       .attr("y", (d, i) => {
         let res = (yOpen[i] >= yClose[i]) ? yOpen[i] : yClose[i];

         return yScale(res);
       })
       .attr("width", xScale.bandwidth)
       .attr("height", (d, i) => {
          let res = Math.abs(yScale(yOpen[i]) - yScale(yClose[i]));

          return res;
       })
       .attr("fill", (d, i) => {
         return (yOpen[i] >= yClose[i]) ? "red" : "green";
       });


    // Init area below line
    // const area = d3.area()
    //               .x((d) => xScale(d.x))
    //               .y0(hSvg/2)
    //               .y1((d) => yScale(d.y))
    //               // .curve(d3.curveBasis);

    // Calculate the peak values of each range
    // const peaks = lines.map((item) => {
    //   let maxVal, peakVal, res;

    //   if (item.pattern === "positive") {
    //     maxVal = d3.max(Object.values(item.points).map((p) => p.y))
    //   } else if (item.pattern === "negative") {
    //     maxVal = d3.min(Object.values(item.points).map((p) => p.y))
    //   }

    //   peakVal = item.points.filter((d) => d.y === maxVal);
    //   res = { ...item };
    //   res.points = peakVal;
    //   return res;
    // });

    // Erase old data
    // svg.selectAll("path.sts").remove();


    // Draw area
    // svg.selectAll("path.tiArea")
    //    .data(lines)
    //    .enter()
    //    .append("path")
    //    .attr("class", "tiArea")
    //    .attr("id", (d, i) => `${this.props.chartName}area${i}`)
    //    .attr("fill", "white")
    //    .attr("d", (d) => area(d.points))
    //    .style("opacity", 0.4)
    //    .on("mousemove", (d, i) => {
    //      d3.select(`#${this.props.chartName}area${i}`).attr("fill", d.pattern === "positive" ? "green" : "red");

    //      // Show peak value info
    //      ["circle", "line", "text"].forEach(item => {
    //        d3.select(`${item}.${this.props.chartName}${item}${i}`).attr("display", "block");
    //      });
    //    })
    //    .on("mouseout", (d, i) => {
    //      d3.select(`#${this.props.chartName}area${i}`).attr("fill", "white");
         
    //      // Hide peak value info
    //      ["circle", "line", "text"].forEach(item => {
    //        d3.select(`${item}.${this.props.chartName}${item}${i}`).attr("display", "none");
    //      });
    //    })

    // // Draw peak value information
    // peaks.forEach((peak, i) => {
    //   // Peak circle
    //   svg.selectAll(`circle.${this.props.chartName}circle${i}`)
    //     .data(peak.points)
    //     .enter()
    //     .append("circle")
    //     .attr("class", `${this.props.chartName}circle${i}`)
    //     .attr("cx", (d) => xScale(d.x))
    //     .attr("cy", (d) => yScale(d.y))
    //     .attr("r", (d) => d.y !== 0 ? 4 : 0)
    //     .attr("fill", "none")
    //     .attr("display", "none")
    //     .attr("stroke", (d) => {
    //       return d.y >= 0 ? "green" : "red";
    //     })
    //     .attr("stroke-width", 3);
      
    //   // Peak line to y-Axis
    //   svg.selectAll(`line.${this.props.chartName}line${i}`)
    //     .data(peak.points)
    //     .enter()
    //     .append("line")
    //     .attr("class", `${this.props.chartName}line${i}`)
    //     .attr("x1", xScale(-1))
    //     .attr("y1", (d) => yScale(d.y))
    //     .attr("x2", (d) => xScale(d.x))
    //     .attr("y2", (d) => yScale(d.y))
    //     .attr("stroke", "black")
    //     .attr("stroke-width", 0.5)
    //     .attr("stroke-dasharray", "5,5")
    //     .attr("display", "none");
      
    //   // Peak text value
    //   svg.selectAll(`text.${this.props.chartName}text${i}`)
    //     .data(peak.points)
    //     .enter()
    //     .append("text")
    //     .attr("class", `${this.props.chartName}text${i}`)
    //     .attr("x", (d) => xScale(d.x))
    //     .attr("y", (d) => {
    //       if (d.y >= 0) {
    //         return yScale(d.y) - 10;
    //       } else {
    //         return yScale(d.y) + 20;
    //       }
    //     })
    //     .attr("text-anchor", "middle")
    //     .attr("font-size", "12px")
    //     .text((d) => d.y)
    //     .attr("display", "none");
    // });
  }

  // Render "please waiting" when no data is retrieved from Stock API
  renderWaitingForData() {
    return (
      <div className="line-nodata-container text-center w-100">
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
        <p className="px-5 pt-3 pb-5 text-muted">Due to limitation of 5 times getting stock data per minute, please patiently wait, thank you!</p>
      </div>
    );
  }

  render() {
    if (this.state.loaded) {
      return (
        <div className="ti-container">
          <div id={"lineChart" + this.props.chartName}/>
        </div>
      );
    } else {
      return <div />
      return this.renderWaitingForData();
    }
  }
}

// LineIndicators.propTypes = {
//   chartName: PropTypes.string.isRequired,
//   tiType: PropTypes.string.isRequired
// };

//TODO: On small screen draw less number of data
//TODO: Correct the width to have rounded circle
