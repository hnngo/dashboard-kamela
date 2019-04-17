import React, { Component } from 'react';
import data from '../../data.json';

export default class FXExchange extends Component {
  constructor(props) {
    super(props);

    this.state = {
      widthThreshold: 640,
      slideShow: undefined,
      resizeEvent: undefined

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

  renderConvertTable() {
    return (
      <div className="fxe-table-container">
        <div className="d-flex">
          <input
            placeholder="1"
          />
          <div className="fxe-table-country d-flex">
            <img src="https://www.countryflags.io/be/shiny/32.png" alt="country-flag"/>
            <h6>USD</h6>
          </div>
        </div>
        {/* <div className="d-flex"> */}
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
        {/* </div> */}
        <div className="d-flex">
          <input
            placeholder="1"
          />
          <div className="fxe-table-country d-flex">
            <img src="https://www.countryflags.io/be/shiny/32.png" alt="country-flag"/>
            <h6>USD</h6>
          </div>
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
    return <div/>;
  }

  renderFXE2() {
    // Checking if slideshow needed for rendering
    if (this.state.slideShow) {
      return (
        <div>
          {this.renderConvertTable()}
        </div>
      );
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
