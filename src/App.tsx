import React, { useState, useEffect } from 'react';
import { PokemonCard } from './utils/pokemon-types';
import { getInitialDeck } from './utils/starter-cards';
import { Header } from './components/Header';
import { BinderView } from './components/BinderView';
import { CardDetailModal } from './components/CardDetailModal';
import { CardScannerModal } from './components/CardScannerModal';
import { CardCreatorModal } from './components/CardCreatorModal';
import { BattleArenaModal } from './components/BattleArenaModal';
import { StatsAndTradesModal } from './components/StatsAndTradesModal';
import { sounds } from './utils/audio';
import { Sparkles, Camera, Swords, ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'pokemon_binder_cards_v1';

export default function App() {
  const [cards, setCards] = useState<PokemonCard[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Failed to load cards from localStorage:', err);
      }
    }
    return getInitialDeck();
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (err) {
      console.warn('Failed to persist cards:', err);
    }
  }, [cards]);

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'scanner' | 'creator' | 'battle' | 'trades' | 'detail' | null
  >(null);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showWelcomeTip, setShowWelcomeTip] = useState<boolean>(true);

  // Sound mute toggle
  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Toggle favorite
  const handleToggleFavorite = (cardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFavorite: !c.isFavorite } : c))
    );
    if (selectedCard && selectedCard.id === cardId) {
      setSelectedCard((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  // Update duplicate count
  const handleUpdateDuplicates = (cardId: string, delta: number) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          const current = c.duplicatesCount || 1;
          const next = Math.max(1, current + delta);
          return { ...c, duplicatesCount: next };
        }
        return c;
      })
    );
    if (selectedCard && selectedCard.id === cardId) {
      setSelectedCard((prev) => {
        if (!prev) return null;
        const current = prev.duplicatesCount || 1;
        return { ...prev, duplicatesCount: Math.max(1, current + delta) };
      });
    }
  };

  // Delete card
  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setActiveModal(null);
    setSelectedCard(null);
  };

  // Add new scanned or custom card
  const handleAddCard = (newCard: PokemonCard) => {
    setCards((prev) => [newCard, ...prev]);
    // Open the new card details
    setSelectedCard(newCard);
    setActiveModal('detail');
  };

  // Start battle with specific card
  const handleStartBattle = (card: PokemonCard) => {
    setSelectedCard(card);
    setActiveModal('battle');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        totalCards={cards.reduce((acc, c) => acc + (c.duplicatesCount || 1), 0)}
        onOpenScanner={() => setActiveModal('scanner')}
        onOpenCreator={() => setActiveModal('creator')}
        onOpenBattle={() => setActiveModal('battle')}
        onOpenTrades={() => setActiveModal('trades')}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Kid & Parent Friendly Hero Banner */}
        {showWelcomeTip && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 border border-slate-800 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white mb-0.5 flex items-center gap-2">
                  <span>ברוכים הבאים לאלבום הפוקימון המושלם!</span>
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  צלם קלף אמיתי מהמצלמה כדי להוסיף אותו לאלבום בעזרת זיהוי AI, הילחם בזירת הקרבות עם הפוקימונים שלך, צור קלפי פוקימון אישיים והזז את העכבר על הקלף לאפקט הולוגרפי זוהר!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveModal('scanner');
                }}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>סרוק קלף ראשון</span>
              </button>
              <button
                type="button"
                onClick={() => setShowWelcomeTip(false)}
                className="px-2.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                title="הסתר הודעה זו"
              >
                הבנתי, תודה!
              </button>
            </div>
          </div>
        )}

        {/* Binder Album Grid */}
        <BinderView
          cards={cards}
          onSelectCard={(card) => {
            setSelectedCard(card);
            setActiveModal('detail');
          }}
          onToggleFavorite={handleToggleFavorite}
          onOpenScanner={() => setActiveModal('scanner')}
        />
      </main>

      {/* Modals */}
      {activeModal === 'detail' && selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => {
            setActiveModal(null);
            setSelectedCard(null);
          }}
          onToggleFavorite={handleToggleFavorite}
          onUpdateDuplicates={handleUpdateDuplicates}
          onDeleteCard={handleDeleteCard}
          onStartBattleWithCard={handleStartBattle}
        />
      )}

      {activeModal === 'scanner' && (
        <CardScannerModal
          onClose={() => setActiveModal(null)}
          onCardAdded={handleAddCard}
        />
      )}

      {activeModal === 'creator' && (
        <CardCreatorModal
          onClose={() => setActiveModal(null)}
          onCardCreated={handleAddCard}
        />
      )}

      {activeModal === 'battle' && (
        <BattleArenaModal
          cards={cards}
          initialCard={selectedCard || undefined}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'trades' && (
        <StatsAndTradesModal
          cards={cards}
          onClose={() => setActiveModal(null)}
          onSelectCard={(card) => {
            setSelectedCard(card);
            setActiveModal('detail');
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500">
        <p>אלבום פוקימון דיגיטלי אספני לילדים · מותאם לכל סדרות הקלפים הרשמיות והמותאמות אישית</p>
      </footer>
    </div>
  );
}
