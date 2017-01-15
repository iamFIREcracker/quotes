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
      legend: [
        {
          name: 'read at least 30m',
          goal: '>=5/7',
          goalDescription: 'at least 5 times in the last 7 days'
        },
        {
          name: 'exercise',
          goal: '>=3/7',
          goalDescription: 'three or more times a week'
        },
        {
          name: 'eat bread at lunch',
          goal: '<=0/7',
          goalDescription: 'never'
        },
        {
          name: 'dinner out',
          goal: '<=1/7',
          goalDescription: 'once a week'
        },
      ],
      entries: [
        {
          _date: '1 Jan',
          'read at least 30m': true,
          'exercise': true
        },
        {
          _date: '3 Jan',
          'read at least 30m': true,
          'exercise': true,
          'eat bread at lunch': true
        },
        {
          _date: '5 Jan',
          'exercise': true
        },
        {
          _date: '6 Jan',
          'read at least 30m': true
        },
        {
          _date: '7 Jan',
          'read at least 30m': true,
          'exercise': true
        },
        {
          _date: '9 Jan',
          'read at least 30m': true
        },
        {
          _date: '10 Jan',
          'read at least 30m': true
        },
        {
          _date: '12 Jan',
          'read at least 30m': true,
          'dinner out': true
        },
        {
          _date: '13 Jan',
          'read at least 30m': true,
          'dinner out': true
        },
        {
          _date: '15 Jan',
          'eat bread at lunch': true,
        },
      ],
    }
  }

  _componentDidMount() {
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
                console.log({ legend, entries });
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
      spreadsheetId: '1akhbqFlElr0iKnKmK0ZTQeNTBgvNgZVghEpDR9_MDvY',
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
      spreadsheetId: '1akhbqFlElr0iKnKmK0ZTQeNTBgvNgZVghEpDR9_MDvY',
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
    return (
      <div className="app">
        <h1 className="brand">“Resolutions”</h1>
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
