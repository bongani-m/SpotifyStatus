import React, { Component } from 'react';

class Track extends Component {

    render() {
        return (
            <div>
                <h2>Track: {this.props.name}</h2>
                <h3>Artist: {this.props.artists[0].name}</h3>
                <h3>Album: {this.props.album.name}</h3>
                <img src={this.props.album.images[0].url} alt={"alt"}/>
            </div>
        )
    }
}

export default Track;  