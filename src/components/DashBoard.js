import React, { Component } from 'react';
import Board from './Board';
import CompanyOverview from './finance/CompanyOverview';
import FinanceSummary from './finance/FinanceSummary';
import LineGraph from './graphs/LineGraph';
import SearchEndPoints from './finance/SearchEndPoints';
import TechnicalIndicators from './finance/TechnicalIndicators';
import FXExchange from './finance/FXExchange';
import data from '../company_data_500.json';
import {
  DATA_VOLUME,
  DOUBLE_HEIGHT,
  SINGLE_HEIGHT,
  FX_DIGITAL_CUR,
  FX_PHYSICAL_CUR
} from '../constants';


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
                      maxNumberOfData={300}
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
          <div
            id="fsBoard"
            className="col-xl-8"
          >
            <Board
              height={SINGLE_HEIGHT}
              title={"Finance Summary"}
              component={<FinanceSummary data={filteredData} />}
            />
          </div>
          <div className="col-xl-4">
            <Board
              height={SINGLE_HEIGHT}
              title={"Search Endpoint"}
              component={<SearchEndPoints />}
            />
          </div>
        </div>
        <div className="row py-1">
          <div className="col-xl-8">
            <Board
              height={DOUBLE_HEIGHT}
              title={"Technical Indicators"}
              component={
                <TechnicalIndicators />
              }
            />
          </div>
          <div className="col-xl-4">
            <div className="row">
              <div
                id="CCE"
                className="col-12"
              >
                <Board
                  height={SINGLE_HEIGHT}
                  title={"Crypto Currencies Exchange"}
                  component={
                    <FXExchange
                      chartKey="CCE"
                      currencySource={[FX_DIGITAL_CUR, FX_PHYSICAL_CUR]}
                      convertTable={true}
                      convertGraph={true}
                      defaultFromCur={"BTC"}
                      defaultToCur={"USD"}
                    />
                  }
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <Board
                  height={SINGLE_HEIGHT}
                  title={"Forex Exchange"}
                  component={
                    <FXExchange
                      chartKey="FE"
                      currencySource={[ FX_PHYSICAL_CUR]}
                      convertTable={true}
                      convertGraph={true}
                      defaultFromCur={"EUR"}
                      defaultToCur={"USD"}
                    />
                  }
                />
              </div>
            </div>
          </div>
        </div>
        {/* <div className="row py-1">
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
          <div className="col-xl-4">
            <Board height={SINGLE_HEIGHT} />
          </div>
        </div> */}
        <div className="footer">
          <h6>*Due to using free API of <a href="https://www.alphavantage.co" target="_blank" rel="noopener noreferrer">Alpha Vantage</a>, website may or may not have a small latency in loading the latest data. Thanks for your patience!</h6>
          <h6><i className="fab fa-github"/>Github link <a href="https://github.com/hnngo/dashboard-kamela" target="_blank" rel="noopener noreferrer">here</a></h6>
        </div>
      </div>
    );
  }
}
