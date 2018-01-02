import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import './index.css';

let [ spreadsheetId, year ] = window.location.hash.substring(1).split('/');
let reload = false;
if (!spreadsheetId) {
  reload = true;
  spreadsheetId = '1S0exiagavqEs-mXAuZr1o_OshtWKZfVERyWRjEepsY0';
}
if (!year) {
  reload = true;
  year = new Date().getFullYear();
}
if (reload) {
  window.location.replace(`./#${spreadsheetId}/${year}`);
}

ReactDOM.render(
  <App
    refreshInterval={ 60 * 60 * 1000 }
    spreadsheetId={ spreadsheetId }
    year={ parseInt(year, 10) }
  />,
  document.getElementById('root')
);
