import React, { Component } from 'react';

export default class SlideChoice extends Component {
  constructor(props) {
    super(props);

    this.state = {
      totalWidth: 0,
      choice: 0,
      selectedPos: 0,
      selectedWidth: 0,
    };
  }

  componentDidMount() {
    // Passing default selected props to parent
    this.props.onSelect(this.props.selections[0]);

    // Calculate the total div of choices
    let totalWidth = 0;
    this.props.selections.forEach((item, i) => {
      totalWidth += document.querySelector(".sel" + i).clientWidth;
    })
    
    // Calculate the first init width of selected div
    this.setState({
      totalWidth: totalWidth + 10, // 10 for margin
      selectedWidth: document.querySelector(".sel0").clientWidth,
    });
  }

  handleClickChoice(e) {
    // Get the choice id
    const id = e.target.parentNode.classList[e.target.parentNode.classList.length - 1].slice(3);

    const $selected = document.querySelector(".sel" + id);
    if ($selected) {
      // Get the selected position and width
      let pos = 0;
      for (let x = 0; x < +id; x++) {
        pos += document.querySelector(".sel" + x).clientWidth;
      }

      const width = $selected.clientWidth;

      this.setState({
        choice: +id,
        selectedPos: pos,
        selectedWidth: width
      });

      // Passing props to parents component
      this.props.onSelect(e.target.innerHTML);
    }
  }

  renderSlideChoices() {
    // Check if choice is selected then mark as selected style
    return this.props.selections.map((selection, i) => {
      let divClass = "d-inline";

      if (i === this.state.choice) {
        divClass += " sc-selected";
      } else {
        divClass += " sc-nonSelected";
      }

      return (
        <div key={i} className={divClass + " sel" + i}>
          <p
            className={"m-0"}
            onClick={(e) => this.handleClickChoice(e)}
          >{selection}</p>
        </div>
      );
    })
  }

  render() {
    return (
      <div className="sc-container" style={{ width: this.state.totalWidth }}>
        <div className="sc-bg-selected" style={{ left: this.state.selectedPos, width: this.state.selectedWidth }} />
        <div className="sc-choices">
          {this.renderSlideChoices()}
        </div>
      </div>
    );
  }
}
