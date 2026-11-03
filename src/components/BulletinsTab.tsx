import React, { useState } from 'react';
import {
  AlertOctagon,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Building,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { FDACachedRecall } from '../types';
import { NATIONAL_BULLETINS } from '../data/nationalBulletins';

interface BulletinsTabProps {
  cachedRecalls: FDACachedRecall[];
  lastSyncTime: number | null;
  onSync: () => Promise<void>;
  isSyncing: boolean;
}

export const BulletinsTab: React.FC<BulletinsTabProps> = ({
  cachedRecalls,
  lastSyncTime,
  onSync,
  isSyncing,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'Class I' | 'Class II' | 'Class III'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Combine curated high-impact national bulletins with live FDA recalls
  const nationalItems: FDACachedRecall[] = NATIONAL_BULLETINS.map((b) => ({
    recall_number: b.id,
    product_description: `${b.brand} - ${b.productName}`,
    reason_for_recall: `${b.hazard} • ${b.action}`,
    classification: b.severity as any,
    recalling_firm: b.brand,
    distribution_pattern: b.distribution,
    recall_initiation_date: b.date.replace(/-/g, ''),
    upc: b.upc,
  }));

  // Deduplicate by recall_number or description
  const combinedRecalls = [...nationalItems];
  for (const item of cachedRecalls) {
    if (!combinedRecalls.some((c) => c.recall_number === item.recall_number)) {
      combinedRecalls.push(item);
    }
  }

  const filteredRecalls = combinedRecalls.filter((item) => {
    if (severityFilter !== 'all' && item.classification !== severityFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.product_description?.toLowerCase().includes(q) ||
        item.reason_for_recall?.toLowerCase().includes(q) ||
        item.recalling_firm?.toLowerCase().includes(q) ||
        item.distribution_pattern?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const formatFdaDate = (raw?: string) => {
    if (!raw) return 'Recent';
    if (raw.length === 8) {
      const y = raw.substring(0, 4);
      const m = raw.substring(4, 6);
      const d = raw.substring(6, 8);
      return `${m}/${d}/${y}`;
    }
    return raw;
  };

  const getSeverityBadge = (classification: string) => {
    switch (classification) {
      case 'Class I':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            Class I (High Danger)
          </span>
        );
      case 'Class II':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Class II (Moderate)
          </span>
        );
      case 'Class III':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Class III (Labeling)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
            {classification}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto space-y-5">
      {/* Header and live FDA sync bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-red-400" />
              <span>FDA Food Recall Wire</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live enforcement feed directly from FDA & USDA official bulletins
            </p>
          </div>

          <button
            onClick={() => onSync()}
            disabled={isSyncing}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
              isSyncing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 shadow-emerald-950/40'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Wire'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live watchdog active</span>
          </div>
          <div>
            Last Sync:{' '}
            {lastSyncTime
              ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Cached'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recalls by brand, pathogen (Listeria, Salmonella)..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-2xl py-2.5 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Severity Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `All (${combinedRecalls.length})` },
            {
              id: 'Class I',
              label: `Class I (${combinedRecalls.filter((r) => r.classification === 'Class I').length})`,
              isDanger: true,
            },
            {
              id: 'Class II',
              label: `Class II (${combinedRecalls.filter((r) => r.classification === 'Class II').length})`,
            },
            {
              id: 'Class III',
              label: `Class III (${combinedRecalls.filter((r) => r.classification === 'Class III').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSeverityFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                severityFilter === tab.id
                  ? 'bg-slate-200 text-slate-950 font-bold shadow-md'
                  : tab.isDanger
                  ? 'bg-red-950/40 text-red-400 border border-red-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recall Cards List */}
      <div className="space-y-3">
        {filteredRecalls.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
            No recalls found matching your filter criteria.
          </div>
        ) : (
          filteredRecalls.map((recall) => {
            const isExpanded = expandedId === recall.recall_number;
            return (
              <div
                key={recall.recall_number}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all shadow-md space-y-3"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : recall.recall_number)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(recall.classification)}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatFdaDate(recall.recall_initiation_date)}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white line-clamp-2 mt-1">
                        {recall.product_description}
                      </h3>
                    </div>

                    <button className="text-slate-500 p-1 hover:text-slate-300">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Hazard / Reason Callout */}
                  <div className="mt-2 text-xs font-semibold text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 flex items-start space-x-2">
                    <AlertOctagon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="line-clamp-2 leading-relaxed">
                      {recall.reason_for_recall}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300 animate-fade-in">
                    {recall.recalling_firm && (
                      <div className="flex items-center space-x-2">
                        <Building className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>
                          <strong className="text-slate-400">Recalling Firm:</strong>{' '}
                          {recall.recalling_firm}
                        </span>
                      </div>
                    )}

                    {recall.distribution_pattern && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-400">Distribution:</strong>{' '}
                          {recall.distribution_pattern}
                        </span>
                      </div>
                    )}

                    {recall.upc && (
                      <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded-lg">
                        Pre-Indexed UPC: {recall.upc}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Recall ID: {recall.recall_number}</span>
                      <a
                        href={`https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center space-x-1"
                      >
                        <span>Official FDA Notice</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
