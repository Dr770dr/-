import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Upload,
  Check,
  Zap,
  Swords,
  Trophy,
} from 'lucide-react';
import {
  PokemonCard,
  PokemonType,
  TYPE_METAS,
  calculatePowerScore,
} from '../utils/pokemon-types';
import { sounds } from '../utils/audio';

interface CardCreatorModalProps {
  onClose: () => void;
  onCardCreated: (newCard: PokemonCard) => void;
}

const PRESET_CREATURE_IMAGES = [
  {
    name: 'דרקון אש חמוד',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
  },
  {
    name: 'צב מים גיבור',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
  },
  {
    name: 'יונק דבש קסום',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
  },
  {
    name: 'עכבר ברקים',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
  },
  {
    name: 'שועל קסם זוהר',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
  },
  {
    name: 'פוקימון רוח שובב',
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
  },
];

export const CardCreatorModal: React.FC<CardCreatorModalProps> = ({
  onClose,
  onCardCreated,
}) => {
  const [nameHe, setNameHe] = useState('פוקימון העל שלי');
  const [nameEn, setNameEn] = useState('My Super Pokemon');
  const [hp, setHp] = useState(250);
  const [selectedType, setSelectedType] = useState<PokemonType>('Electric');
  const [holoStyle, setHoloStyle] = useState<'holo' | 'rainbow' | 'gold' | 'cosmic'>('rainbow');
  const [stage, setStage] = useState<'Basic' | 'Stage 1' | 'Stage 2' | 'VMAX'>('VMAX');
  const [attackNameHe, setAttackNameHe] = useState('קרן מחץ קוסמית');
  const [attackDamage, setAttackDamage] = useState(180);
  const [descriptionHe, setDescriptionHe] = useState(
    'פוקימון אגדי מיוחד שנברא באלבום האישי שלי! בעל מהירות שיא וכוחות חברות אינסופיים.'
  );
  const [funFactHe, setFunFactHe] = useState('הוא מסוגל לעוף בחלל ולשמח ילדים בכל העולם!');
  const [customImageUrl, setCustomImageUrl] = useState(PRESET_CREATURE_IMAGES[3].url);

  const typeMeta = TYPE_METAS[selectedType] || TYPE_METAS.Electric;

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImageUrl(event.target?.result as string);
      sounds.playClick();
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCard = () => {
    sounds.playCardFound();

    const newCard: PokemonCard = {
      id: `custom-${Date.now()}`,
      name: nameEn || nameHe,
      nameHe,
      hp,
      types: [selectedType],
      rarity: 'Custom',
      stage,
      cardNumber: '001/MY-DECK',
      setName: 'מהדורת הילד שלי',
      attacks: [
        {
          name: 'Super Cosmic Strike',
          nameHe: attackNameHe,
          damage: attackDamage,
          cost: [selectedType, 'Colorless'],
          descriptionHe: 'מתקפת על בלתי מנוצחת!',
        },
      ],
      descriptionHe,
      funFactHe,
      imageUrl: customImageUrl,
      holoStyle,
      dateAdded: new Date().toISOString().split('T')[0],
      isFavorite: true,
      isCustom: true,
      duplicatesCount: 1,
      powerScore: 0,
    };

    newCard.powerScore = calculatePowerScore(newCard);
    onCardCreated(newCard);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="creator-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="creator-title" className="text-lg sm:text-xl font-black text-white">
                יוצר קלפי פוקימון אישיים
              </h2>
              <p className="text-xs text-slate-400">
                עצב קלף חלומות עם תמונה אישית, מתקפות וכוחות מיוחדים!
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

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          {/* Left Column: Live Card Preview */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="text-xs text-amber-300 font-bold mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>תצוגה חיה של הקלף שלך:</span>
            </div>

            <div className="w-full max-w-[260px] sm:max-w-[280px] aspect-[2.5/3.5] rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-400/80 bg-slate-950 relative flex flex-col justify-between p-3">
              {/* Card Holographic layer */}
              <div
                className={`absolute inset-0 pointer-events-none z-20 ${
                  holoStyle === 'rainbow'
                    ? 'holo-rainbow'
                    : holoStyle === 'gold'
                    ? 'gold-foil'
                    : 'holo-foil'
                }`}
              />

              {/* Top Bar of card */}
              <div className="relative z-30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-200/80 font-bold block">{stage}</span>
                  <span className="font-black text-white text-base tracking-tight">{nameHe}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-0.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {hp} HP
                  </span>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow text-white font-bold"
                    style={{ backgroundColor: typeMeta.color }}
                  >
                    {typeMeta.symbol}
                  </span>
                </div>
              </div>

              {/* Creature Image Frame */}
              <div className="relative z-10 w-full h-36 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/80 my-1">
                <img
                  src={customImageUrl}
                  alt={nameHe}
                  className="w-full h-full object-contain p-2"
                />
              </div>

              {/* Attack Box */}
              <div className="relative z-30 bg-slate-900/90 rounded-lg p-2 border border-slate-700/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">{attackNameHe}</span>
                  <span className="font-black text-red-400 text-xs">{attackDamage} נזק</span>
                </div>
                <p className="text-[10px] text-slate-300 truncate">מתקפת על עוצמתית במיוחד</p>
              </div>

              {/* Bottom Details */}
              <div className="relative z-30 flex items-center justify-between text-[9px] text-slate-400 pt-1">
                <span>קלף מותאם אישית</span>
                <span>⭐ נדיר ביותר</span>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="md:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {/* Choose or upload image */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                בחר תמונה לקלף (או העלה תמונה אישית מהמכשיר):
              </label>
              <div className="grid grid-cols-6 gap-2 mb-2">
                {PRESET_CREATURE_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setCustomImageUrl(preset.url);
                    }}
                    className={`aspect-square rounded-xl bg-slate-950 p-1 border-2 transition-all ${
                      customImageUrl === preset.url
                        ? 'border-amber-400 scale-105'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>העלה תמונה מהמכשיר (תמונה שלך, חיית מחמד או ציור)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  שם הפוקימון בעברית:
                </label>
                <input
                  type="text"
                  value={nameHe}
                  onChange={(e) => setNameHe(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  שם באנגלית (לסדרות):
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Type & Stage Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  סוג פוקימון (אלמנט):
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    sounds.playClick();
                    setSelectedType(e.target.value as PokemonType);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                >
                  {(Object.keys(TYPE_METAS) as PokemonType[]).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_METAS[t].symbol} {TYPE_METAS[t].nameHe} ({t})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  רמת התפתחות:
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="Basic">Basic (בסיסי)</option>
                  <option value="Stage 1">Stage 1 (התפתחות 1)</option>
                  <option value="Stage 2">Stage 2 (התפתחות 2)</option>
                  <option value="VMAX">VMAX (ענקי אגדי)</option>
                </select>
              </div>
            </div>

            {/* HP Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">נקודות חיים (HP):</label>
                <span className="text-sm font-black text-amber-400">{hp} HP</span>
              </div>
              <input
                type="range"
                min="60"
                max="340"
                step="10"
                value={hp}
                onChange={(e) => setHp(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Holo Foil Style */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                אפקט זוהר הולוגרפי:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'holo', label: 'הולוגרפי זוהר' },
                  { id: 'rainbow', label: 'קשת צבעים' },
                  { id: 'gold', label: 'זהב טהור' },
                  { id: 'cosmic', label: 'גלקסיה קוסמית' },
                ].map((foil) => (
                  <button
                    key={foil.id}
                    type="button"
                    onClick={() => {
                      sounds.playHoloShimmer();
                      setHoloStyle(foil.id as any);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      holoStyle === foil.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {foil.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Attack Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  שם המתקפה המיוחדת:
                </label>
                <input
                  type="text"
                  value={attackNameHe}
                  onChange={(e) => setAttackNameHe(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  עוצמת נזק:
                </label>
                <input
                  type="number"
                  value={attackDamage}
                  onChange={(e) => setAttackDamage(parseInt(e.target.value, 10) || 50)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-red-400 font-black text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Save Card CTA */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleSaveCard}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-sm shadow-xl flex items-center gap-2 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 text-slate-950" />
                <span>שמור קלף אישי באלבום!</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
