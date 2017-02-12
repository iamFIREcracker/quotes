import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';

import Alert from '../components/Alert';
import Calendar from '../components/Calendar';
import Loader from '../components/Loader';

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
      this.reload();
      this.timerID = setInterval(
        () => this.reload(),
        this.props.refreshInterval
      );
    });
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  reload() {
    console.log(new Date(), 'reload');
    this.today = moment().startOf('day');
    this.firstDayOfYear = moment().startOf('year');
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
            goalsFormula = row.filter(v => v).map(v => {
              const groups = /([0-9]+)\/([0-9]+)/.exec(v);
              const num = parseInt(groups[1], 10);
              const den = parseInt(groups[2], 10);
              return { num, den };
            });
          } else if (!goalsDescription) {
            goalsDescription = row.filter(v => v);
            legend = _.zipWith(goalsName, goalsFormula, goalsDescription, (name, goal, frequency) => ({
              name, 
              goal,
              frequency
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
          goal={ legend.name }
          frequency={ legend.frequency }
          days={ this.getDays(legend) }
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

  getDays(legend) {
    const entriesByDate = _.keyBy(this.state.entries, '_date');
    const mostRecent = _.times(legend.goal.den, _.constant(false));
    return _.range(365).map((i) => {
      const day = this.firstDayOfYear.clone().add(i, 'days');
      if (day.isAfter(this.today)) {
        const label = this.getLabel(day);
        return { label };
      } else {
        const dayLabel = day.format('D MMM');
        mostRecent.push(!!(entriesByDate[dayLabel] && entriesByDate[dayLabel][legend.name]));
        mostRecent.shift();

        const improvement = _.last(mostRecent);
        const successPercentage = this.getSuccessPercentage(legend, mostRecent);
        const success = successPercentage >= 100;
        const label = this.getLabel(day, legend, successPercentage);
        const isToday = this.isToday(day);
        return { label, isToday, improvement, success };
      }
    });
  }

  getSuccessPercentage(legend, mostRecent) {
    const goal = legend.goal.num / legend.goal.den;

    const last = _.takeRight(mostRecent, legend.goal.den);
    const actual = _.sum(last) / legend.goal.den;
    return actual * 100 / goal;
  }

  getLabel(day, legend, successPercentage) {
    let label = day.format('ddd D MMM');
    if (this.isToday(day)) {
      label = 'Today';
    }
    if (legend) {
      const goal = legend.goal.num / legend.goal.den;
      const done = parseFloat((successPercentage * goal / 100 * legend.goal.den).toFixed(1));
      const period = legend.goal.den;
      switch (done) {
        case 0:
          break;
        case 1:
          label = `${label} — 1 time in the last ${period} days`;
          break;
        default:
          label = `${label} — ${done} times in the last ${period} days`;
          break;
      }
    }
    return label;
  }

  isToday(day) {
    return this.today.isSame(day);
  }

  static propTypes = {
    refreshInterval: React.PropTypes.number.isRequired,
    spreadsheetId: React.PropTypes.string.isRequired,
  };
}

export default App;
