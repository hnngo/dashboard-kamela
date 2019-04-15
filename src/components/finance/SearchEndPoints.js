import React, { Component } from 'react';
import axios from 'axios';

export default class SearchEndPoints extends Component {
  constructor(props) {
    super(props);

    this.state = {
      result: undefined,
      choice: undefined,
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

  handleClickDetail(index) {
    this.setState({ choice: index }, () => {
      // Let all the data fly left
      const $rowData = document.querySelector(".se-row .animated");
      const $rowDetail = document.querySelector(".se-detail");

      if ($rowData && $rowDetail) {
        $rowData.classList.remove("fadeInLeft");
        $rowData.classList.add("fadeOutLeft");

        setTimeout(() => {
          $rowData.style.display = "none";
          $rowDetail.style.display = "block";
          $rowDetail.classList.remove("fadeOutRight", "fast");
          $rowDetail.classList.add("fadeInRight");
        }, 400);
      }
    });
  }

  handleClickBack() {
    // Let all the data fly left
    const $rowData = document.querySelector(".se-row .animated");
    const $rowDetail = document.querySelector(".se-detail");

    if ($rowData && $rowDetail) {
      $rowDetail.classList.remove("fadeInRight");
      $rowDetail.classList.add("fadeOutRight");

      $rowData.style.display = "block";
      $rowData.classList.remove("fadeOutLeft");
      $rowData.classList.add("fadeInLeft");;
    }

    this.setState({ choice: undefined })
  }

  async handleClickSearch() {
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
      const divClass = (window.screen.width >= 600) ? "col-6" : "col-12";

      return (
        <div
          key={i}
          className={"se-res " + divClass}
          onClick={() => this.handleClickDetail(i)}
        >
          <p className="se-symbol">{item["1. symbol"]}</p>
          <p>{item["2. name"]}</p>
        </div>
      );
    });
  }

  renderDetailMatchedData() {
    if (this.state.choice === undefined) {
      return;
    }

    const item = this.state.result[this.state.choice];
    let divClass = (window.screen.width >= 600) ? "col-6" : "col-12";
    divClass += " d-flex"

    return (
      <div className="se-detail animated">
        <i
          className="se-back fas fa-arrow-circle-left"
          onClick={() => this.handleClickBack()}
        />
        <div className="row">
          <div className={divClass}>
            <p>Symbol:&nbsp;
            <span className="info">{item["1. symbol"]}</span></p>
          </div>
          <div className={divClass}>
            <p>Name:&nbsp;<span className="info">{item["2. name"]}</span></p>
          </div>
          <div className={divClass}>
            <p>Type:&nbsp;<span className="info">{item["3. type"]}</span></p>
          </div>
          <div className={divClass}>
            <p>Region:&nbsp;<span className="info">{item["4. region"]}</span></p>
          </div>
          <div className={divClass}>
            <p>Market Open:&nbsp;<span className="info">{item["5. marketOpen"]}</span></p>
          </div>
          <div className={divClass}>
            <p>Market Close:&nbsp;<span className="info">{item["6. marketClose"]}</span></p>
          </div>
          <div className={divClass}>
            <p>Time Zone:&nbsp;<span className="info">{item["7. timezone"]}</span></p>
          </div>
          <div className={divClass}>
            <p>Currency:&nbsp;<span className="info">{item["8. currency"]}</span></p>
          </div>
        </div>
      </div>
    );
  }

  renderSearchResults() {
    if (this.state.result) {
      if (this.state.result.length > 0) {
        return (
          <div className="se-row">
            <div className="animated">
              <div className="row">
                {this.renderMatchedData()}
              </div>
            </div>
            {this.renderDetailMatchedData()}
          </div>
        );
      } else {
        return (
          <div className="se-no-res">
            <p>There are no resuls for <span>"{this.state.inputSearch}"</span></p>
          </div>
        );
      }
    } else {
      return (
        <div className="se-no-res">
          <p>Are you looking for <span>symbols</span> or <span>companies</span> ?</p>
          <p className="text-muted mt-3">Just enter a symbol on the top left corner <i className="fas fa-search" /> and let us help you find the best match</p>
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
            onClick={() => this.handleClickSearch()}
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
