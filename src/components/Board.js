import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Board extends Component {
  constructor(props) {
    super(props);

    // Loop interval for resize checking
    const resizeEvent = setInterval(() => {
      const currentSize = window.screen.width;
      if (currentSize < 1200 && this.state.isCurrentScreenBig) {
        this.setState({ isCurrentScreenBig: false });
      } else if (currentSize >= 1200 && !this.state.isCurrentScreenBig) {
        this.setState({ isCurrentScreenBig: true });
      }
    }, 200);

    this.state = {
      resizeEvent,
      isCurrentScreenBig: (window.screen.width >= 1200) ? true : false
    };
  }

  componentDidMount() {
    // Loop interval for resize checking
    // const resizeEvent = setInterval(() => {
    //   const currentSize = window.screen.width;
    //   if (currentSize < 1200 && this.state.isCurrentScreenBig) {
    //     this.setState({ isCurrentScreenBig: false });
    //   } else if (currentSize >= 1200 && !this.state.isCurrentScreenBig) {
    //     this.setState({ isCurrentScreenBig: true });
    //   }
    // }, 200);

    // this.setState({ resizeEvent });
  }

  componentWillUnmount() {
    clearInterval(this.state.resizeEvent);
  }

  renderTitle() {
    if (this.props.title) {
      return (
        <div className="board-title pt-3 pl-3">
          <h5>{this.props.title}</h5>
        </div>
      );
    }
  }

  render() {
    const height = this.state.isCurrentScreenBig ? this.props.height.toString() : "auto";
    console.log(this.state.isCurrentScreenBig)
    console.log(height)
    return (
      <div className="board-container" style={{ height }}>
        {this.renderTitle()}
        {this.props.component}
      </div>
    );
  }
}

Board.propTypes = {
  component: PropTypes.element.isRequired,
  title: PropTypes.string
};
