import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Board extends Component {
  render() {
    return (
      <div className="board-container">
        {this.props.component}
      </div>
    );
  }
}

// Board.propTypes = {
//   component: PropTypes.element.isRequired
// };
