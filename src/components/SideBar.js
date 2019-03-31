import React, { Component } from 'react';
import data from '../data.json';
import {
  SIDE_HOME,
  SIDE_CALENDAR,
  SIDE_SETTING,
  SIDE_QUESTION
} from '../constants';

export default class SideBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reloadImg: false,
      subSideType: undefined
    };
  }

  removeAllBgSilver() {
    const targetList = ["fa-home", "fa-calendar-check", "fa-cog", "fa-question-circle"];

    targetList.forEach((item) => {
      document.querySelector(`.${item}`).classList.remove("bg-silver");
    });
  }

  toggleSideAndEffectIcon(type, target) {

    if (this.state.subSideType === type) {
      target.classList.remove("bg-silver");
      this.setState({ subSideType: undefined });
    } else {
      this.removeAllBgSilver();
      target.classList.add("bg-silver");
      this.setState({ subSideType: type });
    }
  }

  handleClickIcon(e) {
    // Get the specific type of icon
    const type = e.target;

    switch (type.classList[4]) {
      case "fa-home":
        this.toggleSideAndEffectIcon(SIDE_HOME, type);
        return;
      case "fa-calendar-check":
        this.toggleSideAndEffectIcon(SIDE_CALENDAR, type);
        return;
      case "fa-cog":
        this.toggleSideAndEffectIcon(SIDE_SETTING, type);
        return;
      case "fa-question-circle":
        this.toggleSideAndEffectIcon(SIDE_QUESTION, type);
        return;
      default:
        return;
    }
  }

  renderSubSideBar() {
    if (this.state.subSideType) {
      return (
        <div className="sidebar-sub-container d-flex ">
          <div className="sidebar-sub-mainnav animated fadeInLeft faster">
            <div className="w-100 mt-3 text-right">
              <i
                className="fas fa-times mr-3 h4"
                onClick={() => {
                  this.setState({ subSideType: undefined });
                  this.removeAllBgSilver();
                }}
              />
            </div>
            <h1>{this.state.subSideType}</h1>
          </div>
          <div
            className="sidebar-sub-dimpart animated fadeIn slow"
            onClick={() => {
              this.setState({ subSideType: undefined });
              this.removeAllBgSilver();
            }}
          />
        </div>
      )
    }
  }

  render() {
    return (
      <div className="sidebar-container">
        <div className="d-inline">
          <img
            src={data.logoWithSlogan}
            className="img-fluid"
            alt="web-logo"
            onLoad={() => this.setState({ reloadImg: !this.state.reloadImg })}
          />
        </div>
        <div className="sidebar-bars">
          <i className="fas fa-bars d-md-block d-lg-none" />
        </div>
        <div className="sidebar-icon-container mt-5 d-none d-lg-block">
          <div className="d-flex align-items-center flex-column h-100">
            <div className="mt-5">
              <i
                className="my-4 p-2 d-block fas fa-home"
                onClick={(e) => this.handleClickIcon(e)}
              />
              <i
                className="my-4 p-2 d-block far fa-calendar-check"
                onClick={(e) => this.handleClickIcon(e)}
              />
            </div>
            <div className="mt-4 mt-auto">
              <i
                className="my-4 p-2 d-block fas fa-cog"
                onClick={(e) => this.handleClickIcon(e)}
              />
              <i
                className="mt-3 p-2 d-block fas fa-question-circle"
                onClick={(e) => this.handleClickIcon(e)}
              />
            </div>
          </div>
        </div>
        {this.renderSubSideBar()}
      </div>
    );
  }
}
