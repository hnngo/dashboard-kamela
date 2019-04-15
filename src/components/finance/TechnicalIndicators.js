import React, { Component } from 'react';
import LineIndicators from '../graphs/LineIndicators';
import axios from 'axios';
import {
  TI_APO,
  TI_CMO,
  TI_AROONOS,
  TI_CCI,
  TI_EMA,
  TI_ROC,
  STS_MSFT
} from '../../constants';
import LineStockSeries from '../graphs/LineStockSeries';

export default class TechnicalIndicators extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectTI: TI_CCI,
      selectSTS: "INS",
      searchInput: undefined,
      searchTimeout: undefined,
      searchResult: undefined,
    }
  }

  handleSelectTI(e) {
    this.setState({ selectTI: e.target.value });
  }

  handleSelectSTS(e) {
    this.setState({ selectSTS: e.target.value });
  }

  handleOnInput(e) {
    // Clear time out for previous active
    clearTimeout(this.state.searchTimeout)

    // Active new timeout
    const searchTimeout = setTimeout(() => {
      this.activeSearch();
    }, 1000);

    // Save input and timeout ref
    this.setState({
      searchInput: e.target.value,
      searchTimeout
    });
  }

  async activeSearch() {
    // Check if input nothing then do nothing
    if (!this.state.searchInput) {
      return;
    }

    const res = await axios.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${this.state.searchInput}&apikey=KJO1VD3QQ2D7BDOV`);

    // Check if return data is okay
    if (Object.keys(res.data).includes("bestMatches")) {
      console.log(res.data);
      this.setState({
        searchResult: res.data["bestMatches"].slice(0, 10)
      });
    }
  }

  renderSearchResult() {
    if (!this.state.searchInput) {
      return <div />
    }

    let style = {
      left: 1,
      width: document.querySelector('#inputTI').clientWidth,
      top: document.querySelector('#inputTI').clientHeight
    };

    return (
      <div
        className="ti-sr-container"
        style={style}
      >
        {
          (this.state.searchResult) ?
            <div>
              {this.state.searchResult.map((item, i) => {
                return (
                  <div key={i} className="ti-sr-dataRow">
                    <h6>{item["1. symbol"]}</h6>
                    <p>{item["2. name"]}</p>
                  </div>
                );
              })}
            </div> :
            <div>
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
        }
      </div>
    );
  }

  render() {
    return (
      <div className="ti-container">
        <div>
          <select
            className="custom-select"
            id="selectTI"
            onChange={(e) => this.handleSelectTI(e)}
          >
            <option value={TI_CCI}>(CCI) Commodity Channel Index</option>
            <option value={TI_AROONOS}>(AROONOSC) Aroon Oscillator</option>
            <option value={TI_CMO}>(CMO) Chande Momentum Oscillator</option>
            <option value={TI_APO}>(APO) Absolute Price Oscillator</option>
            <option value={TI_EMA}>(EMA) Exponential Moving Average</option>
            <option value={TI_ROC}>(ROC) Rate of change</option>
          </select>
          <LineIndicators
            chartName={"TI"}
            tiType={this.state.selectTI}
          />
        </div>
        <div>
          <div className="board-title ml-3 d-flex justify-content-between">
            <h5 className="bold">Stock Times Series</h5>
          </div>
          <div className="input-group">
            <input
              id="inputTI"
              className="form-control"
              placeholder={`Enter a symbol. Ex: "AAPL" or select one beside`}
              onChange={(e) => this.handleOnInput(e)}
            />
            <div>
              {this.renderSearchResult()}
            </div>
            {/* <select
              className="custom-select"
              id="selectSTS"
              onChange={(e) => this.handleSelectSTS(e)}
            >
              <option value={"INS"}>(INS) Intelligent Systems Corp</option>
              <option value={"NVTA"}>(NVTA) Invitae Corp</option>
              <option value={"CHMA"}>(CHMA) Chiasma Inc</option>
              <option value={"EHTH"}>(EHTH) Ehealth Inc</option>
              <option value={"TNDM"}>(TNDM) Tandem Diabetes Care</option>
              <option value={"VCYT"}>(VCYT) Veracyte Inc</option>
              <option value={"VCYT"}>(VCYT) Veracyte Inc</option>
            </select> */}
          </div>
          <LineStockSeries
            chartName={"SS"}
            stSeries={this.state.selectSTS}
          />
        </div>
      </div>
    );
  }
}
