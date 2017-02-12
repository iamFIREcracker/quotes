import React from 'react';
import _ from 'lodash';
import moment from 'moment';

import './Calendar.css';

const DAYS_PER_ROW = 21;
const DAYS = DAYS_PER_ROW * Math.ceil(365 / DAYS_PER_ROW);

class Day extends React.Component {
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
    if (this.props.success) {
      classes.push('goal-100');
    }
    return classes.join(' ');
  }

  getClassName() {
    const classes = [];
    if (this.props.improvement) {
      classes.push('yeah');
    }
    if (this.props.isToday) {
      classes.push('today');
    }
    return classes.join(' ');
  }

  static propTypes = {
    label: React.PropTypes.string.isRequired,
    isToday: React.PropTypes.bool,
    improvement: React.PropTypes.bool,
    success: React.PropTypes.bool,
  }
};

export default class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.today = moment().startOf('day');
    this.todayLabel = this.today.format('D MMM');
    this.firstMonday = moment().startOf('year').startOf('isoweek');
  }

  render() {
    return (
      <div className="Calendar">
        <h2 className="goal">{ this.props.goal }</h2>
        <h3 className="frequency">{ this.props.frequency }</h3>
        { this.renderContent() }
      </div>
    );
  }

  renderContent() {
    const rows = _.chunk(this.getAllDaysOfYear(this.props.days), DAYS_PER_ROW).map((data, i) => {
      const columns = data.map((props, j) => {
        if (!props.label) {
          return <td key={ j }></td>
        }
        const tdClass = props.success ? 'goal-100' : undefined;
        return (
          <td
            key={ j }
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
    return _.concat(
      this.props.days,
      _.times(DAYS - this.props.days.length, _.constant({}))
    );
  }

  static propTypes = {
    goal: React.PropTypes.string.isRequired,
    frequency: React.PropTypes.string.isRequired,
    days: React.PropTypes.array.isRequired,
  };
}
