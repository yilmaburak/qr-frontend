import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // Initialize i18n

console.log('Main.tsx: Starting execution');
const rootElement = document.getElementById('root');
console.log('Main.tsx: Root element found:', !!rootElement);

if (!rootElement) {
  console.error('Main.tsx: Root element NOT found!');
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('Main.tsx: Root created, attempting render');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('Main.tsx: Render called');
  } catch (err) {
    console.error('Main.tsx: Render failed', err);
  }
}

// PWA Service Worker Registration
// import { registerSW } from 'virtual:pwa-register';

// const updateSW = registerSW({
//   onNeedRefresh() {
//     // Show a prompt to the user
//     if (confirm('New content available. Reload to update?')) {
//       updateSW(true);
//     }
//   },
//   onOfflineReady() {
//     console.log('App is ready for offline usage.');
//   },
// });

