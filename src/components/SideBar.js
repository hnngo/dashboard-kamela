import React, { Component } from 'react';
import data from '../data.json';
import {
  SIDE_HOME,
  SIDE_CALENDAR,
  SIDE_SETTING,
  SIDE_HELP
} from '../constants';

export default class SideBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reloadImg: false,
      subSideType: undefined,
      offsetSubSide: 0
    };
  }

  componentDidUpdate() {
    const $sideBarOffset = document.querySelector('.sidebar-sub-offset');

    if ($sideBarOffset) {
      $sideBarOffset.style.height = this.state.offsetSubSide + "px";
    }
  }

  removeAllBgSilver() {
    const targetList = ["fa-home", "fa-calendar-check", "fa-cog", "fa-question-circle"];

    targetList.forEach((item) => {
      document.querySelector(`.${item}`).classList.remove("bg-silver");
    });
  }

  toggleSideAndEffectIcon(type, target) {
    // Get the offset of icon
    const offset = this.getScreenY(target.classList[4]);
    if (this.state.subSideType === type) {
      target.classList.remove("bg-silver");
      this.setState({
        subSideType: undefined,
        offsetSubSide: 0
      });
    } else {
      this.removeAllBgSilver();
      target.classList.add("bg-silver");
      this.setState({
        subSideType: type,
        offsetSubSide: offset - 180
      });
    }
  }

  getScreenY(nameClass) {
    // Get the y position of each sub icon
    let y = document.querySelector('.' + nameClass).getBoundingClientRect().top;

    return nameClass === "fa-question-circle" ? y - 60 : y;
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
        this.toggleSideAndEffectIcon(SIDE_HELP, type);
        return;
      default:
        return;
    }
  }

  handleClickDim(e) {
    if (e.clientX > 480) {
      this.setState({ subSideType: undefined });
      this.removeAllBgSilver();
    }
  }

  renderSubSidebar() {
    if (this.state.subSideType) {
      return (
        <div className="sidebar-sub-container d-flex ">
          <div
            className="sidebar-sub-mainnav animated fadeInLeft faster"
            onMouseDown={(e) => this.handleClickDim(e)}
          >
            <div className="w-100 mt-3 text-right">
              <i
                className="fas fa-times mr-3 h4"
                onClick={() => {
                  this.setState({ subSideType: undefined });
                  this.removeAllBgSilver();
                }}
              />
            </div>
            <div className="sidebar-sub-listItems">
              <div className="sidebar-sub-offset" />
              {this.renderContentSubSidebar()}
            </div>
          </div>
        </div>
      )
    }
  }

  renderContentSubSidebar() {
    let obj = undefined;
    switch (this.state.subSideType) {
      case SIDE_HOME:
        obj = data.sidebar.home;
        break;
      case SIDE_CALENDAR:
        obj = data.sidebar.calendar;
        break;
      case SIDE_SETTING:
        obj = data.sidebar.settings;
        break;
      case SIDE_HELP:
        obj = data.sidebar.help;
        break;
      default:
        return;
    }

    // Get the keys from object
    let keys = Object.keys(obj);
    return keys.map((item, i) => {
      return (
        <div className="mb-2" key={i}>
          <div className="d-inline">
            <i className={obj[item]} />
          </div>
          <p key={i} className="d-inline">{item.charAt(0).toUpperCase() + item.slice(1)}</p>
        </div>
      );
    });
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
        {this.renderSubSidebar()}
      </div>
    );
  }
}
