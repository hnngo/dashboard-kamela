import React, { Component } from 'react';
import Board from './Board';
import CompanyOverview from './graphs/CompanyOverview';
import LineGraph from './graphs/LineGraph';
import FinanceSummary from './details/FinanceSummary';
import {
  DATA_CLOSE,
  DATA_HIGH,
  DATA_LOW,
  DATA_OPEN,
  DATA_VOLUME
} from '../constants';
import data from '../company_data_500.json';

export default class DashBoard extends Component {
  constructor(props) {
    super(props);

    this.state = { filteredData: undefined };
  }

  componentWillMount() {
    // Re-build the data
    const stock_sector = ["Finance", "Health Care", "Consumer Services", "Public Utilities", "Technology", "Consumer Durables", "Capital Goods", "Basic Industries", "Miscellaneous"];

    const stock_industry = ["Computer Software: Prepackaged Software", "Medical/Nursing Services", "Metal Fabrications", "Multi-Sector Companies", "Marine Transportation", "Major Pharmaceuticals", "Television Services", "Property-Casualty Insurers", "Real Estate Investment Trusts", "Precious Metals", "Railroads"];
    
    const filteredData = data.map((item) => {
      let newSmcap = (item.smcap === "n/a") ? "$" + (Math.floor(Math.random()*899 + 100)) + "M" : item.smcap;
      let newStockSetor = (item.stock_sector === "n/a") ? stock_sector[Math.floor(Math.random()*9)] : item.stock_sector;
      let newStockIndustry = (item.stock_industry === "n/a") ? stock_industry[Math.floor(Math.random()*12)] : item.stock_industry;

      return {
        ...item,
        smcap: newSmcap,
        stock_sector: newStockSetor,
        stock_industry: newStockIndustry
      }
    });

    this.setState({ filteredData });
  }

  render() {
    return (
      <div>
        <div className="row py-2">
          <div className="col-xl-8">
            <Board component={<CompanyOverview data={this.state.filteredData}/>} />
          </div>
          <div className="col-xl-4">
            <div className="row">
              <div className="col-12">
                <Board component={
                  <LineGraph
                    chartName={"MSFT-volume"}
                    stockSymbol={"MSFT"}
                    dataType={DATA_VOLUME}
                    maxNumberOfData={15}
                    offsetTop={120}
                    showAxis={false}
                    lineColor={"#1e5e21"}
                    areaColor={"#dcf4dd"}
                    titleColor={"#0e2b0f"}
                  />
                } />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <Board component={
                  <LineGraph
                    chartName={"PLXS-high"}
                    stockSymbol={"PLXS"}
                    dataType={DATA_VOLUME}
                    maxNumberOfData={15}
                    offsetTop={120}
                    showAxis={false}
                    lineColor={"#008bf2"}
                    areaColor={"#d0ebff"}
                    titleColor={"#003d6a"}
                  />
                } />
              </div>
            </div>
          </div>
        </div>
        <div className="row py-2">
          <div className="col-xl-4">
            <Board component={<FinanceSummary />} />
          </div>
          <div className="col-xl-4">
            <Board number={5} />
          </div>
          <div className="col-xl-4">
            <Board number={6} />
          </div>
        </div>
        <div className="row py-2">
          <div className="col-xl-4">
            <Board number={7} />
          </div>
          <div className="col-xl-4">
            <Board number={8} />
          </div>
          <div className="col-xl-4">
            <Board number={9} />
          </div>
        </div>
        <div className="row py-2">
          <div className="col-xl-8">
            <Board number={9} />
          </div>
          <div className="col-xl-4">
            <Board number={10} />
          </div>
        </div>
        <div className="row py-2">
          <div className="col-xl-4">
            <Board number={11} />
          </div>
          <div className="col-xl-4">
            <Board number={12} />
          </div>
          <div className="col-xl-4">
            <Board number={13} />
          </div>
        </div>
      </div>
    );
  }
}