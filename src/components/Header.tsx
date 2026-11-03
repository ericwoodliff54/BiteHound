import React from 'react';
import { Volume2, VolumeX, ShieldAlert, Share2, Download, Sparkles } from 'lucide-react';
import { PlusStatus } from '../types';

interface HeaderProps {
  plusStatus: PlusStatus;
  trialDaysRemaining: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPaywall: () => void;
  onOpenDisclaimer: () => void;
  onOpenInstall: () => void;
  onShareVip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  plusStatus,
  trialDaysRemaining,
  soundEnabled,
  onToggleSound,
  onOpenPaywall,
  onOpenDisclaimer,
  onOpenInstall,
  onShareVip,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src="/apple-touch-icon.png"
              alt="BiteHound App Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-blue-950/60 border border-slate-700/80"
              onError={(e) => {
                // Fallback to favicon if icon missing
                (e.target as HTMLImageElement).src = '/favicon.png';
              }}
            />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-bold text-slate-100 text-lg tracking-tight">BiteHound</h1>
              <button
                type="button"
                onClick={onOpenPaywall}
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                  plusStatus === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : plusStatus === 'trial'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                }`}
                title="BiteHound Pro Status"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>
                  {plusStatus === 'paid' ? 'PRO' : plusStatus === 'trial' ? `TRIAL (${trialDaysRemaining}D)` : 'PRO'}
                </span>
              </button>
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-400 truncate">
              Sniffs Out Recalls. Verifies Every Bite.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700/80 text-sky-400 hover:bg-slate-800'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Mute audio feedback' : 'Unmute audio feedback'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Share Family VIP Link */}
          <button
            type="button"
            onClick={onShareVip}
            className="p-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-600/40 text-purple-300 transition"
            title="Invite Family Members"
            aria-label="Invite Family"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Safety Disclaimer */}
          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Food Safety Disclaimer"
            aria-label="Disclaimer"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          {/* Install Guide */}
          <button
            type="button"
            onClick={onOpenInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
            title="Install App Guide"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        </div>
      </div>
    </header>
  );
};
