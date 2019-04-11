import React, { Component } from 'react';
import LineIndicators from '../graphs/LineIndicators';
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
      selectTI: TI_CCI
    }
  }

  handleSelectTI(e) {
    this.setState({ selectTI: e.target.value });
  }

  render() {
    return (
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
        <div className="row">
          <LineIndicators
            chartName={"TI"}
            tiType={this.state.selectTI}
          />
        </div>
        <div className="row">
          <div className="board-title ml-3 d-flex justify-content-between">
            <h5 className="pt-3 pl-3 bold">Stock Times Series</h5>
          </div>
          <LineStockSeries
            chartName={"SS"}
            tiType={this.state.selectTI}
          />
        </div>
      </div>
    );
  }
}
