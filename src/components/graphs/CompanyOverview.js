import React, { Component } from 'react';
import data from '../../company_data_500.json';

export default class CompanyOverview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: 1,
      maxPage: 5
    }
  }

  componentDidUpdate() {

  }

  handleClickPagination(e) {
    const clickTarget = e.target.innerHTML;

    if (clickTarget === "Previous" && this.state.currentPage > 1) {
      this.setState({ currentPage: this.state.currentPage - 1 });
    } else if (clickTarget === "Next" && this.state.currentPage < 5) {
      this.setState({ currentPage: this.state.currentPage + 1 });
    } else {
      this.setState({ currentPage: +clickTarget });
    }
  }

  renderPagination() {
    const pagIndex = ["Previous", 1, 2, 3, 4, 5, "Next"];
    return (
      <div className="co-pagination-container">
        <nav>
          <ul className="pagination">
            {
              pagIndex.map((index, i) => {
                let liClass = "page-item";
                let btnClass = "page-link";

                if (this.state.currentPage === index) {
                  btnClass += " co-activePage";
                } else if (index === "Previous" && this.state.currentPage === 1) {
                  liClass += " disabled"
                } else if (index === "Next" && this.state.currentPage === 5) {
                  liClass += " disabled"
                }

                return (
                  <li key={i} className={liClass}>
                    <button
                      id={"pag" + index}
                      className={btnClass}
                      onClick={(e) => this.handleClickPagination(e)}
                    >
                      {index}
                    </button>
                  </li>
                );
              })
            }
          </ul>
        </nav>
      </div>
    );
  }

  renderTableData() {
    return data.map((item, i) => {
      const today = new Date();
      today.setDate(today.getDate() - i)
      return (
        <div className="co-table-row" key={i}>
          <div className="row">
            <div className="col-xl-3 data-row">
              <p className="m-0">
                {item.company}
              </p>
            </div>
            <div className="col-xl-2 data-row">
              <p className="m-0">
                {today.toLocaleDateString()}
              </p>
            </div>
            <div className="col-xl-3 data-row">
              <div className="d-flex">
                <img src={item.ava} />
                <p className="m-0 my-auto">
                  {item.first_name} {item.last_name}
                </p>
              </div>
            </div>
            <div className="col-xl-2 data-row">
              <p className="m-0">
                {item.stock_sector}
              </p>
            </div>
            <div className="col-xl-2 data-row">
              <p className="m-0">
                {item.smcap}
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
        <h5 className="mt-2 ml-2">Company Overview</h5>
        <div className="co-table">
          <div className="co-table-header row">
            <div className="col-xl-3">
              <h5>Company</h5>
            </div>
            <div className="col-xl-2">
              <h5>Date</h5>
            </div>
            <div className="col-xl-3 text-center">
              <h5 className="">Managed By</h5>
            </div>
            <div className="col-xl-2">
              <h5>Stock Sector</h5>
            </div>
            <div className="col-xl-2">
              <h5>Stock Market Cap</h5>
            </div>
          </div>
          <div className="w-100 border" />
          <div className="co-table-data">
            {this.renderTableData()}
          </div>
          <div>
            {this.renderPagination()}
          </div>
        </div>
      </div>
    );
  }
}

//TODO: Click changing page
//TODO: Restyle same width for each button
