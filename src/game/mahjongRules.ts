/**
 * Mahjong Rules Engine for ZI LAND
 * Standard 136-tile Chinese Mahjong rules:
 * Wan (1w-9w), Tong/Bing (1b-9b), Tiao (1t-9t), Winds (E, S, W, N), Dragons (Z=红中, F=发财, B=白板)
 */

export type MahjongTile = string;

export const ALL_SUITS = ['w', 'b', 't'] as const;
export const HONORS = ['E', 'S', 'W', 'N', 'Z', 'F', 'B'] as const;

export const TILE_NAMES: Record<string, string> = {
  '1w': '一万', '2w': '二万', '3w': '三万', '4w': '四万', '5w': '五万', '6w': '六万', '7w': '七万', '8w': '八万', '9w': '九万',
  '1b': '一筒', '2b': '二筒', '3b': '三筒', '4b': '四筒', '5b': '五筒', '6b': '六筒', '7b': '七筒', '8b': '八筒', '9b': '九筒',
  '1t': '一条', '2t': '二条', '3t': '三条', '4t': '四条', '5t': '五条', '6t': '六条', '7t': '七条', '8t': '八条', '9t': '九条',
  'E': '东风', 'S': '南风', 'W': '西风', 'N': '北风',
  'Z': '红中', 'F': '发财', 'B': '白板'
};

// Generate full standard 136-tile deck
export function createMahjongDeck(): MahjongTile[] {
  const deck: MahjongTile[] = [];
  // Numbered suits
  for (const suit of ALL_SUITS) {
    for (let num = 1; num <= 9; num++) {
      for (let i = 0; i < 4; i++) {
        deck.push(`${num}${suit}`);
      }
    }
  }
  // Honors
  for (const h of HONORS) {
    for (let i = 0; i < 4; i++) {
      deck.push(h);
    }
  }
  return shuffleDeck(deck);
}

export function shuffleDeck<T>(deck: T[]): T[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Tile sort comparator
export function compareTiles(a: MahjongTile, b: MahjongTile): number {
  const suitOrder: Record<string, number> = { w: 1, b: 2, t: 3, E: 4, S: 4, W: 4, N: 4, Z: 5, F: 5, B: 5 };
  const getSuit = (t: string) => (t.length === 2 ? t[1] : t);
  const getNum = (t: string) => (t.length === 2 ? parseInt(t[0], 10) : HONORS.indexOf(t as any));

  const suitA = suitOrder[getSuit(a)] || 9;
  const suitB = suitOrder[getSuit(b)] || 9;
  if (suitA !== suitB) return suitA - suitB;
  return getNum(a) - getNum(b);
}

export function sortTiles(tiles: MahjongTile[]): MahjongTile[] {
  return [...tiles].sort(compareTiles);
}

/**
 * Check if a hand of tiles can form 4 melds (triplets or sequences) + 1 pair (14 tiles)
 * or 7 pairs (14 tiles).
 */
export function canHu(tiles: MahjongTile[]): boolean {
  if (tiles.length % 3 !== 2) return false;
  const sorted = sortTiles(tiles);

  // Check 7 pairs (14 tiles only)
  if (sorted.length === 14 && isSevenPairs(sorted)) {
    return true;
  }

  // Check 4 melds + 1 pair
  // Count frequency of each tile
  const counts: Record<string, number> = {};
  for (const t of sorted) {
    counts[t] = (counts[t] || 0) + 1;
  }

  const uniqueTiles = Object.keys(counts);

  // Try each possible pair
  for (const tile of uniqueTiles) {
    if (counts[tile] >= 2) {
      counts[tile] -= 2;
      if (canFormMelds({ ...counts })) {
        return true;
      }
      counts[tile] += 2;
    }
  }

  return false;
}

function isSevenPairs(sorted: MahjongTile[]): boolean {
  for (let i = 0; i < 14; i += 2) {
    if (sorted[i] !== sorted[i + 1]) return false;
  }
  return true;
}

function canFormMelds(counts: Record<string, number>): boolean {
  // Find first remaining tile
  const keys = Object.keys(counts).filter(k => counts[k] > 0);
  if (keys.length === 0) return true;

  const first = keys[0];

  // Try triplet
  if (counts[first] >= 3) {
    counts[first] -= 3;
    if (canFormMelds(counts)) return true;
    counts[first] += 3;
  }

  // Try sequence (must be numbered suit: 1w-9w, 1b-9b, 1t-9t)
  if (first.length === 2) {
    const num = parseInt(first[0], 10);
    const suit = first[1];
    if (num <= 7) {
      const second = `${num + 1}${suit}`;
      const third = `${num + 2}${suit}`;
      if ((counts[second] || 0) > 0 && (counts[third] || 0) > 0) {
        counts[first] -= 1;
        counts[second] -= 1;
        counts[third] -= 1;
        if (canFormMelds(counts)) return true;
        counts[first] += 1;
        counts[second] += 1;
        counts[third] += 1;
      }
    }
  }

  return false;
}

// Can Peng: Player has at least 2 copies of discarded tile
export function canPeng(hand: MahjongTile[], discardedTile: MahjongTile): boolean {
  const count = hand.filter(t => t === discardedTile).length;
  return count >= 2;
}

// Can Gang: Player has 3 copies of discarded tile (ming gang), or 4 copies in hand (an gang)
export function canGang(hand: MahjongTile[], tile: MahjongTile, isDiscard: boolean = true): boolean {
  const count = hand.filter(t => t === tile).length;
  return isDiscard ? count >= 3 : count === 4;
}

// Calculate Hu Score & Fan description
export function calculateHuFan(tiles: MahjongTile[], isSelfDrawn: boolean = false): { fan: number; types: string[]; score: number } {
  const sorted = sortTiles(tiles);
  const types: string[] = [];
  let fan = 1; // base
  types.push('基础胡');

  // Check 7 pairs
  if (sorted.length === 14 && isSevenPairs(sorted)) {
    fan += 4;
    types.push('七对 (+4番)');
  }

  // Check all triplets (碰碰胡)
  if (isAllTriplets(sorted)) {
    fan += 4;
    types.push('对对胡/碰碰胡 (+4番)');
  }

  // Check pure suit (清一色)
  const suits = new Set(sorted.filter(t => t.length === 2).map(t => t[1]));
  const hasHonors = sorted.some(t => t.length === 1);
  if (suits.size === 1 && !hasHonors) {
    fan += 8;
    types.push('清一色 (+8番)');
  } else if (suits.size === 1 && hasHonors) {
    fan += 4;
    types.push('混一色 (+4番)');
  }

  if (isSelfDrawn) {
    fan += 1;
    types.push('自摸 (+1番)');
  }

  const score = Math.pow(2, Math.min(fan, 12)) * 10;
  return { fan, types, score };
}

function isAllTriplets(sorted: MahjongTile[]): boolean {
  const counts: Record<string, number> = {};
  for (const t of sorted) counts[t] = (counts[t] || 0) + 1;
  const values = Object.values(counts);
  const pairCount = values.filter(v => v === 2).length;
  const tripCount = values.filter(v => v === 3 || v === 4).length;
  return pairCount === 1 && tripCount === 4;
}
