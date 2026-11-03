import React, { useState } from 'react';
import { X, Check, User, Heart } from 'lucide-react';
import { FamilyProfile } from '../types';
import { ALLERGEN_OPTIONS } from '../data/allergens';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: { name: string; avatar: string; allergens: string[] }) => void;
  initialProfile?: FamilyProfile | null;
}

const AVATAR_CHOICES = [
  '👨', '👩', '👦', '👧', '👶', '👴', '👵', '🐶', '🐱', '🥑', '🍎', '🥦'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [avatar, setAvatar] = useState(initialProfile?.avatar || '🧒');
  const [allergens, setAllergens] = useState<string[]>(initialProfile?.allergens || []);

  if (!isOpen) return null;

  const toggleAllergen = (id: string) => {
    const lower = id.toLowerCase();
    setAllergens((prev) =>
      prev.includes(lower) ? prev.filter((a) => a !== lower) : [...prev, lower]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      avatar,
      allergens,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <User className="w-5 h-5 text-emerald-400" />
          <span>{initialProfile ? 'Edit Profile' : 'Add Family Member'}</span>
        </h3>

        {/* Avatar selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Choose Avatar</label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setAvatar(choice)}
                className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center transition-all ${
                  avatar === choice
                    ? 'bg-emerald-500/30 border-2 border-emerald-400 scale-105 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 border border-slate-700 hover:bg-slate-750'
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        </div>

        {/* Member Name */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Member Name / Nickname</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Leo (Toddler), Emma, Mom, Baxter (Pup)"
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Initial Allergens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300">Flagged Allergies & Sensitivities</label>
            <span className="text-slate-500">{allergens.length} selected</span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {ALLERGEN_OPTIONS.map((item) => {
              const checked = allergens.includes(item.id.toLowerCase());
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleAllergen(item.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                    checked
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="truncate">
                    {item.icon} {item.name}
                  </span>
                  {checked && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all shadow-md ${
              name.trim()
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
