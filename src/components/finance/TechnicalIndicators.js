import React, { Component } from 'react';
import LineIndicators from '../graphs/LineIndicators';
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
      selectSTS: "INS"
    }
  }

  handleSelectTI(e) {
    this.setState({ selectTI: e.target.value });
  }

  handleSelectSTS(e) {
    this.setState({ selectSTS: e.target.value });
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
              className="form-control"
              placeholder={`Enter a symbol. Ex: "AAPL" or select one beside`}
            />
            <select
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
            </select>
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
