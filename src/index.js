import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

const spreadsheetId = window.location.hash.substring(1) || '1akhbqFlElr0iKnKmK0ZTQeNTBgvNgZVghEpDR9_MDvY';
ReactDOM.render(
  <App
    refreshInterval={ 60 * 60 * 1000 }
    spreadsheetId={ spreadsheetId }
  />,
  document.getElementById('root')
);
