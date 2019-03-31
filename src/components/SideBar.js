import React, { Component } from 'react';
import data from '../data.json';

export default class SideBar extends Component {
  render() {
    return (
      <div className="sidebar-container">
        <div className="d-inline">
          <img
            src={data.logoWithSlogan}
            className="img-fluid"
          />
        </div>
        <div className="sidebar-bars">
          <i className="fas fa-bars d-md-block d-lg-none" />
        </div>
        <div className="sidebar-icon-container mt-5 d-none d-lg-block">
          <div className="d-flex align-items-center flex-column h-100">
            <div className="">
              <i className="py-3 d-block fas fa-home" />
              <i className="py-3 d-block far fa-calendar-check" />
            </div>
            <div className="py-3 mt-auto">
              <i className="py-3 d-block fas fa-cog" />
              <i className="py-3 d-block fas fa-question-circle" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
