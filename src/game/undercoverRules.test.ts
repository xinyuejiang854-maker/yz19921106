import test from 'node:test';
import assert from 'node:assert/strict';
import { assignUndercoverWords, tallyVotes, checkUndercoverWinner, UndercoverPlayerState } from './undercoverRules';

test('assignUndercoverWords assigns correct number of undercovers and words', () => {
  const players = ['p1', 'p2', 'p3', 'p4', 'p5'];
  const res = assignUndercoverWords(players, 1);
  const undercovers = Object.values(res.roles).filter(r => r.isUndercover);
  const civilians = Object.values(res.roles).filter(r => !r.isUndercover);

  assert.equal(undercovers.length, 1);
  assert.equal(civilians.length, 4);
  assert.equal(undercovers[0].word, res.undercoverWord);
  assert.equal(civilians[0].word, res.civilianWord);
  assert.notEqual(res.undercoverWord, res.civilianWord);
});

test('tallyVotes correctly identifies eliminated player and ties', () => {
  const votes = {
    voter1: 'p2',
    voter2: 'p2',
    voter3: 'p3',
    voter4: 'p2',
  };
  const res = tallyVotes(votes);
  assert.equal(res.eliminatedId, 'p2');
  assert.equal(res.isTie, false);
  assert.equal(res.counts['p2'], 3);

  const tieVotes = {
    voter1: 'p1',
    voter2: 'p2',
  };
  const tieRes = tallyVotes(tieVotes);
  assert.equal(tieRes.eliminatedId, null);
  assert.equal(tieRes.isTie, true);
});

test('checkUndercoverWinner detects civilians win or undercovers win', () => {
  const playersAllCiviliansAlive: UndercoverPlayerState[] = [
    { id: '1', name: 'A', isUndercover: false, word: 'W1', isAlive: true },
    { id: '2', name: 'B', isUndercover: false, word: 'W1', isAlive: true },
    { id: '3', name: 'C', isUndercover: true, word: 'W2', isAlive: false },
  ];
  assert.equal(checkUndercoverWinner(playersAllCiviliansAlive), 'civilians');

  const playersUndercoverDominates: UndercoverPlayerState[] = [
    { id: '1', name: 'A', isUndercover: false, word: 'W1', isAlive: true },
    { id: '2', name: 'B', isUndercover: true, word: 'W2', isAlive: true },
  ];
  assert.equal(checkUndercoverWinner(playersUndercoverDominates), 'undercovers');

  const stillPlaying: UndercoverPlayerState[] = [
    { id: '1', name: 'A', isUndercover: false, word: 'W1', isAlive: true },
    { id: '2', name: 'B', isUndercover: false, word: 'W1', isAlive: true },
    { id: '3', name: 'C', isUndercover: false, word: 'W1', isAlive: true },
    { id: '4', name: 'D', isUndercover: true, word: 'W2', isAlive: true },
  ];
  assert.equal(checkUndercoverWinner(stillPlaying), null);
});
