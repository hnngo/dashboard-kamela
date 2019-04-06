import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import _ from 'lodash';

export default class PieChart extends Component {
  constructor(props) {
    super(props);

    const filteredData = this.props.data.map((item) => {
      // Get filtered sections
      let strCap = item.smcap.slice(1, item.smcap.length - 2);
      let newSmcap = item.smcap.charAt(item.smcap.length - 1) === "B" ? +strCap * 1000000000 : +strCap * 1000000;

      return { ...item, smcap: newSmcap }
    });

    // console.log(filteredData);

    const catIndustry = _.uniq(filteredData.map((item) => item.stock_industry));

    // console.log(catIndustry)

    const catIndustrySorted = _.sortBy(filteredData, [(d) => d.smcap]);

    // console.log(catIndustrySorted)


    this.state = {
      filteredData,
      totalWidth: 180,
      totalHeight: 180,
      svgInfo: undefined
    };
  }

  componentDidMount() {
    this.drawChart();
  }

  drawChart() {
    let data = [12,23,21,34,23,43,54,65,32]
    // Calculate the max radius
    const maxRadius = Math.min(this.state.totalWidth, this.state.totalHeight) / 2;

    // Init svg
    const svg = d3.select("#pieChart" + this.props.chartName)
                  .append("svg")
                  .style("width", this.state.totalWidth)
                  .style("height", this.state.totalHeight)
                  .append("g")
                    .attr("transform", "translate(" + (this.state.totalWidth/2) + "," + (this.state.totalHeight/2) + ")");
    
    // Color scale
    const colorScale = d3.scaleOrdinal(['#f7fcf5','#e5f5e0','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#006d2c','#00441b']);

    // Init pie
    const pie = d3.pie().value((d) => d)

    // Init arc
    const arc = d3.arc()
                  .innerRadius(maxRadius - 40)
                  .outerRadius(maxRadius - 5);

    // Tooltip
    const tip = d3.select('body')
                  .append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0);

    const legend = svg.append("g")
              .attr("transform", "translate(" + this.state.totalWidth +",0)");

    const svgInfo = { svg, data, pie, arc, colorScale, tip };

    this.setState({ svgInfo }, () => this.drawData())
  }

  drawData() {
    const {
      svg, data, pie, arc,
      colorScale, tip
    } = this.state.svgInfo;

    // Drawdata
    svg.datum(data.sort((a,b) => a - b))
       .selectAll("path")
       .data(pie)
       .enter()
       .append("path")
       .attr("fill", (d, i) => colorScale(i))
       .attr("d", arc)
       .on("mouseover", (d) => {
         tip.transition()
            .duration(200)
            .style("opacity", .9)
         tip.html(() => {
           let text = `<strong>Country: </strong><span>$ {d.country}<span></br>`;
           text += `<strong>Income: </strong><span>${d.income} <span></br>`;
           text += `<strong>Life Expectancy: </strong><span>$ {d.life_exp}<span></br>`;
           text += `<strong>Population: </strong><span>$ {d.population}<span></br>`;
           return text;
         })
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 60) + "px");
         })
       .on("mouseout", (d) => {
           tip.transition()
               .duration(500)
               .style("opacity", 0);
       })
  }

  render() {
    // // Update data
    // this.drawData();

    return (
      <div className="pl-1">
        <div id={"pieChart" + this.props.chartName}/>
      </div>
    );
  }
}

PieChart.propTypes = {
  chartName: PropTypes.string.isRequired
};

//TODO: Add legends
