import React, { useState } from 'react';
import {
  X,
  Swords,
  Shield,
  Zap,
  RotateCcw,
  Trophy,
  Sparkles,
  Heart,
  ChevronLeft,
} from 'lucide-react';
import {
  PokemonCard,
  PokemonType,
  TYPE_METAS,
  calculateDamage,
  checkBattleState,
} from '../utils/pokemon-types';
import { sounds } from '../utils/audio';

interface BattleArenaModalProps {
  cards: PokemonCard[];
  initialCard?: PokemonCard;
  onClose: () => void;
}

interface Opponent {
  id: string;
  nameHe: string;
  nameEn: string;
  hp: number;
  maxHp: number;
  type: PokemonType;
  imageUrl: string;
  attacks: { nameHe: string; damage: number }[];
  trainerTitle: string;
}

const OPPONENTS: Opponent[] = [
  {
    id: 'opp-meowth',
    nameHe: 'מיאו מצוות רוקט',
    nameEn: 'Team Rocket Meowth',
    hp: 140,
    maxHp: 140,
    type: 'Colorless',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png',
    trainerTitle: 'צוות רוקט הרשע',
    attacks: [
      { nameHe: 'שריטות מהירות', damage: 30 },
      { nameHe: 'מכת מטבע זהב', damage: 60 },
    ],
  },
  {
    id: 'opp-onix',
    nameHe: 'אוניקס של ברוק',
    nameEn: 'Brock\'s Onix',
    hp: 210,
    maxHp: 210,
    type: 'Fighting',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png',
    trainerTitle: 'מנהיג המכון ברוק',
    attacks: [
      { nameHe: 'זריקת סלעים', damage: 50 },
      { nameHe: 'קבר אבן מוחץ', damage: 90 },
    ],
  },
  {
    id: 'opp-gengar',
    nameHe: 'גנגר הרפאים',
    nameEn: 'Shadow Gengar',
    hp: 240,
    maxHp: 240,
    type: 'Darkness',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    trainerTitle: 'פוקימון צללים מסתורי',
    attacks: [
      { nameHe: 'כדור צללים אפל', damage: 70 },
      { nameHe: 'סיוט לילה', damage: 110 },
    ],
  },
  {
    id: 'opp-mewtwo',
    nameHe: 'מיוטו האגדי (בוס)',
    nameEn: 'Legendary Mewtwo',
    hp: 310,
    maxHp: 310,
    type: 'Psychic',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    trainerTitle: 'בוס הזירה האולטימטיבי',
    attacks: [
      { nameHe: 'מכת מחשבה על-קולית', damage: 85 },
      { nameHe: 'פיצוץ פסיכוקינטי הרסני', damage: 135 },
    ],
  },
];

