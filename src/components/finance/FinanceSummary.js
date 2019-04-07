import React, { Component } from 'react';
import _ from 'lodash';
import PieChart from '../graphs/PieChart';
import SlideChoice from '../SlideChoice';
import {
  STOCK_INDUSTRY,
  STOCK_SECTOR
} from '../../constants';

const COLOR_CODE_1 = ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'];

const COLOR_CODE_2 = ["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"];

const COLOR_CODE_3 = ["#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#E1E1E1", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221"];

export default class FinanceSummary extends Component {
  constructor(props) {
    super(props);

    // Filter data with smcap in string and number
    const filteredData = this.props.data.map((item) => {
      // Get filtered sections
      let smcap = item.smcap.slice(1, item.smcap.length - 1);
      let numCap = item.smcap.charAt(item.smcap.length - 1) === "B" ? +smcap * 1000000000 : +smcap * 1000000;

      return { ...item, numCap }
    });

    // Sorted data base on stock market cap
    const dataSmcapSorted = _.sortBy(filteredData, [(d) => d.numCap]).reverse();

    this.state = {
      resizeEvent: undefined,
      showTopInfo: true,
      filteredData,
      dataSmcapSorted,
      pieData: dataSmcapSorted.slice(0, 10),
      pieType: STOCK_INDUSTRY, // default
      topType: undefined
    };
  }

  componentWillMount() {
    // Loop interval for resize checking
    const resizeEvent = setInterval(() => {
      const currentSize = window.screen.width;
      let showTopInfo, smallSlide, setState = false;

      // Checking for show Top company info
      if (((currentSize < 1600 && currentSize >= 1200) || (currentSize < 920)) && (this.state.showTopInfo)) {
        showTopInfo = false;
        setState = true;
      } else if (!((currentSize < 1600 && currentSize >= 1200) || (currentSize < 920)) && !this.state.showTopInfo) {
        showTopInfo = true;
        setState = true;
      }

      if (setState) {
        this.setState({ resizeEvent, showTopInfo, smallSlide });
      }
    }, 200);
  }

  componentWillUnmount() {
    clearInterval(this.state.resizeEvent);
  }

  handleSelectTopComapny(e) {
    // Base on selection give the data for piechart
    switch (e.target.value) {
      case "1":
        this.setState({ pieData: this.state.dataSmcapSorted.slice(0, 10) });
        return;
      case "2":
        this.setState({ pieData: this.state.dataSmcapSorted.slice(0, 50) });
        return;
      case "3":
        this.setState({ pieData: this.state.dataSmcapSorted.slice(0, 100) });
        return;
      default:
        return;
    }
  }

  handleSelectSector(item) {
    switch (item.toLowerCase()) {
      case "industry":
        this.setState({ pieType: STOCK_INDUSTRY });
        return;
      case "sector":
        this.setState({ pieType: STOCK_SECTOR });
        return;
      default:
        return;
    }
  }

  renderSumarryInfo() {
    if (this.state.topType) {
      const dataInType = _.filter(this.state.filteredData, (d) => d[this.state.pieType] === this.state.topType);
      const sortDataInType = dataInType.sort((a, b) => b.numCap - a.numCap);

      if (sortDataInType.length === 0) {
        return <div />;
      }

      if (this.state.showTopInfo) {
        return (
          <div>
            <div className="text-center">
              <h2 className="m-0">#1 <span className="h5 bold fs-top">
                {sortDataInType[0].company}
              </span></h2>
            </div>
            <div className="fs-data-extra">
              <div className="row">
                <div className="col-6 text-center">
                  <div className="m-2 p-1">
                    <h6 className="s-13">Stock Market Cap</h6>
                    <p className="bold h4">
                      {sortDataInType[0].smcap}
                    </p>
                  </div>
                </div>
                <div className="col-6 text-center">
                  <div className="m-2 p-1">
                    <h6 className="s-13">Owner</h6>
                    <p className="bold h4">
                      {sortDataInType[0].first_name + " " + sortDataInType[0].last_name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-6 text-center">
                  <div className="mb-2 p-1">
                    <h6 className="s-13">Average Product Cost</h6>
                    <p className="bold h4">
                      {sortDataInType[0].ave_products_cost}
                    </p>
                  </div>
                </div>
                <div className="col-6 text-center">
                  <div className="mb-2 p-1">
                    <h6 className="s-13">Company Main Stock Market</h6>
                    <p className="bold h4">
                      {sortDataInType[0].stock_market}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="fs-top-small">
            <h2 className="m-0">#1 <span className="h5 bold fs-top">
              {sortDataInType[0].company}
            </span></h2>
          </div>
        );
      }
    }
  }

  render() {
    return (
      <div className="">
        <div className="fs-slidechoice">
          <SlideChoice
            onSelect={(item) => this.handleSelectSector(item)}
            smallSlide={this.state.smallSlide}
            selections={["Industry", "Sector"]}
          />
        </div>
        <div>
          <select
            className="custom-select"
            id="selectTop"
            onChange={(e) => this.handleSelectTopComapny(e)}
          >
            <option value="1">Top 10 Stock Market Cap Companies</option>
            <option value="2">Top 50 Stock Market Cap Companies</option>
            <option value="3">Top 100 Stock Market Cap Companies</option>
          </select>
        </div>
        <div className="row px-3">
          <div className="col-sm-6 col-12 mt-3">
            <div className="my-4 ml-2">
              <PieChart
                chartName={"StockIndustry"}
                data={this.state.pieData}
                sortType={this.state.pieType}
                colorCode={COLOR_CODE_3}
                getTopType={(info) => this.setState({ topType: info })}
              />
            </div>
          </div>
          <div className="col-sm-6 d-none d-sm-block mt-3 ">
            <div className="fs-summary-info pt-1 pb-2">
              {this.renderSumarryInfo()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
