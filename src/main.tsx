import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker';
import { AuthProvider } from './context/AuthContext';
import { installPreloadErrorRecovery } from './utils/lazyWithReload';
import { applyStoredDisplayScale } from './utils/displayScale';

installPreloadErrorRecovery();
applyStoredDisplayScale();
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);

