import test from 'node:test';
import assert from 'node:assert/strict';
import { canHu, canPeng, canGang, calculateHuFan, sortTiles } from './mahjongRules';

test('canHu detects standard winning hand (4 melds + 1 pair)', () => {
  // 1w 2w 3w, 4b 5b 6b, 7t 8t 9t, 1b 1b 1b, 9w 9w (14 tiles)
  const hand = [
    '1w', '2w', '3w',
    '4b', '5b', '6b',
    '7t', '8t', '9t',
    '1b', '1b', '1b',
    '9w', '9w'
  ];
  assert.equal(canHu(hand), true);
});

test('canHu rejects incomplete or invalid hand', () => {
  const incomplete = ['1w', '2w', '3w', '4b'];
  assert.equal(canHu(incomplete), false);

  const nonWinning = [
    '1w', '2w', '4w',
    '4b', '5b', '7b',
    '7t', '8t', '9t',
    '1b', '2b', '3b',
    '9w', '8w'
  ];
  assert.equal(canHu(nonWinning), false);
});

test('canHu detects 7 pairs', () => {
  const sevenPairs = [
    '1w', '1w', '2w', '2w', '5b', '5b', '9b', '9b',
    '3t', '3t', 'E', 'E', 'Z', 'Z'
  ];
  assert.equal(canHu(sevenPairs), true);
});

test('canPeng and canGang work accurately', () => {
  const hand = ['1w', '1w', '3t', '5b'];
  assert.equal(canPeng(hand, '1w'), true);
  assert.equal(canPeng(hand, '3t'), false);

  const handForGang = ['1w', '1w', '1w', '3t'];
  assert.equal(canGang(handForGang, '1w', true), true);
  assert.equal(canGang(handForGang, '3t', true), false);
});

test('calculateHuFan computes fan and score', () => {
  const pureHand = [
    '1w', '2w', '3w',
    '4w', '5w', '6w',
    '7w', '8w', '9w',
    '2w', '2w', '2w',
    '5w', '5w'
  ];
  const res = calculateHuFan(pureHand, true);
  assert.ok(res.fan >= 8); // Qing Yi Se + base + zi mo
  assert.ok(res.score > 0);
  assert.ok(res.types.includes('清一色 (+8番)'));
});
