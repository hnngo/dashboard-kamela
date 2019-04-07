import React, { Component } from 'react';

export default class SlideChoice extends Component {
  constructor(props) {
    super(props);

    this.state = {
      choice: 0,
      selectedPos: 0,
      selectedWidth: 0,
    };
  }

  componentDidMount() {
    // Calculate the first init width of selected div
    this.setState({
      selectedWidth: document.querySelector("div.sel0").clientWidth,
    });
  }

  handleClickChoice(e) {
    // Get the choice id
    const id = e.target.classList[e.target.classList.length - 1].slice(3);

    const $selected = document.querySelector("div.sel" + id);
    if ($selected) {
      // Get the selected position and width
      let pos = 0;
      for (let x = 0; x < +id; x++) {
        pos += document.querySelector("div.sel" + x).clientWidth;
      }

      const width = $selected.clientWidth;

      this.setState({
        choice: +id,
        selectedPos: pos,
        selectedWidth: width
      }, () => {
        // Passing props to parents component
        this.props.onSelect(this.props.selections[this.state.choice]);
      });
    }
  }

  renderSlideChoices() {
    // Check if choice is selected then mark as selected style
    return this.props.selections.map((selection, i) => {
      let divClass = "d-inline";

      if (this.props.smallSlide || window.screen.width <= 576) {
        selection = selection.charAt(0)
      }

      if (i === this.state.choice) {
        divClass += " sc-selected";
      } else {
        divClass += " sc-nonSelected";
      }

      return (
        <div key={i} className={divClass + " sel" + i} onClick={(e) => this.handleClickChoice(e)}>
          <p className={"m-0 sel" + i}>{selection}</p>
        </div>
      );
    })
  }

  render() {
    return (
      <div className="sc-container">
        <div className="sc-bg-selected" style={{ left: this.state.selectedPos, width: this.state.selectedWidth }} />
        <div className="sc-choices">
          {this.renderSlideChoices()}
        </div>
      </div>
    );
  }
}

//TODO: FIXME: change screen width change selected bg
