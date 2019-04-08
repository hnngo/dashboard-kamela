import React, { Component } from 'react';
import axios from 'axios';

export default class SearchEndPoints extends Component {
  constructor(props) {
    super(props);

    this.state = {
      result: undefined,
      choice: 0,
      inputSearch: ""
    };
  }

  componentDidMount() {
    // Set initial width for input
    const $searchbar = document.querySelector(".se-searchbar");

    if ($searchbar) {
      if (window.screen.width > 576) {
        $searchbar.style.width = "48px";
      } else {
        document.querySelector("#se-input").placeholder = "search";
        $searchbar.style.width = "130px";
      }
    }
  }

  handleMouseEnter() {
    // Show input in large screen
    if (window.screen.width <= 576) {
      return;
    }

    const $searchbar = document.querySelector(".se-searchbar");

    if ($searchbar) {
      $searchbar.style.width = "200px";

      // Set timeout for collapsing input width if no input
      setTimeout(() => {
        if (!this.state.inputSearch) {
          $searchbar.style.width = "48px";
        }
      }, 3000);
    }
  }

  handleInputSearch(inputSearch) {
    // Set timeout for collapsing input width if user input then erase all input
    if (window.screen.width > 576) {
      const $searchbar = document.querySelector(".se-searchbar");
      setTimeout(() => {
        if (!inputSearch) {
          $searchbar.style.width = "48px";
        }
      }, 3000);
    }
    
    // Save the input search in state
    this.setState({ inputSearch });
  }

  async handleClick() {
    // Check if input nothing then do nothing
    if (!this.state.inputSearch) {
      return;
    }

    const res = await axios.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${this.state.inputSearch}&apikey=KJO1VD3QQ2D7BDOV`);

    // Check if return data is okay
    if (Object.keys(res.data).includes("bestMatches")) {
      this.setState({
        result: res.data["bestMatches"].slice(0, 10)
      });
    }
  }

  renderMatchedData() {
    return this.state.result.map((item, i) => {
      const divClass = (this.state.choice === i) ? "se-active" : "";

      return (
        <div key={i} className={divClass}>
          <p>{item["1. symbol"]}</p>
        </div>
      );
    });
  }

  renderDetailMatchedData() {
    const item = this.state.result[this.state.choice];

    return (
      <div className="se-detail">
        <div className="row">
          <div className="col-6 d-flex">
            <p>Symbol:&nbsp;
            <span className="info">{item["1. symbol"]}</span></p>
          </div>
          <div className="col-6 d-flex">
            <p>Name:&nbsp;<span className="info">{item["2. name"]}</span></p>
          </div>
        </div>
        <div className="row">
          <div className="col-6 d-flex">
            <p>Type:&nbsp;<span className="info">{item["3. type"]}</span></p>
          </div>
          <div className="col-6 d-flex">
            <p>Region:&nbsp;<span className="info">{item["4. region"]}</span></p>
          </div>
        </div>
        <div className="row">
          <div className="col-6 d-flex">
            <p>Market Open:&nbsp;<span className="info">{item["5. marketOpen"]}</span></p>
          </div>
          <div className="col-6 d-flex">
            <p>Market Close:&nbsp;<span className="info">{item["6. marketClose"]}</span></p>
          </div>
        </div>
        <div className="row">
          <div className="col-6 d-flex">
            <p>Time Zone:&nbsp;<span className="info">{item["7. timezone"]}</span></p>
          </div>
          <div className="col-6 d-flex">
            <p>Currency:&nbsp;<span className="info">{item["8. currency"]}</span></p>
          </div>
        </div>
      </div>
    );
  }

  renderSearchResults() {
    console.log(this.state.result)
    if (this.state.result) {
      if (this.state.result.length > 0) {
        return (
          <div>
            <div className="row se-row">
              {this.renderMatchedData()}
            </div>
            <div>
              {this.renderDetailMatchedData()}
            </div>
          </div>
        );
      } else {
        return <div />;
      }
    } else {
      return (
        <div className="se-no-res">
          <p>Are you looking for <span>symbols</span> or <span>companies</span> ?</p>
        </div>
      )
    }
  }

  render() {
    return (
      <div className="se-container">
        <div className="se-searchbar">
          <input
            id="se-input"
            type="text"
            placeholder="Enter a symbol"
            value={this.state.inputSearch}
            onChange={(e) => this.handleInputSearch(e.target.value)}
          />
          <button
            onMouseEnter={() => this.handleMouseEnter()}
            onClick={() => this.handleClick()}
          >
            <i className="fas fa-search" />
          </button>
        </div>
        {this.renderSearchResults()}
      </div>
    );
  }
}

//TODO: Enter to get results
//TODO: Handle input "" can click search
