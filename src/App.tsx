import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ScannerTab } from './components/ScannerTab';
import { ManualTab } from './components/ManualTab';
import { WatchlistTab } from './components/WatchlistTab';
import { AllergensTab } from './components/AllergensTab';
import { BulletinsTab } from './components/BulletinsTab';
import { ResultCard } from './components/ResultCard';
import { PaywallModal } from './components/PaywallModal';
import { ProfileModal } from './components/ProfileModal';
import { DisclaimerModal } from './components/DisclaimerModal';
import { InstallModal } from './components/InstallModal';

import { ActiveTab, FamilyProfile, ProductResult, WatchlistItem, FDACachedRecall } from './types';
import { processBarcode, syncFDARecalls, initStaplesCatalog } from './utils/recallService';
import {
  playScanBeep,
  playClearChime,
  playAlertSiren,
  playAllergenAlert,
  triggerHaptic,
} from './utils/sound';

const DEFAULT_PROFILES: FamilyProfile[] = [
  {
    id: 'profile-1',
    name: 'Leo (Toddler)',
    avatar: '🧒',
    allergens: ['peanuts', 'tree nuts', 'milk', 'eggs'],
  },
  {
    id: 'profile-2',
    name: 'Mom',
    avatar: '👩',
    allergens: ['gluten', 'soybeans'],
  },
  {
    id: 'profile-3',
    name: 'Dad',
    avatar: '👨',
    allergens: ['shellfish'],
  },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  const [audioMuted, setAudioMuted] = useState<boolean>(() => {
    return localStorage.getItem('bitehound_audio_muted') === 'true';
  });

  // Profiles State
  const [profiles, setProfiles] = useState<FamilyProfile[]>(() => {
    try {
      const saved = localStorage.getItem('safebite_family_profiles');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem('safebite_active_profile_id') || 'profile-1';
  });

  // Pro & VIP status
  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem('safebite_pro_active') === 'true';
  });

  // Watchlist (Pantry) State
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('safebite_history') || localStorage.getItem('bitehound_watchlist');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // FDA Cached Recalls
  const [cachedRecalls, setCachedRecalls] = useState<FDACachedRecall[]>(() => {
    try {
      const saved = localStorage.getItem('safebite_cached_recalls');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [lastSyncTime, setLastSyncTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('safebite_last_sync_time');
    return saved ? parseInt(saved, 10) : null;
  });

  // Modals state
  const [isScanning, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReauditing, setIsReauditing] = useState(false);
  const [activeResult, setActiveResult] = useState<ProductResult | null>(null);

  const [paywallOpen, setPaywallOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FamilyProfile | null>(null);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Profile getter
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILES[0];

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('safebite_family_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('safebite_active_profile_id', activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem('safebite_pro_active', isPro ? 'true' : 'false');
  }, [isPro]);

  useEffect(() => {
    localStorage.setItem('bitehound_watchlist', JSON.stringify(watchlist));
    localStorage.setItem('safebite_history', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('bitehound_audio_muted', audioMuted ? 'true' : 'false');
  }, [audioMuted]);

  // Check VIP URL query params & PWA install prompt & init data
  useEffect(() => {
    initStaplesCatalog();

    // Check URL parameters for VIP pass
    const params = new URLSearchParams(window.location.search);
    const vipVal = params.get('vip') || params.get('code') || params.get('pro');
    if (vipVal && ['family', 'vip', 'bitehound', 'safebite'].includes(vipVal.toLowerCase())) {
      setIsPro(true);
      showToast('🌟 VIP Family Pass activated! All PRO safety features unlocked.');
    }

    // Capture PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Initial silent sync of live FDA recalls wire
    handleSyncRecalls(false);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSyncRecalls = async (notify = true) => {
    try {
      setIsSyncing(true);
      const recalls = await syncFDARecalls();
      if (recalls && recalls.length > 0) {
        setCachedRecalls(recalls);
        const now = Date.now();
        setLastSyncTime(now);
        localStorage.setItem('safebite_cached_recalls', JSON.stringify(recalls));
        localStorage.setItem('safebite_last_sync_time', now.toString());
        if (notify) {
          showToast(`FDA Wire Synced: ${recalls.length} active recalls loaded.`);
        }
      }
    } catch (e) {
      if (notify) {
        showToast('Unable to connect to FDA Wire. Using pre-indexed database.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBarcodeLookup = async (barcode: string) => {
    setIsProcessing(true);
    playScanBeep(audioMuted);
    triggerHaptic('light');

    try {
      const result = await processBarcode(barcode);
      setActiveResult(result);

      // Play alert sounds based on severity
      const hasAllergen = result.allergens.some((a) =>
        activeProfile.allergens.includes(a.toLowerCase())
      );

      if (result.isRecalled) {
        playAlertSiren(audioMuted);
        triggerHaptic('heavy');
      } else if (hasAllergen) {
        playAllergenAlert(audioMuted);
        triggerHaptic('medium');
      } else {
        playClearChime(audioMuted);
        triggerHaptic('light');
      }
    } catch (err) {
      console.error('Barcode lookup error:', err);
      showToast('Error auditing barcode. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToWatchlist = (result: ProductResult) => {
    setWatchlist((prev) => {
      const existsIndex = prev.findIndex((item) => item.product.barcode === result.barcode);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = {
          ...updated[existsIndex],
          product: result,
          addedAt: Date.now(),
        };
        return updated;
      } else {
        const newItem: WatchlistItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          product: result,
          addedAt: Date.now(),
          profileId: activeProfileId,
        };
        return [newItem, ...prev];
      }
    });

    showToast(`"${result.name}" added to Pantry Watchdog.`);
  };

  const handleRemoveFromWatchlist = (id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from pantry.');
  };

  const handleReauditAll = async () => {
    if (watchlist.length === 0) return;
    setIsReauditing(true);
    let recallHits = 0;

    try {
      const updatedList = await Promise.all(
        watchlist.map(async (item) => {
          const fresh = await processBarcode(item.product.barcode);
          if (fresh.isRecalled) recallHits++;
          return {
            ...item,
            product: fresh,
          };
        })
      );
      setWatchlist(updatedList);
      if (recallHits > 0) {
        playAlertSiren(audioMuted);
        showToast(`⚠️ Re-Audit complete: ${recallHits} pantry items flagged with active recalls!`);
      } else {
        playClearChime(audioMuted);
        showToast('✅ Re-Audit complete: All pantry items are currently free of active recalls.');
      }
    } catch (err) {
      showToast('Error during pantry audit.');
    } finally {
      setIsReauditing(false);
    }
  };

  const handleSaveProfile = (data: { name: string; avatar: string; allergens: string[] }) => {
    if (editingProfile) {
      // Edit existing
      setProfiles((prev) =>
        prev.map((p) => (p.id === editingProfile.id ? { ...p, ...data } : p))
      );
      showToast(`Updated profile for ${data.name}`);
    } else {
      // Add new
      const newId = `profile-${Date.now()}`;
      const newProfile: FamilyProfile = {
        id: newId,
        ...data,
      };
      setProfiles((prev) => [...prev, newProfile]);
      setActiveProfileId(newId);
      showToast(`Added profile for ${data.name}`);
    }
    setEditingProfile(null);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);
    if (activeProfileId === id) {
      setActiveProfileId(remaining[0].id);
    }
    showToast('Profile removed.');
  };

  const handleToggleAllergen = (allergenId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === activeProfileId) {
          const exists = p.allergens.includes(allergenId);
          const next = exists
            ? p.allergens.filter((a) => a !== allergenId)
            : [...p.allergens, allergenId];
          return { ...p, allergens: next };
        }
        return p;
      })
    );
  };

  const recallBadgeCount = watchlist.filter((w) => w.product.isRecalled).length;
  const bulletinCount = cachedRecalls.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Header */}
      <Header
        isPro={isPro}
        onOpenPaywall={() => setPaywallOpen(true)}
        audioMuted={audioMuted}
        onToggleAudio={() => setAudioMuted((prev) => !prev)}
        onOpenDisclaimer={() => setDisclaimerOpen(true)}
        onOpenInstall={() => setInstallOpen(true)}
      />

      {/* Top Navigation Bar */}
      <div className="sticky top-[60px] sm:top-[66px] z-20 w-full max-w-2xl mx-auto px-3 sm:px-4 pt-2.5 pb-1.5 backdrop-blur-md">
        <Navigation
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onTabChange={(tab) => setActiveTab(tab)}
          watchlistBadgeCount={recallBadgeCount}
          bulletinBadgeCount={bulletinCount}
        />
      </div>

      {/* Main App Content View */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-3 pb-12">
        {activeTab === 'scanner' && (
          <ScannerTab
            activeProfile={activeProfile}
            isScanning={isScanning}
            onScanSuccess={handleBarcodeLookup}
            audioMuted={audioMuted}
          />
        )}

        {activeTab === 'manual' && (
          <ManualTab
            onLookup={handleBarcodeLookup}
            isProcessing={isScanning}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistTab
            watchlist={watchlist}
            activeProfile={activeProfile}
            onRemoveItem={handleRemoveFromWatchlist}
            onReauditAll={handleReauditAll}
            onInspectProduct={(prod) => setActiveResult(prod)}
            onNavigateToScan={() => setActiveTab('scanner')}
            isAuditing={isReauditing}
          />
        )}

        {activeTab === 'allergens' && (
          <AllergensTab
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelectProfile={(id) => setActiveProfileId(id)}
            onOpenAddProfile={() => {
              setEditingProfile(null);
              setProfileModalOpen(true);
            }}
            onOpenEditProfile={(profile) => {
              setEditingProfile(profile);
              setProfileModalOpen(true);
            }}
            onDeleteProfile={handleDeleteProfile}
            onToggleAllergen={handleToggleAllergen}
            isPro={isPro}
            onOpenPaywall={() => setPaywallOpen(true)}
          />
        )}

        {activeTab === 'bulletins' && (
          <BulletinsTab
            cachedRecalls={cachedRecalls}
            lastSyncTime={lastSyncTime}
            onSync={() => handleSyncRecalls(true)}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Product Result Sheet / Modal */}
      {activeResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <ResultCard
              result={activeResult}
              activeProfile={activeProfile}
              onClose={() => setActiveResult(null)}
              onAddToWatchlist={() => handleAddToWatchlist(activeResult)}
              isSaved={watchlist.some((w) => w.product.barcode === activeResult.barcode)}
            />
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-fade-in flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}


      {/* Modals */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onUnlockPro={() => {
          setIsPro(true);
          setPaywallOpen(false);
          showToast('BiteHound PRO Activated! Enjoy full safety watchdog protection.');
        }}
        isPro={isPro}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setEditingProfile(null);
        }}
        onSave={handleSaveProfile}
        initialProfile={editingProfile}
      />

      <DisclaimerModal
        isOpen={disclaimerOpen}
        onClose={() => setDisclaimerOpen(false)}
      />

      <InstallModal
        isOpen={installOpen}
        onClose={() => setInstallOpen(false)}
        deferredPrompt={deferredPrompt}
      />
    </div>
  );
};
