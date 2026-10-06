import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker';
import { AuthProvider } from './context/AuthContext';
import { installPreloadErrorRecovery } from './utils/lazyWithReload';
import { applyStoredDisplayScale } from './utils/displayScale';
import { installPushClickHandler } from './utils/pushNotifications';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Aplikace směruje jen přes #kotvu, cesty nepoužívá. Hosting ale na jakoukoli
// adresu (/admin, /cokoli) vrací tutéž stránku, takže by v adresním řádku
// zůstala cesta, která nic neznamená. Srovnáme ji na kořen; dotaz i kotvu
// (odkazy z e-mailů Supabase) necháme beze změny.
if (window.location.pathname !== '/') {
  window.history.replaceState(window.history.state, '', `/${window.location.search}${window.location.hash}`);
}

installPreloadErrorRecovery();
applyStoredDisplayScale();
registerServiceWorker();
installPushClickHandler();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    {/* Anonymní měření návštěvnosti a rychlosti (bez cookies). Skripty jdou
        ze stejné domény přes /_vercel/…, takže CSP 'self' stačí. Ve Vercelu
        byly obě služby zapnuté, jen se v aplikaci nikdy nespustily. */}
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
);

