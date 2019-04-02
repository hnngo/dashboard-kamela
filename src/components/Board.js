import React, { Component } from 'react';

export default class Board extends Component {
  render() {
    return (
      <div className="board-container">
        {this.props.component}
      </div>
    );
  }
}
