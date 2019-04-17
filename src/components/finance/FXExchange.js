import React, { Component } from 'react';
import data from '../../data.json';

export default class FXExchange extends Component {
  constructor(props) {
    super(props);

    this.state = {
      widthThreshold: 640,
      slideShow: undefined,
      resizeEvent: undefined,
      showCurrencySelection: false
    };
  }

  componentWillMount() {
    // Set up interval checking in resize mode for slide show
    const resizeEvent = setInterval(() => {
      const { widthThreshold, slideShow } = this.state;
      const $CCE = document.querySelector("#CCE");

      if ($CCE) {
        if ($CCE.clientWidth >= widthThreshold && slideShow) {
          this.setState({ slideShow: false });
        } else if ($CCE.clientWidth < widthThreshold && !slideShow) {
          this.setState({ slideShow: true });
        }
      }
    }, 1000);

    this.setState({ resizeEvent });
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    clearInterval(this.state.resizeEvent);
  }

  handClickChangeCurrency(position) {
    console.log(position);
    this.setState({
      showCurrencySelection: position
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

    const $curInput = document.querySelector("#FXInputFrom");
    const $CCE = document.querySelector("#CCE");

    // Assign the right style for selection from or to
    let style = {};
    if ($curInput && $CCE) {
      style = {
        top: $curInput.clientHeight + "px",
        left: ($CCE.clientWidth - 300) / 2 + "px",
        right: ($CCE.clientWidth - 300) / 2 + "px"
      };

      if (this.state.showCurrencySelection === "from") {
        style.top = $curInput.clientHeight + "px";
        style.bottom = "";
      } else {
        style.top = "";
        style.bottom = ($curInput.clientHeight + 1) + "px";
      }
    }

    return (
      <div className="fxe-cs-container" style={style}>
        <h5>Selection</h5>
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
    console.log(this.props.currencySource)
    console.log(data[this.props.currencySource[1]])

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
