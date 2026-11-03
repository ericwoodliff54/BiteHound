import React from 'react';
import { X, ShieldAlert, CheckCircle, ExternalLink, FileText } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  if (!isOpen) return null;

  const handleAgree = () => {
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 text-amber-400">
          <ShieldAlert className="w-6 h-6 flex-shrink-0" />
          <h3 className="text-lg font-bold text-white">Food Safety Watchdog Disclaimer</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <p>
            <strong>1. Consumer Reference Only:</strong> BiteHound is an independent food safety watchdog and barcode audit assistant. It aggregates and indexes public recall feeds from the U.S. Food & Drug Administration (FDA), USDA Food Safety and Inspection Service (FSIS), and Open Food Facts.
          </p>
          <p>
            <strong>2. Not Medical Advice:</strong> BiteHound is not a medical device, licensed allergist, or healthcare diagnosis tool. Formulations, manufacturing facilities, cross-contact lines, and supplier ingredients can change without notice. Always inspect the physical packaging, allergen disclaimer labels, and batch/lot numbers directly on the item.
          </p>
          <p>
            <strong>3. In Case of Anaphylaxis:</strong> If someone experiences signs of an acute allergic reaction or foodborne illness, immediately call emergency medical services (911) or contact Poison Control (1-800-222-1222).
          </p>
          <p>
            <strong>4. Government Affiliation:</strong> BiteHound uses the openFDA API but is not officially endorsed or certified by the FDA, USDA, or U.S. Federal Government.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <a
            href="https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>FDA.gov Official Recall Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleAgree}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
