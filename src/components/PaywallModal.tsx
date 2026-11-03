import React, { useState } from 'react';
import { X, Check, Sparkles, ShieldCheck, Heart, Users, Bell, Zap, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockPro: () => void;
  isPro: boolean;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onUnlockPro,
  isPro,
}) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);

  if (!isOpen) return null;

  const handleActivatePro = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    onUnlockPro();
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toLowerCase();
    const validCodes = ['family', 'vip', 'bitehound', 'safebite', 'pro', 'fda', 'free'];

    if (validCodes.includes(code)) {
      setPromoSuccess(true);
      setPromoError(false);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
      });
      setTimeout(() => {
        onUnlockPro();
      }, 1000);
    } else {
      setPromoError(true);
      setPromoSuccess(false);
    }
  };

  const features = [
    {
      icon: <Bell className="w-4 h-4 text-emerald-400" />,
      title: '24/7 Pantry Recall Watchdog',
      desc: 'Automatic background sync with FDA Enforcement API for all saved pantry items.',
    },
    {
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      title: 'Unlimited Family & Pet Profiles',
      desc: 'Configure individual profiles and allergy guardrails for every member of the household.',
    },
    {
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      title: 'Ultra-Processed Additives & Dyes Audit',
      desc: 'Flags Red 40, Titanium Dioxide, BHA, High Fructose Corn Syrup, and synthetic stabilizers.',
    },
    {
      icon: <Gift className="w-4 h-4 text-emerald-400" />,
      title: 'VIP Family Share Pass',
      desc: 'Share 1 subscription with up to 5 family members at no additional charge.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>BiteHound PRO Watchdog</span>
          </div>

          <h2 className="text-2xl font-black text-white">Protect Every Family Bite</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Get instant FDA recall alerts, full allergen interception, and pantry safety guards.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mt-0.5 flex-shrink-0">
                {feat.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{feat.title}</div>
                <div className="text-[11px] text-slate-400 leading-snug">{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Toggle Plan */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setBillingCycle('annual')}
            className={`p-3.5 rounded-2xl border text-left transition-all relative ${
              billingCycle === 'annual'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="absolute -top-2.5 right-3 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
              Save 44%
            </span>
            <div className="text-xs font-bold text-white">Annual Plan</div>
            <div className="text-lg font-black text-emerald-400 mt-1">$1.66<span className="text-[10px] text-slate-400 font-normal">/mo</span></div>
            <div className="text-[10px] text-slate-400">$19.99 billed yearly</div>
          </button>

          <button
            onClick={() => setBillingCycle('monthly')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              billingCycle === 'monthly'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold text-white">Monthly Plan</div>
            <div className="text-lg font-black text-emerald-400 mt-1">$2.99<span className="text-[10px] text-slate-400 font-normal">/mo</span></div>
            <div className="text-[10px] text-slate-400">Cancel anytime</div>
          </button>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleActivatePro}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.99]"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>{isPro ? 'PRO Active — Refresh Benefits' : 'Start 3-Day Free Trial'}</span>
        </button>

        {/* Secret VIP / Promo Code Input */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoError(false);
              }}
              placeholder="Enter VIP / Promo Code (e.g. FAMILY)"
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none uppercase"
            />
            <button
              onClick={handleApplyPromo}
              className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 border border-slate-700"
            >
              Apply
            </button>
          </div>

          {promoSuccess && (
            <div className="text-[11px] text-emerald-400 font-bold mt-1.5 flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>VIP Family Pass Unlocked! PRO features enabled.</span>
            </div>
          )}

          {promoError && (
            <div className="text-[11px] text-rose-400 font-medium mt-1.5">
              Invalid code. Try using "FAMILY" or "VIP" for instant access.
            </div>
          )}
        </div>

        <div className="text-center text-[10px] text-slate-500 space-x-2">
          <span>No credit card required for trial</span>
          <span>•</span>
          <span>Family Safe Guarantee</span>
        </div>
      </div>
    </div>
  );
};
