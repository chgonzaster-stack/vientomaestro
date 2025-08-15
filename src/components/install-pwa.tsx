'use client';
import { useEffect, useState } from 'react';

let deferredPrompt: any = null;

export default function InstallPWAButton() {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(e: any) {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    if ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone) {
      setCanInstall(false);
    }
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    setCanInstall(false);
  }

  if (!canInstall) return null;
  return <button onClick={handleInstall} className="text-sm rounded-md border px-3 py-1">Instalar App</button>;
}
