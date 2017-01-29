import React from 'react';
import _ from 'lodash';
import moment from 'moment';

import './Calendar.css';

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
    const rows = _.chunk(this.getDays(), 21).map((data, i) => {
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
    return data.map(({ dayLabel, previousYear, afterToday, score, done }, i) => {
      if (previousYear) {
        return (
          <td key={ dayLabel } />
        );
      }
      if (afterToday) {
        return (
          <td
            key={ dayLabel }
            title={ dayLabel }
          >
            <span />
          </td>
        );
      }

      const prevScore = data[i - 1] && data[i - 1].score;
      const nextScore = data[i + 1] && data[i + 1].score;
      return (
        <td
          key={ dayLabel }
          title={ this.getContainerLabel(dayLabel, score) }
          className={ this.getContainerClassName(
            prevScore || 0,
            score,
            nextScore || 0
          ) }
        >
          <span
            className={ this.getClassName(done) }
          >
          </span>
        </td>
      );

    });
  }

  getDaysData() {
    const entriesByDate = _.keyBy(this.props.entries, '_date');
    const mostRecent = _.times(7, _.constant(false));
    return _.range(this.endOfYear.diff(this.firstMonday, 'days') + 1).map((i) => {
      const day = this.firstMonday.clone().add(i, 'days');
      const dayLabel = day.format('D MMM');
      if (day.year() !== this.endOfYear.year()) {
        return { dayLabel, previousYear: true };
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

  getContainerClassName(prevScore, score, nextScore) {
    let classes = '';
    if (score >= 100) {
      classes = 'goal-100';
      if (prevScore < 100) {
        classes = `${classes} first`;
      }
      if (nextScore < 100) {
        classes = `${classes} last`;
      }
    }
    return classes;
  }

  getClassName(done) {
    let classes = '';
    if (done) {
      classes = 'yeah';
    }
    return classes;
  }

  static propTypes = {
    title: React.PropTypes.string.isRequired,
    goal: React.PropTypes.object.isRequired,
    goalDescription: React.PropTypes.string.isRequired,
    entries: React.PropTypes.array.isRequired,
  };
}
