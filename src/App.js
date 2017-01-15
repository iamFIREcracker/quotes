import React, { Component } from 'react';
import moment from 'moment';

import Alert from './Alert';
import Calendar from './Calendar';
import Loader from './Loader';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      legend: [],
      entries: []
    }
  }

  componentDidMount() {
    window.gapi.load('client', () => {
      window.gapi.client.load('sheets', 'v4', () => {
        this.loadLegend((legend, error) => {
          if (error) {
            this.setState({
              error
            });
          } else {
            this.loadEntries(legend, (entries, error) => {
              if (error) {
                this.setState({
                  error
                });
              } else {
                this.setState({
                  legend,
                  entries
                });
              }
            });
          }
        });
      });
    });
  }

  loadLegend(callback) {
    window.gapi.client.sheets.spreadsheets.values.get({
      key: 'KEY',
      spreadsheetId: this.props.spreadsheetId,
      range: 'Legend!A2:C'
    }).then(
      (response) => {
        const data = response.result.values || [];
        const legend = data.map(row => {
          const name = row[0];
          const goal = row[1];
          const goalDescription = row[2];
          return { name, goal, goalDescription };
        })
        callback(legend);
      }, (response) => {
        callback(null, response.result.error);
      });
  }

  loadEntries(legend, callback) {
    window.gapi.client.sheets.spreadsheets.values.get({
      key: 'KEY',
      spreadsheetId: this.props.spreadsheetId,
      range: `Entries!A2:${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[legend.length + 1]}`
    }).then(
      (response) => {
        const data = response.result.values || [];
        const entries = data.map(row => {
          const date = moment.utc(row[0], 'M/D/YYYY').format('D MMM');
          let done = {};
          let i = 1;
          while (i < row.length) {
            if (row[i]) {
              done[legend[i - 1].name] = true
            }
            i++;
          }
          return { _date: date, ...done };
        })
        callback(entries);
      }, (response) => {
        callback(null, response.result.error);
      });
  }

  render() {
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${this.props.spreadsheetId }`;
    const locationHashUrl = `/#${this.props.spreadsheetId}`;
    return (
      <div className="app">
        <h1 className="brand">“Resolutions”</h1>
        <p className="description">
          * This page renders data taken from
          &nbsp;
          <a
            target='_blank'
            href={ spreadsheetUrl }
          >
            this
          </a>
          &nbsp;
          Google sheet
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
    if (this.state.legend.length && this.state.entries.length) {
      const calendars = this.state.legend.map(legend => (
        <Calendar
          key={ legend.name }
          title={ legend.name }
          goal={ legend.goal }
          goalDescription={ legend.goalDescription }
          entries={ this.state.entries }
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
}

export default App;
