// index.js

// If you're using modules/imports (with a build system)
import React from 'react';
import ReactDOM from 'react-dom';
import LunchPlannerApp from './app.js';

ReactDOM.render(
  <React.StrictMode>
    <LunchPlannerApp />
  </React.StrictMode>,
  document.getElementById('root')
);
