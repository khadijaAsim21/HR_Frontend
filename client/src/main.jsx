import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './utils/themeContext';
import './utils/i18n'; // Initialize i18n
import './styles/global.css';
import './index.css'; // Keep original index.css for Tailwind directives if global.css doesn't cover everything, but global.css handles it. I'll import both to be safe.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
