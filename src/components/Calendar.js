import React from 'react';
import _ from 'lodash';
import moment from 'moment';

import './Calendar.css';

const DAYS_PER_ROW = 21;
const DAYS = DAYS_PER_ROW * Math.ceil(365 / DAYS_PER_ROW);

export class Day extends React.Component {
  render() {
    return (
      <div
        title={ this.props.label }
        className='Day'
      >
        <div
          className={ this.getContainerClassName() }
        >
          <span
            className={ this.getClassName() }
          >
          </span>
        </div>
      </div>
    );
  }

  getContainerClassName() {
    const classes = [];
    if (this.props.aboveTarget) {
      classes.push('aboveTarget');
    }
    if (this.props.missing) {
      classes.push('missing');
    }
    return classes.join(' ');
  }

  getClassName() {
    const classes = [];
    if (this.props.progressed) {
      classes.push('progressed');
    }
    if (this.props.isToday) {
      classes.push('today');
    }
    return classes.join(' ');
  }

  static propTypes = {
    label: React.PropTypes.string.isRequired,
    missing: React.PropTypes.bool,
    isToday: React.PropTypes.bool,
    progressed: React.PropTypes.bool,
    aboveTarget: React.PropTypes.bool,
  }
};

export class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.today = moment().startOf('day');
    this.todayLabel = this.today.format('D MMM');
    this.firstMonday = moment().year(props.year).startOf('year').startOf('isoweek');
  }

  render() {
    return (
      <div className="Calendar">
        <div className="textContainer">
          <h2 className="name">{ this.props.name }</h2>
          <h3 className="target">{ this.props.target }</h3>
        </div>
        { this.renderContent() }
      </div>
    );
  }

  renderContent() {
    const rows = _.chunk(this.getAllDaysOfYear(this.props.data), DAYS_PER_ROW).map((data, i) => {
      const columns = data.map((entry, j) => {
        if (!entry) {
          return <td key={ j }></td>
        }

        const props = {
          label: this.getDayLabel(entry),
          ...entry
        }
        const tdStyle = {
          position: 'relative',
          zIndex: DAYS_PER_ROW - j
        }
        // this enables some CSS magic to join adj success days
        const tdClass = entry.aboveTarget ? 'aboveTarget' : undefined;
        return (
          <td
            key={ j }
            style={ tdStyle }
            className={ tdClass }>
            <Day {...props}></Day>
          </td>
        );
      })
      return (
        <tr key={ i }>{ columns }</tr>
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

  getAllDaysOfYear() {
    const tillEndOfYear = 365 - this.props.data.length;
    const additionalDaysToAlign = DAYS - 365;
    return _.concat(
      this.props.data,
      _.times(tillEndOfYear, i => ({
        day: moment().year(this.props.year).dayOfYear(this.props.data.length + i + 1) // dayOfYear accepts 1 - 366
      })),
      _.times(additionalDaysToAlign, _.constant(undefined))
    );
  }

  getDayLabel(entry) {
    let label = entry.day.format('ddd D MMM');
    if (entry.isToday) {
      label = 'Today';
    }
    if (entry.note) {
      label = `${label} — ${entry.note}`;
    }
    return label;
  }

  static propTypes = {
    name: React.PropTypes.string.isRequired,
    target: React.PropTypes.string.isRequired,
    year: React.PropTypes.number.isRequired,
    data: React.PropTypes.array.isRequired,
  };
};
