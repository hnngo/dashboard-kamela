import React, { Component } from 'react';
import axios from 'axios';
import data from '../../data.json';

export default class FXExchange extends Component {
  constructor(props) {
    super(props);

    // Setup the selection from and to currency
    let dataFromCurrency, dataToCurrency;
    dataFromCurrency = data[this.props.currencySource[0]];
    switch (this.props.currencySource.length) {
      case 1:
        dataToCurrency = data[this.props.currencySource[0]];
        break;
      case 2:
        dataToCurrency = data[this.props.currencySource[1]];
        break;
      default:
        break;
    }

    // Setup the logos currency
    let [logoFromCurrency, logoToCurrency] = [dataFromCurrency, dataToCurrency].map((type) => {
      let newType = { ...type };

      if (Object.keys(newType).includes("BTC")) {
        Object.keys(newType).forEach((item) => {
          newType[item] = require(`../../img/${item}.png`);
        });
      } else {
        Object.keys(newType).forEach((item) => {
          newType[item] = `https://www.countryflags.io/${item.slice(0, 2).toLowerCase()}/flat/32.png`;
        });
      }

      return newType;
    })

    this.state = {
      loaded: false,
      data: undefined,
      lastRefresh: "Loading...",
      lateExchangeRate: "Loading...",
      inputExchangeAmount: 1,
      widthThreshold: 640,
      resizeEvent: undefined,
      slideShow: undefined,
      searchCurrency: "",
      showCurrencySelection: false,
      dataFromCurrency,
      dataToCurrency,
      selectFromCurrency: this.props.defaultFromCur,
      selectToCurrency: this.props.defaultToCur,
      logoCurrency: { ...logoFromCurrency, ...logoToCurrency },
      cooldownInterval: undefined,
      cooldownTime: 60
    };
  }

  componentWillMount() {
    // Set up interval checking in resize mode for slide show
    const resizeEvent = setInterval(() => {
      const { widthThreshold, slideShow } = this.state;
      const $CCE = document.querySelector("#CCE");

      // Resize checking
      if ($CCE) {
        if (slideShow === undefined) {
          this.setState({ slideShow: !($CCE.clientWidth >= widthThreshold) })
        } else if ($CCE.clientWidth >= widthThreshold && slideShow) {
          this.setState({ slideShow: false });
        } else if ($CCE.clientWidth < widthThreshold && !slideShow) {
          this.setState({ slideShow: true });
        }
      }
    }, 1000);

    this.setState({ resizeEvent }, () => this.getData());
  }

  componentDidMount() {
    // Add click event to trigger collapse currency selection
    document.addEventListener("click", (event) => {
      if (!this.state.showCurrencySelection) {
        return;
      }

      const { showCurrencySelection } = this.state;

      const $fxeBtn = document.querySelector(`#${showCurrencySelection}${this.props.chartKey}`);
      const $fxeCon = document.querySelector("#fxeCs" + this.props.chartKey);

      if ($fxeCon && $fxeBtn) {
        if (!$fxeCon.contains(event.target) && !$fxeBtn.contains(event.target) && showCurrencySelection) {
          this.setState({
            showCurrencySelection: false,
            searchCurrency: ""
          })
        }
      }
    });
  }

  componentDidUpdate() {
    const $csSearch = document.querySelector("#fxeCs" + this.props.chartKey);

    if ($csSearch) {
      $csSearch.scrollTo({
        'behavior': 'smooth',
        'top': 0
      })
    }
  }

  componentWillUnmount() {
    // Clear Resize event after unmout
    clearInterval(this.state.resizeEvent);
  }

