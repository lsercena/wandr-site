import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import './PwaUpdateToast.css';

/**
 * Registers the service worker and surfaces PWA lifecycle events:
 * - "Ready offline" once the app shell is precached
 * - "New version" prompt when an updated SW takes control
 * - A persistent badge while the browser loses connectivity
 */
export default function PwaUpdateToast() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const updateSW = registerSW({
      immediate: true,
      onOfflineReady: () => {
        setOfflineReady(true);
        window.setTimeout(() => setOfflineReady(false), 4000);
      },
      onNeedRefresh: () => setNeedRefresh(true),
    });

    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      void updateSW(false);
    };
  }, []);

  if (isOffline) {
    return (
      <div className="pwa-toast pwa-toast--offline" role="status">
        <span aria-hidden="true">◍</span>
        You&apos;re offline — showing saved guides and itineraries.
      </div>
    );
  }

  if (needRefresh) {
    return (
      <div className="pwa-toast" role="status">
        <span>A new version of Wandr is ready.</span>
        <div className="pwa-toast__actions">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setNeedRefresh(false)}>
            Later
          </button>
        </div>
      </div>
    );
  }

  if (offlineReady) {
    return (
      <div className="pwa-toast pwa-toast--ready" role="status">
        <span aria-hidden="true">✓</span> Ready to use offline.
      </div>
    );
  }

  return null;
}
