import React, { Component } from 'react';

export default class Board extends Component {
  render() {
    return (
      <div className="board-container">
        <h1>Front Board {this.props.number}</h1>
      </div>
    );
  }
}
