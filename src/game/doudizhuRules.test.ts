import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateHand, canBeat, Card } from './doudizhuRules';

const makeCard = (rank: string, value: number, suit: any = '♠'): Card => ({
  id: `${rank}_${suit}`,
  rank,
  value,
  suit,
});

test('evaluateHand classifies single, pair, triplet, bomb, rocket', () => {
  const single = [makeCard('A', 14)];
  assert.equal(evaluateHand(single).type, 'SINGLE');

  const pair = [makeCard('8', 8), makeCard('8', 8, '♥')];
  assert.equal(evaluateHand(pair).type, 'PAIR');

  const bomb = [
    makeCard('7', 7, '♠'),
    makeCard('7', 7, '♥'),
    makeCard('7', 7, '♣'),
    makeCard('7', 7, '♦')
  ];
  assert.equal(evaluateHand(bomb).type, 'BOMB');

  const rocket = [makeCard('小王', 16, '★'), makeCard('大王', 17, '★')];
  assert.equal(evaluateHand(rocket).type, 'ROCKET');
});

test('evaluateHand detects valid straights and rejects invalid ones', () => {
  const straight5 = [
    makeCard('3', 3),
    makeCard('4', 4),
    makeCard('5', 5),
    makeCard('6', 6),
    makeCard('7', 7)
  ];
  assert.equal(evaluateHand(straight5).type, 'STRAIGHT');

  // Straight cannot contain 2
  const invalidStraight = [
    makeCard('J', 11),
    makeCard('Q', 12),
    makeCard('K', 13),
    makeCard('A', 14),
    makeCard('2', 15)
  ];
  assert.equal(evaluateHand(invalidStraight).type, 'INVALID');
});

test('canBeat correctly checks card superiority', () => {
  const pair8 = [makeCard('8', 8), makeCard('8', 8, '♥')];
  const pair10 = [makeCard('10', 10), makeCard('10', 10, '♥')];
  const bomb4 = [
    makeCard('4', 4, '♠'),
    makeCard('4', 4, '♥'),
    makeCard('4', 4, '♣'),
    makeCard('4', 4, '♦')
  ];
  const rocket = [makeCard('小王', 16, '★'), makeCard('大王', 17, '★')];

  assert.equal(canBeat(pair10, pair8), true);
  assert.equal(canBeat(pair8, pair10), false);
  assert.equal(canBeat(bomb4, pair10), true);
  assert.equal(canBeat(rocket, bomb4), true);
  assert.equal(canBeat(bomb4, rocket), false);
});
