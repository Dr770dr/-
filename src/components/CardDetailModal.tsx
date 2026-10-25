import React, { useState } from 'react';
import {
  X,
  Volume2,
  Star,
  Swords,
  Shield,
  Sparkles,
  Layers,
  Trash2,
  Plus,
  Minus,
  Trophy,
} from 'lucide-react';
import { PokemonCard, TYPE_METAS, getRarityLabel } from '../utils/pokemon-types';
import { sounds } from '../utils/audio';

interface CardDetailModalProps {
  card: PokemonCard;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onUpdateDuplicates: (id: string, delta: number) => void;
  onDeleteCard: (id: string) => void;
  onStartBattleWithCard: (card: PokemonCard) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  onClose,
  onToggleFavorite,
  onUpdateDuplicates,
  onDeleteCard,
  onStartBattleWithCard,
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const primaryType = card.types[0] || 'Colorless';
  const typeMeta = TYPE_METAS[primaryType] || TYPE_METAS.Colorless;
  const rarityMeta = getRarityLabel(card.rarity);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((y - centerY) / centerY) * -16);
    setRotateY(((x - centerX) / centerX) * 16);
  };

  const handleSpeak = () => {
    sounds.speakPokemonCard(
      card.nameHe,
      card.name,
      typeMeta.nameHe,
      card.hp,
      card.descriptionHe
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-base shadow"
              style={{ backgroundColor: typeMeta.color }}
            >
              {typeMeta.symbol}
            </span>
            <div>
              <h2
                id="card-modal-title"
                className="text-xl sm:text-2xl font-black text-white tracking-wide"
              >
                {card.nameHe}
              </h2>
              <p className="text-xs text-slate-400 font-mono">{card.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Read aloud Pokédex voice */}
            <button
              type="button"
              onClick={handleSpeak}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors active:scale-95"
              title="הקרא פרטי קלף בקול"
            >
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>הקרא קלף</span>
            </button>

            {/* Favorite toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onToggleFavorite(card.id);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700 transition-colors"
              aria-label="סמן כמועדף"
            >
              <Star
                className={`w-5 h-5 ${
                  card.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              aria-label="סגור חלון"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          {/* Left Column: 3D Tilt Card Showcase */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div
              className="perspective-1000 w-full max-w-[280px] sm:max-w-[320px] cursor-grab active:cursor-grabbing"
              onMouseMove={handleCardMouseMove}
              onMouseEnter={() => {
                setIsHovered(true);
                sounds.playHoloShimmer();
              }}
              onMouseLeave={() => {
                setIsHovered(false);
                setRotateX(0);
                setRotateY(0);
              }}
            >
              <div
                style={{
                  transform: isHovered
                    ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`
                    : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                  transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
                }}
                className="relative aspect-[2.5/3.5] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 bg-black"
              >
                <img
                  src={card.imageUrl}
                  alt={card.name}
                  className="w-full h-full object-cover"
                />

                {/* Holographic overlay */}
                {card.holoStyle !== 'none' && (
                  <div
                    className={`absolute inset-0 pointer-events-none ${
                      card.holoStyle === 'rainbow'
                        ? 'holo-rainbow'
                        : card.holoStyle === 'gold'
                        ? 'gold-foil'
                        : 'holo-foil'
                    }`}
                  />
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400 text-center flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>הזז את העכבר מעל הקלף כדי לראות את האפקט ההולוגרפי!</span>
            </p>

            {/* Quick Battle CTA Button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onStartBattleWithCard(card);
              }}
              className="mt-4 w-full max-w-[280px] sm:max-w-[320px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm shadow-lg shadow-red-900/40 active:scale-95 transition-all"
            >
              <Swords className="w-4 h-4" />
              <span>צא לקרב עם {card.nameHe}!</span>
            </button>
          </div>

          {/* Right Column: Detailed Stats & Attacks */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Top Quick Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">נקודות חיים (HP)</span>
                <span className="text-lg font-black text-amber-400">{card.hp}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">סוג עיקרי</span>
                <span className="text-sm font-bold text-slate-200">{typeMeta.nameHe}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">רמת התפתחות</span>
                <span className="text-sm font-bold text-slate-200">{card.stage}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">מדד עוצמה</span>
                <span className="text-lg font-black text-purple-400 flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  {card.powerScore}
                </span>
              </div>
            </div>

            {/* Rarity and Set Banner */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs">
              <span className={`px-2 py-0.5 rounded font-semibold ${rarityMeta.badge}`}>
                {rarityMeta.nameHe}
              </span>
              {card.setName && (
                <span className="text-slate-400">
                  סט: <strong className="text-slate-200">{card.setName}</strong>
                </span>
              )}
              {card.cardNumber && (
                <span className="text-slate-400 font-mono">
                  מספר: <strong className="text-slate-200">{card.cardNumber}</strong>
                </span>
              )}
            </div>

            {/* Attacks List */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <Swords className="w-4 h-4 text-red-400" />
                <span>מתקפות מיוחדות</span>
              </h3>
              <div className="space-y-2">
                {card.attacks.length > 0 ? (
                  card.attacks.map((attack, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {attack.nameHe || attack.name}
                          </span>
                          {attack.nameHe && attack.nameHe !== attack.name && (
                            <span className="text-xs text-slate-400 font-mono">
                              ({attack.name})
                            </span>
                          )}
                        </div>
                        {attack.damage !== 0 && (
                          <span className="px-2 py-0.5 rounded-lg bg-red-950/80 border border-red-800/70 text-red-300 font-black text-sm">
                            {attack.damage} נזק
                          </span>
                        )}
                      </div>
                      {attack.descriptionHe && (
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {attack.descriptionHe}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">לא צוינו מתקפות בקלף זה</p>
                )}
              </div>
            </div>

            {/* Lore Description */}
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40">
              <h4 className="text-xs font-bold text-blue-300 mb-1">אודות הפוקימון:</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{card.descriptionHe}</p>
            </div>

            {/* Fun Fact / Trivia for the Kid */}
            {card.funFactHe && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/40 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300 mb-0.5">
                    הידעת? סוד מיוחד לילדים:
                  </h4>
                  <p className="text-xs text-amber-100/90 leading-relaxed">{card.funFactHe}</p>
                </div>
              </div>
            )}

            {/* Duplicates / Trading with Friends Manager */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-300 block">
                  כפילויות להחלפה עם חברים
                </span>
                <span className="text-[11px] text-slate-400">
                  {card.duplicatesCount && card.duplicatesCount > 1
                    ? `יש לך ${card.duplicatesCount} עותקים (מומלץ לקחת לבית ספר להחלפות!)`
                    : 'עותק יחיד באלבום'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onUpdateDuplicates(card.id, -1);
                  }}
                  disabled={!card.duplicatesCount || card.duplicatesCount <= 1}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="הפחת עותק"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-white text-sm w-6 text-center">
                  {card.duplicatesCount || 1}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onUpdateDuplicates(card.id, 1);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  title="הוסף עותק נוסף"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Actions: Delete Card */}
            <div className="mt-2 pt-3 border-t border-slate-800 flex justify-end">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">בטוח שברצונך למחוק מהאלבום?</span>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onDeleteCard(card.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                  >
                    כן, מחק
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                  >
                    ביטול
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>הסר קלף מהאלבום</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
