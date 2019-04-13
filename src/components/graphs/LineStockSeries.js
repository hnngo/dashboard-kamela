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
        bottom: 45,
      },
      totalWidth: 800,
      totalHeight: 330,
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
    const xAxis = d3.axisBottom(xScale)
                    .tickFormat((d, i) => {
                      // Only show a few axis values
                      if (i % 3 === 0) {
                        return d.slice(11);
                      } else {
                        return "";
                      }
                    })
                    
    svg.append("g")
       .call(xAxis)
       .attr("transform", `translate(0, ${hSvg})`)
       .style("stroke-width", 0.2)
       .selectAll("text")
          .attr("x", -8)
          .attr("y", 8)
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-50)")

    // Y Axis
    const yAxis = d3.axisLeft(yScale);
    svg.append("g")
       .call(yAxis)
       .style("stroke-width", 0.2);

    // Tooltip
    const tip = d3.select('body')
                  .append('div')
                  .attr('class', 'STSTooltip')
                  .style('opacity', 0);

    // Store important svg info in state
    const svgInfo = { svg, yScale, xScale, timeParse, xData, dataSeries, yData, tip };  

    // Set state then trigger draw data 
    this.setState({ svgInfo }, () => this.drawData());
  }

  drawData() {
    // Get svg info from state
    const {
      svg, yScale, xScale, tip,
      timeParse, xData, dataSeries,
      yData
    } = this.state.svgInfo;


    console.log(yData);

    // Draw the line for High and Low value
    svg.selectAll("line.stsHighLow")
       .data(yData)
       .enter()
       .append("line")
       .attr("x1", (d, i) => xScale(xData[i]) + xScale.bandwidth()/2)
       .attr("y1", (d, i) => yScale(+d[DATA_HIGH]))
       .attr("x2", (d, i) => xScale(xData[i]) + xScale.bandwidth()/2)
       .attr("y2", (d, i) => yScale(+d[DATA_LOW]))
       .attr("stroke", "black")
       .attr("stroke-width", 1);

    // Draw the rect for Open and Close value
    svg.selectAll("rect.stsOpenClose")
       .data(yData)
       .enter()
       .append("rect")
       .attr("x", (d, i) => xScale(xData[i]))
       .attr("y", (d, i) => {
         let res = (+d[DATA_OPEN] >= +d[DATA_CLOSE]) ? +d[DATA_OPEN] : +d[DATA_CLOSE];

         return yScale(res);
       })
       .attr("width", xScale.bandwidth)
       .attr("height", (d, i) => {
          let res = Math.abs(yScale(+d[DATA_OPEN]) - yScale(+d[DATA_CLOSE]));

          return res;
       })
       .attr("fill", (d, i) => {
         return (+d[DATA_OPEN] >= +d[DATA_CLOSE]) ? "red" : "green";
       });

    // Draw the rect to overlay and set mouse event
    svg.selectAll("rect.stsOpenClose")
       .data(yData)
       .enter()
       .append("rect")
       .attr("id", (d, i) => `rectOverlay${i}`)
       .attr("x", (d, i) => xScale(xData[i]))
       .attr("y", (d, i) => yScale(+d[DATA_HIGH]))
       .attr("width", xScale.bandwidth)
       .attr("height", (d, i) => {
         return Math.abs(yScale(+d[DATA_HIGH]) - yScale(+d[DATA_LOW]));
       })
       .attr("fill", "#333")
       .attr("opacity", 0)
       .on("mouseenter", (d, i) => {
         // Tips showing
         tip.transition().duration(200).style("opacity", 1);

         if (+d[DATA_OPEN] >= +d[DATA_CLOSE]) {
           tip.style("border", "2px dashed red");
           tip.style("background-color", "#fcc");
         } else {
           tip.style("border", "2px dashed green");
           tip.style("background-color", "#dafbe4");
         }

         // Tips content
         tip.html(() => {
           let change = (100 * ((+d[DATA_CLOSE]) - (+d[DATA_OPEN]))/(+d[DATA_OPEN])).toFixed(2);

           let res = "";
           res += `<h6>${xData[i]}</h6>`;
           res += `<p>Open: <span>${d[DATA_OPEN]}</span></p>`;
           res += `<p>High&nbsp;: <span>${d[DATA_HIGH]}</span></p>`;
           res += `<p>Low&nbsp;&nbsp;: <span>${d[DATA_LOW]}</span></p>`;
           res += `<p>Close: <span>${d[DATA_CLOSE]}</span></p>`;
           res += `<p>Change: <span style="color:${
            +d[DATA_OPEN] >= +d[DATA_CLOSE] ? "red" : "green"
           }">${change}%</span></p>`;

           return res;
         }).style("left", (d3.event.pageX - 90) + "px")
           .style("top", (d, i) => (d3.event.pageY - 200) + "px");
       })
       .on("mouseout", () => {
         // Tips dimming
         tip.transition().duration(200).style("opacity", 0);
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

//TODO: Small screen
//TODO: Responsive
//TODO: Render no res
//TODO: Add changing data dynamically
