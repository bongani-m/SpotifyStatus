import React, { Component } from 'react';
import './App.css';
import Track from './Track.js';
import Artist from './Artist.js';

class App extends Component {

  constructor(props) {
    super(props);
    this.yo = this.yo.bind(this);
    this.topArtists = this.topArtists.bind(this);
    this.topTracks = this.topTracks.bind(this);
    this.state = {user: null, artists: null, tracks: null, isArtist: false, isTrack: false};
  }

  yo() {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          var slackUser = JSON.parse(this.responseText)
          console.log(slackUser);
          this.setState({user:slackUser})
        }
      };
      xhttp.open("GET", "/start", true);
      xhttp.send();

  }

  topArtists() {
      var app = this;
      app.setState({isArtist: true, isTrack: false});
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          var data = JSON.parse(this.responseText)
          app.setState({artists: data.items.map((art) => {
            return <Artist name={art.name} images={art.images} popularity={art.popularity} genres={art.genres} />
          })});
        }
      };
      xhttp.open("GET", "/topartists", true);
      xhttp.send();

  }

  topTracks() {
      var app = this;
      app.setState({isArtist: false, isTrack: true});
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          var data = JSON.parse(this.responseText)
          app.setState({tracks: data.items.map((art) => {
            return <Track name={art.name} artists={art.artists} album={art.album} />
          })});
        }
      };
      xhttp.open("GET", "/toptracks", true);
      xhttp.send();

  }

  render() {

    return (
      <div className="App">
        <div className="App-header">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2000px-Spotify_logo_without_text.svg.png" className="App-logo" alt="logo" />
          <h2>Welcome to SpotifyStatus</h2>
        </div>
        <a href="/auth/slack">login slack</a>
        <a href="/auth/spotify">login spotify</a>
        <button onClick={this.yo}>start</button>
        <button onClick={this.topArtists}>artists</button>
        <button onClick={this.topTracks}>tracks</button>
        
        <div>
          {(this.state.isArtist)? this.state.artists : this.state.tracks}
          
        </div>
      </div>
    );
  }
}

export default App;
