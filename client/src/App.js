import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.yo = this.yo.bind(this);
    this.state = {user: null};
  }

  yo() {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          var slackUser = JSON.parse(this.responseText)
          console.log(slackUser);
          // this.setState({user:slackUser})
        }
      };
      xhttp.open("GET", "/start", true);
      xhttp.send();

  }
  render() {

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <a href="/auth/slack">login slack</a>
        <a href="/auth/spotify">login spotify</a>
        <button onClick={this.yo}>start</button>
      </div>
    );
  }
}

export default App;
