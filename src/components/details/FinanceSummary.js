import React, { Component } from 'react';
import PieChart from '../graphs/PieChart';

export default class FinanceSummary extends Component {
  renderInfo() {

  }

  render() {
    return (
      <div className="fs-container h-100">
        <div>
          <select className="custom-select" id="inlineFormCustomSelect">
            <option value="1">Top 10 Stock Market Cap Companies</option>
            <option value="2">Top 50 Stock Market Cap Companies</option>
            <option value="3">Top 100 Stock Market Cap Companies</option>
          </select>
        </div>
        <div className="row">
          <div className="col-6 my-5">
            <PieChart
              chartName={"FinanceSummary"}
              data={this.props.data}
            />
          </div>
          <div className="col-6">
            {this.renderInfo()}
          </div>
        </div>
      </div>
    );
  }
}

//TODO: Add more information about top companys or just #1 company

/*
Company Name
Loop Inc.
SM cap:
$520,000
Business Description:
Lorem Ipsum is simply dummy text of the printing and typesetting industry.
Employee Amount:
1,300
Emal:
supporet@keenthemes.com
Phone:
(0) 123 456 78 90
Annual Companies Taxes EMS
$500,000
Next Tax Review Date
July 24,2017
Total Annual Profit Before Tax
$3,800,000
Type Of Market Share
Grossery
Avarage Product Price
$60,70
Satisfication Rate

*/