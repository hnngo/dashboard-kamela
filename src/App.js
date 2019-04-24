import React, { Component } from 'react';
import './styles/App.css';
import './styles/mediaquerries.css';
import SideBar from './components/SideBar';
import DashBoard from './components/DashBoard';

class App extends Component {
  render() {
    return (
      <div>
        <SideBar />
        <div className="outside-sidebar pb-5">
          <h5 className="dashboard-title">Dashboard</h5>
          <div className="dashboard-container">
            <DashBoard />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
