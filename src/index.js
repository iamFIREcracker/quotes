import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import './index.css';

let spreadsheetId = window.location.hash.substring(1);
if (!spreadsheetId) {
  spreadsheetId = '1akhbqFlElr0iKnKmK0ZTQeNTBgvNgZVghEpDR9_MDvY';
  window.location.replace(`./#${spreadsheetId}`);
}

ReactDOM.render(
  <App
    refreshInterval={ 60 * 60 * 1000 }
    spreadsheetId={ spreadsheetId }
  />,
  document.getElementById('root')
);
