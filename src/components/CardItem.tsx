import React, { useState, useRef } from 'react';
import { Star, ShieldAlert, Zap, Sparkles } from 'lucide-react';
import { PokemonCard, TYPE_METAS, getRarityLabel } from '../utils/pokemon-types';
import { sounds } from '../utils/audio';

interface CardItemProps {
  card: PokemonCard;
  onClick: () => void;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  showDuplicatesBadge?: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onClick,
  onToggleFavorite,
  showDuplicatesBadge = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const primaryType = card.types[0] || 'Colorless';
  const typeMeta = TYPE_METAS[primaryType] || TYPE_METAS.Colorless;
  const rarityMeta = getRarityLabel(card.rarity);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12; // tilt max 12 deg
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (card.holoStyle !== 'none') {
      sounds.playHoloShimmer();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleClick = () => {
    sounds.playCardFlip();
    onClick();
  };

  return (
    <div
      className="perspective-1000 w-full group select-none"
      style={{ minHeight: '320px' }}
    >
      <div
        ref={cardRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
        }}
        className="relative w-full aspect-[2.5/3.5] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-yellow-500/20 bg-slate-900 border-2 border-slate-700/80 transition-shadow duration-300"
      >
        {/* Binder Sleeve Pocket Plastic Gloss */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none z-30" />

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            type="button"
            aria-label={card.isFavorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              onToggleFavorite(card.id, e);
            }}
            className="absolute top-2 right-2 z-40 p-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-yellow-400 hover:scale-110 active:scale-95 transition-transform"
          >
            <Star
              className={`w-4 h-4 ${card.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`}
            />
          </button>
        )}

        {/* Duplicate badge */}
        {showDuplicatesBadge && card.duplicatesCount && card.duplicatesCount > 1 && (
          <div className="absolute top-2 left-2 z-40 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs shadow-md border border-amber-300 flex items-center gap-1">
            <span>x{card.duplicatesCount}</span>
            <span className="text-[10px] font-normal">להחלפה</span>
          </div>
        )}

        {/* Card Artwork Image */}
        <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between overflow-hidden">
          {/* Card Image */}
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Fallback illustration if CDN fails
              (e.currentTarget as HTMLImageElement).src =
                'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';
            }}
          />

          {/* Holographic Foil Filter */}
          {card.holoStyle !== 'none' && isHovered && (
            <div
              className={`absolute inset-0 pointer-events-none z-20 ${
                card.holoStyle === 'rainbow'
                  ? 'holo-rainbow'
                  : card.holoStyle === 'gold'
                  ? 'gold-foil'
                  : 'holo-foil'
              }`}
              style={{
                backgroundPosition: `${glarePos.x}% ${glarePos.y}%`,
                opacity: 0.85,
              }}
            />
          )}

          {/* Dynamic Glare Reflection */}
          {isHovered && (
            <div
              className="absolute inset-0 pointer-events-none z-25 opacity-40 mix-blend-overlay"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
              }}
            />
          )}

          {/* Bottom Card Summary Badge (Overlay) */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent p-3 pt-6 z-30">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-bold text-white text-base tracking-tight truncate drop-shadow">
                {card.nameHe}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-amber-300 font-extrabold flex items-center gap-0.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {card.hp} HP
                </span>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs shadow"
                  style={{ backgroundColor: typeMeta.color }}
                  title={typeMeta.nameHe}
                >
                  {typeMeta.symbol}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="truncate text-slate-300 text-[11px] font-mono">
                {card.name}
              </span>
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                {card.stage}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
