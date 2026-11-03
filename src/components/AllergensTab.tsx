import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldAlert,
  Check,
  Edit2,
  Trash2,
  Share2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { FamilyProfile } from '../types';
import { ALLERGEN_OPTIONS } from '../data/allergens';

interface AllergensTabProps {
  profiles: FamilyProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onOpenAddProfile: () => void;
  onOpenEditProfile: (profile: FamilyProfile) => void;
  onDeleteProfile: (id: string) => void;
  onToggleAllergen: (allergenId: string) => void;
  isPro: boolean;
  onOpenPaywall: () => void;
}

export const AllergensTab: React.FC<AllergensTabProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onOpenAddProfile,
  onOpenEditProfile,
  onDeleteProfile,
  onToggleAllergen,
  isPro,
  onOpenPaywall,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const handleCopyFamilyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('vip', 'family');
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto space-y-6">
      {/* Family Profiles Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Family Allergen Profiles</h2>
          </div>

          <button
            onClick={() => {
              if (profiles.length >= 2 && !isPro) {
                onOpenPaywall();
              } else {
                onOpenAddProfile();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-bold text-slate-200 flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Member</span>
            {!isPro && profiles.length >= 2 && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                PRO
              </span>
            )}
          </button>
        </div>

        {/* Profile Avatars Horizontal Scroll */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-1 pt-1">
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfileId;
            return (
              <div
                key={profile.id}
                onClick={() => onSelectProfile(profile.id)}
                className={`flex-shrink-0 cursor-pointer p-3 rounded-2xl border transition-all text-center flex flex-col items-center min-w-[85px] relative group ${
                  isActive
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-3xl mb-1.5 filter drop-shadow-sm">{profile.avatar}</span>
                <span
                  className={`text-xs font-bold truncate max-w-[80px] ${
                    isActive ? 'text-emerald-300' : 'text-slate-300'
                  }`}
                >
                  {profile.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {profile.allergens.length} flagged
                </span>

                {isActive && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-black shadow">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Profile Info & Edit/Delete Controls */}
        {activeProfile && (
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Currently Auditing:</span>
              <span className="font-bold text-white">{activeProfile.name}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onOpenEditProfile(activeProfile)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Edit profile"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {profiles.length > 1 && (
                <button
                  onClick={() => onDeleteProfile(activeProfile.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Delete profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Allergen Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Allergen & Sensitivity Guard</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select ingredients that will trigger instant alerts for {activeProfile?.name || 'this profile'}
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {activeProfile?.allergens.length || 0} active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ALLERGEN_OPTIONS.map((allergen) => {
            const isSelected = activeProfile?.allergens.includes(allergen.id.toLowerCase());

            return (
              <button
                key={allergen.id}
                onClick={() => onToggleAllergen(allergen.id.toLowerCase())}
                className={`p-3.5 rounded-2xl text-left border transition-all flex items-start justify-between space-x-3 ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-sm shadow-amber-950/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl flex-shrink-0">{allergen.icon}</span>
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        isSelected ? 'text-amber-300' : 'text-slate-200'
                      }`}
                    >
                      {allergen.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {allergen.description}
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 border transition-all ${
                    isSelected
                      ? 'bg-amber-500 border-amber-400 text-slate-950'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIP Family Share Pass */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h4 className="text-sm font-bold text-white">VIP Family Pass & Sync</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Share your BiteHound Family Link with spouses, caregivers, or kids. Anyone who opens this link automatically gets unlimited PRO safety scans and shared allergen alerts.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCopyFamilyLink}
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-950/50 active:scale-95"
          >
            {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'VIP Family Link Copied!' : 'Copy VIP Family Invite Link'}</span>
          </button>
        </div>
      </div>

      {/* FDA FASTER Act Reference */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5 flex items-start space-x-3">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-300">FDA FASTER Act & Big 9 Compliance</span>
          <p className="text-[11px] leading-relaxed">
            BiteHound cross-references ingredients against the FDA Major 9 Food Allergens (Milk, Egg, Fish, Shellfish, Tree Nuts, Peanuts, Wheat, Soybeans, Sesame) plus Gluten, Sulfites, and synthetic pet toxins.
          </p>
        </div>
      </div>
    </div>
  );
};
