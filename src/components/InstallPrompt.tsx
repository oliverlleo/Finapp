import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isStandalone) {
      return;
    }

    // Handle beforeinstallprompt
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, we might want to show it immediately if not standalone
    if (isIosDevice && !isStandalone) {
        // We can show the prompt, but we can't programmatically install.
        // We have to instruct the user.
        setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-700 max-w-md mx-auto relative flex flex-col gap-3">
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-500" />
        </button>

        <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Download className="w-6 h-6 text-white" />
            </div>
            <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Instalar Aplicativo</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {isIOS
                        ? "Para instalar: toque em Compartilhar e depois em 'Adicionar à Tela de Início'"
                        : "Instale nosso aplicativo para uma melhor experiência!"}
                </p>
            </div>
        </div>

        {!isIOS && deferredPrompt && (
            <button
            onClick={handleInstallClick}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
            Instalar Agora
            </button>
        )}
      </div>
    </div>
  );
};
