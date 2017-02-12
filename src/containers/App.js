import React, { Component } from 'react';
import _ from 'lodash';

import Alert from '../components/Alert';
import { Day, Calendar } from '../components/Calendar';
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
          response => this.setState({ resolutions: parseResolutions(response.result.values) }),
          response => this.setState(response.result.error)
        );
      });
    });
  }

  render() {
    console.log(Calendar);
    const dayWithProgress = <Day label={ 'Some progress' } progressed={ true } />;
    const dayWithAboveTarget = <Day label={ 'Yeah!' } aboveTarget={ true } />;
    const dayWithAboveTargetAndProgress = (
      <Day
        label={ 'Yeah!' }
        aboveTarget={ true }
        progressed={ true }
      />
    );
    const dayWithNothing = <Day label={ 'Not much...' } />;
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${this.props.spreadsheetId }`;
    const spreadsheetLink = <a target='_blank' href={ spreadsheetUrl }>spreadsheet</a>;
    return (
      <div className="app">
        <h1 className="brand">“Resolutions”</h1>
        <div className="description">
          <p>
            Each calendar says how you are faring with a specific new year resolution.
            Days in which nothing interesting has happened are represented by a { dayWithNothing },
            days in which there has been some kind of progress (eg. you exercised) are represented
            by a { dayWithProgress }, while days in which XXX (eg. you checked Facebook no more than
            3 times a week) are represented by either a { dayWithAboveTarget } or
            a { dayWithAboveTargetAndProgress }
          </p>
        </div>
        { this.renderContent() }
        <div className="footer">
          <p>
            This page reads data from this { spreadsheetLink }.  You can visualize your new year
            resolutions by setting the Location hash property to the ID of the spreadsheet
            containing your data.
          </p>
        </div>
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
          target={ resolution.target }
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
