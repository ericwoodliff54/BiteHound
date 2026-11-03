import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, Image, RefreshCw, Zap, ZapOff, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { FamilyProfile } from '../types';
import { isValidBarcodeCheckDigit, expandUPCE } from '../utils/barcode';

interface ScannerTabProps {
  activeProfile: FamilyProfile;
  isScanning: boolean;
  onScanSuccess: (code: string) => void;
  onScanError?: (err: string) => void;
  audioMuted: boolean;
}

export const ScannerTab: React.FC<ScannerTabProps> = ({
  activeProfile,
  onScanSuccess,
}) => {
  const [scannerStarted, setScannerStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const readerId = 'bitehound-reader';

  const handleBarcodeDetected = (rawCode: string) => {
    if (isProcessing) return;
    
    let cleanCode = rawCode.trim().replace(/[^0-9]/g, '');
    if (!cleanCode) return;

    // Check UPC-E expansion if 8 digits
    if (cleanCode.length === 8 && (cleanCode.startsWith('0') || cleanCode.startsWith('1'))) {
      cleanCode = expandUPCE(cleanCode);
    }

    // Quick cooldown so same code isn't bombarded
    if (cleanCode === lastScannedCode && isProcessing) {
      return;
    }

    setLastScannedCode(cleanCode);
    setIsProcessing(true);

    onScanSuccess(cleanCode);

    setTimeout(() => {
      setIsProcessing(false);
    }, 1800);
  };

  const startScanner = async () => {
    setCameraError(null);
    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(readerId);
      scannerRef.current = html5QrCode;

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      await html5QrCode.start(
        { facingMode: facingMode },
        {
          fps: 15,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.0,
          formatsToSupport,
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {
          // Frame scan error - normal when scanning empty frames
        }
      );

      setScannerStarted(true);

      // Check torch capability
      try {
        const capabilities = html5QrCode.getRunningTrackCapabilities();
        if (capabilities && (capabilities as any).torch) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: any) {
      console.warn('Scanner camera init failed:', err);
      setCameraError(
        err?.message || 'Unable to access camera. Please allow camera permissions or upload an image of the barcode.'
      );
      setScannerStarted(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
    }
    setScannerStarted(false);
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  const flipCamera = async () => {
    await stopScanner();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [facingMode]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const scanner = scannerRef.current || new Html5Qrcode(readerId);
      const decodedResult = await scanner.scanFile(file, true);
      if (decodedResult) {
        handleBarcodeDetected(decodedResult);
      }
    } catch (err: any) {
      alert('Could not detect a clear barcode in this photo. Please try another angle or enter manually.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4">

      {/* Scanner Viewport */}
      <div className="relative w-full aspect-square max-h-[380px] bg-black rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-2xl shadow-emerald-950/20">
        <div id={readerId} className="w-full h-full object-cover"></div>

        {/* Viewfinder Overlay Guide */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
          <div className="relative w-64 h-44 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center">
            {/* Corner notches */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

            {/* Laser scanning line */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse absolute shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>

            {isProcessing && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-center p-3 animate-fade-in">
                <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                <span className="text-xs font-bold text-emerald-200">Checking FDA & Alerts...</span>
              </div>
            )}
          </div>

          <div className="mt-4 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 backdrop-blur-md text-xs font-medium text-slate-300">
            Center Barcode inside box
          </div>
        </div>

        {/* Scanner Floating Controls */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
                torchOn
                  ? 'bg-amber-400 text-slate-950 shadow-amber-500/40'
                  : 'bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800'
              }`}
              title="Toggle Flashlight"
            >
              {torchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={flipCamera}
            className="p-2.5 rounded-full bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 backdrop-blur-md transition-all shadow-md"
            title="Switch Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Permission / Fallback Warning */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-20">
            <ShieldAlert className="w-12 h-12 text-amber-400" />
            <h4 className="text-base font-bold text-white">Camera Access Required</h4>
            <p className="text-xs text-slate-400 max-w-xs">{cameraError}</p>
            <button
              onClick={startScanner}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/40"
            >
              Retry Camera
            </button>
          </div>
        )}
      </div>

      {/* Alternative actions: Upload photo */}
      <div className="w-full flex items-center justify-between gap-3 pt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
        >
          <Image className="w-4 h-4 text-emerald-400" />
          <span>Upload Barcode Photo</span>
        </button>

        <button
          onClick={startScanner}
          className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restart Camera</span>
        </button>
      </div>

      {/* Scanning Tips */}
      <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 space-y-1">
        <div className="font-semibold text-slate-300 flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>BiteHound Barcode Tips</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Supports standard UPC-A, UPC-E (expanded automatically), and EAN-13. Hold packaging flat and ensure good lighting.
        </p>
      </div>
    </div>
  );
};
