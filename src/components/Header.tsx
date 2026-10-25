import React from 'react';
import {
  Camera,
  Sparkles,
  Swords,
  Repeat,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  totalCards: number;
  onOpenScanner: () => void;
  onOpenCreator: () => void;
  onOpenBattle: () => void;
  onOpenTrades: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCards,
  onOpenScanner,
  onOpenCreator,
  onOpenBattle,
  onOpenTrades,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            {/* Pokéball Graphic */}
            <div className="relative w-9 h-9 rounded-full border-2 border-slate-900 bg-gradient-to-b from-red-600 50% via-slate-900 50% to-white 50% shadow-md flex items-center justify-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-900 shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  אלבום הפוקימון שלי
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {totalCards} קלפים
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                אלבום דיגיטלי אספני עם סריקת קלפים, קרבות ואפקט הולוגרפי
              </p>
            </div>
          </div>

          {/* Sound Mute Toggle (Mobile & Desktop) */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title={isMuted ? 'הפעל צלילים' : 'השתק צלילים'}
            aria-label={isMuted ? 'הפעל צלילים' : 'השתק צלילים'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none justify-start md:justify-end">
          {/* Scan Button (Primary) */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenScanner();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-md shadow-red-950/50 active:scale-95 transition-all shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span>סרוק קלף חדש</span>
          </button>

          {/* Create Custom Card */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenCreator();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>צור קלף אישי</span>
          </button>

          {/* Battle Arena */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenBattle();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-red-300 hover:text-red-200 border border-red-900/40 font-bold text-xs active:scale-95 transition-all shrink-0"
          >
            <Swords className="w-4 h-4 text-red-400" />
            <span>זירת קרבות</span>
          </button>

          {/* Trades & Stats */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenTrades();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-indigo-900/40 font-bold text-xs active:scale-95 transition-all shrink-0"
          >
            <Repeat className="w-4 h-4 text-indigo-400" />
            <span>החלפות ונתונים</span>
          </button>
        </div>
      </div>
    </header>
  );
};
