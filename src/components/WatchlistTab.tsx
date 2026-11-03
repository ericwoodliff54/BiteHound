import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Search,
  PlusCircle,
  PackageCheck,
  Calendar,
  AlertOctagon,
} from 'lucide-react';
import { WatchlistItem, FamilyProfile, ProductResult } from '../types';

interface WatchlistTabProps {
  watchlist: WatchlistItem[];
  activeProfile: FamilyProfile;
  onRemoveItem: (id: string) => void;
  onReauditAll: () => Promise<void>;
  onInspectProduct: (result: ProductResult) => void;
  onNavigateToScan: () => void;
  isAuditing: boolean;
}

export const WatchlistTab: React.FC<WatchlistTabProps> = ({
  watchlist,
  activeProfile,
  onRemoveItem,
  onReauditAll,
  onInspectProduct,
  onNavigateToScan,
  isAuditing,
}) => {
  const [filter, setFilter] = useState<'all' | 'alerts' | 'allergens' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const recallCount = watchlist.filter((w) => w.product.isRecalled).length;
  const allergenCount = watchlist.filter((w) => {
    const allergenMatches = w.product.allergens.filter((a) =>
      activeProfile.allergens.includes(a.toLowerCase())
    );
    return allergenMatches.length > 0;
  }).length;
  const safeCount = watchlist.length - recallCount;

  const filteredItems = watchlist.filter((item) => {
    // text search
    const matchesSearch =
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.barcode.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filter === 'alerts') return item.product.isRecalled;
    if (filter === 'allergens') {
      return item.product.allergens.some((a) =>
        activeProfile.allergens.includes(a.toLowerCase())
      );
    }
    if (filter === 'safe') return !item.product.isRecalled;
    return true;
  });

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto space-y-5">
      {/* Overview Stats Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <PackageCheck className="w-5 h-5 text-emerald-400" />
              <span>Pantry Watchdog</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuously monitoring your home pantry against FDA food recalls
            </p>
          </div>

          <button
            onClick={() => onReauditAll()}
            disabled={isAuditing || watchlist.length === 0}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
              isAuditing || watchlist.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing...' : 'Re-Audit All'}</span>
          </button>
        </div>

        {/* Stats Pill Matrix */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-xl font-black text-white">{watchlist.length}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Total In Pantry
            </div>
          </div>

          <div
            className={`border rounded-2xl p-3 text-center ${
              recallCount > 0
                ? 'bg-red-950/40 border-red-500/40'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div
              className={`text-xl font-black ${
                recallCount > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'
              }`}
            >
              {recallCount}
            </div>
            <div
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                recallCount > 0 ? 'text-red-400' : 'text-slate-500'
              }`}
            >
              Recall Alerts
            </div>
          </div>

          <div
            className={`border rounded-2xl p-3 text-center ${
              allergenCount > 0
                ? 'bg-amber-950/40 border-amber-500/40'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div
              className={`text-xl font-black ${
                allergenCount > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {allergenCount}
            </div>
            <div
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                allergenCount > 0 ? 'text-amber-400' : 'text-slate-500'
              }`}
            >
              Allergen Flags
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pantry items..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-2xl py-2.5 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `All (${watchlist.length})` },
            { id: 'alerts', label: `Recalls (${recallCount})`, isAlert: recallCount > 0 },
            { id: 'allergens', label: `Allergen Hits (${allergenCount})`, isWarning: allergenCount > 0 },
            { id: 'safe', label: `Safe (${safeCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : tab.isAlert
                  ? 'bg-red-950/60 text-red-400 border border-red-500/40'
                  : tab.isWarning
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pantry Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 text-center space-y-4">
          <PackageCheck className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-300">
              {searchQuery ? 'No matching items found' : 'Your Pantry is Empty'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {searchQuery
                ? 'Try a different search query or clear the filter.'
                : 'Scan barcodes to add food items to your 24/7 recall monitoring watchlist.'}
            </p>
          </div>

          {!searchQuery && (
            <button
              onClick={onNavigateToScan}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Scan First Item</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const hasRecalls = item.product.isRecalled;
            const matchedAllergens = item.product.allergens.filter((a) =>
              activeProfile.allergens.includes(a.toLowerCase())
            );

            return (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-2xl p-4 transition-all shadow-md flex items-start justify-between gap-3 ${
                  hasRecalls
                    ? 'border-red-500/50 bg-red-950/15'
                    : matchedAllergens.length > 0
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onInspectProduct(item.product)}
                >
                  <div className="flex items-center space-x-2">
                    {hasRecalls ? (
                      <span className="p-1 rounded-md bg-red-500/20 text-red-400">
                        <AlertOctagon className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                    )}

                    <div className="text-xs font-bold text-white line-clamp-1">
                      {item.product.name}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                    <span className="font-semibold text-slate-300">{item.product.brand}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      UPC: {item.product.barcode}
                    </span>
                  </div>

                  {/* Recall or Alert Notice */}
                  {hasRecalls && (
                    <div className="mt-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-2.5 py-1 flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {item.product.recallDetails?.hazard || 'FDA Recall Notice Active'}
                      </span>
                    </div>
                  )}

                  {/* Allergen Flag Notice */}
                  {!hasRecalls && matchedAllergens.length > 0 && (
                    <div className="mt-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1 flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Contains {matchedAllergens.join(', ')} ({activeProfile.name})
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium hover:underline">
                      View Audit Details &rarr;
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Remove from pantry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
