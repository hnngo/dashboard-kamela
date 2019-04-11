import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import axios from 'axios';

export default class LineIndicators extends Component {
  constructor(props) {
    super(props);

    this.state = {
      svgInfo: undefined,
      data: undefined,
      loaded: true, // Temporarily
      margin: {
        top: 10,
        left: 30,
        right: 20,
        bottom: 30,
      },
      totalWidth: 800,
      totalHeight: 300,
      cooldownTime: 60,
      cooldownInterval: undefined,
      number: 100,
    }
  }

  componentWillMount() {
    // Getting data and draw when data is loaded fully
    this.getData(this.props.tiType, () => this.drawChart());
  }

  componentWillReceiveProps(newProps) {
    if (newProps.tiType !== this.props.tiType) {
      this.getData(newProps.tiType, () => this.drawData());
    }
  }

  getData = async (APILink, callback) => {
    // Get data from stock API
    let res = await axios.get(APILink);

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
      this.setState({ 
        data: res.data,
        loaded: true 
      }, () => callback());
    }
  }

  drawChart() {
    // Setup margin
    const { margin, totalWidth, totalHeight } = this.state;
    let wSvg, hSvg;
    wSvg = totalWidth - margin.left - margin.right;
    hSvg = totalHeight - margin.top - margin.bottom;

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
    const xScale = d3.scaleTime()
                     .domain([-1, this.state.number])
                     .range([0, wSvg]);

    // Y scale
    const yScale = d3.scaleLinear()
                     .range([hSvg, 0]);
    
    // X Axis
    const xAxis = d3.axisBottom(xScale).tickValues([]);
    svg.append("g")
       .call(xAxis)
       .attr("transform", `translate(0,${hSvg/2})`)
       .style("stroke-width", 0.1);
      
    // Y Axis
    // const yAxis = d3.axisLeft(yScale);
    const yAxisGroup = svg.append("g")
                        //  .call(yAxis)
                          .style("stroke-width", 0.2);
                        
    const svgInfo = { svg, yScale, xScale, yAxisGroup, hSvg };

    this.setState({ svgInfo }, () => this.drawData());
  }

  drawData() {
    const {
      svg, yScale, xScale, yAxisGroup, hSvg
    } = this.state.svgInfo;

    // Setup data
    const { data } = this.state;
    let temp = Object.values(data[Object.keys(data)[1]]).slice(0, this.state.number);
    let yData = temp.map((item) => +item[Object.keys(item)[0]]).reverse();
    
    // Define range of Y-axis
    const maxY = d3.max(yData);
    const minY = d3.min(yData);

    if (minY >= 0) {
      yScale.domain([-maxY - 15, maxY + 15]);
    } else if (-minY < maxY) {
      yScale.domain([-maxY - 15, maxY + 15]);
    } else {
      yScale.domain([minY - 15, -minY + 15]);
    }
    yAxisGroup.call(d3.axisLeft(yScale));

    // Line Division
    let lines = [];
    let linesTemp = {
      pattern: undefined,
      points: []
    };

    yData.forEach((item, i) => {
      if (i === 0) {
        linesTemp.pattern = item >= 0 ? "positive" : "negative";
        linesTemp.points.push({ x: 0, y: item });
      } else if (i === yData.length - 1) {
        linesTemp.points.push({ x: i, y: item });
        lines.push(linesTemp);
      } else if ((item >= 0 && linesTemp.pattern === "positive") || (item < 0 && linesTemp.pattern === "negative")) {
        linesTemp.points.push({ x: i, y: item });
      } else if ((item >= 0 && linesTemp.pattern === "negative") || (item < 0 && linesTemp.pattern === "positive")) {
        linesTemp.points.push({ x: i - 0.5, y: 0 });
        lines.push(linesTemp);

        linesTemp = {
          pattern: undefined,
          points: []
        };

        linesTemp.pattern = lines[lines.length - 1].pattern === "positive" ? "negative" : "positive";
        linesTemp.points = [
          { x: i - 0.5, y: 0 }, 
          { x: i, y: item }
        ];
      }
    });

    // Init line
    const line = d3.line()
                    .x((d) => xScale(d.x))
                    .y((d) => yScale(d.y))
                    // .curve(d3.curveBasis);               
    // Init area
    const area = d3.area()
                  .x((d) => xScale(d.x))
                  .y0(hSvg/2)
                  .y1((d) => yScale(d.y))
                  // .curve(d3.curveBasis);
      
    // Erase old data
    svg.selectAll("path.ti").remove();
    svg.selectAll("path.tiArea").remove();
    svg.selectAll("circle").remove();
    svg.selectAll("line").remove();
    svg.selectAll(`text[class^="${this.props.chartName}"]`).remove();

    // Draw lines
    svg.selectAll("path.ti")
        .data(lines)
        .enter()
        .append("path")
        .attr("class", "ti")
        .attr("fill", "none")
        .attr("d", (d) => line(d.points))
        .attr("stroke",  (d) => {
          if (d.pattern >= "positive") {
            return "green";
          } else {
            return "red";
          }
        })
        .attr("stroke-width","3px");

    // Draw area first to get lower z-index
    svg.selectAll("path.tiArea")
       .data(lines)
       .enter()
       .append("path")
       .attr("class", "tiArea")
       .attr("id", (d, i) => `${this.props.chartName}area${i}`)
       .attr("fill", "white")
       .attr("d", (d) => area(d.points))
       .style("opacity", 0.4)
       .on("mousemove", (d, i) => {
         d3.select(`#${this.props.chartName}area${i}`).attr("fill", d.pattern === "positive" ? "green" : "red");
         
         d3.select(`circle.${this.props.chartName}circle${i}`).attr("display", "block");

         d3.select(`line.${this.props.chartName}line${i}`).attr("display", "block");

         d3.select(`text.${this.props.chartName}text${i}`).attr("display", "block");
       })
       .on("mouseout", (d, i) => {
         d3.select(`#${this.props.chartName}area${i}`).attr("fill", "white");

         d3.select(`circle.${this.props.chartName}circle${i}`).attr("display", "none");

         d3.select(`line.${this.props.chartName}line${i}`).attr("display", "none");

         d3.select(`text.${this.props.chartName}text${i}`).attr("display", "none");
       })
      //  .on("mouseenter", (d) => console.log(d));

    const peaks = lines.map((item) => {
      let maxVal, peakVal, res;

      if (item.pattern === "positive") {        
        maxVal = d3.max(Object.values(item.points).map((p) => p.y))
      } else if (item.pattern === "negative") {   
        maxVal = d3.min(Object.values(item.points).map((p) => p.y))
      }

      peakVal = item.points.filter((d) => d.y === maxVal);
      res = { ...item };
      res.points = peakVal;
      return res;
    });

    // Draw data dot circle
    peaks.forEach((peak, i) => {
      svg.selectAll(`circle.${this.props.chartName}circle${i}`)
        .data(peak.points)
        .enter()
        .append("circle")
        .attr("class", `${this.props.chartName}circle${i}`)
        .attr("cx", (d) => xScale(d.x))
        .attr("cy", (d) => yScale(d.y))
        .attr("r", (d) => d.y !== 0 ? 4 : 0)
        .attr("fill", "none")
        .attr("display", "none")
        .attr("stroke", (d) => {
          return d.y >= 0 ? "green" : "red";
        })
        .attr("stroke-width", 3);

      svg.selectAll(`line.${this.props.chartName}line${i}`)
        .data(peak.points)
        .enter()
        .append("line")
        .attr("class", `${this.props.chartName}line${i}`)
        .attr("x1", xScale(-1))
        .attr("y1", (d) => yScale(d.y))
        .attr("x2", (d) => xScale(d.x))
        .attr("y2", (d) => yScale(d.y))
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "5,5")
        .attr("display", "none");

      svg.selectAll(`text.${this.props.chartName}text${i}`)
        .data(peak.points)
        .enter()
        .append("text")
        .attr("class", `${this.props.chartName}text${i}`)
        .attr("x", (d) => xScale(d.x))
        .attr("y", (d) => {
          if (d.y >= 0) {
            return yScale(d.y) - 5;
          } else {
            return yScale(d.y) + 15;
          }
        })
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text((d) => d.y)
        .attr("display", "none");
    });
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
//TODO: Show activities indicator when waiting
//TODO: Fix mousemove in other data
//TODO: On small screen draw less number of data
//TODO: Correct the width to have rounded circle
//TODO: With top peak stroke only not fill

