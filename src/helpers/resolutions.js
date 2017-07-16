import _ from 'lodash';
import moment from 'moment';

function parseData(data) {
  let goalsName;
  let goalsFormula;
  let goalsTarget;
  let legend = [];
  const entries = [];
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
    } else if (!goalsTarget) {
      goalsTarget = row.filter(v => v);
      legend = _.zipWith(
        goalsName,
        goalsFormula,
        goalsTarget,
        (name, goal, target) => ({name, goal, target})
      );
    } else {
      const date = moment(row[0], 'M/D/YYYY').format('D MMM');
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
  return { legend, entries };
};

function getNote(missing, legend, successPercentage) {
  let note = '';
  if (missing) {
    note = 'status not tracked';
  } else {
    const goal = legend.goal.num / legend.goal.den;
    const done = parseFloat((successPercentage * goal / 100 * legend.goal.den).toFixed(1));
    const period = legend.goal.den;
    switch (done) {
      case 0:
        break;
      case 1:
        note = `1 time in the last ${period} days`;
        break;
      default:
        note = `${done} times in the last ${period} days`;
        break;
    }
  }
  return note;
}

function getSuccessPercentage(legend, mostRecent) {
  const goal = legend.goal.num / legend.goal.den;

  const last = _.takeRight(mostRecent, legend.goal.den);
  const actual = _.sum(last) / legend.goal.den;
  return actual * 100 / goal;
}

function getDiary(legend, entries) {
  const today = moment().startOf('day');
  const entriesByDate = _.keyBy(entries, '_date');
  const mostRecent = _.times(legend.goal.den, _.constant(false));
  return _.range(today.dayOfYear()).map((i) => {
    const day = today.clone().dayOfYear(i + 1); // 1-based 
    const dayLabel = day.format('D MMM');
    const missing = !entriesByDate[dayLabel];
    mostRecent.push(!!(entriesByDate[dayLabel] && entriesByDate[dayLabel][legend.name]));
    mostRecent.shift();

    const progressed = _.last(mostRecent);
    const successPercentage = getSuccessPercentage(legend, mostRecent);
    const aboveTarget = successPercentage >= 100;
    const note = getNote(missing, legend, successPercentage);
    return { day, missing, note, isToday: day.isSame(today), progressed, aboveTarget };
  });
}

export function parseResolutions(data) {
  const { legend, entries } = parseData(data);
  return legend.map(legend =>({
    name: legend.name,
    target: legend.target,
    diary: getDiary(legend, entries)
  }));
};
