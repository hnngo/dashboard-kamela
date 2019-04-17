import React, { Component } from 'react';
import LineIndicators from '../graphs/LineIndicators';
import axios from 'axios';
import {
  TI_APO,
  TI_CMO,
  TI_AROONOS,
  TI_CCI,
  TI_EMA,
  TI_ROC
} from '../../constants';
import LineStockSeries from '../graphs/LineStockSeries';

export default class TechnicalIndicators extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectTI: TI_CCI,
      selectSTS: "INS",
      selectName: "Intelligent Systems Corporation",
      searchInput: undefined,
      searchTimeout: undefined,
      searchResult: undefined,
      isInputFocused: false,
      focusEvent: undefined
    }
  }

  componentDidMount() {
    // Loop interval for focus event checking
    const focusEvent = setInterval(() => {
      const $tiInput = document.querySelector("#inputTI");

      if ($tiInput) {
        let isInputFocused = $tiInput === document.activeElement;

        if ((isInputFocused && !this.state.isInputFocused) || (!isInputFocused && this.state.isInputFocused)) {
          const $searchRes = document.querySelector(".ti-sr-container");

          // Collapsing and Opening
          if ($searchRes) {
            if (isInputFocused) {
              $searchRes.style["max-height"] = "180px";
            } else {
              $searchRes.style["max-height"] = 0;
            }
          }

          this.setState({ isInputFocused });
        }

      }
    }, 200);

    this.setState({ focusEvent });
  }

  componentWillUnmount() {
    clearInterval(this.state.focusEvent);
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
    }, 800);

    // Save input and timeout ref
    this.setState({
      searchResult: undefined,
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

  handleClickSR(index) {
    const symbolSelect = this.state.searchResult[index];

    // When click on result, collapsing the search div
    // and query the selected symbol
    const $searchRes = document.querySelector(".ti-sr-container");

    if ($searchRes) {
      this.setState({
        searchResult: undefined,
        searchInput: symbolSelect["1. symbol"],
        selectSTS: symbolSelect["1. symbol"],
        selectName: symbolSelect["2. name"]
      })
    }
  }

  renderSearchResult() {
    if (!this.state.searchInput) {
      return <div />
    }

    let content = undefined;
    if (this.state.searchResult) {
      if (this.state.searchResult.length > 0) {
        content =
          <div>
            {this.state.searchResult.map((item, i) => {
              return (
                <div 
                  key={i} className="ti-sr-dataRow"
                  onClick={() => this.handleClickSR(i)}
                >
                  <h6>{item["1. symbol"]}</h6>
                  <p>{item["2. name"]}</p>
                </div>
              );
            })}
          </div>;
      } else {
        content = 
          <div className="ti-sr-nores">
            <h6>There is no results for "{this.state.searchInput}"</h6>
          </div>
      }
    } else {
      content =
        <div className="py-2">
          <div className="spinner-border spinner-border-sm text-success">
            <span className="sr-only" />
          </div>
          <div className="spinner-border spinner-border-sm text-success">
            <span className="sr-only" />
          </div>
          <div className="spinner-border spinner-border-sm text-success">
            <span className="sr-only" />
          </div>
        </div>;
    }

    return (
      <div
        className="ti-sr-container"
        style={{
          left: 1,
          width: document.querySelector('#inputTI').clientWidth,
          top: document.querySelector('#inputTI').clientHeight
        }}
      >
        {content}
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="ti-container">
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
              placeholder={`Enter a symbol (example: "AAPL")`}
              value={this.state.searchInput}
              onChange={(e) => this.handleOnInput(e)}
            />
            <div>
              {this.renderSearchResult()}
            </div>
          </div>
          <LineStockSeries
            chartName={"SS"}
            stSeries={this.state.selectSTS}
          />
          <div className="text-center">
            <h6>{this.state.selectName}</h6>
          </div>
        </div>
      </div>
    );
  }
}

//TODO: CLick nowhere to collapse searhc and keep old res
//TODO: Adding label for chart to indicate company name