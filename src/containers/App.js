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
          response => this.setState({ resolutions: parseResolutions(this.props.year, response.result.values) }),
          response => this.setState(response.result.error)
        );
      });
    });
  }

  render() {
    const dayWithProgress = <Day label={ 'Some progress' } progressed={ true } />;
    const dayWithAboveTarget = <Day label={ 'Yeah!' } aboveTarget={ true } />;
    const dayWithNothing = <Day label={ 'Not much...' } />;
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${this.props.spreadsheetId }`;
    const spreadsheetLink = <a target='_blank' href={ spreadsheetUrl }>spreadsheet</a>;
    return (
      <div className="app">
        <h1 className="brand">“Resolutions”</h1>
        <div className="description">
          <p>
            New year resolutions are defined in terms of <span className="action">actions</span> and <span className="frequency">frequencies</span>&nbsp;
            (read every day, run at least two days a week),
            and each calendar below says how you are faring with a specific new year resolution you set for yourself
          </p>
          <p>
            <ul>
              <li> { dayWithNothing } is a day in which you did not do anything special</li>
              <li> { dayWithProgress } is day in which you progressed toward your goal (eg. you exercised)</li>
              <li> { dayWithAboveTarget } is a day in which you are above your weekly target (eg. in the last week you checked on Facebook no more than 3 times)</li>
            </ul>
          </p>
        </div>
        { this.renderContent() }
        <div className="footer">
          <p>
            This page reads data from this { spreadsheetLink }.  You can visualize your new year
            resolutions by setting the Location hash property equal to the ID of your spreadsheet.
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
          year={ this.props.year }
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
    year: React.PropTypes.number.isRequired,
  };
}

export default App;
