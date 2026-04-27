import { AlertTriangle, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import './NetworkBanner.css';

export default function NetworkBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="network-banner-overlay">
      <div className="network-banner">
        <div className="network-icon-pulse">
          <WifiOff size={20} />
        </div>
        <div className="network-banner-content">
          <span className="label-md">No Internet Connection</span>
          <span className="body-sm">You're offline. Don't worry, your data is cached and will sync automatically when you reconnect. Some features like AI analysis require internet.</span>
        </div>
      </div>
    </div>
  );
}
