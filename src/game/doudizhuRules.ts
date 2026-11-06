/**
 * Doudizhu (Fight the Landlord) Game Logic Engine
 */

export interface Card {
  id: string;
  suit: '♠' | '♥' | '♣' | '♦' | '★';
  rank: string;
  value: number; // 3=3 ... 10=10, J=11, Q=12, K=13, A=14, 2=15, BJ=16, RJ=17
}

export type HandPatternType =
  | 'SINGLE'
  | 'PAIR'
  | 'TRIPLET'
  | 'TRIPLET_SINGLE'
  | 'TRIPLET_PAIR'
  | 'STRAIGHT'
  | 'STRAIGHT_PAIRS'
  | 'BOMB'
  | 'ROCKET'
  | 'INVALID';

export interface EvaluatedHand {
  type: HandPatternType;
  value: number; // primary comparison value
  length: number;
}

export const SUITS: Array<'♠' | '♥' | '♣' | '♦'> = ['♠', '♥', '♣', '♦'];
export const RANKS: Array<{ rank: string; value: number }> = [
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 11 },
  { rank: 'Q', value: 12 },
  { rank: 'K', value: 13 },
  { rank: 'A', value: 14 },
  { rank: '2', value: 15 },
];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  let id = 1;
  for (const suit of SUITS) {
    for (const r of RANKS) {
      deck.push({ id: `c_${id++}`, suit, rank: r.rank, value: r.value });
    }
  }
  // Black Joker & Red Joker
  deck.push({ id: `c_${id++}`, suit: '★', rank: '小王', value: 16 });
  deck.push({ id: `c_${id++}`, suit: '★', rank: '大王', value: 17 });

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => b.value - a.value);
}

export function evaluateHand(cards: Card[]): EvaluatedHand {
  const len = cards.length;
  if (len === 0) return { type: 'INVALID', value: 0, length: 0 };

  const sorted = sortCards(cards);

  // Rocket (王炸)
  if (len === 2 && sorted[0].value === 17 && sorted[1].value === 16) {
    return { type: 'ROCKET', value: 999, length: 2 };
  }

  // Count occurrences by value
  const counts: Record<number, number> = {};
  for (const c of sorted) {
    counts[c.value] = (counts[c.value] || 0) + 1;
  }
  const uniqueVals = Object.keys(counts).map(Number).sort((a, b) => b - a);

  // Single
  if (len === 1) {
    return { type: 'SINGLE', value: sorted[0].value, length: 1 };
  }

  // Pair
  if (len === 2 && uniqueVals.length === 1) {
    return { type: 'PAIR', value: sorted[0].value, length: 2 };
  }

  // Triplet
  if (len === 3 && uniqueVals.length === 1) {
    return { type: 'TRIPLET', value: sorted[0].value, length: 3 };
  }

  // Bomb (4 of same rank)
  if (len === 4 && uniqueVals.length === 1) {
    return { type: 'BOMB', value: sorted[0].value, length: 4 };
  }

  // Triplet + Single (4 cards)
  if (len === 4 && uniqueVals.length === 2) {
    const tripVal = uniqueVals.find(v => counts[v] === 3);
    if (tripVal) {
      return { type: 'TRIPLET_SINGLE', value: tripVal, length: 4 };
    }
  }

  // Triplet + Pair (5 cards)
  if (len === 5 && uniqueVals.length === 2) {
    const tripVal = uniqueVals.find(v => counts[v] === 3);
    const pairVal = uniqueVals.find(v => counts[v] === 2);
    if (tripVal && pairVal) {
      return { type: 'TRIPLET_PAIR', value: tripVal, length: 5 };
    }
  }

  // Straight (>= 5 cards, 3 to A, no 2 or Jokers)
  if (len >= 5 && uniqueVals.length === len) {
    const max = sorted[0].value;
    const min = sorted[len - 1].value;
    if (max <= 14 && max - min === len - 1) {
      return { type: 'STRAIGHT', value: max, length: len };
    }
  }

  // Straight Pairs (连对, >= 3 consecutive pairs, e.g. 6, 8, 10 cards)
  if (len >= 6 && len % 2 === 0 && uniqueVals.length === len / 2) {
    const allPairs = uniqueVals.every(v => counts[v] === 2);
    const max = Math.max(...uniqueVals);
    const min = Math.min(...uniqueVals);
    if (allPairs && max <= 14 && max - min === uniqueVals.length - 1) {
      return { type: 'STRAIGHT_PAIRS', value: max, length: len };
    }
  }

  return { type: 'INVALID', value: 0, length: 0 };
}

export function canBeat(toPlay: Card[], prevPlay: Card[] | null): boolean {
  const current = evaluateHand(toPlay);
  if (current.type === 'INVALID') return false;
  if (!prevPlay || prevPlay.length === 0) return true;

  const prev = evaluateHand(prevPlay);
  if (prev.type === 'INVALID') return true;

  // Rocket beats all
  if (current.type === 'ROCKET') return true;
  if (prev.type === 'ROCKET') return false;

  // Bomb beats non-bomb
  if (current.type === 'BOMB' && prev.type !== 'BOMB') return true;
  if (prev.type === 'BOMB' && current.type !== 'BOMB') return false;

  // Both bombs
  if (current.type === 'BOMB' && prev.type === 'BOMB') {
    return current.value > prev.value;
  }

  // Same pattern type and length
  if (current.type === prev.type && current.length === prev.length) {
    return current.value > prev.value;
  }

  return false;
}
