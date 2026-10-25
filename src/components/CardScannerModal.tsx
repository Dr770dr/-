import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  RefreshCw,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PokemonCard, calculatePowerScore } from '../utils/pokemon-types';
import { SAMPLE_CARD_PHOTOS, SamplePhoto } from '../utils/sample-photos';
import { sounds } from '../utils/audio';

interface CardScannerModalProps {
  onClose: () => void;
  onCardAdded: (newCard: PokemonCard) => void;
}

export const CardScannerModal: React.FC<CardScannerModalProps> = ({
  onClose,
  onCardAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('samples');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scannedCard, setScannedCard] = useState<PokemonCard | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Camera states
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);

  // Stop camera stream cleanly
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraPermissionError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera error or permission denied:', err);
      setCameraPermissionError(true);
      setActiveTab('samples');
    }
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  // Capture frame from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    processCardImage(dataUrl);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      processCardImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // Handle sample card selection
  const handleSelectSample = (sample: SamplePhoto) => {
    sounds.playClick();
    processCardImage(sample.imageUrl);
  };

  // Send image to backend Gemini API
  const processCardImage = async (imageSrc: string) => {
    setIsScanning(true);
    setErrorMessage(null);
    setPreviewImage(imageSrc);
    sounds.playPokedexScan();

    try {
      const payload: { imageUrl?: string; imageBase64?: string } = {};
      if (imageSrc.startsWith('http')) {
        payload.imageUrl = imageSrc;
      } else {
        payload.imageBase64 = imageSrc;
      }

      const res = await fetch('/api/scan-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('שגיאה בסריקת התמונה. נסה שוב.');
      }

      const data = await res.json();
      if (!data.success || !data.card) {
        throw new Error(data.error || 'לא זוהה קלף בתמונה');
      }

      const raw = data.card;
      const parsedCard: PokemonCard = {
        id: `scanned-${Date.now()}`,
        name: raw.name || 'Pokemon Card',
        nameHe: raw.nameHe || raw.name || 'פוקימון חדש',
        hp: typeof raw.hp === 'number' ? raw.hp : 100,
        types: Array.isArray(raw.types) && raw.types.length > 0 ? raw.types : ['Colorless'],
        rarity: raw.rarity || 'Holo Rare',
        stage: raw.stage || 'Basic',
        cardNumber: raw.cardNumber || `${Math.floor(Math.random() * 150) + 1}/198`,
        setName: raw.setName || 'סדרה חדשה',
        attacks: Array.isArray(raw.attacks)
          ? raw.attacks.map((a: any) => ({
              name: a.name || 'Attack',
              nameHe: a.nameHe || a.name || 'מתקפה מיוחדת',
              damage: typeof a.damage === 'number' ? a.damage : 60,
              cost: Array.isArray(a.cost) ? a.cost : ['Colorless'],
              descriptionHe: a.descriptionHe || 'מתקפת פוקימון מרהיבה!',
            }))
          : [],
        weakness: raw.weakness || undefined,
        resistance: raw.resistance || undefined,
        retreatCost: raw.retreatCost || 1,
        descriptionHe: raw.descriptionHe || 'פוקימון נהדר שנוסף לאלבום שלך!',
        funFactHe: raw.funFactHe || 'פוקימון זה ידוע בקרבות חזקים במיוחד!',
        imageUrl: imageSrc,
        holoStyle: raw.holoStyle || 'holo',
        dateAdded: new Date().toISOString().split('T')[0],
        isFavorite: false,
        duplicatesCount: 1,
        powerScore: 0,
      };

      parsedCard.powerScore = calculatePowerScore(parsedCard);
      setScannedCard(parsedCard);
      sounds.playCardFound();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'הסריקה נכשלה. אנא נסה שוב עם תמונה ברורה יותר.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!scannedCard) return;
    sounds.playCardFound();
    onCardAdded(scannedCard);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 id="scanner-title" className="text-lg sm:text-xl font-black text-white">
                סורק הקלפים החכם של הפוקדקס
              </h2>
              <p className="text-xs text-slate-400">
                צלם קלף אמיתי, העלה תמונה, או בחר קלף לדוגמה
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="סגור סורק"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!scannedCard ? (
            <>
              {/* Method Tabs */}
              <div className="flex items-center gap-2 mb-6 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('samples');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'samples'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>קלפים לדוגמה (מהיר)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('camera');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'camera'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>מצלמה פעילה</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('upload');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>העלאת קובץ</span>
                </button>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Scanning in progress overlay */}
              {isScanning ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative w-36 h-48 rounded-xl overflow-hidden border-2 border-red-500 shadow-xl bg-slate-950 mb-4">
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover opacity-60"
                      />
                    )}
                    {/* Animated Laser scan line */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-red-500 via-amber-300 to-red-500 shadow-[0_0_15px_#ef4444] animate-bounce" />
                  </div>
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-1">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>הבינה המלאכותית מזהה את הקלף...</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-sm">
                    מפענח את סוג הפוקימון, נקודות החיים, המתקפות והערך ההולוגרפי!
                  </p>
                </div>
              ) : (
                <>
                  {/* Tab 1: Quick Sample Cards for instant testing */}
                  {activeTab === 'samples' && (
                    <div>
                      <p className="text-xs text-slate-300 mb-3 font-medium">
                        לחץ על אחד מקלפי הפוקימון כדי לסרוק אותו מיד:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {SAMPLE_CARD_PHOTOS.map((sample) => (
                          <button
                            key={sample.id}
                            type="button"
                            onClick={() => handleSelectSample(sample)}
                            className="group p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/60 text-right transition-all flex flex-col items-center"
                          >
                            <div className="w-full aspect-[2.5/3.5] rounded-lg overflow-hidden bg-slate-900 mb-2 border border-slate-700/60">
                              <img
                                src={sample.thumbnailUrl}
                                alt={sample.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <span className="text-xs font-bold text-white truncate w-full text-center">
                              {sample.title}
                            </span>
                            <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              סרוק קלף זה
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Live Camera Viewfinder */}
                  {activeTab === 'camera' && (
                    <div className="flex flex-col items-center">
                      {cameraPermissionError ? (
                        <div className="py-8 text-center">
                          <p className="text-xs text-amber-400 mb-2">
                            לא ניתן להפעיל את המצלמה בדפדפן זה, או שלא אושרה הרשאה.
                          </p>
                          <p className="text-xs text-slate-400 mb-4">
                            באפשרותך להעלות תמונה מהמכשיר או לבחור קלף לדוגמה!
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab('samples')}
                            className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                          >
                            עבור לקלפים לדוגמה
                          </button>
                        </div>
                      ) : (
                        <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden bg-black border-2 border-slate-700 flex flex-col justify-end">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                          {/* Card Guide Outline */}
                          <div className="absolute inset-8 border-2 border-dashed border-amber-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                            <span className="text-[11px] text-amber-300 font-bold bg-black/60 px-2 py-1 rounded">
                              הצב את הקלף בתוך המסגרת
                            </span>
                          </div>

                          {/* Shutter Button */}
                          <div className="absolute bottom-4 inset-x-0 flex justify-center">
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 border-4 border-white shadow-xl active:scale-95 transition-transform flex items-center justify-center text-white"
                              aria-label="צלם תמונה של הקלף"
                            >
                              <Camera className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Upload File */}
                  {activeTab === 'upload' && (
                    <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/60 p-6 text-center">
                      <div className="w-14 h-14 rounded-full bg-indigo-950/80 border border-indigo-700 flex items-center justify-center text-indigo-400 mb-3">
                        <Upload className="w-7 h-7" />
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1">
                        בחר תמונה של קלף פוקימון
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">
                        תומך בפורמטים JPG, PNG ישירות מהגלריה או קבצים
                      </p>
                      <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>בחר קובץ תמונה</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* Review Scanned Card Result */
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>הקלף זוהה בהצלחה על ידי הבינה המלאכותית! סקור את הפרטים ואשר:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-5 flex justify-center">
                  <div className="w-44 aspect-[2.5/3.5] rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-xl bg-black">
                    <img
                      src={scannedCard.imageUrl}
                      alt={scannedCard.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="sm:col-span-7 space-y-2.5">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">שם הקלף (עברית):</label>
                    <input
                      type="text"
                      value={scannedCard.nameHe}
                      onChange={(e) =>
                        setScannedCard({ ...scannedCard, nameHe: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">נקודות חיים (HP):</label>
                      <input
                        type="number"
                        value={scannedCard.hp}
                        onChange={(e) =>
                          setScannedCard({
                            ...scannedCard,
                            hp: parseInt(e.target.value, 10) || 50,
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-amber-400 font-bold text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">רמת התפתחות:</label>
                      <input
                        type="text"
                        value={scannedCard.stage}
                        onChange={(e) =>
                          setScannedCard({ ...scannedCard, stage: e.target.value as any })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 font-bold text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">תיאור לילד:</label>
                    <textarea
                      rows={2}
                      value={scannedCard.descriptionHe}
                      onChange={(e) =>
                        setScannedCard({ ...scannedCard, descriptionHe: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setScannedCard(null);
                    setPreviewImage(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  סרוק שוב
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-900/30 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>שמור קלף באלבום!</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
