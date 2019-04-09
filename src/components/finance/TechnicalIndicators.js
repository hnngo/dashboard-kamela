import React, { Component } from 'react';
import { DATA_VOLUME } from '../../constants';
import LineIndicators from '../graphs/LineIndicators';

export default class TechnicalIndicators extends Component {
  render() {
    return (
      <div>
        <div className="row">
          <LineIndicators
            chartName={"TI"}
            stockSymbol={"AAPL"}
            dataType={DATA_VOLUME}
            maxNumberOfData={15}
            showAxis={false}
            lineColor={"#008bf2"}
            areaColor={"#d0ebff"}
            titleColor={"#003d6a"}
          />
        </div>
        <div className="row">
          Sector 2
        </div>
      </div>
    );
  }
}
