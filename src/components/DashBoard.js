import React, { Component } from 'react';
import Board from './Board';
import CompanyOverview from './details/CompanyOverview';
import FinanceSummary from './details/FinanceSummary';
import LineGraph from './graphs/LineGraph';
import {
  // DATA_CLOSE,
  // DATA_HIGH,
  // DATA_LOW,
  // DATA_OPEN,
  DATA_VOLUME,
  DOUBLE_HEIGHT,
  SINGLE_HEIGHT
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
      // Get filtered sections
      let newSmcap = (item.smcap === "n/a") ? "$" + (Math.floor(Math.random() * 899 + 100)) + "M" : item.smcap;
      let newStockSetor = (item.stock_sector === "n/a") ? stock_sector[Math.floor(Math.random() * 9)] : item.stock_sector;
      let newStockIndustry = (item.stock_industry === "n/a") ? stock_industry[Math.floor(Math.random() * 12)] : item.stock_industry;

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
    const { filteredData } = this.state;

    return (
      <div>
        <div className="row py-1">
          <div className="col-xl-8">
            <Board
              height={DOUBLE_HEIGHT}
              title={"Company Overview"}
              component={
                <CompanyOverview data={filteredData} />
              }
            />
          </div>
          <div className="col-xl-4">
            <div className="row">
              <div className="col-12">
                <Board
                  height={SINGLE_HEIGHT}
                  component={
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
                  }
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <Board
                  height={SINGLE_HEIGHT}
                  component={
                    <LineGraph
                      chartName={"PLXS-volume"}
                      stockSymbol={"PLXS"}
                      dataType={DATA_VOLUME}
                      maxNumberOfData={15}
                      offsetTop={120}
                      showAxis={false}
                      lineColor={"#008bf2"}
                      areaColor={"#d0ebff"}
                      titleColor={"#003d6a"}
                    />
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row py-1">
          <div className="col-xl-4">
            <Board
              height={SINGLE_HEIGHT}
              title={"Finance Summary"}
              component={<FinanceSummary data={filteredData} />}
            />
          </div>
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
        </div>
        <div className="row py-1">
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
        </div>
        <div className="row py-1">
          <div className="col-xl-8">
            <Board height={SINGLE_HEIGHT} />
          </div>
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
        </div>
        <div className="row py-1">
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
        </div>
      </div>
    );
  }
}