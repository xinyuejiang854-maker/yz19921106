/**
 * Undercover (谁是卧底) Game Logic Engine
 */

export interface UndercoverWordPair {
  civilian: string;
  undercover: string;
  category: string;
}

export const YANG_ZI_WORD_PAIRS: UndercoverWordPair[] = [
  { civilian: '锦觅', undercover: '颜淡', category: '古装仙侠角色' },
  { civilian: '小夭', undercover: '玟小六', category: '长相思角色' },
  { civilian: '佟年', undercover: '黄瀛子', category: '现代甜愈角色' },
  { civilian: '杨紫', undercover: '小猴紫', category: '本尊与昵称' },
  { civilian: '紫米', undercover: '爆米花', category: '粉丝与应援' },
  { civilian: '紫藤花', undercover: '薰衣草', category: '应援紫色花卉' },
  { civilian: '长相思', undercover: '香蜜沉沉烬如霜', category: '经典爆款代表作' },
  { civilian: '何惟芳', undercover: '陆雪琪', category: '大女主角色' },
  { civilian: '小雪', undercover: '邱莹莹', category: '国民回忆成长' },
  { civilian: '星愿灯', undercover: '荧光棒', category: '星河应援物' }
];

export interface UndercoverPlayerState {
  id: string;
  name: string;
  isUndercover: boolean;
  word: string;
  isAlive: boolean;
  statement?: string;
  hasStated?: boolean;
}

export function assignUndercoverWords(
  playerIds: string[],
  undercoverCount: number = 1
): { civilianWord: string; undercoverWord: string; roles: Record<string, { isUndercover: boolean; word: string }> } {
  const pair = YANG_ZI_WORD_PAIRS[Math.floor(Math.random() * YANG_ZI_WORD_PAIRS.length)];
  const shuffledIds = [...playerIds].sort(() => Math.random() - 0.5);

  const undercoverIds = new Set(shuffledIds.slice(0, undercoverCount));
  const roles: Record<string, { isUndercover: boolean; word: string }> = {};

  for (const id of playerIds) {
    const isUndercover = undercoverIds.has(id);
    roles[id] = {
      isUndercover,
      word: isUndercover ? pair.undercover : pair.civilian
    };
  }

  return {
    civilianWord: pair.civilian,
    undercoverWord: pair.undercover,
    roles
  };
}

export function tallyVotes(votes: Record<string, string>): { eliminatedId: string | null; isTie: boolean; counts: Record<string, number> } {
  const counts: Record<string, number> = {};
  for (const targetId of Object.values(votes)) {
    if (targetId) {
      counts[targetId] = (counts[targetId] || 0) + 1;
    }
  }

  let maxVotes = 0;
  let candidates: string[] = [];
  for (const [id, count] of Object.entries(counts)) {
    if (count > maxVotes) {
      maxVotes = count;
      candidates = [id];
    } else if (count === maxVotes) {
      candidates.push(id);
    }
  }

  if (candidates.length === 1 && maxVotes > 0) {
    return { eliminatedId: candidates[0], isTie: false, counts };
  }
  return { eliminatedId: null, isTie: candidates.length > 1, counts };
}

export function checkUndercoverWinner(players: UndercoverPlayerState[]): 'civilians' | 'undercovers' | null {
  const aliveCivilians = players.filter(p => p.isAlive && !p.isUndercover).length;
  const aliveUndercovers = players.filter(p => p.isAlive && p.isUndercover).length;

  if (aliveUndercovers === 0) {
    return 'civilians';
  }
  if (aliveUndercovers >= aliveCivilians) {
    return 'undercovers';
  }
  return null;
}