  async getData(fromCur = null, toCur = null) {
    let from = fromCur ? fromCur : this.props.defaultFromCur;
    let to = toCur ? toCur : this.props.defaultToCur;
    let res;
    if (this.props.currencySource.length > 1) {
      res = await axios.get(`https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${from}&market=${to}&apikey=JDXSSIOOFMWY42SP`);
    } else {
      res = await axios.get(`https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${from}&to_symbol=${to}&apikey=JDXSSIOOFMWY42SP`);
    }
    
    // Check if result is valid data or error
    // If fail, then re-attempt to get the data after 1 mins, free API maximum 5 calls per min
    if ((Object.keys(res.data).includes("Error Message")) || (Object.keys(res.data).includes("Note"))) {
      // Set time out for the next attempt
      setTimeout(() => {
        this.getData(() => this.drawChart());
      }, 5000);

      // Check if cooldown is counting down then stop setting new timeout
      if (this.state.cooldownTime < 60) {
        return;
      }

      // Set interval for counting down for every second
      const cooldownInterval = setInterval(() => {
        let cooldownTime;

        if (this.state.cooldownTime >= 1) {
          cooldownTime = this.state.cooldownTime - 1;
        } else {
          clearInterval(this.state.cooldownInterval);
          cooldownTime = 60;
        }
        this.setState({ cooldownTime });
      }, 1000);

      this.setState({ loaded: false, cooldownInterval });
    } else {
      console.log(res.data)
      // Clear interval of re-try
      clearInterval(this.state.cooldownInterval);

      // Retrieve the last refresh and data series
      let lastRefresh, data;
      if (this.props.currencySource.length > 1) {
        lastRefresh = res.data["Meta Data"]["6. Last Refreshed"].slice(0, 10);
        data = res.data["Time Series (Digital Currency Daily)"];
      } else {
        lastRefresh = res.data["Meta Data"]["5. Last Refreshed"].slice(0, 10);
        data = res.data["Time Series FX (Daily)"];
      }

      // Retrieve the last exchange rate
      let latestRate = data[Object.keys(data)[0]];
      let lateExchangeRate = this.props.currencySource.length > 1 ? latestRate[Object.keys(latestRate)[6]] : latestRate[Object.keys(latestRate)[3]];

      this.setState({
        data,
        lastRefresh,
        lateExchangeRate,
        loaded: true,
        cooldownTime: 60
      });
    }
  }

  handleClickCurrencyBtn(position) {
    // Handle click open currency selection
    if (this.state.showCurrencySelection) {
      this.setState({
        showCurrencySelection: false,
        searchCurrency: ""
      });
    } else {
      this.setState({ showCurrencySelection: position });
    }
  }

  handleSelectCurrency(curCode) {
    if (this.state.showCurrencySelection === "from") {
      this.setState({
        showCurrencySelection: false,
        selectFromCurrency: curCode,
        searchCurrency: ""
      });
    } else {
      this.setState({
        showCurrencySelection: false,
        selectToCurrency: curCode,
        searchCurrency: ""
      });
    }
  }

  handleInputSearchCurrency(e) {
    this.setState({ searchCurrency: e.target.value });
  }

  handleInputExchangeAmount(e) {
    this.setState({ inputExchangeAmount: e.target.value });
  }

  renderConvertTable() {
    return (
      <div className="fxe-table-container">
        <div className="d-flex">
          <input
            id="FXInputFrom"
            value={this.state.inputExchangeAmount}
            onChange={(e) => this.handleInputExchangeAmount(e)}
          />
          <div
            id={"from" + this.props.chartKey}
            className="fxe-table-country d-flex"
            onClick={() => this.handleClickCurrencyBtn("from")}
          >
            <img
              src={this.state.logoCurrency[this.state.selectFromCurrency]}
              alt="country-flag"
            />
            <h6>{this.state.selectFromCurrency}</h6>
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
        <div className="fxe-ex-rate">
          <ul>
            <li>
              <h6>Last Refresh:</h6>
              <p>{this.state.lastRefresh}</p>
            </li>
            <li>
              <h6>Exchange Rate:</h6>
              <p>{this.state.lateExchangeRate}</p>
            </li>
          </ul>
        </div>
        <div className="d-flex">
          <input
            value={
              (isNaN(this.state.inputExchangeAmount) || isNaN(this.state.lateExchangeRate)) ? 0 : (+this.state.inputExchangeAmount * +this.state.lateExchangeRate).toFixed(4)
            }
            disabled
          />
          <div
            id={"to" + this.props.chartKey}
            className="fxe-table-country d-flex"
            onClick={() => this.handleClickCurrencyBtn("to")}
          >
            <img
              src={this.state.logoCurrency[this.state.selectToCurrency]}
              alt="country-flag"
            />
            <h6>{this.state.selectToCurrency}</h6>
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
        {this.renderCurrencySelection()}
      </div>
    );
  }

