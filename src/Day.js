import React from 'react';

import './Day.css';

export default class Day extends React.Component {
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
      if (this.props.firstInARow) {
        classes.push('first');
      }
      if (this.props.lastInARow) {
        classes.push('last');
      }
    }
    return classes.join(' ');
  }

  getClassName() {
    const classes = [];
    if (this.props.scored) {
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
    scored: React.PropTypes.bool,
    success: React.PropTypes.bool,
    firstInARow: React.PropTypes.bool,
    lastInARow: React.PropTypes.bool,
  }

};
