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
      loaded: false,
      margin: {
        top: 10,
        left: 35,
        right: 20,
        bottom: 45,
      },
      totalWidth: 800,
      totalHeight: 315,
      number: 40,
      resizeEvent: undefined,
      cooldownTime: 60,
      cooldownInterval: undefined
    }
  }

  componentWillMount() {
    // Getting data and draw when data is loaded fully
    this.getData(() => this.drawChart());
  }

  componentDidMount() {
    // Loop interval for resize checking
    const resizeEvent = setInterval(() => {
      const $lssContainer = document.querySelector(".lss-container");

      if ($lssContainer) {
        const currentWidth = $lssContainer.clientWidth;

        if (this.state.totalWidth !== currentWidth) {
          let number = currentWidth > 576 ? 40 : 20;

          this.setState({
            totalWidth: $lssContainer.clientWidth,
            number
          }, () => this.drawChart());
        }
      }
    }, 200);

    this.setState({ resizeEvent });
  }

  componentWillReceiveProps(newProps) {
    if (newProps.stSeries !== this.props.stSeries) {
      this.setState({ loaded: false }, () => this.getData(() => this.drawChart(), newProps));
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.resizeEvent);
  }

  getData = async (callback, newProps=undefined) => {
    let stsSymbol = newProps ? newProps.stSeries : this.props.stSeries;

    // Get data from stock API
    let res = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stsSymbol}&interval=5min&apikey=JDXSSIOOFMWY42SP`);

    // Check if result is valid data or error
    // If fail, then re-attempt to get the data after 1 mins, free API maximum 5 calls per min
    if ((Object.keys(res.data).includes("Error Message")) || (Object.keys(res.data).includes("Note"))) {
      // Set time out for the next attempt
      setTimeout(() => {
        this.getData(() => this.drawChart());
      }, 5000);

      if (this.state.cooldownTime < 60) {
        return;
      }

      // Set interval for counting down for every second
      const cooldownInterval = setInterval(() => {
        let cooldownTime;
        
        if (this.state.cooldownTime > 1) {
          cooldownTime = this.state.cooldownTime - 1;
        } else {
          clearInterval(this.state.cooldownInterval);
          cooldownTime = 60;
        }
        this.setState({ cooldownTime });
      }, 1000);

      this.setState({ loaded: false, cooldownInterval });
    } else {
      clearInterval(this.state.cooldownInterval);
      this.setState({
        data: res.data,
        loaded: true,
        cooldownTime: 60
      }, () => callback());
    }
  }

  drawChart() {
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

    // Store important svg info in state
    const svgInfo = { svg, yScale, xScale, xData, yData };

    // Set state then trigger draw data
    this.setState({ svgInfo }, () => this.drawData());
  }

  drawData() {
    // Get svg info from state
    const {
      svg, yScale, xScale,
      xData, yData
    } = this.state.svgInfo;

    // Init line for trending
    const line = d3.line()
                   .x((d, i) => xScale(xData[i]) + xScale.bandwidth() / 2)
                   .y((d) => yScale(+d[DATA_HIGH]))
                   .curve(d3.curveBasis);

    svg.append("path")
       .attr("d", line(yData))
       .attr("stroke",  "#000")
       .attr("stroke-width", "2px")
       .attr("stroke-dasharray", "5,5")
       .attr("fill", "none");

    // Draw the line for High and Low value
    svg.selectAll("line.stsHighLow")
       .data(yData)
       .enter()
       .append("line")
       .attr("x1", (d, i) => xScale(xData[i]) + xScale.bandwidth() / 2)
       .attr("y1", (d, i) => yScale(+d[DATA_HIGH]))
       .attr("x2", (d, i) => xScale(xData[i]) + xScale.bandwidth() / 2)
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


    // Tooltip
    d3.select("div.STSTooltip").remove();
    const tip = d3.select('body')
                  .append('div')
                  .attr('class', 'STSTooltip')
                  .style('opacity', 0);

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
         if (window.screen.width <= 576) {
           return;
         }

         // Tips showing
         tip.transition().duration(200).style("opacity", 1);

         if (+d[DATA_OPEN] > +d[DATA_CLOSE]) {
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
            +d[DATA_OPEN] > +d[DATA_CLOSE] ? "red" : "green"
           }">${change}%</span></p>`;

           return res;
         }).style("left", () => {
           if (i >= yData.length - 8) {
            return (d3.event.pageX - 150) + "px"; 
           }

           return (d3.event.pageX - 90) + "px";
          })
           .style("top", (d, i) => (d3.event.pageY - 180) + "px");
       })
       .on("mouseout", () => {
         if (window.screen.width <= 576) {
           return;
         }

         // Tips dimming
         tip.transition().duration(200).style("opacity", 0);
       });
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
        <h3 className="pt-3 pb-2">{this.state.cooldownTime}<span className="p">s</span></h3>
        <p className="px-5 pt-3 pb-5 text-muted">Due to limitation of 5 times getting stock data per minute, please patiently wait, thank you!</p>
      </div>
    );
  }

  render() {
    if (this.state.loaded) {
      return (
        <div className="lss-container">
          <div id={"lineChart" + this.props.chartName}/>
        </div>
      );
    } else {
      return this.renderWaitingForData();
    }
  }
}

LineStockSeries.propTypes = {
  chartName: PropTypes.string.isRequired,
  stSeries: PropTypes.string.isRequired
};
