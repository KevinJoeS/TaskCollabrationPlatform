import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque/wdth.css';
import '@fontsource-variable/hanken-grotesk/wght.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';
import './styles/shell.css';
import './styles/workspace.css';
import './styles/public.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
