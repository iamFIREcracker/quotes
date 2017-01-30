import React from 'react';
import _ from 'lodash';
import moment from 'moment';

import './Calendar.css';

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
    const rows = _.chunk(this.props.children, this.props.daysPerRow).map((data, i) => {
      const columns = data.map((day, j) => {
        return (
          <td key={ j }>{ day }</td>
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

  static propTypes = {
    goal: React.PropTypes.string.isRequired,
    frequency: React.PropTypes.string.isRequired,
    daysPerRow: React.PropTypes.number.isRequired,
    children: React.PropTypes.array.isRequired,
  };
}
