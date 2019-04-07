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
      filteredData,
      dataSmcapSorted,
      pieData: dataSmcapSorted.slice(0, 10),
      pieType: STOCK_INDUSTRY, // default
    };
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

  render() {
    return (
      <div className="">
        <div className="fs-slidechoice">
          <SlideChoice
            onSelect={(item) => this.handleSelectSector(item)}
            selections={['Industry', 'Sector']}
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
            <h5>Stock industry percentage</h5>
            <div className="mt-4 ml-2">
              <PieChart
                chartName={"StockIndustry"}
                data={this.state.pieData}
                sortType={this.state.pieType}
                colorCode={COLOR_CODE_3}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

//TODO: Add more information about top companys or just #1 company

/*
Company Name
Loop Inc.
SM cap:
$520,000
Business Description:
Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Employee Amount:
1,300
Emal:
supporet@keenthemes.com
Phone:
(0) 123 456 78 90
Annual Companies Taxes EMS
$500,000
Next Tax Review Date
July 24,2017
Total Annual Profit Before Tax
$3,800,000
Type Of Market Share
Grossery
Avarage Product Price
$60,70
Satisfication Rate

*/