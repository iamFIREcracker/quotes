import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';

import Alert from './Alert';
import Calendar from './Calendar';
import Day from './Day';
import Loader from './Loader';

import './App.css';

const DAYS_PER_ROW = 21;
const DAYS = DAYS_PER_ROW * Math.ceil(365 / DAYS_PER_ROW);

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
    this.todayLabel = this.today.format('D MMM');
    this.firstMonday = moment().startOf('year').startOf('isoweek');
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
          daysPerRow={ DAYS_PER_ROW }
        >
          { this.getDays(legend) }
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
    const data = this.getDaysData(legend);
    return data.map(({ dayLabel, differentYear, afterToday, score, done }, i) => {
      if (differentYear) {
        return undefined;
      }
      if (afterToday) {
        return (
          <Day
            key={ dayLabel }
            label={ dayLabel }
          >
          </Day>
        );
      }

      const prevScore = (data[i - 1] && data[i - 1].score) || 0;
      const nextScore = (data[i + 1] && data[i + 1].score) || 0;

      const label = this.getContainerLabel(legend, dayLabel, score);
      const isToday = this.todayLabel === dayLabel;
      const scored = done;
      const success = score >= 100;
      const firstInARow = success && prevScore < 100;
      const lastInARow = success && nextScore < 100;
      return (
        <Day
          key={ dayLabel }
          label={ label }
          isToday={ isToday }
          scored={ scored }
          success={ score >= 100 }
          firstInARow={ firstInARow }
          lastInARow={ lastInARow }
        >
        </Day>
      );
    });
  }

  getDaysData(legend) {
    const entriesByDate = _.keyBy(this.state.entries, '_date');
    const mostRecent = _.times(7, _.constant(false));
    return _.range(DAYS + 1).map((i) => {
      const day = this.firstMonday.clone().add(i, 'days');
      const dayLabel = day.format('D MMM');
      if (day.year() !== this.today.year()) {
        return { dayLabel, differentYear: true };
      }

      if (day.isAfter(this.today)) {
        return { dayLabel, afterToday: true };
      }

      mostRecent.push(!!(entriesByDate[dayLabel] && entriesByDate[dayLabel][legend.name]));
      mostRecent.shift();
      const score = this.getScore(legend, mostRecent);
      const done = _.last(mostRecent);

      return { dayLabel, score, done };
    });
  }

  getScore(legend, mostRecent) {
    const goal = legend.goal.num / legend.goal.den;

    const last = _.takeRight(mostRecent, legend.goal.den);
    const score = _.sum(last) / legend.goal.den;
    return score * 100 / goal;
  }

  getContainerLabel(legend, dayLabel, score) {
    let label = dayLabel;
    if (this.todayLabel === dayLabel) {
      label = 'Today';
    }
    const goal = legend.goal.num / legend.goal.den;
    const done = parseFloat((score * goal / 100 * legend.goal.den).toFixed(1));
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
    if (score >= 100) {
      label = `${label} — you did it!`;
    }
    return label;
  }

  static propTypes = {
    refreshInterval: React.PropTypes.number.isRequired,
    spreadsheetId: React.PropTypes.string.isRequired,
  };
}

export default App;
