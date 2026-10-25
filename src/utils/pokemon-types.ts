/**
 * Pokémon card types, effectiveness chart, rarity definitions, and battle logic.
 */

export type PokemonType =
  | 'Fire'
  | 'Water'
  | 'Grass'
  | 'Electric'
  | 'Psychic'
  | 'Fighting'
  | 'Darkness'
  | 'Metal'
  | 'Dragon'
  | 'Fairy'
  | 'Colorless';

export type CardRarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Holo Rare'
  | 'Ultra Rare (EX/GX/V)'
  | 'Secret Rare'
  | 'Custom';

export interface CardAttack {
  name: string;
  nameHe?: string;
  damage: number | string;
  cost: PokemonType[];
  description?: string;
  descriptionHe?: string;
}

export interface PokemonCard {
  id: string;
  name: string;
  nameHe: string;
  hp: number;
  types: PokemonType[];
  rarity: CardRarity;
  stage: 'Basic' | 'Stage 1' | 'Stage 2' | 'VMAX' | 'VSTAR' | 'Mega';
  cardNumber?: string;
  setName?: string;
  attacks: CardAttack[];
  weakness?: PokemonType;
  resistance?: PokemonType;
  retreatCost?: number;
  descriptionHe: string;
  funFactHe?: string;
  imageUrl: string;
  holoStyle: 'none' | 'holo' | 'rainbow' | 'gold' | 'cosmic';
  dateAdded: string;
  isFavorite?: boolean;
  isCustom?: boolean;
  duplicatesCount?: number;
  powerScore: number;
}

export interface TypeMeta {
  nameEn: PokemonType;
  nameHe: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  symbol: string;
}

export const TYPE_METAS: Record<PokemonType, TypeMeta> = {
  Fire: {
    nameEn: 'Fire',
    nameHe: 'אש',
    color: '#EF4444',
    bgGradient: 'from-amber-600 via-red-600 to-rose-700',
    borderColor: '#F87171',
    badgeBg: 'bg-red-900/60',
    badgeText: 'text-red-300',
    symbol: '🔥',
  },
  Water: {
    nameEn: 'Water',
    nameHe: 'מים',
    color: '#3B82F6',
    bgGradient: 'from-sky-500 via-blue-600 to-indigo-800',
    borderColor: '#60A5FA',
    badgeBg: 'bg-blue-900/60',
    badgeText: 'text-blue-300',
    symbol: '💧',
  },
  Grass: {
    nameEn: 'Grass',
    nameHe: 'עשב',
    color: '#10B981',
    bgGradient: 'from-emerald-500 via-green-600 to-teal-800',
    borderColor: '#34D399',
    badgeBg: 'bg-emerald-900/60',
    badgeText: 'text-emerald-300',
    symbol: '🌿',
  },
  Electric: {
    nameEn: 'Electric',
    nameHe: 'חשמל',
    color: '#EAB308',
    bgGradient: 'from-yellow-400 via-amber-500 to-orange-600',
    borderColor: '#FDE047',
    badgeBg: 'bg-amber-900/60',
    badgeText: 'text-amber-300',
    symbol: '⚡',
  },
  Psychic: {
    nameEn: 'Psychic',
    nameHe: 'על-חושי',
    color: '#A855F7',
    bgGradient: 'from-purple-500 via-fuchsia-600 to-pink-700',
    borderColor: '#C084FC',
    badgeBg: 'bg-purple-900/60',
    badgeText: 'text-purple-300',
    symbol: '🔮',
  },
  Fighting: {
    nameEn: 'Fighting',
    nameHe: 'לחימה',
    color: '#EA580C',
    bgGradient: 'from-orange-600 via-amber-700 to-yellow-800',
    borderColor: '#FB923C',
    badgeBg: 'bg-orange-900/60',
    badgeText: 'text-orange-300',
    symbol: '🥊',
  },
  Darkness: {
    nameEn: 'Darkness',
    nameHe: 'חושך',
    color: '#4B5563',
    bgGradient: 'from-slate-700 via-gray-800 to-zinc-950',
    borderColor: '#6B7280',
    badgeBg: 'bg-gray-800/80',
    badgeText: 'text-gray-300',
    symbol: '🌑',
  },
  Metal: {
    nameEn: 'Metal',
    nameHe: 'מתכת',
    color: '#94A3B8',
    bgGradient: 'from-slate-400 via-zinc-500 to-slate-700',
    borderColor: '#CBD5E1',
    badgeBg: 'bg-slate-800/70',
    badgeText: 'text-slate-300',
    symbol: '⚙️',
  },
  Dragon: {
    nameEn: 'Dragon',
    nameHe: 'דרקון',
    color: '#6366F1',
    bgGradient: 'from-indigo-600 via-violet-700 to-amber-700',
    borderColor: '#818CF8',
    badgeBg: 'bg-indigo-900/60',
    badgeText: 'text-indigo-300',
    symbol: '🐉',
  },
  Fairy: {
    nameEn: 'Fairy',
    nameHe: 'פיה',
    color: '#EC4899',
    bgGradient: 'from-pink-400 via-rose-500 to-fuchsia-600',
    borderColor: '#F472B6',
    badgeBg: 'bg-pink-900/60',
    badgeText: 'text-pink-300',
    symbol: '✨',
  },
  Colorless: {
    nameEn: 'Colorless',
    nameHe: 'רגיל',
    color: '#9CA3AF',
    bgGradient: 'from-stone-400 via-zinc-500 to-neutral-600',
    borderColor: '#E5E7EB',
    badgeBg: 'bg-zinc-800/60',
    badgeText: 'text-zinc-300',
    symbol: '⭐',
  },
};

