import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/main.css';
import App from './App.jsx';

// Register Service Worker for Mobile PWA Installation and Notifications
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('StudyOS PWA ServiceWorker active:', reg.scope);
      })
      .catch((err) => {
        console.warn('StudyOS ServiceWorker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
