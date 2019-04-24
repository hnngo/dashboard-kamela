import React, { Component } from 'react';
import * as d3 from 'd3';
import SlideChoice from '../SlideChoice';

export default class LineExchangeGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      svgInfo: undefined,
      data: this.props.data,
      margin: {
        top: 55,
        bottom: 20,
        left: 60,
        right: 20
      },
      totalWidth: 500,
      totalHeight: 375,
      number: 90,
      resizeEvent: undefined
    }
  }

  componentWillMount() {
    // Filter data before drawing
    this.filterData(this.state.data, () => this.drawChart());
  }

  componentDidMount() {
    // Loop interval for resize checking
    const resizeEvent = setInterval(() => {
      const $fxeGraph = document.querySelector(".fxe-graph-container");

      if ($fxeGraph) {
        const currentWidth = $fxeGraph.clientWidth;

        if (this.state.totalWidth !== currentWidth) {
          this.setState({ 
            totalWidth: $fxeGraph.clientWidth
          }, () => this.drawChart());
        }
      }
    }, 200);

    this.setState({ resizeEvent });
  }

  componentWillUnmount() {
    // Clear interval before unmounting
    clearInterval(this.state.resizeEvent);
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

    this.setState({ data }, () => {
      if (callback) {
        callback();
      }
    });
  }

  handleSelectSector(select) {
    let numberOfData = 0;
    switch(select) {
      case "1W":
        numberOfData = 7;
        break;
      case "1M":
        numberOfData = 30;
        break;
      case "3M":
        numberOfData = 90;
        break;
      case "1Y":
        numberOfData = 365;
        break;
      default:
        numberOfData = undefined;
        break;
    }

    if (this.state.number !== numberOfData) {
      this.setState({ number: numberOfData }, () => this.drawChart());
    }
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
    let divide = Math.floor(yData.length / 5);
    let xAxisVal = [];
    xData.forEach((item, i) => {
      if (i % divide === 0 || i === yData.length - 1) {
        xAxisVal.push(timeParse(item))
      }
    })

    const xAxis = d3.axisBottom(xScale)
                    .tickValues(xAxisVal)
                    .tickFormat((d) => d.toDateString().slice(4, 10))
                    

    svg.append("g")
      .call(xAxis)
      .attr("transform", `translate(0, ${hSvg})`)
      .style("stroke-width", 0.2);

    // Y Axis
    const yAxis = d3.axisLeft(yScale)       
                    .tickFormat((d, i) => {
                        // Format the right value
                        if (d > 10000000) {
                          return d.toString().slice(0, -6) + "M"
                        } else if (d > 10000) {
                          return d.toString().slice(0, -3) + "K"
                        } else if (d > 1000) {
                          return d.toFixed(0);
                        } else {
                          return d;
                        }
                      });

    svg.append("g")
      .call(yAxis)
      .style("stroke-width", 0);

    // Line's generator
    const line = d3.line()
                   .x((d, i) => xScale(timeParse(xData[i])))
                   .y((d) => yScale(d));

    // Create area below line
    const area = d3.area()
                   .x((d, i) => xScale(timeParse(xData[i])))
                   .y0(hSvg)
                   .y1((d) => yScale(d));

    // Store important svg info in state
    const svgInfo = { svg, yScale, xScale, xData, yData, timeParse, hSvg, line, area };

    // Set state then trigger draw data
    this.setState({ svgInfo }, () => this.drawData());
  }

  drawData() {
    const { svg, yScale, xScale, xData, yData, timeParse, hSvg, line, area } = this.state.svgInfo;

    // Init path
    svg.append("path")
       .attr("class", "lineChart")
       .attr("fill", "none")
       .attr("stroke", "#333")
       .attr("stroke-width", "2px")
       .attr("d", line(yData))
       
    svg.append("path")
       .attr("class", "lineChart")
       .attr("fill", "#a3a3a3")
       .attr("opacity", 0.5)
       .attr("d", area(yData));

    svg.selectAll("rect.rectArea")
       .data(yData)
       .enter()
       .append("rect")
       .attr("class", "rectArea")
       .attr("x", (d, i) => {
         if (i === 0) {
           return xScale(timeParse(xData[i]));
         } else {
           return xScale(timeParse(xData[i - 1])) + (xScale(timeParse(xData[i])) - xScale(timeParse(xData[i - 1]))) / 2;
         }
        })
       .attr("y", 0)
       .attr("width", (d, i) => {
        if (i === 0) {
          return (xScale(timeParse(xData[1])) - xScale(timeParse(xData[0]))) / 2;
        } else if (i === yData.length - 1) {
          return (xScale(timeParse(xData[i])) - xScale(timeParse(xData[i - 1]))) / 2;
        } else {
          return (xScale(timeParse(xData[i + 1])) - xScale(timeParse(xData[i - 1]))) / 2;
        }
       })
       .attr("height", hSvg)
       .attr("stroke", "#c2c3c4")
       .attr("stroke-width", "0.1px")
       .attr("fill", "grey")
       .attr("opacity", 0)
       .on("mouseenter", (d, i) => {
         // Show lines
         d3.select(".rectLine" + this.props.chartKey + i).attr("opacity", 1);

         // Show circles
         d3.select(".circle" + this.props.chartKey + i).attr("opacity", 1);
       })
       .on("mouseleave", (d, i) => {
         // Hide lines
         d3.select(".rectLine" + this.props.chartKey + i).attr("opacity", 0);

         // Hide circles
         d3.select(".circle" + this.props.chartKey + i).attr("opacity", 0);
       })

    svg.selectAll(`rect[class^="rectLine${this.props.chartKey}"]`)
       .data(yData)
       .enter()
       .append("rect")
       .attr("class", (d, i) => "rectLine" + this.props.chartKey + i)
       .attr("x", (d, i) => xScale(timeParse(xData[i])))
       .attr("y", (d) => yScale(d))
       .attr("width", 1)
       .attr("height", (d) => hSvg - yScale(d))
       .attr("stroke", "#333")
       .attr("stroke-width", "0.3px")
       .attr("opacity", 0);

   svg.selectAll("circle")
      .data(yData)
      .enter()
      .append("circle")
      .attr("class", (d, i) => "circle" + this.props.chartKey + i)
      .attr("cx", (d, i) => xScale(timeParse(xData[i])))
      .attr("cy", (d, i) => yScale(d))
      .attr("r", 4)
      .attr("stroke", "#333")
      .attr("opacity", 0)
      //  .attr("stroke-width", "1px")
  }

  render() {
    return (
      <div className="pr-3 pb-3">
        <div className="le-slidechoice">
          <SlideChoice
            slideKey={this.props.chartKey}
            onSelect={(item) => this.handleSelectSector(item)}
            smallSlide={false}
            selections={["1W", "3M", "1Y", "Max"]}
            optionChoice={2}
          />
        </div>
        <div id={"lineChart" + this.props.chartKey} />
      </div>
    );
  }
}