/**
 * Type effectiveness chart: attacker -> defender -> multiplier
 */
export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  Fire: { Grass: 2.0, Metal: 2.0, Water: 0.5, Fire: 0.5, Dragon: 0.5 },
  Water: { Fire: 2.0, Grass: 0.5, Water: 0.5, Dragon: 0.5 },
  Grass: { Water: 2.0, Fire: 0.5, Grass: 0.5, Metal: 0.5, Dragon: 0.5 },
  Electric: { Water: 2.0, Grass: 0.5, Electric: 0.5, Dragon: 0.5 },
  Psychic: { Fighting: 2.0, Darkness: 0.5, Metal: 0.5, Psychic: 0.5 },
  Fighting: { Darkness: 2.0, Metal: 2.0, Colorless: 2.0, Psychic: 0.5, Fairy: 0.5 },
  Darkness: { Psychic: 2.0, Fighting: 0.5, Darkness: 0.5, Fairy: 0.5 },
  Metal: { Fairy: 2.0, Fire: 0.5, Water: 0.5, Electric: 0.5, Metal: 0.5 },
  Dragon: { Dragon: 2.0, Metal: 0.5, Fairy: 0 },
  Fairy: { Dragon: 2.0, Fighting: 2.0, Darkness: 2.0, Fire: 0.5, Metal: 0.5 },
  Colorless: { Metal: 0.5 },
};

/**
 * Calculate attack multiplier
 */
export function getTypeMultiplier(attackerType: PokemonType, defenderType?: PokemonType): number {
  if (!defenderType) return 1.0;
  const defenderMap = TYPE_CHART[attackerType];
  if (!defenderMap || defenderMap[defenderType] === undefined) {
    return 1.0;
  }
  return defenderMap[defenderType]!;
}

/**
 * Calculate damage inflicted by attack
 */
export function calculateDamage(
  baseDamage: number,
  attackerType: PokemonType,
  defenderType?: PokemonType
): { finalDamage: number; multiplier: number; messageHe: string } {
  const multiplier = getTypeMultiplier(attackerType, defenderType);
  const finalDamage = Math.round(baseDamage * multiplier);

  let messageHe = 'פגיעה רגילה!';
  if (multiplier > 1) {
    messageHe = 'סופר אפקטיבי! נזק כפול!';
  } else if (multiplier === 0) {
    messageHe = 'אין השפעה כלל!';
  } else if (multiplier < 1) {
    messageHe = 'לא מאוד אפקטיבי...';
  }

  return { finalDamage, multiplier, messageHe };
}

/**
 * Calculate overall power score for a card (useful for kid's deck ranking)
 */
export function calculatePowerScore(card: Partial<PokemonCard>): number {
  const hp = card.hp || 50;
  let maxAttack = 0;
  if (card.attacks && card.attacks.length > 0) {
    for (const atk of card.attacks) {
      const dmgNum = typeof atk.damage === 'number' ? atk.damage : parseInt(String(atk.damage)) || 0;
      if (dmgNum > maxAttack) maxAttack = dmgNum;
    }
  }

  let rarityBonus = 0;
  switch (card.rarity) {
    case 'Ultra Rare (EX/GX/V)':
      rarityBonus = 80;
      break;
    case 'Secret Rare':
      rarityBonus = 120;
      break;
    case 'Holo Rare':
      rarityBonus = 50;
      break;
    case 'Rare':
      rarityBonus = 30;
      break;
    case 'Uncommon':
      rarityBonus = 15;
      break;
    default:
      rarityBonus = 5;
  }

  return Math.round(hp * 0.8 + maxAttack * 1.2 + rarityBonus);
}

/**
 * Rarity Hebrew translation and color
 */
export function getRarityLabel(rarity: CardRarity): { nameHe: string; color: string; badge: string } {
  switch (rarity) {
    case 'Secret Rare':
      return { nameHe: 'נדיר סודי (Secret Rare)', color: '#F59E0B', badge: 'bg-amber-500/20 text-amber-300' };
    case 'Ultra Rare (EX/GX/V)':
      return { nameHe: 'אולטרה נדיר (EX/GX/V)', color: '#EC4899', badge: 'bg-pink-500/20 text-pink-300' };
    case 'Holo Rare':
      return { nameHe: 'הולוגרפי זוהר (Holo)', color: '#8B5CF6', badge: 'bg-purple-500/20 text-purple-300' };
    case 'Rare':
      return { nameHe: 'נדיר (Rare)', color: '#3B82F6', badge: 'bg-blue-500/20 text-blue-300' };
    case 'Uncommon':
      return { nameHe: 'לא נפוץ', color: '#10B981', badge: 'bg-emerald-500/20 text-emerald-300' };
    case 'Common':
      return { nameHe: 'נפוץ', color: '#6B7280', badge: 'bg-gray-500/20 text-gray-300' };
    case 'Custom':
      return { nameHe: 'קלף מותאם אישית!', color: '#F43F5E', badge: 'bg-rose-500/20 text-rose-300' };
  }
}

/**
 * Check if battle has finished
 */
export function checkBattleState(playerHP: number, opponentHP: number): 'ongoing' | 'player_won' | 'opponent_won' {
  if (playerHP <= 0 && opponentHP <= 0) return 'player_won'; // player gets tie-breaker advantage for fun
  if (playerHP <= 0) return 'opponent_won';
  if (opponentHP <= 0) return 'player_won';
  return 'ongoing';
}