export const BattleArenaModal: React.FC<BattleArenaModalProps> = ({
  cards,
  initialCard,
  onClose,
}) => {
  const [selectedCard, setSelectedCard] = useState<PokemonCard>(
    initialCard || cards[0] || ({} as PokemonCard)
  );
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent>(OPPONENTS[0]);

  // Battle states
  const [playerHp, setPlayerHp] = useState<number>(selectedCard.hp || 200);
  const [opponentHp, setOpponentHp] = useState<number>(selectedOpponent.hp);
  const [battleLogs, setBattleLogs] = useState<string[]>([
    `הקרב התחיל! ${selectedCard.nameHe} מול ${selectedOpponent.nameHe}!`,
  ]);
  const [isOpponentTurn, setIsOpponentTurn] = useState<boolean>(false);
  const [battleState, setBattleState] = useState<'ongoing' | 'player_won' | 'opponent_won'>('ongoing');
  const [lastEffectivenessMsg, setLastEffectivenessMsg] = useState<string | null>(null);

  // Switch card
  const handleSelectFighter = (card: PokemonCard) => {
    setSelectedCard(card);
    setPlayerHp(card.hp);
    setOpponentHp(selectedOpponent.maxHp);
    setBattleState('ongoing');
    setBattleLogs([`נבחר לוחם חדש: ${card.nameHe}! הקרב מתחיל מחדש.`]);
  };

  // Switch opponent
  const handleSelectOpponent = (opp: Opponent) => {
    setSelectedOpponent(opp);
    setOpponentHp(opp.maxHp);
    setPlayerHp(selectedCard.hp || 200);
    setBattleState('ongoing');
    setBattleLogs([`יריב חדש עלה לזירה: ${opp.nameHe}!`]);
  };

  // Reset battle
  const resetBattle = () => {
    setPlayerHp(selectedCard.hp || 200);
    setOpponentHp(selectedOpponent.maxHp);
    setBattleState('ongoing');
    setLastEffectivenessMsg(null);
    setBattleLogs([`הקרב אותחל מחדש! ${selectedCard.nameHe} מוכן לפעולה!`]);
    sounds.playPokedexScan();
  };

  // Player Attack
  const handlePlayerAttack = (attackName: string, baseDamage: number | string) => {
    if (battleState !== 'ongoing' || isOpponentTurn) return;

    const dmgNum = typeof baseDamage === 'number' ? baseDamage : parseInt(String(baseDamage), 10) || 50;
    const playerType = selectedCard.types[0] || 'Colorless';
    const { finalDamage, multiplier, messageHe } = calculateDamage(
      dmgNum,
      playerType,
      selectedOpponent.type
    );

    sounds.playAttack(multiplier > 1);
    setLastEffectivenessMsg(messageHe);

    const nextOppHp = Math.max(0, opponentHp - finalDamage);
    setOpponentHp(nextOppHp);

    const logEntry = `${selectedCard.nameHe} ביצע ${attackName}! גרם ל-${finalDamage} נזק! (${messageHe})`;
    setBattleLogs((prev) => [logEntry, ...prev]);

    const state = checkBattleState(playerHp, nextOppHp);
    if (state === 'player_won') {
      setBattleState('player_won');
      sounds.playCardFound();
      setBattleLogs((prev) => [`כל הכבוד! ניצחת בקרב את ${selectedOpponent.nameHe}! 🏆`, ...prev]);
      return;
    }

    // Opponent counter-attack turn
    setIsOpponentTurn(true);
    setTimeout(() => {
      executeOpponentTurn(nextOppHp);
    }, 1200);
  };

  // Opponent turn
  const executeOpponentTurn = (currentOppHp: number) => {
    if (currentOppHp <= 0) return;

    const oppAttacks = selectedOpponent.attacks;
    const chosenAttack = oppAttacks[Math.floor(Math.random() * oppAttacks.length)];
    const oppType = selectedOpponent.type;
    const playerType = selectedCard.types[0] || 'Colorless';

    const { finalDamage, multiplier, messageHe } = calculateDamage(
      chosenAttack.damage,
      oppType,
      playerType
    );

    sounds.playAttack(multiplier > 1);
    const nextPlayerHp = Math.max(0, playerHp - finalDamage);
    setPlayerHp(nextPlayerHp);

    const oppLog = `${selectedOpponent.nameHe} תקף עם ${chosenAttack.nameHe} וגרם ל-${finalDamage} נזק!`;
    setBattleLogs((prev) => [oppLog, ...prev]);

    const state = checkBattleState(nextPlayerHp, currentOppHp);
    if (state === 'opponent_won') {
      setBattleState('opponent_won');
      setBattleLogs((prev) => [`אוי לא! ${selectedCard.nameHe} הובס... נסה שוב או בחר פוקימון חזק יותר!`, ...prev]);
    }

    setIsOpponentTurn(false);
  };

  const playerTypeMeta = TYPE_METAS[selectedCard.types?.[0] || 'Colorless'] || TYPE_METAS.Colorless;
  const oppTypeMeta = TYPE_METAS[selectedOpponent.type] || TYPE_METAS.Colorless;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="arena-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h2 id="arena-title" className="text-lg sm:text-xl font-black text-white">
                זירת הקרבות של הפוקימונים
              </h2>
              <p className="text-xs text-slate-400">
                הילחם עם הקלפים שבאוסף שלך מול מאמנים ובוסים אגדיים!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetBattle}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1"
              title="אתחל קרב מחדש"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">התחל מחדש</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="סגור זירה"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Battle Arena Stage */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Opponent Selection Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 shrink-0">בחר יריב לקרב:</span>
            {OPPONENTS.map((opp) => (
              <button
                key={opp.id}
                type="button"
                onClick={() => handleSelectOpponent(opp)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 transition-all ${
                  selectedOpponent.id === opp.id
                    ? 'bg-red-950/70 text-red-300 border-red-500 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{TYPE_METAS[opp.type]?.symbol}</span>
                <span>{opp.nameHe}</span>
              </button>
            ))}
          </div>

          {/* Arena Ring Floor */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/40 border border-slate-800 p-4 sm:p-6 overflow-hidden shadow-inner">
            {/* Arena Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Opponent Card / Fighter Box */}
              <div className="flex flex-col items-center md:items-start p-4 rounded-xl bg-slate-950/70 border border-red-900/40">
                <div className="w-full flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ backgroundColor: oppTypeMeta.color }}
                    >
                      {oppTypeMeta.symbol}
                    </span>
                    <div>
                      <span className="font-black text-white text-sm block">
                        {selectedOpponent.nameHe}
                      </span>
                      <span className="text-[10px] text-red-400">
                        {selectedOpponent.trainerTitle}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-red-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    {opponentHp} / {selectedOpponent.maxHp} HP
                  </span>
                </div>

                {/* HP Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-4 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                    style={{
                      width: `${Math.max(0, (opponentHp / selectedOpponent.maxHp) * 100)}%`,
                    }}
                  />
                </div>

                {/* Opponent Visual Image */}
                <div className="w-36 h-36 mx-auto rounded-xl flex items-center justify-center p-2 bg-slate-900/80 border border-slate-800 mb-2">
                  <img
                    src={selectedOpponent.imageUrl}
                    alt={selectedOpponent.nameHe}
                    className={`max-w-full max-h-full object-contain ${
                      opponentHp <= 0 ? 'grayscale opacity-40' : 'animate-pulse'
                    }`}
                  />
                </div>
              </div>

              {/* Player Card / Fighter Box */}
              <div className="flex flex-col items-center md:items-end p-4 rounded-xl bg-slate-950/70 border border-blue-900/40">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                    {playerHp} / {selectedCard.hp} HP
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <span className="font-black text-white text-sm block">
                        {selectedCard.nameHe}
                      </span>
                      <span className="text-[10px] text-blue-400">הפוקימון שלך</span>
                    </div>
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ backgroundColor: playerTypeMeta.color }}
                    >
                      {playerTypeMeta.symbol}
                    </span>
                  </div>
                </div>

                {/* HP Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-4 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{
                      width: `${Math.max(0, (playerHp / (selectedCard.hp || 100)) * 100)}%`,
                    }}
                  />
                </div>

                {/* Player Visual Image */}
                <div className="w-36 h-36 mx-auto rounded-xl flex items-center justify-center p-2 bg-slate-900/80 border border-slate-800 mb-2">
                  <img
                    src={selectedCard.imageUrl}
                    alt={selectedCard.nameHe}
                    className={`max-w-full max-h-full object-contain ${
                      playerHp <= 0 ? 'grayscale opacity-40' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Effectiveness Indicator Alert */}
            {lastEffectivenessMsg && (
              <div className="mt-3 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5" />
                  {lastEffectivenessMsg}
                </span>
              </div>
            )}
          </div>

          {/* Player Attack Actions / Winner announcement */}
          {battleState === 'ongoing' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">
                  בחר מתקפה של {selectedCard.nameHe}:
                </span>
                {isOpponentTurn && (
                  <span className="text-xs text-amber-400 animate-pulse font-bold">
                    תור היריב מגיב...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCard.attacks && selectedCard.attacks.length > 0 ? (
                  selectedCard.attacks.map((atk, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isOpponentTurn}
                      onClick={() => handlePlayerAttack(atk.nameHe || atk.name, atk.damage)}
                      className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 hover:border-amber-400 flex items-center justify-between transition-all group text-right"
                    >
                      <div>
                        <span className="font-bold text-white text-sm block group-hover:text-amber-300">
                          {atk.nameHe || atk.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {atk.descriptionHe || 'מתקפת פוקימון'}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-red-950/80 text-red-300 border border-red-800 font-black text-sm">
                        {atk.damage} נזק
                      </span>
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    disabled={isOpponentTurn}
                    onClick={() => handlePlayerAttack('מכת מחץ בסיסית', 60)}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700"
                  >
                    מכת מחץ בסיסית (60 נזק)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center flex flex-col items-center">
              {battleState === 'player_won' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-amber-300 mb-1">
                    ניצחון אדיר בקרב! כל הכבוד!
                  </h3>
                  <p className="text-xs text-slate-300 mb-4 max-w-md">
                    {selectedCard.nameHe} הוכיח את כוחו והביס את {selectedOpponent.nameHe}!
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-black text-red-400 mb-1">הקרב הסתיים בהפסד</h3>
                  <p className="text-xs text-slate-300 mb-4 max-w-md">
                    לא נורא! מאמני פוקימונים אמיתיים לומדים מכל קרב. נסה שוב או בחר פוקימון עם יתרון סוג!
                  </p>
                </>
              )}
              <button
                type="button"
                onClick={resetBattle}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg active:scale-95 transition-all"
              >
                קרב חדש!
              </button>
            </div>
          )}

          {/* Choose Another Card from Collection */}
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2">
              או החלף לפוקימון אחר מהאלבום שלך:
            </span>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {cards.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectFighter(c)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border shrink-0 transition-all ${
                    selectedCard.id === c.id
                      ? 'bg-blue-950/80 border-blue-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <img
                    src={c.imageUrl}
                    alt={c.nameHe}
                    className="w-7 h-9 rounded object-cover"
                  />
                  <div className="text-right">
                    <span className="text-xs font-bold block truncate max-w-[100px]">
                      {c.nameHe}
                    </span>
                    <span className="text-[10px] text-amber-400 font-black">{c.hp} HP</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Combat Log History */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 max-h-32 overflow-y-auto text-xs space-y-1 font-mono">
            {battleLogs.map((log, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 'text-amber-300 font-bold'
                    : 'text-slate-400'
                }
              >
                • {log}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
