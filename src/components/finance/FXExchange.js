import React, { Component } from 'react';
import axios from 'axios';
import data from '../../data.json';

export default class FXExchange extends Component {
  constructor(props) {
    super(props);

    // Setup the selection from and to currency
    let selectFromCurreny, selectToCurrency;
    selectFromCurreny = data[this.props.currencySource[0]];
    switch (this.props.currencySource.length) {
      case 1:
        selectToCurrency = data[this.props.currencySource[0]];
        break;
      case 2:
        selectToCurrency = data[this.props.currencySource[1]];
        break;
      default:
        break;
    }

    this.state = {
      widthThreshold: 640,
      slideShow: undefined,
      resizeEvent: undefined,
      showCurrencySelection: false,
      data: undefined,
      clickFromTarget: undefined,
      selectFromCurreny,
      selectToCurrency
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
          this.setState({ showCurrencySelection: false })
        }
      }
    });
  }

  componentWillUnmount() {
    // Clear Resize event after unmout
    clearInterval(this.state.resizeEvent);
  }

  async getData(fromCur = null, toCur = null) {
    let from = fromCur ? fromCur : this.props.defaultFromCur;
    let to = toCur ? toCur : this.props.defaultToCur;

    let res = await axios.get(`https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${from}&market=${to}&apikey=JDXSSIOOFMWY42SP`);

    if ((Object.keys(res.data).includes("Error Message")) || (Object.keys(res.data).includes("Note"))) {
      // Set time out for the next attempt
      setTimeout(() => {
        this.getData();
      }, 5000);

      // if (this.state.cooldownTime < 60) {
      //   return;
      // }

      // // Set interval for counting down for every second
      // const cooldownInterval = setInterval(() => {
      //   this.setState({
      //     cooldownTime: this.state.cooldownTime - 1
      //   });
      // }, 1000);

      // this.setState({ loaded: false, cooldownInterval });
    } else {
      console.log(res.data)
      // clearInterval(this.state.cooldownInterval);
      // this.setState({
      //   data: res.data,
      //   loaded: true,
      //   cooldownTime: 60
      // }, () => callback());
    }
  }

  handClickChangeCurrency(position) {
    this.setState({
      showCurrencySelection: this.state.showCurrencySelection ? false : position
    })
  }

  renderConvertTable() {
    return (
      <div className="fxe-table-container">
        <div className="d-flex">
          <input
            id="FXInputFrom"
            placeholder="1"
          />
          <div
            id={"from" + this.props.chartKey}
            className="fxe-table-country d-flex"
            onClick={() => this.handClickChangeCurrency("from")}
          >
            <img src="https://www.countryflags.io/be/shiny/32.png" alt="country-flag" />
            <h6>USD</h6>
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
        <div className="fxe-ex-rate">
          <ul>
            <li>
              <h6>Last Refresh:</h6>
              <p>12 PM</p>
            </li>
            <li>
              <h6>Exchange Rate:</h6>
              <p>1.2323</p>
            </li>
          </ul>
        </div>
        <div className="d-flex">
          <input
            placeholder="1"
          />
          <div
            id={"to" + this.props.chartKey}
            className="fxe-table-country d-flex"
            onClick={() => this.handClickChangeCurrency("to")}
          >
            <img src="https://www.countryflags.io/be/shiny/32.png" alt="country-flag" />
            <h6>USD</h6>
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

    const {
      showCurrencySelection,
      selectFromCurreny,
      selectToCurrency
    } = this.state;

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

    console.log(selectFromCurreny)
    console.log(selectToCurrency)

    let selections = showCurrencySelection === "from" ? selectFromCurreny : selectToCurrency;
    let typeSelection = Object.keys(selections)[0] === "AED";

    return (
      <div
        id={"fxeCs" + this.props.chartKey}
        className="fxe-cs-container"
        style={style}
      >
        <ul>
          {
            Object.keys(selections).map((item, i) => {
              return (
                <li key={i}>
                  <h6>
                    <span>
                      {
                        (Object.keys(selections)[0] === "BTC") ? <img src={require(`../../img/${item}.png`)} alt="curLogo"/> : <img src={`https://www.countryflags.io/${item.slice(0, 2).toLowerCase()}/flat/32.png`} alt="curLogo"/>
                      }
                    </span>
                    {item}&nbsp;&nbsp;
                    <span>{selections[item]}</span>
                  </h6>
                </li>
              );
            })
          }
        </ul>
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
    // console.log(this.props.currencySource)
    // console.log(data[this.props.currencySource[1]])

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
