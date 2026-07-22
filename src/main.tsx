import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global localStorage interceptor to hot-fix any stale cached image asset paths
const originalGetItem = localStorage.getItem;
localStorage.getItem = function (key) {
  const val = originalGetItem.call(localStorage, key);
  if (val && typeof val === 'string' && val.includes('src/assets/images/')) {
    return val.replace(/\/src\/assets\/images\//g, '/images/').replace(/src\/assets\/images\//g, '/images/');
  }
  return val;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

