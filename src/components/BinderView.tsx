import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Star,
  ChevronRight,
  ChevronLeft,
  Plus,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import {
  PokemonCard,
  PokemonType,
  TYPE_METAS,
  CardRarity,
} from '../utils/pokemon-types';
import { CardItem } from './CardItem';
import { sounds } from '../utils/audio';

interface BinderViewProps {
  cards: PokemonCard[];
  onSelectCard: (card: PokemonCard) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenScanner: () => void;
}

const CARDS_PER_PAGE = 9; // Authentic 3x3 Pokemon binder page!

export const BinderView: React.FC<BinderViewProps> = ({
  cards,
  onSelectCard,
  onToggleFavorite,
  onOpenScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PokemonType | 'ALL'>('ALL');
  const [selectedRarity, setSelectedRarity] = useState<CardRarity | 'ALL'>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'power' | 'hp' | 'name' | 'date'>('power');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = card.name.toLowerCase().includes(q);
          const matchNameHe = card.nameHe.includes(q);
          const matchSet = card.setName?.toLowerCase().includes(q);
          const matchAttack = card.attacks.some((a) =>
            a.name.toLowerCase().includes(q) || (a.nameHe && a.nameHe.includes(q))
          );
          if (!matchName && !matchNameHe && !matchSet && !matchAttack) return false;
        }

        // Type filter
        if (selectedType !== 'ALL') {
          if (!card.types.includes(selectedType)) return false;
        }

        // Rarity filter
        if (selectedRarity !== 'ALL') {
          if (card.rarity !== selectedRarity) return false;
        }

        // Favorites filter
        if (onlyFavorites && !card.isFavorite) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'power') return (b.powerScore || 0) - (a.powerScore || 0);
        if (sortBy === 'hp') return b.hp - a.hp;
        if (sortBy === 'name') return a.nameHe.localeCompare(b.nameHe);
        if (sortBy === 'date') return (b.dateAdded || '').localeCompare(a.dateAdded || '');
        return 0;
      });
  }, [cards, searchQuery, selectedType, selectedRarity, onlyFavorites, sortBy]);

  // Pagination for binder pages
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / CARDS_PER_PAGE));
  const currentCards = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    return filteredCards.slice(start, start + CARDS_PER_PAGE);
  }, [filteredCards, currentPage]);

  // Pad the page to 9 slots like a real 3x3 binder page!
  const emptySlotsCount = Math.max(0, CARDS_PER_PAGE - currentCards.length);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      sounds.playCardFlip();
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      sounds.playCardFlip();
      setCurrentPage((p) => p + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="חפש לפי שם פוקימון (עברית/אנגלית), מתקפה או סט..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                נקה
              </button>
            )}
          </div>

          {/* Quick Filter Controls */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Favorites toggle button */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setOnlyFavorites((prev) => !prev);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
                onlyFavorites
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  onlyFavorites ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                }`}
              />
              <span>מועדפים בלבד</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="power" className="bg-slate-900">
                  לפי עוצמה (גבוה לנמוך)
                </option>
                <option value="hp" className="bg-slate-900">
                  לפי נקודות חיים (HP)
                </option>
                <option value="name" className="bg-slate-900">
                  לפי שם (א-ת)
                </option>
                <option value="date" className="bg-slate-900">
                  חדשים ביותר
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedType('ALL');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shrink-0 ${
              selectedType === 'ALL'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            כל הסוגים
          </button>
          {(Object.keys(TYPE_METAS) as PokemonType[]).map((type) => {
            const meta = TYPE_METAS[type];
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedType(type);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors shrink-0 ${
                  isSelected
                    ? 'text-white border-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
                style={isSelected ? { backgroundColor: meta.color } : {}}
              >
                <span>{meta.symbol}</span>
                <span>{meta.nameHe}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Realistic Pokemon Card Binder Page Canvas */}
      <div className="relative bg-slate-950/90 border-2 border-slate-800/90 rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden">
        {/* Binder Ring Graphics on the right (for RTL Hebrew binder) */}
        <div className="absolute right-1 top-8 bottom-8 flex flex-col justify-around z-20 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-5 h-8 rounded-r-full binder-ring" />
          ))}
        </div>

        {/* Binder Page Header & Pagination */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-black text-white">
              עמוד {currentPage} מתוך {totalPages}
            </span>
            <span className="text-xs text-slate-400">
              ({filteredCards.length} קלפים מוצגים)
            </span>
          </div>

          {/* Page navigation controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              <span>עמוד קודם</span>
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span>עמוד הבא</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The 3x3 Card Grid (9 Sleeves) */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {currentCards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                onClick={() => onSelectCard(card)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}

            {/* Empty Binder Pocket Sleeves to complete the 9-card page */}
            {emptySlotsCount > 0 &&
              [...Array(emptySlotsCount)].map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  onClick={() => {
                    sounds.playClick();
                    onOpenScanner();
                  }}
                  className="w-full aspect-[2.5/3.5] rounded-xl border-2 border-dashed border-slate-800 hover:border-amber-400/60 bg-slate-900/30 hover:bg-slate-900/60 transition-all cursor-pointer flex flex-col items-center justify-center p-4 text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-500 group-hover:text-amber-400 border border-slate-700 flex items-center justify-center mb-2 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-amber-300 transition-colors">
                    כיס פנוי באלבום
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    לחץ לסריקת קלף חדש
                  </span>
                </div>
              ))}
          </div>
        ) : (
          /* Empty Search Filter State */
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              לא נמצאו קלפים התואמים לחיפוש
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              נסה לשנות את הסינון, לנקות את מילת החיפוש, או לסרוק קלף פוקימון חדש!
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedRarity('ALL');
                setOnlyFavorites(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
            >
              איפוס כל הסינונים
            </button>
          </div>
        )}

        {/* Binder Page Bottom Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>אלבום אספנים רשמי - תצוגת שרוולים הולוגרפיים</span>
          <div className="flex items-center gap-1 text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>הזז את העכבר על קלף כדי להפעיל את האפקט ההולוגרפי</span>
          </div>
        </div>
      </div>
    </div>
  );
};
