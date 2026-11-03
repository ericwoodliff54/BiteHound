import React from 'react';
import { X, Smartphone, Share, PlusSquare, MoreVertical, Download } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
}) => {
  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Install BiteHound App</h3>
          <p className="text-xs text-slate-400">
            Keep instant barcode recall audits in your pocket for grocery store aisle checks.
          </p>
        </div>

        {/* If native PWA install prompt is available */}
        {deferredPrompt && (
          <button
            onClick={handleNativeInstall}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Install Web App Now</span>
          </button>
        )}

        {/* iOS Step-by-Step */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <span>🍏 iOS (Safari)</span>
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2.5">
              <span className="p-1 rounded-md bg-slate-800 text-slate-200">
                <Share className="w-4 h-4" />
              </span>
              <span>1. Tap the <strong>Share</strong> button at the bottom of Safari.</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="p-1 rounded-md bg-slate-800 text-slate-200">
                <PlusSquare className="w-4 h-4" />
              </span>
              <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
            </div>
          </div>
        </div>

        {/* Android Step-by-Step */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <span>🤖 Android (Chrome)</span>
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2.5">
              <span className="p-1 rounded-md bg-slate-800 text-slate-200">
                <MoreVertical className="w-4 h-4" />
              </span>
              <span>1. Tap the three dots menu at top right.</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="p-1 rounded-md bg-slate-800 text-slate-200">
                <Download className="w-4 h-4" />
              </span>
              <span>2. Tap <strong>Install app</strong> or <strong>Add to Home Screen</strong>.</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-colors"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
