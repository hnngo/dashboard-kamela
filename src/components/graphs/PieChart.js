import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import _ from 'lodash';
import { STOCK_INDUSTRY } from '../../constants';

export default class PieChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      resizeEvent: undefined,
      smallScreen: false,
      prevWidth: undefined,
      totalWidth: 465,
      totalHeight: 220,
      radius: 100,
      svgInfo: undefined,
      pieData: undefined,
      toggleDraw: false,
    };

    this.drawData = this.drawData.bind(this);
  }

  componentWillMount() {
    // Loop interval for resize checking
    const resizeEvent = setInterval(() => {
      const currentWidth = window.screen.width;
      let smallScreen, prevWidth = undefined, setState = false;

      // Checking for show Top company info
      if ((currentWidth <= 576) && (currentWidth !== this.state.prevWidth)) {
        setState = true;
        smallScreen = true;
        prevWidth = currentWidth;
      } else if ((currentWidth > 576) && (this.state.smallScreen)) {
        setState = true;
        smallScreen = false;
      }

      if (setState) {
        this.setState({ prevWidth, smallScreen }, () => this.drawData());
      }
    }, 200);

    // Init the data by type then draw chart
    this.setState({
      resizeEvent,
      prevWidth: window.screen.width,
      smallScreen: window.screen.width <= 576 ? true : false,
      pieData: _.countBy(this.props.data, (d) => d[this.props.sortType]) 
    }, () => this.drawChart());
  }

  componentWillUnmount() {
    clearInterval(this.state.resizeEvent);
  }

  componentWillReceiveProps(newProps) {
    // Check if pie chart receive new sort type or new data props
    // Then re-draw the data before rendering
    if (this.props.sortType !== newProps.sortType) {
      const oldPieData = this.state.pieData;
      this.setState({ 
        pieData: _.countBy(this.props.data, (d) => d[newProps.sortType]) 
      }, () => this.drawData(oldPieData));
    } else if (this.props.data.length !== newProps.data.length) {
      const oldPieData = this.state.pieData;
      this.setState({ 
        pieData: _.countBy(newProps.data, (d) => d[this.props.sortType]) 
      }, () => this.drawData(oldPieData));
    }
  }
  
  drawChart() {
    // Init svg
    const svg = d3.select("#pieChart" + this.props.chartName)
                  .append("svg")
                  .style("width", this.state.totalWidth)
                  .style("height", this.state.totalHeight)
                  .append("g")
                    .attr("transform", "translate(" + (this.state.radius) + "," + (this.state.totalHeight / 2) + ")");

    // Init pie
    const pie = d3.pie().value((d) => d).sort(null)

    // Init arc
    const arc = d3.arc()
                  .innerRadius(this.state.radius - 40)
                  .outerRadius(this.state.radius - 5);
              
    // Init legends
    const legend = svg.append("g")
    // .attr("transform", "translate(" + (this.state.radius + 20) + "," + (-this.state.totalHeight/2 + 20) + ")");

    // Tooltip
    const tip = d3.select('body')
                  .append('div')
                  .attr('class', 'PieTooltip')
                  .style('opacity', 0);

    // Init number
    const tipNum = svg.append("g")
                      .attr("transform", "translate(0, 15)")
                      .append("text")
                      .attr("x", 0)
                      .attr("y", 0)
                      .style("color", "black")
                      .style("text-anchor", "middle")
                      .style("font-size", "50px");
    
    const svgInfo = { svg, pie, arc, tip, legend, tipNum };

    this.setState({ svgInfo }, () => this.drawData());
  }

  prepareData(oldPieData=false) {
    // Prepare data for drawing
    let data = this.state.pieData;
    let keyData = Object.keys(data).sort((a, b) => data[b] - data[a]);
    let valueData = keyData.map((item) => data[item]);

    // Check if data more than 9, out of color range
    // Then set all the data to Others
    if (keyData.length > 9) {
      keyData.splice(8);
      keyData.push("Others");

      valueData.splice(8);
      valueData.push(1);
    }

    // For better transition, merging with old values
    if (oldPieData) {
      while (valueData.length < Object.values(oldPieData).length) {
        valueData.push(0);
      }
    }
    
    // Calculating percentage for tooltips
    const sum = valueData.reduce((acc, cur) => acc + cur);
    const percentageArr = valueData.map((item) => Math.floor(item * 100 / sum, 0));

    // Passing props to parents
    this.props.getTopType(keyData[0]);

    return [keyData, valueData, percentageArr];
  }

  drawData(oldPieData=false) {
    // Get svg informaiton
    const {
      svg, pie, arc, legend, tip, tipNum
    } = this.state.svgInfo;

    // Check if small width then translate svg and g to fit screen width
    if (this.state.smallScreen) {
      d3.select("#pieChart" + this.props.chartName + " svg")
        .style("height", 420);

      svg.attr("transform", "translate(" + (window.screen.width / 2 - 30) + "," + (this.state.radius) + ")");

      legend.attr("transform", "translate(" + (-this.state.radius + 10) + "," + (this.state.totalHeight - 70) + ")");
    } else {
      d3.select("#pieChart" + this.props.chartName + " svg")
        .style("height", this.state.totalHeight);

      svg.attr("transform", "translate(" + (this.state.radius) + "," + (this.state.totalHeight/2) + ")");

      legend.attr("transform", "translate(" + (this.state.radius + 20) + "," + (-this.state.totalHeight/2 + 20) + ")");
    }

    // Get data
    let [keyData, valueData] = this.prepareData(oldPieData)

    // Color scale
    const colorScale = d3.scaleOrdinal()
                         .domain(keyData)
                         .range(this.props.colorCode);

    // Remove old legends
    legend.selectAll(`.${this.props.chartName}circle`).remove();
    legend.selectAll(`.${this.props.chartName}text`).remove();

    // Add new legends
    const legendCategory = this.props.sortType === STOCK_INDUSTRY ? "Top Industry" : "Top Sector";

    legend.append("text")
          .attr("transform", "translate(70, -10)")
          .attr("x", 10)
          .attr("y", 6)
          .style("color", "black")
          .style("font-weight", "bold")
          .attr("class", this.props.chartName + "text")
          .attr("text-anchor", "middle")
          .text(legendCategory);

    keyData.forEach((item, i) => {
      if (item.startsWith("Computer Software")) {
        item = "Computer Software";
      }

      const legendRow = legend.append("g")
                              .attr("transform", "translate(0," + (i * 20 + 20) + ")");
      
      legendRow.append("circle")
               .attr("cx", 2)
               .attr("cx", 0)
               .attr("r", 6)
               .attr("class", this.props.chartName + "circle")
               .style("fill", colorScale(keyData[i]))
               .attr("stroke", "#867979")
               .attr("stroke-width", 0.5)
               .style("cursor", "pointer");

      legendRow.append("text")
                .attr("x", 10)
                .attr("y", 6)
                .style("color", "black")
                .style("font-size", "15px")
                .attr("class", this.props.chartName + "text")
                .text(item)
    });

    // Draw data
    const path = svg.selectAll("path")
                    .data(pie(valueData));
                 
    // Update existing arcs
    path.transition().duration(300).attrTween("d", arcTween)
    
    // Exit old elements                    
    path.exit().remove();
    
    // Enter new arcs
    path.enter()
        .append("path")
        .attr("fill", (d, i) => colorScale(keyData[i]))
        .attr("d", arc)
        .attr("stroke", "white")
        .attr("stroke-width", "2px")
        .each(function(d) { this._current = d; })
        .on("mousemove", (d, i) => {
          // Get the prepared data
          let [ key, , percentage ] = this.prepareData(oldPieData);

          if (key[i] && key[i].startsWith("Computer Software")) {
            key[i] = "Computer Software";
          }

          // Tips showing
          tip.transition().duration(200).style("opacity", .9);
          
          // Tips content
          tip.html(() => {
             let res= `<svg height="15" width="15"  style="margin: 10px 10px">`;
             res += `<rect width="15" height="15"  style="fill:${colorScale(keyData[i])};" />`;
             res += `<span class="my-0">${key[i]}</span></svg>`;
 
             return res;
          }).style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 40) + "px");

            tipNum.text(percentage[i] + "%")
        })
        .on("mouseout", (d) => {
          // Tips dimming
          tip.transition().duration(200).style("opacity", 0);

          //
          tipNum.text("");
        });

    function arcTween(a) {
      const i = d3.interpolate(this._current, a);
      this._current = i(1);
      return (t) => arc(i(t));
    }
  }

  render() {
    return (
      <div className="pie-container">
        <div id={"pieChart" + this.props.chartName}/>
      </div>
    );
  }
}

PieChart.propTypes = {
  chartName: PropTypes.string.isRequired
};

//TODO: Show tooltips inside pie chart
//TODO: Find way to show percentage on small screen
