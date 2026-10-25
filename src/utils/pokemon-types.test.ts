import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getTypeMultiplier,
  calculateDamage,
  calculatePowerScore,
  checkBattleState,
  getRarityLabel,
} from './pokemon-types';

test('type effectiveness chart calculates correct multipliers', () => {
  // Fire vs Grass -> 2.0x super effective
  assert.equal(getTypeMultiplier('Fire', 'Grass'), 2.0);
  // Water vs Fire -> 2.0x
  assert.equal(getTypeMultiplier('Water', 'Fire'), 2.0);
  // Grass vs Fire -> 0.5x
  assert.equal(getTypeMultiplier('Grass', 'Fire'), 0.5);
  // Dragon vs Fairy -> 0x
  assert.equal(getTypeMultiplier('Dragon', 'Fairy'), 0);
  // Colorless vs Fire -> 1.0x (neutral)
  assert.equal(getTypeMultiplier('Colorless', 'Fire'), 1.0);
  // Undefined defender type -> 1.0x
  assert.equal(getTypeMultiplier('Fire', undefined), 1.0);
});

test('calculateDamage returns correct rounded damage and Hebrew messages', () => {
  const superEffective = calculateDamage(50, 'Electric', 'Water');
  assert.equal(superEffective.finalDamage, 100);
  assert.equal(superEffective.multiplier, 2.0);
  assert.match(superEffective.messageHe, /סופר אפקטיבי/);

  const notVeryEffective = calculateDamage(40, 'Fire', 'Water');
  assert.equal(notVeryEffective.finalDamage, 20);
  assert.equal(notVeryEffective.multiplier, 0.5);
  assert.match(notVeryEffective.messageHe, /לא מאוד אפקטיבי/);

  const zeroEffect = calculateDamage(80, 'Dragon', 'Fairy');
  assert.equal(zeroEffect.finalDamage, 0);
  assert.equal(zeroEffect.multiplier, 0);
  assert.match(zeroEffect.messageHe, /אין השפעה/);
});

test('calculatePowerScore values high HP, strong attacks and rare cards', () => {
  const charizardScore = calculatePowerScore({
    hp: 250,
    attacks: [{ name: 'Flare Strike', damage: 230, cost: ['Fire'] }],
    rarity: 'Ultra Rare (EX/GX/V)',
  });
  // 250 * 0.8 + 230 * 1.2 + 80 = 200 + 276 + 80 = 556
  assert.equal(charizardScore, 556);

  const commonCaterpieScore = calculatePowerScore({
    hp: 40,
    attacks: [{ name: 'Tackle', damage: 10, cost: ['Grass'] }],
    rarity: 'Common',
  });
  // 40 * 0.8 + 10 * 1.2 + 5 = 32 + 12 + 5 = 49
  assert.equal(commonCaterpieScore, 49);
  assert.ok(charizardScore > commonCaterpieScore);
});

test('checkBattleState correctly identifies winner and continuation', () => {
  assert.equal(checkBattleState(100, 100), 'ongoing');
  assert.equal(checkBattleState(0, 50), 'opponent_won');
  assert.equal(checkBattleState(50, 0), 'player_won');
  assert.equal(checkBattleState(-10, -5), 'player_won'); // tie gives player victory
});

test('getRarityLabel returns Hebrew labels and proper badges', () => {
  const holo = getRarityLabel('Holo Rare');
  assert.match(holo.nameHe, /הולוגרפי/);
  assert.ok(holo.badge.includes('purple'));

  const secret = getRarityLabel('Secret Rare');
  assert.match(secret.nameHe, /נדיר סודי/);
  assert.ok(secret.badge.includes('amber'));
});
