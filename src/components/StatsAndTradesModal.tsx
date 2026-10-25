import React, { useState } from 'react';
import {
  X,
  Trophy,
  Repeat,
  Star,
  Sparkles,
  PieChart,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PokemonCard, PokemonType, TYPE_METAS } from '../utils/pokemon-types';
import { sounds } from '../utils/audio';

interface StatsAndTradesModalProps {
  cards: PokemonCard[];
  onClose: () => void;
  onSelectCard: (card: PokemonCard) => void;
}

export const StatsAndTradesModal: React.FC<StatsAndTradesModalProps> = ({
  cards,
  onClose,
  onSelectCard,
}) => {
  const [activeTab, setActiveTab] = useState<'trades' | 'stats' | 'tips'>('trades');

  // Calculate stats
  const totalCards = cards.reduce((acc, c) => acc + (c.duplicatesCount || 1), 0);
  const uniqueCount = cards.length;
  const duplicateCards = cards.filter((c) => (c.duplicatesCount || 1) > 1);
  const totalDuplicatesCount = duplicateCards.reduce(
    (acc, c) => acc + ((c.duplicatesCount || 1) - 1),
    0
  );
  const totalPower = cards.reduce((acc, c) => acc + (c.powerScore || 0), 0);

  // Type counts
  const typeCounts: Partial<Record<PokemonType, number>> = {};
  cards.forEach((c) => {
    const t = c.types[0] || 'Colorless';
    typeCounts[t] = (typeCounts[t] || 0) + (c.duplicatesCount || 1);
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h2 id="stats-title" className="text-lg sm:text-xl font-black text-white">
                מרכז ההחלפות ונתוני האלבום
              </h2>
              <p className="text-xs text-slate-400">
                מעקב כפילויות להחלפה עם חברים ונתוני אוסף
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="סגור חלון"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 pb-2">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">סך הכל קלפים</span>
            <span className="text-2xl font-black text-white">{totalCards}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">פוקימונים שונים</span>
            <span className="text-2xl font-black text-amber-400">{uniqueCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">כפילויות להחלפה</span>
            <span className="text-2xl font-black text-emerald-400">{totalDuplicatesCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-0.5">עוצמת אלבום כוללת</span>
            <span className="text-2xl font-black text-purple-400">{totalPower}</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="px-6 pt-3">
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('trades');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'trades'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>קלפים להחלפה עם חברים ({duplicateCards.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('stats');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'stats'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>התפלגות סוגים</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab('tips');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'tips'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>טיפים לאספן הצעיר</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[420px] overflow-y-auto">
          {/* Tab 1: Trades List */}
          {activeTab === 'trades' && (
            <div>
              {duplicateCards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {duplicateCards.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelectCard(c);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={c.imageUrl}
                          alt={c.nameHe}
                          className="w-10 h-14 rounded object-cover border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-white text-sm block group-hover:text-emerald-300">
                            {c.nameHe}
                          </span>
                          <span className="text-xs text-slate-400">{c.name}</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-xs">
                          x{c.duplicatesCount} עותקים
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          {((c.duplicatesCount || 1) - 1)} להחלפה
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm font-bold text-slate-300 mb-1">
                    עדיין אין לך קלפים כפולים באלבום!
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    כשיהיו לך עותקים כפולים של אותו פוקימון, הם יופיעו כאן כדי שתוכל לדעת בדיוק מה לקחת לבית הספר או לחברים להחלפה.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Type Breakdown */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 block mb-2">
                כמות קלפים לפי סוג באלבום:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(TYPE_METAS) as PokemonType[]).map((type) => {
                  const meta = TYPE_METAS[type];
                  const count = typeCounts[type] || 0;
                  const pct = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
                  return (
                    <div
                      key={type}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white"
                          style={{ backgroundColor: meta.color }}
                        >
                          {meta.symbol}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {meta.nameHe} ({type})
                          </span>
                          <span className="text-[10px] text-slate-500">{pct}% מהאלבום</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-200">
                        {count} קלפים
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Pro Tips for young collectors */}
          {activeTab === 'tips' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>שמירה על קלפים הולוגרפיים (Sleeves):</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  הכנס כל קלף זוהר או נדיר לשרוול פלסטיק (Sleeve) שקוף מיד לאחר הפתיחה. זה שומר עליו משריטות, מים וקיפולים!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-blue-400" />
                  <span>החלפות הוגנות עם חברים:</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  תמיד החלף רק קלפים כפולים שיש לך מהם עוד עותק באלבום! בדוק את רמת הנדירות של הקלף (סמל הכוכב בתחתית) לפני ההחלפה.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>סדר באלבום:</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  מומלץ לסדר את האלבום לפי סוגים (עמוד אש, עמוד מים, עמוד חשמל) או לפי מספר הפוקימון בפוקדקס, כדי למצוא קלפים בקלות לקרב!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
