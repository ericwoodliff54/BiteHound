import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Share2,
  BookmarkPlus,
  BookmarkCheck,
  RefreshCw,
  Lock,
  Beaker,
  AlertOctagon,
  Building2,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ProductResult } from '../types';

interface ResultCardProps {
  data: ProductResult;
  isPlus: boolean;
  isInWatchlist: boolean;
  onSaveToWatchlist: (data: ProductResult) => void;
  onScanNext: () => void;
  onOpenPaywall: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  data,
  isPlus,
  isInWatchlist,
  onSaveToWatchlist,
  onScanNext,
  onOpenPaywall,
}) => {
  const [showFullIngredients, setShowFullIngredients] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const isRecalled = Boolean(data.isRecalled && data.recallRecord);
  const isTerminated = Boolean(data.terminatedNotice);
  const hasFamilyMatches = Boolean(data.familyMatches && data.familyMatches.length > 0);
  const hasAdditives = Boolean(data.detectedAdditives && data.detectedAdditives.length > 0);
  const additivesCount = (data.detectedAdditives || []).length;
  const hasIngredients = Boolean(data.ingredients && data.ingredients.trim().length > 0);

  // Status pills
  let recallPillBg = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  let recallPillText = 'Cleared';
  let recallPillIcon = '✓';
  if (isRecalled) {
    recallPillBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    recallPillIcon = '🚨';
    recallPillText = 'Active Recall';
  } else if (isTerminated) {
    recallPillBg = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    recallPillIcon = '🏛️';
    recallPillText = 'Terminated';
  }

  let allergenPillBg = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  let allergenPillIcon = '✓';
  let allergenPillText = 'All Safe';
  if (!isPlus) {
    allergenPillBg = 'bg-slate-800 text-amber-300 border-slate-700';
    allergenPillIcon = '🔒';
    allergenPillText = 'Pro Feature';
  } else if (hasFamilyMatches) {
    allergenPillBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    allergenPillIcon = '⚠️';
    allergenPillText = `${data.familyMatches.length} Alert${data.familyMatches.length > 1 ? 's' : ''}`;
  } else if (!hasIngredients) {
    allergenPillBg = 'bg-slate-800 text-amber-300 border-slate-700';
    allergenPillIcon = 'ℹ️';
    allergenPillText = 'Check Label';
  }

  let additivePillBg = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  let additivePillIcon = '✓';
  let additivePillText = 'Clean';
  if (!hasIngredients) {
    additivePillBg = 'bg-slate-800 text-slate-300 border-slate-700';
    additivePillIcon = 'ℹ️';
    additivePillText = 'Unindexed';
  } else if (!isPlus) {
    additivePillBg = 'bg-slate-800 text-amber-300 border-slate-700';
    additivePillIcon = '🔒';
    additivePillText = 'Pro Feature';
  } else if (hasAdditives) {
    additivePillBg = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    additivePillIcon = '🧪';
    additivePillText = `${additivesCount} Flagged`;
  }

  const handleShare = async () => {
    const text = isRecalled
      ? `🚨 RECALL ALERT: ${data.brand} - ${data.productName} (UPC: ${data.upc}) has an active FDA/USDA safety recall! Verified via BiteHound.`
      : `✓ Verified Safe: ${data.brand} - ${data.productName} (UPC: ${data.upc}) has 0 active federal recalls on record via BiteHound.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `BiteHound Safety Verification: ${data.productName}`,
          text,
          url: window.location.href,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      } catch {}
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 shadow-2xl transition space-y-4 ${
        isRecalled
          ? 'bg-gradient-to-b from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/60 ring-2 ring-rose-500/30'
          : hasFamilyMatches
          ? 'bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 border-amber-500/50'
          : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-800'
      }`}
    >
      {/* 1. Master Header & Status Pills */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-400 font-mono tracking-wider">
            UPC: {data.upc}
          </span>
          <span className="text-[10px] text-slate-400">{data.timestamp}</span>
        </div>

        <h3 className="text-base sm:text-lg font-black text-white leading-snug">
          {data.productName}
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-0.5">{data.brand}</p>

        {/* Multi-guardrail Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3">
          <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${recallPillBg}`}>
            <span>{recallPillIcon}</span>
            <span>Federal Recall: {recallPillText}</span>
          </span>

          <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${allergenPillBg}`}>
            <span>{allergenPillIcon}</span>
            <span>Allergen Guard: {allergenPillText}</span>
          </span>

          <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${additivePillBg}`}>
            <span>{additivePillIcon}</span>
            <span>Additive Guard: {additivePillText}</span>
          </span>
        </div>
      </div>

      {/* 2. Recall Alert Container (If Recalled) */}
      {isRecalled && data.recallRecord && (
        <div className="p-4 rounded-xl bg-rose-950/90 border border-rose-500/70 space-y-2.5 text-rose-100 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs sm:text-sm uppercase tracking-wider text-rose-200 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Federal Safety Warning: {data.recallRecord.severity || 'Class I High Risk'}</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-400/40 shrink-0">
              {data.recallRecord.recallDate || 'Active Wire'}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-rose-100 leading-relaxed">
            <strong className="text-white">Identified Hazard:</strong> {data.recallRecord.hazard}
          </p>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-800/60 text-xs">
            <strong className="text-amber-300">Mandated Action:</strong>{' '}
            <span className="text-slate-200">
              {data.recallRecord.action || 'Do not consume. Discard or return to store of purchase for a full refund.'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-rose-300/90 pt-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Agency: {data.recallRecord.agency || 'FDA Food Safety Wire'}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>States: {(data.recallRecord.states || ['All US States']).slice(0, 4).join(', ')}</span>
            </span>
          </div>
        </div>
      )}

      {/* 3. Terminated Recall Notice */}
      {isTerminated && data.terminatedNotice && (
        <div className="p-3.5 rounded-xl bg-teal-950/60 border border-teal-500/50 space-y-1.5 text-xs text-teal-200">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5 text-teal-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Historical Recall Resolved: {data.terminatedNotice.severity}</span>
            </span>
            <span className="text-[10px] bg-teal-500/20 px-2 py-0.5 rounded border border-teal-500/40">
              Remediated {data.terminatedNotice.date}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-normal">
            Prior recall completed and officially terminated by the FDA. Current production runs are cleared for retail sale.
          </p>
        </div>
      )}

      {/* 4. Household Allergen Guard Section */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
            <span>🛡️</span>
            <span>Family Allergen Guard</span>
          </span>
          {!isPlus && (
            <button
              type="button"
              onClick={onOpenPaywall}
              className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 hover:bg-amber-500/30 transition flex items-center gap-1"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Unlock Pro</span>
            </button>
          )}
        </div>

        {isPlus ? (
          hasFamilyMatches ? (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs text-amber-200 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Allergen Conflict Triggered for Family Member:</span>
              </p>
              {data.familyMatches.map((m) => (
                <div
                  key={m.profileId}
                  className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/50 text-xs flex items-center justify-between gap-2"
                >
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span>{m.profileIcon}</span>
                    <span>{m.profileName}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-600/50">
                    Contains: {m.allergens.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-emerald-400 flex items-center gap-2 pt-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {hasIngredients
                  ? 'No allergens detected for your active family profile!'
                  : 'Product formulation verified with 0 active federal recall flags.'}
              </span>
            </div>
          )
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs space-y-1.5">
            <p className="text-[11px] text-slate-300 leading-normal">
              BiteHound can cross-reference every barcode against your household’s specific allergies (Gluten, Peanuts, Dairy, Tree Nuts, Soy, Shellfish, etc.).
            </p>
            <button
              type="button"
              onClick={onOpenPaywall}
              className="w-full py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition"
            >
              Activate Personal Allergen Guard
            </button>
          </div>
        )}
      </div>

      {/* 5. Food Additives & Dyes Guard */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5 uppercase tracking-wider">
            <Beaker className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {additivesCount > 0
                ? `${additivesCount} Flagged Additive${additivesCount > 1 ? 's' : ''} & Synthetic Dye${additivesCount > 1 ? 's' : ''}`
                : 'Synthetic Dye & Additive Guard'}
            </span>
          </span>

          {isPlus ? (
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Pro Guard Active
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenPaywall}
              className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 hover:bg-amber-500/30 transition flex items-center gap-1"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Pro</span>
            </button>
          )}
        </div>

        {isPlus ? (
          hasAdditives ? (
            <div className="space-y-1.5 pt-1">
              {data.detectedAdditives.map((add) => (
                <div
                  key={add.id}
                  className="p-2.5 rounded-lg bg-slate-900/90 border border-purple-900/60 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>{add.icon}</span>
                      <span>{add.name}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded border border-purple-700/50 shrink-0">
                      {add.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{add.desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-emerald-400 flex items-center gap-2 pt-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Clean formulation: No petroleum dyes, BVO, or high-concern preservatives found.</span>
            </div>
          )
        ) : (
          <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/40 text-xs space-y-1.5">
            <p className="text-[11px] text-slate-300 leading-normal">
              {additivesCount > 0
                ? `BiteHound detected ${additivesCount} ultra-processed additives/dyes in this item. Unlock Pro to view the exact chemical breakdown and toxicity classifications.`
                : 'Unlock Pro to monitor formulations for synthetic dyes (Red 40, Yellow 5), BHA/BHT, TBHQ, and industrial additives.'}
            </p>
            <button
              type="button"
              onClick={onOpenPaywall}
              className="w-full py-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 text-white font-bold text-xs transition"
            >
              Unlock Pro Additive Audit
            </button>
          </div>
        )}
      </div>

      {/* 6. Ingredients Breakdown */}
      {hasIngredients && (
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Indexed Ingredients
            </span>
            <button
              type="button"
              onClick={() => setShowFullIngredients(!showFullIngredients)}
              className="text-sky-400 hover:text-sky-300 text-[11px] font-semibold flex items-center gap-1"
            >
              <span>{showFullIngredients ? 'Show Less' : 'View Full List'}</span>
              {showFullIngredients ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <p
            className={`text-[11px] text-slate-300 leading-relaxed ${
              showFullIngredients ? '' : 'line-clamp-2'
            }`}
          >
            {data.ingredients}
          </p>
        </div>
      )}

      {/* 7. Retail Stores */}
      {data.stores && data.stores.length > 0 && (
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Major Stores:</span>
          <span className="text-slate-300 font-medium">{data.stores.slice(0, 6).join(', ')}</span>
        </div>
      )}

      {/* 8. Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => onSaveToWatchlist(data)}
          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
            isInWatchlist
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
          }`}
        >
          {isInWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
          <span>{isInWatchlist ? 'In Pantry' : 'Guard in Pantry'}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          <span>{copiedShare ? 'Copied Link!' : 'Share Alert'}</span>
        </button>

        <button
          type="button"
          onClick={onScanNext}
          className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Scan Next</span>
        </button>
      </div>
    </div>
  );
};
