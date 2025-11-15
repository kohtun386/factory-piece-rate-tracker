
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeFirebase, initializeAuth, loadFirebaseConfig } from './lib/firebase';
import { defaultConfig } from './lib/firebaseConfig';

// --- Global Firebase Initialization ---
// This ensures Firebase is initialized once before any component renders.
const initializeAppOnLoad = () => {
  const useDemo = localStorage.getItem('useDemoData') === 'true';
  if (useDemo) {
    console.log("Running in Demo Mode. Firebase will not be initialized.");
    return;
  }

  const loadedConfig = loadFirebaseConfig();
  const configToUse = loadedConfig || defaultConfig;

  if (configToUse && configToUse.apiKey) {
    if (initializeFirebase(configToUse)) {
      initializeAuth(configToUse);
    }
  } else {
    console.warn("No valid Firebase config found. App will run without Firebase connection.");
  }
};

initializeAppOnLoad();
// --- End of Initialization ---


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
