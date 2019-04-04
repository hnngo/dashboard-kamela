import React, { Component } from 'react';
import Board from './Board';
import CompanyOverview from './graphs/CompanyOverview';
import LineGraph from './graphs/LineGraph';
import {
  DATA_CLOSE,
  DATA_HIGH,
  DATA_LOW,
  DATA_OPEN,
  DATA_VOLUME
} from '../constants';

export default class DashBoard extends Component {
  render() {
    return (
      <div>
        <div className="row py-2">
          <div className="col-xl-8">
            <Board component={<CompanyOverview />} />
          </div>
          <div className="col-xl-4">
            <div className="row">
              <div className="col-12">
                <Board component={
                  <LineGraph
                    chartName={"MSFT-volume"}
                    stockSymbol={"MSFT"}
                    dataType={DATA_VOLUME}
                    maxNumberOfData={15}
                    offsetTop={120}
                    showAxis={false}
                    lineColor={"#1e5e21"}
                    areaColor={"#dcf4dd"}
                    titleColor={"#0e2b0f"}
                  />
                } />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <Board component={
                  <LineGraph
                    chartName={"PLXS-high"}
                    stockSymbol={"PLXS"}
                    dataType={DATA_VOLUME}
                    maxNumberOfData={15}
                    offsetTop={120}
                    showAxis={false}
                    lineColor={"#008bf2"}
                    areaColor={"#d0ebff"}
                    titleColor={"#003d6a"}
                  />
                } />
              </div>
            </div>
          </div>
        </div>
        <div className="row py-2">
          <div className="col-xl-4">
            <Board number={4} />
          </div>
          <div className="col-xl-4">
            <Board number={5} />
          </div>
          <div className="col-xl-4">
            <Board number={6} />
          </div>
        </div>
        <div className="row py-2">
          <div className="col-xl-4">
            <Board number={7} />
          </div>
          <div className="col-xl-4">
            <Board number={8} />
          </div>
          <div className="col-xl-4">
            <Board number={9} />
          </div>
        </div>
        <div className="row py-2">
          <div className="col-xl-8">
            <Board number={9} />
          </div>
          <div className="col-xl-4">
            <Board number={10} />
          </div>
        </div>
        <div className="row py-2">
          <div className="col-xl-4">
            <Board number={11} />
          </div>
          <div className="col-xl-4">
            <Board number={12} />
          </div>
          <div className="col-xl-4">
            <Board number={13} />
          </div>
        </div>
      </div>
    );
  }
}