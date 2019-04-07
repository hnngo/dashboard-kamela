import React, { Component } from 'react';
import data from '../data.json';
import {
  SIDE_HOME,
  SIDE_CALENDAR,
  SIDE_SETTING,
  SIDE_HELP,
  SIDE_SMALL
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

  iconRemoveBg() {
    // Remove all icon background
    const targetList = ["fa-home", "fa-calendar-check", "fa-cog", "fa-question-circle"];

    targetList.forEach((item) => {
      document.querySelector(`.${item}`).classList.remove("bg-silver");
    });
  }

  iconToggleSideAndEffect(type, target) {
    // Get the offset of icon
    const offset = this.iconGetScreenY(target.classList[4]);

    this.iconRemoveBg();
    if (this.state.subSideType === type) {
      this.handleCloseSlide("sidebar-sub-mainnav");
    } else {
      target.classList.add("bg-silver");
      this.setState({
        subSideType: type,
        offsetSubSide: offset - 100
      });
    }
  }

  iconGetScreenY(nameClass) {
    // Get the y position of each sub icon
    let y = document.querySelector('.' + nameClass).getBoundingClientRect().top;

    return nameClass === "fa-question-circle" ? y - 60 : y;
  }

  handleCloseSlide(slideClass, exitStyle = "fadeOut") {
    const $slide = document.querySelector(`.${slideClass}`);

    if ($slide) {
      // $slide.classList.remove("fadeInLeft");
      $slide.classList.add(exitStyle);

      // Time out to make sure the animation fully loaded
      setTimeout(() => this.setState({
        subSideType: undefined,
        offsetSubSide: 0
      }), 300);
    }
  }

  handleClickIcon(e) {
    // Get the specific type of icon
    const type = e.target;

    switch (type.classList[4]) {
      case "fa-home":
        this.iconToggleSideAndEffect(SIDE_HOME, type);
        return;
      case "fa-calendar-check":
        this.iconToggleSideAndEffect(SIDE_CALENDAR, type);
        return;
      case "fa-cog":
        this.iconToggleSideAndEffect(SIDE_SETTING, type);
        return;
      case "fa-question-circle":
        this.iconToggleSideAndEffect(SIDE_HELP, type);
        return;
      default:
        return;
    }
  }

  handleClickDim(e) {
    const sWidth = window.screen.width;
    const eWidth = e.clientX;

    // Check dim area depends on screen width
    if (sWidth >= 992 && eWidth > 480) {
      this.iconRemoveBg();
      this.handleCloseSlide("sidebar-sub-mainnav");
    } else if (sWidth < 992 && eWidth < sWidth / 2) {
      this.handleCloseSlide("sidebar-smallSub-container");
    }
  }

  handleClickExpandNav(e) {
    const arrowChild = e.currentTarget.childNodes[1];
    let curStyle = arrowChild.style.transform;

    if (curStyle === "") {
      arrowChild.style.transform = "rotate(-90deg)";
    } else {
      arrowChild.style.transform = "";
    }
  }

  renderSubSidebarSmall() {
    if (this.state.subSideType === SIDE_SMALL) {
      return (
        <div className="d-md-block d-lg-none">
          <div
            className="sidebar-smallSub-container animated fadeIn faster"
            onClick={(e) => this.handleClickDim(e)}
          >
            <div className="sidebar-smallSub-content">
              {this.renderContentSubSidebarSmall()}
            </div>
          </div>
        </div>
      )
    }
  }

  renderContentSubSidebarSmall() {
    let res = [];
    let mainNav = ["home", "time", "settings", "help"]

    mainNav.forEach((item, i) => {
      res.push(
        <div key={i}>
          <div
            className="d-flex justify-content-between"
            onClick={(e) => this.handleClickExpandNav(e)}
            data-toggle="collapse"
            data-target={"#collapse" + item + i}
          >
            <p className="mb-1">{item.charAt(0).toUpperCase() + item.slice(1)}</p>
            <i className="fas fa-chevron-left" />
          </div>
          <div
            className="mb-3 collapse"
            id={"collapse" + item + i}
          >
            {
              Object.keys(data.sidebar[item]).map((cat) => {
                return (
                  <p key={cat} className="sidebar-smallSub-listItem">{cat}</p>
                );
              })
            }
          </div>
        </div>

      );
    })

    return res;
  }

  renderSubSidebarLarge() {
    if (this.state.subSideType && this.state.subSideType !== SIDE_SMALL) {
      return (
        <div className="d-none d-lg-block">
          <div className="sidebar-sub-container d-flex">
            <div
              className="sidebar-sub-mainnav animated fadeIn faster"
              onMouseDown={(e) => this.handleClickDim(e)}
            >
              <div className="sidebar-sub-listItems">
                <div className="sidebar-sub-offset" />
                {this.renderContentSubSidebarLarge()}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  renderContentSubSidebarLarge() {
    let obj = undefined;
    switch (this.state.subSideType) {
      case SIDE_HOME:
        obj = data.sidebar.home;
        break;
      case SIDE_CALENDAR:
        obj = data.sidebar.time;
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

        {/* Show on small screen */}
        <div className="sidebar-bars">
          <i
            className="fas fa-bars d-md-block d-lg-none"
            onClick={() => this.setState({ subSideType: SIDE_SMALL })}
          />
        </div>

        {/* Hide on small screen */}
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
        {this.renderSubSidebarLarge()}
        {this.renderSubSidebarSmall()}
      </div>
    );
  }
}

//TODO: Small screen overflow when expanding all category
