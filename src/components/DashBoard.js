import React, { Component } from 'react';
import Board from './Board';
import CompanyOverview from './graphs/CompanyOverview';
import LineGraph from './graphs/LineGraph';

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
                <Board component={<LineGraph chartName="MSFT" />} />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <Board number={3} />
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