/**
 * Sample Pokémon card photos for quick testing & instant scanning demo.
 */

export interface SamplePhoto {
  id: string;
  title: string;
  pokemon: string;
  imageUrl: string;
  thumbnailUrl: string;
}

export const SAMPLE_CARD_PHOTOS: SamplePhoto[] = [
  {
    id: 'sample-charizard',
    title: 'צ\'אריזרד GX זוהר',
    pokemon: 'Charizard',
    imageUrl: 'https://images.pokemontcg.io/sm3/20_hires.png',
    thumbnailUrl: 'https://images.pokemontcg.io/sm3/20.png',
  },
  {
    id: 'sample-pikachu',
    title: 'פיקאצ\'ו V חשמלי',
    pokemon: 'Pikachu',
    imageUrl: 'https://images.pokemontcg.io/swsh4/43_hires.png',
    thumbnailUrl: 'https://images.pokemontcg.io/swsh4/43.png',
  },
  {
    id: 'sample-mewtwo',
    title: 'מיוטו GX על-חושי',
    pokemon: 'Mewtwo',
    imageUrl: 'https://images.pokemontcg.io/sm35/39_hires.png',
    thumbnailUrl: 'https://images.pokemontcg.io/sm35/39.png',
  },
  {
    id: 'sample-rayquaza',
    title: 'רייקוואזה VMAX מוזהב',
    pokemon: 'Rayquaza',
    imageUrl: 'https://images.pokemontcg.io/swsh7/218_hires.png',
    thumbnailUrl: 'https://images.pokemontcg.io/swsh7/218.png',
  },
  {
    id: 'sample-blastoise',
    title: 'בלסטויז GX מים',
    pokemon: 'Blastoise',
    imageUrl: 'https://images.pokemontcg.io/sm10/35_hires.png',
    thumbnailUrl: 'https://images.pokemontcg.io/sm10/35.png',
  },
  {
    id: 'sample-eevee',
    title: 'איבי חמוד',
    pokemon: 'Eevee',
    imageUrl: 'https://images.pokemontcg.io/swsh12pt5/108_hires.png',
    thumbnailUrl: 'https://images.pokemontcg.io/swsh12pt5/108.png',
  },
];
