import _ from 'lodash';
import moment from 'moment';

export function parseResolutions(response) {
  let goalsName;
  let goalsFormula;
  let goalsDescription;
  let legend = [];
  const entries = [];
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
      legend = _.zipWith(
        goalsName,
        goalsFormula,
        goalsDescription,
        (name, goal, frequency) => ({name, goal, frequency})
      );
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
  return { legend, entries };
};

