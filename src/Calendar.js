import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Day from './Day';

import './Calendar.css';

const DAYS_PER_ROW = 21;
const DAYS = DAYS_PER_ROW * Math.ceil(365 / DAYS_PER_ROW);

export default class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.today = moment.utc().startOf('day');
    this.todayLabel = this.today.format('D MMM');
    this.firstMonday = moment.utc().startOf('year').startOf('isoweek');
    this.endOfYear = moment.utc().endOf('year');
  }

  render() {
    return (
      <div className="Calendar">
        <h2 className="title">{ this.props.title }</h2>
        <h3 className="description">{ this.props.goalDescription }</h3>
        { this.renderContent() }
      </div>
    );
  }

  renderContent() {
    const rows = _.chunk(this.getDays(), DAYS_PER_ROW).map((data, i) => {
      return (
        <tr key={ i }>{ data }</tr>
      );
    })
    return (
      <table>
        <tbody>
          { rows }
        </tbody>
      </table>
    );
  }
  getDays() {
    const data = this.getDaysData();
    return data.map(({ dayLabel, differentYear, afterToday, score, done }, i) => {
      if (differentYear) {
        return (
          <td key={ dayLabel } />
        );
      }
      if (afterToday) {
        return (
          <td
            key={ dayLabel }
          >
            <Day
              label={ dayLabel }
            />
          </td>
        );
      }

      const prevScore = (data[i - 1] && data[i - 1].score) || 0;
      const nextScore = (data[i + 1] && data[i + 1].score) || 0;

      const label = this.getContainerLabel(dayLabel, score);
      const isToday = this.todayLabel === dayLabel;
      const scored = done;
      const success = score >= 100;
      const firstInARow = success && prevScore < 100;
      const lastInARow = success && nextScore < 100;
      return (
        <td
          key={ dayLabel }
        >
          <Day
            label={ label }
            isToday={ isToday }
            scored={ scored }
            success={ score >= 100 }
            firstInARow={ firstInARow }
            lastInARow={ lastInARow }
          >
          </Day>
        </td>
      );

    });
  }

  getDaysData() {
    const entriesByDate = _.keyBy(this.props.entries, '_date');
    const mostRecent = _.times(7, _.constant(false));
    return _.range(DAYS + 1).map((i) => {
      const day = this.firstMonday.clone().add(i, 'days');
      const dayLabel = day.format('D MMM');
      if (day.year() !== this.endOfYear.year()) {
        return { dayLabel, differentYear: true };
      }

      if (day.isAfter(this.today)) {
        return { dayLabel, afterToday: true };
      }

      mostRecent.push(!!(entriesByDate[dayLabel] && entriesByDate[dayLabel][this.props.title]));
      mostRecent.shift();
      const score = this.getScore(mostRecent);
      const done = _.last(mostRecent);

      return { dayLabel, score, done };
    });
  }

  getScore(mostRecent) {
    const { num, den } = this.props.goal;
    const goal = num/den;

    const last = _.takeRight(mostRecent, den);
    const score = _.sum(last) / den;
    return score * 100 / goal;
  }

  getContainerLabel(dayLabel, score) {
    let label = dayLabel;
    if (this.todayLabel === dayLabel) {
      label = 'Today';
    }
    const goal = this.props.goal.num / this.props.goal.den;
    const done = parseFloat((score * goal / 100 * this.props.goal.den).toFixed(1));
    const period = this.props.goal.den;
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
    title: React.PropTypes.string.isRequired,
    goal: React.PropTypes.object.isRequired,
    goalDescription: React.PropTypes.string.isRequired,
    entries: React.PropTypes.array.isRequired,
  };
}
