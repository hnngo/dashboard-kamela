import React, { Component } from 'react';
import { DATA_VOLUME } from '../../constants';
import LineIndicators from '../graphs/LineIndicators';
import {
  SINGLE_HEIGHT,
  TI_APO,
  TI_CMO,
  TI_AROONOS,
  TI_CCI,
  TI_EMA,
  TI_ROC
} from '../../constants';

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
          <option value={TI_CCI}>Commodity Channel Index (CCI)</option>
          <option value={TI_AROONOS}>Aroon Oscillator (AROONOSC)</option>
          <option value={TI_CMO}>Chande Momentum Oscillator (CMO)</option>
          <option value={TI_APO}>Absolute Price Oscillator (APO)</option>
          <option value={TI_EMA}>Exponential Moving Average (EMA)</option>
          <option value={TI_ROC}>Rate of change (ROC)</option>
        </select>
        <div className="row">
          <LineIndicators
            chartName={"TI"}
            tiType={this.state.selectTI}
          />
        </div>
        <div className="row">
          Sector 2
        </div>
      </div>
    );
  }
}
