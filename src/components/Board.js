import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Board extends Component {
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
    return (
      <div className="board-container">
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
