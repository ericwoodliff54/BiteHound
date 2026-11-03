import React, { useState } from 'react';
import { Search, Delete, AlertTriangle, ShieldCheck, ArrowRight, Sparkles, Check, Hash } from 'lucide-react';
import { isValidBarcodeCheckDigit, expandUPCE } from '../utils/barcode';
import { RECALL_DATABASE } from '../data/recallDatabase';

interface ManualTabProps {
  onLookup: (barcode: string) => void;
  isProcessing: boolean;
}

// Sample recalled test products from FDA database for instant demo & verification
const DEMO_TEST_PRODUCTS = [
  {
    name: "Boar's Head Strassburger Brand Liverwurst",
    code: "042421004113",
    tag: "Class I Listeria Recall",
    severity: "danger",
  },
  {
    name: "Jif Creamy Peanut Butter (16 oz)",
    code: "051500255162",
    tag: "Salmonella Outbreak Recall",
    severity: "danger",
  },
  {
    name: "Quaker Chewy Chocolate Chip Granola Bars",
    code: "030000311910",
    tag: "Salmonella Contamination",
    severity: "danger",
  },
  {
    name: "Rizo Bros Cotija Aged Mexican Cheese",
    code: "727342340015",
    tag: "Fatal Listeria Outbreak",
    severity: "danger",
  },
  {
    name: "Campbell's Tomato Soup (10.75 oz)",
    code: "051000000115",
    tag: "Pantry Staple (Audit Safe)",
    severity: "safe",
  },
  {
    name: "Kraft Macaroni & Cheese Dinner",
    code: "021000658831",
    tag: "Staple (Dyes & Additives Audit)",
    severity: "safe",
  },
];

export const ManualTab: React.FC<ManualTabProps> = ({ onLookup, isProcessing }) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const cleanCode = barcodeInput.trim().replace(/[^0-9]/g, '');
  const isValidLength = cleanCode.length === 8 || cleanCode.length === 12 || cleanCode.length === 13;
  const isCheckDigitValid = isValidLength ? isValidBarcodeCheckDigit(cleanCode) : false;

  const handleKeyPress = (num: string) => {
    if (barcodeInput.length < 14) {
      setBarcodeInput((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setBarcodeInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setBarcodeInput('');
  };

  const handleSubmit = (codeToSubmit?: string) => {
    let finalCode = (codeToSubmit || barcodeInput).trim().replace(/[^0-9]/g, '');
    if (!finalCode) return;

    if (finalCode.length === 8 && (finalCode.startsWith('0') || finalCode.startsWith('1'))) {
      finalCode = expandUPCE(finalCode);
    }

    onLookup(finalCode);
  };

  // Filter pre-indexed items if searching by name
  const filteredRecalls = searchQuery.trim().length > 2
    ? RECALL_DATABASE.filter(
        (item) =>
          item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.upc.includes(searchQuery)
      ).slice(0, 8)
    : [];

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto space-y-6">
      {/* Input Display Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
          <span className="flex items-center space-x-1.5">
            <Hash className="w-4 h-4 text-emerald-400" />
            <span>ENTER BARCODE (UPC / EAN)</span>
          </span>
          {cleanCode.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isCheckDigitValid
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isValidLength
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isCheckDigitValid
                ? 'Valid Check Digit'
                : isValidLength
                ? 'Check Digit Mismatch'
                : `${cleanCode.length} / 12 digits`}
            </span>
          )}
        </div>

        {/* Big Code Input */}
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && cleanCode.length >= 8) {
                handleSubmit();
              }
            }}
            placeholder="e.g. 042421004113"
            className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 rounded-2xl py-4 px-5 text-2xl font-mono text-center tracking-widest text-emerald-300 placeholder:text-slate-600 focus:outline-none transition-all shadow-inner"
          />

          {barcodeInput.length > 0 && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Delete className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Verification Submit Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={cleanCode.length < 8 || isProcessing}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
            cleanCode.length >= 8 && !isProcessing
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30 active:scale-[0.99]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Auditing Recall & Allergen Databases...</span>
            </div>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              <span>Verify Barcode Safety</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>

        {/* Virtual Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 text-lg font-bold text-slate-200 transition-colors border border-slate-700/50 font-mono shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-xs font-bold text-slate-400 transition-colors border border-slate-700/50"
          >
            CLEAR
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-slate-700 text-lg font-bold text-slate-200 transition-colors border border-slate-700/50 font-mono shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors border border-slate-700/50"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Test Recall Library */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Test Barcodes (Try a Recall)</span>
          </h3>
          <span className="text-[10px] text-slate-500">Tap to load & audit</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEMO_TEST_PRODUCTS.map((prod) => (
            <button
              key={prod.code}
              onClick={() => {
                setBarcodeInput(prod.code);
                handleSubmit(prod.code);
              }}
              className="text-left p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between space-y-2 shadow-sm"
            >
              <div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-1">
                  {prod.name}
                </div>
                <div className="text-[11px] font-mono text-slate-400">UPC: {prod.code}</div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    prod.severity === 'danger'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {prod.tag}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold group-hover:underline">
                  Test &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search Pre-Indexed Database by Name */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <Search className="w-4 h-4 text-emerald-400" />
          <span>Search 360+ Known Recalls by Brand or Product</span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type brand, e.g. Boar's Head, Jif, Enoki, Quaker..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-600 rounded-xl py-2.5 pl-3 pr-8 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {filteredRecalls.length > 0 && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {filteredRecalls.map((recall) => (
              <div
                key={recall.upc + recall.productName}
                onClick={() => {
                  setBarcodeInput(recall.upc);
                  handleSubmit(recall.upc);
                }}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {recall.brand} - {recall.productName}
                  </div>
                  <div className="text-[10px] text-red-400 truncate font-mono">
                    {recall.hazard} ({recall.upc})
                  </div>
                </div>
                <button className="text-[10px] px-2 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 whitespace-nowrap">
                  Audit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
