import React, { Component } from 'react';
import _ from 'lodash';
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
        this.loadData((data, error) => {
          if (error) {
            this.setState({
              error
            });
          } else {
            this.setState({
              legend: data.legend,
              entries: data.entries
            });
          }
        });
      });
    });
  }

  loadData(callback) {
    let goalsName;
    let goalsFormula;
    let goalsDescription;
    let legend = [];
    const entries = [];
    window.gapi.client.sheets.spreadsheets.values.get({
      key: 'AIzaSyDwSI9VlOBTMTYoXR4_S3agLDJhph0lTKg',
      spreadsheetId: this.props.spreadsheetId,
      range: `Data!A1:${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[20]}`
    }).then(
      (response) => {
        const data = response.result.values || [];
        data.forEach(row => {
          if (!goalsName) {
            goalsName = row.filter(v => v);
          } else if (!goalsFormula) {
            goalsFormula = row.filter(v => v);
          } else if (!goalsDescription) {
            goalsDescription = row.filter(v => v);
            legend = _.zipWith(goalsName, goalsFormula, goalsDescription, (name, goal, goalDescription) => ({
              name, 
              goal,
              goalDescription
            }));
          } else {
            const date = moment.utc(row[0], 'M/D/YYYY').format('D MMM');
            let done = {};
            let i = 1;
            while (i < row.length) {
              if (row[i]) {
                done[legend[i - 1].name] = true
              }
              i++;
            }
            entries.push({ _date: date, ...done });
          }
        });
        callback({ legend, entries });
      }, (response) => {
        callback(null, response.result.error);
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
