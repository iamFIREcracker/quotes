import React, { Component } from 'react';
import _ from 'lodash';

import Alert from '../components/Alert';
import Calendar from '../components/Calendar';
import Loader from '../components/Loader';

import { parseResolutions } from '../helpers/resolutions';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resolutions: [],
    }
  }

  componentDidMount() {
    this.reload();
    this.timerID = setInterval(
      () => this.reload(),
      this.props.refreshInterval
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  reload() {
    window.gapi.load('client', () => {
      window.gapi.client.load('sheets', 'v4', () => {
        window.gapi.client.sheets.spreadsheets.values.get({
          key: 'AIzaSyDwSI9VlOBTMTYoXR4_S3agLDJhph0lTKg',
          spreadsheetId: this.props.spreadsheetId,
          range: `Data!A1:Z`
        }).then(
          response => this.setState({ resolutions: parseResolutions(response) }),
          response => this.setState(response.result.error)
        );
      });
    });
  }

  render() {
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${this.props.spreadsheetId }`;
    const locationHashUrl = `./#${this.props.spreadsheetId}`;
    return (
      <div className="app">
        <h1 className="brand">“Resolutions”</h1>
        <p className="description">
          * This page uses
          &nbsp;
          <a
            target='_blank'
            href={ spreadsheetUrl }
          >
            this
          </a>
          &nbsp;
          Google sheet as source of data.
        </p>
        <p className="description">
          ** You can change the sourced sheet by setting the Location hash property to its ID
          <br />
          (e.g.
          &nbsp;
          <a
            href={ locationHashUrl }
          >
            { locationHashUrl }
          </a>
          &nbsp;
          )
        </p>
        { this.renderContent() }
      </div>
    );
  }

  renderContent() {
    if (this.state.error) {
      return (
        <Alert error={ this.state.error } />
      );
    }
    if (this.state.resolutions.length) {
      const calendars = this.state.resolutions.map(resolution => (
        <Calendar
          key={ resolution.name }
          name={ resolution.name }
          frequency={ resolution.frequency }
          data={ resolution.diary }
        >
        </Calendar>
      ));
      return (
        <div>{ calendars }</div>
      );
    }
    return (
      <Loader />
    );
  }

  static propTypes = {
    refreshInterval: React.PropTypes.number.isRequired,
    spreadsheetId: React.PropTypes.string.isRequired,
  };
}

export default App;
