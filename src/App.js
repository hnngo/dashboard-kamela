import React, { Component } from 'react';
import './styles/App.css';
import './styles/mediaquerries.css';
import SideBar from './components/SideBar';

class App extends Component {
  render() {
    return (
      <div>
        <SideBar />
        <div className="outside-sidebar">
          <h1 className="display-1">Under/Beside Sidebar</h1>
          <h1 className="display-1">Under/Beside Sidebar</h1>
          <h1 className="display-1">Under/Beside Sidebar</h1>
          <h1 className="display-1">Under/Beside Sidebar</h1>
          <h1 className="display-1">Under/Beside Sidebar</h1>
          <h1 className="display-1">Under/Beside Sidebar</h1><h1 className="display-1">Under/Beside Sidebar</h1><h1 className="display-1">Under/Beside Sidebar</h1><h1 className="display-1">Under/Beside Sidebar</h1><h1 className="display-1">Under/Beside Sidebar</h1>
        </div>
      </div>
    );
  }
}

export default App;
