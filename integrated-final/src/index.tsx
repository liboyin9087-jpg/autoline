import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// ★ 關鍵：引用您唯一的樣式檔 App.css
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);