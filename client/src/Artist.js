import React, { Component } from 'react';

class Artist extends Component {

    render() {
        var genres = this.props.genres.map((genre, id)=> {
            return <li>{genre}</li>
        })

        return (
            <div>
                <h2>Name: {this.props.name}</h2>
                <h3>Popularity: {this.props.popularity}</h3>
                <img src={this.props.images[0].url} alt={"alt"}/>
                <ul>{genres}</ul>
            </div>
        )
    }
}

export default Artist;  