  renderCurrencySelection() {
    // Check if not click yet wont show info
    if (!this.state.showCurrencySelection) {
      return <div />;
    }

    const { showCurrencySelection } = this.state;

    // Assign the right style for selection from or to
    const $curInput = document.querySelector("#FXInputFrom");
    const $fxeCon = document.querySelector(".fxe-table-container");
    let style = {};

    if ($curInput && $fxeCon) {
      style = {
        left: ($fxeCon.clientWidth - 280) / 2 + "px",
        right: ($fxeCon.clientWidth - 280) / 2 + "px"
      };

      if (showCurrencySelection === "from") {
        style.top = ($curInput.clientHeight + 2) + "px";
        style.bottom = "";
      } else {
        style.top = "";
        style.bottom = ($curInput.clientHeight + 2) + "px";
      }
    }

    return (
      <div
        id={"fxeCs" + this.props.chartKey}
        className="fxe-cs-container"
        style={style}
      >
        <div className="fxe-cs-search d-flex">
          <i className="fas fa-search"></i>
          <input
            className="form-control"
            placeholder="Type a currency/country"
            value={this.state.searchCurrency}
            onChange={(e) => this.handleInputSearchCurrency(e)}
          />
        </div>
        {this.renderSearchResult()}
      </div>
    );
  }

  renderSearchResult() {
    const {
      showCurrencySelection,
      dataFromCurrency,
      dataToCurrency,
      logoCurrency,
      searchCurrency
    } = this.state;

    // Select the proper currency selection
    let selectionsCurrency = showCurrencySelection === "from" ? dataFromCurrency : dataToCurrency;
    let popularCurrency = Object.keys(selectionsCurrency).includes("BTC") ? ["BTC", "ETH", "LTC"] : ["USD", "EUR", "GBP"];

    let filteredSelections = {};
    // Render search result if have
    if (searchCurrency.length >= 1) {
      Object.keys(selectionsCurrency).forEach((item) => {
        if (item.toLowerCase().includes(searchCurrency.toLowerCase()) || selectionsCurrency[item].toLowerCase().includes(searchCurrency.toLowerCase())) {
          filteredSelections[item] = selectionsCurrency[item];
        }
      });

      return (
        <ul>
          {
            Object.keys(filteredSelections).map((item, i) => {
              return (
                <li
                  key={i}
                  onClick={() => this.handleSelectCurrency(item)}
                >
                  <h6>
                    <span>
                      <img
                        src={logoCurrency[item]}
                        alt="curLogo"
                      />
                    </span>
                    {item}&nbsp;&nbsp;
                    <span>{filteredSelections[item]}</span>
                  </h6>
                </li>
              );
            })
          }
        </ul>
      );
    }

    return (
      <div>
        <div className="fxe-cs-popular">
          <h6 className="fxe-cs-category">
            Popular Currencies
          </h6>
          <ul>
            {
              popularCurrency.map((item, i) => {
                return (
                  <li
                    key={i}
                    onClick={() => this.handleSelectCurrency(item)}
                  >
                    <h6>
                      <span>
                        <img
                          src={logoCurrency[item]}
                          alt="curLogo"
                        />
                      </span>
                      {item}&nbsp;&nbsp;
                      <span>{selectionsCurrency[item]}</span>
                    </h6>
                  </li>
                );
              })
            }
          </ul>
        </div>
        <div className="fxe-cs-all">
          <h6 className="fxe-cs-category">
            All Currencies
          </h6>
          <ul>
            {
              Object.keys(selectionsCurrency).map((item, i) => {
                return (
                  <li
                    key={i}
                    onClick={() => this.handleSelectCurrency(item)}
                  >
                    <h6>
                      <span>
                        <img
                          src={logoCurrency[item]}
                          alt="curLogo"
                        />
                      </span>
                      {item}&nbsp;&nbsp;
                      <span>{selectionsCurrency[item]}</span>
                    </h6>
                  </li>
                );
              })
            }
          </ul>
        </div>
      </div>
    );
  }

  renderConvertGraph() {
    return (
      <div className="fxe-graph-container">
        graph
      </div>
    );
  }

  renderFXE1() {
    return <div />;
  }

  renderFXE2() {
    // Checking if slideshow needed for rendering
    if (this.state.slideShow) {
      return this.renderConvertTable();
    } else {
      return (
        <div className="row">
          <div className="col-6">
            {this.renderConvertTable()}
          </div>
          <div className="col-6">
            {this.renderConvertGraph()}
          </div>
        </div>
      );
    }
  }

  render() {
    if (this.state.slideShow === undefined) {
      return <div />;
    }

    // Checking the number of component need to render
    if (this.props.convertTable && this.props.convertGraph) {
      return (
        <div className="fxe2-container">
          {this.renderFXE2()}
        </div>
      );
    } else {
      return (
        <div className="fxe1-container">
          {this.renderFXE1()}
        </div>
      );
    }
  }
}

//TODO: Add animated slide down or up
