import React from 'react';
import { Camera, Search, BookmarkCheck, Users, Radio } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange?: (tab: ActiveTab) => void;
  onSelectTab?: (tab: ActiveTab) => void;
  watchlistCount?: number;
  watchlistBadgeCount?: number;
  hasPantryAlert?: boolean;
  bulletinBadgeCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onSelectTab,
  watchlistCount,
  watchlistBadgeCount,
  hasPantryAlert,
  bulletinBadgeCount,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    if (onSelectTab) {
      onSelectTab(tab);
    }
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const pantryBadge = (watchlistBadgeCount ?? watchlistCount) || 0;
  const wireBadge = bulletinBadgeCount || 0;

  const tabs = [
    {
      id: 'scanner' as ActiveTab,
      label: 'Scanner',
      icon: Camera,
      badge: null,
      gradient: 'from-emerald-600 via-teal-600 to-emerald-500',
    },
    {
      id: 'manual' as ActiveTab,
      label: 'Lookup',
      icon: Search,
      badge: null,
      gradient: 'from-blue-600 via-indigo-600 to-blue-500',
    },
    {
      id: 'watchlist' as ActiveTab,
      label: 'Pantry',
      icon: BookmarkCheck,
      badge: pantryBadge > 0 ? pantryBadge : null,
      badgeAlert: hasPantryAlert || pantryBadge > 0,
      gradient: 'from-amber-600 via-orange-600 to-amber-500',
    },
    {
      id: 'allergens' as ActiveTab,
      label: 'Family',
      icon: Users,
      badge: null,
      gradient: 'from-purple-600 via-pink-600 to-purple-500',
    },
    {
      id: 'bulletins' as ActiveTab,
      label: 'FDA Wire',
      icon: Radio,
      badge: wireBadge > 0 ? wireBadge : null,
      badgeAlert: false,
      gradient: 'from-rose-600 via-red-600 to-rose-500',
    },
  ];

  return (
    <nav className="w-full bg-slate-900/95 backdrop-blur-lg p-1.5 sm:p-2 rounded-2xl border border-slate-800 grid grid-cols-5 gap-1.5 sm:gap-2 shadow-xl text-center">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`py-2 sm:py-2.5 px-1 min-h-[52px] sm:min-h-[56px] rounded-xl text-[11px] sm:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 relative ${
              isActive
                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg ring-2 ring-emerald-400/40`
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.badge !== null && (
                <span
                  className={`absolute -top-1.5 -right-2.5 text-[9px] font-black px-1.5 py-0.2 rounded-full min-w-[16px] text-center border ${
                    tab.badgeAlert
                      ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                      : isActive
                      ? 'bg-white text-slate-900 border-slate-200'
                      : 'bg-slate-700 text-slate-200 border-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="truncate max-w-full tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
