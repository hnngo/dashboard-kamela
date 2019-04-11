import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Board extends Component {
  constructor(props) {
    super(props);

    // Loop interval for resize checking
    const resizeEvent = setInterval(() => {
      const currentWidth = window.screen.width;
      if (currentWidth < 1200 && this.state.isCurrentScreenBig) {
        this.setState({ isCurrentScreenBig: false });
      } else if (currentWidth >= 1200 && !this.state.isCurrentScreenBig) {
        this.setState({ isCurrentScreenBig: true });
      }
    }, 200);

    this.state = {
      resizeEvent,
      isCurrentScreenBig: (window.screen.width >= 1200) ? true : false,
      titleHeight: 0,
    };
  }

  componentDidMount() {
    // Get height of the title to assign the rest space for content
    this.setState({ titleHeight: document.querySelector(".board-title").clientHeight });
  }

  componentWillUnmount() {
    clearInterval(this.state.resizeEvent);
  }

  renderOptionalHeader() {
    if (this.props.optionalHeader) {
      return this.props.optionalHeader;
    }
  }

  renderTitle() {
    if (this.props.title) {
      return (
        <div className="board-title d-flex justify-content-between">
          <h5 className="pt-3 pl-3 bold">{this.props.title}</h5>
          {this.renderOptionalHeader()}
        </div>
      );
    }
  }

  render() {
    const height = this.state.isCurrentScreenBig ? (this.props.height + "px") : "auto";

    return (
      <div
        className="board-container"
        style={{ height }}
      >
        {this.renderTitle()}
        <div
          className="board-content"
          style={{ height: `calc(100% - ${this.state.titleHeight}px)` }}
        >
          {this.props.component}
        </div>
      </div>
    );
  }
}

Board.propTypes = {
  component: PropTypes.element.isRequired,
  title: PropTypes.string,
  height: PropTypes.string.isRequired
};
