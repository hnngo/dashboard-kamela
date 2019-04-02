import React, { Component } from 'react';
import data from '../../company_data_100.json';

export default class CompanyOverview extends Component {
  renderTableData() {
    return data.map((item, i) => {
      const today = new Date();
      today.setDate(today.getDate() - i)
      return (
        <div className="co-table-row" key={i}>
          <div className="row">
            <div className="col-xl-3">
              <p className="m-0">
                {item.company}
              </p>
            </div>
            <div className="col-xl-2">
              <p className="m-0">
                {today.toLocaleDateString()}
              </p>
            </div>
            <div className="col-xl-2">
              <p className="m-0">
                {item.first_name} {item.last_name}
              </p>
            </div>
            <div className="col-xl-2">
              <p className="m-0">
                {item.stock_name}
              </p>
            </div>
            <div className="col-xl-3">
              <p className="m-0">
                {item.stock_industry}
              </p>
            </div>
          </div>
        </div>
      );
    })
  }
  render() {
    return (
      <div className="co-container">
        <h4 className="mt-2 ml-2">Company Overview</h4>
        <div className="co-table">
          <div className="co-table-header row">
            <div className="col-xl-3">
              <h5>Company</h5>
            </div>
            <div className="col-xl-2">
              <h5>Date</h5>
            </div>
            <div className="col-xl-2">
              <h5>Managed By</h5>
            </div>
            <div className="col-xl-2">
              <h5>Stock Name</h5>
            </div>
            <div className="col-xl-3">
              <h5>Stock Industry</h5>
            </div>
          </div>
          <div className="w-100 border" />
          <div className="co-table-data">
            {this.renderTableData()}
          </div>
        </div>
      </div>
    );
  }
}
