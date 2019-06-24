import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './Home';
import './app.css';
import ReactImage from './react.png';

export default class App extends Component {
  state = { username: null };

  componentDidMount() {
    fetch('/api/getUsername')
      .then(res => res.json())
      .then(user => this.setState({ username: user.username }));
  }

  render() {
    return (
      <Router>
         <Route path="/" exact component={Home} />
      </Router>
    );
  }
}
