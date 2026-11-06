import React, { useState, useEffect } from 'react';
import {
  MahjongTile,
  createMahjongDeck,
  sortTiles,
  canHu,
  canPeng,
  canGang,
  calculateHuFan,
  TILE_NAMES
} from '../../game/mahjongRules';
import { useApp } from '../../context/AppContext';
import { RotateCcw, Award, Play, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayerState {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  hand: MahjongTile[];
  melds: Array<{ type: 'PENG' | 'GANG'; tile: MahjongTile }>;
  discards: MahjongTile[];
}

export const MahjongGame: React.FC = () => {
  const { profile, showToast } = useApp();

  const [deck, setDeck] = useState<MahjongTile[]>([]);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0); // 0 = Human, 1..3 = Bots
  const [lastDiscard, setLastDiscard] = useState<{ tile: MahjongTile; fromPlayer: number } | null>(null);
  const [gameResult, setGameResult] = useState<{
    winnerName: string;
    fan: number;
    types: string[];
    score: number;
  } | null>(null);

  // Initialize a new game round
  const startNewGame = () => {
    const fullDeck = createMahjongDeck();
    const p1Hand = sortTiles(fullDeck.splice(0, 14)); // Human starts with 14
    const p2Hand = sortTiles(fullDeck.splice(0, 13));
    const p3Hand = sortTiles(fullDeck.splice(0, 13));
    const p4Hand = sortTiles(fullDeck.splice(0, 13));

    const initPlayers: PlayerState[] = [
      {
        id: 'p0',
        name: profile?.nickname || '星河小紫米 (我)',
        avatar: profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
        isBot: false,
        hand: p1Hand,
        melds: [],
        discards: []
      },
      {
        id: 'p1',
        name: '九头相柳_01',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
        isBot: true,
        hand: p2Hand,
        melds: [],
        discards: []
      },
      {
        id: 'p2',
        name: '青丘涂山璟_02',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
        isBot: true,
        hand: p3Hand,
        melds: [],
        discards: []
      },
      {
        id: 'p3',
        name: '芳华何惟芳_03',
        avatar: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=128&q=80',
        isBot: true,
        hand: p4Hand,
        melds: [],
        discards: []
      }
    ];

    setDeck(fullDeck);
    setPlayers(initPlayers);
    setCurrentTurn(0);
    setLastDiscard(null);
    setGameResult(null);
    showToast('🀄 紫约麻将开局！发牌完毕，轮到你出牌', 'info');
  };

  useEffect(() => {
    startNewGame();
  }, []);

  // Bot AI Turn Handler
  useEffect(() => {
    if (gameResult) return;
    if (currentTurn !== 0 && players.length === 4) {
      const timer = setTimeout(() => {
        executeBotTurn(currentTurn);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameResult]);

  const executeBotTurn = (botIdx: number) => {
    if (deck.length === 0) {
      showToast('荒庄！牌墙已摸完', 'info');
      return;
    }

    const currentDeck = [...deck];
    const drawnTile = currentDeck.shift()!;
    setDeck(currentDeck);

    const bot = { ...players[botIdx] };
    const newHand = [...bot.hand, drawnTile];

    // Check if bot can Hu
    if (canHu(newHand)) {
      const fanRes = calculateHuFan(newHand, true);
      setGameResult({
        winnerName: bot.name,
        fan: fanRes.fan,
        types: fanRes.types,
        score: fanRes.score
      });
      return;
    }

    // Otherwise discard last or non-matching tile
    const sorted = sortTiles(newHand);
    const discardTile = sorted.pop()!;
    bot.hand = sorted;
    bot.discards.push(discardTile);

    const nextTurn = (botIdx + 1) % 4;

    const newPlayers = [...players];
    newPlayers[botIdx] = bot;

    setPlayers(newPlayers);
    setLastDiscard({ tile: discardTile, fromPlayer: botIdx });

    // Check if human can Hu or Peng on bot discard
    const human = newPlayers[0];
    const humanCanHu = canHu([...human.hand, discardTile]);

    if (nextTurn === 0) {
      // Draw a tile for human
      if (currentDeck.length > 0) {
        const humanDrawn = currentDeck.shift()!;
        human.hand = [...human.hand, humanDrawn];
        setDeck(currentDeck);
      }
    }

    setCurrentTurn(nextTurn);
  };

  // Human Discard
  const handleHumanDiscard = (tileIndex: number) => {
    if (currentTurn !== 0 || gameResult) return;

    const human = { ...players[0] };
    const [discarded] = human.hand.splice(tileIndex, 1);
    human.hand = sortTiles(human.hand);
    human.discards.push(discarded);

    const newPlayers = [...players];
    newPlayers[0] = human;

    setPlayers(newPlayers);
    setLastDiscard({ tile: discarded, fromPlayer: 0 });
    setCurrentTurn(1); // Pass to bot 1
  };

  // Human Actions (Hu / Peng / Gang)
  const handleHumanHu = (isSelfDrawn: boolean) => {
    const human = players[0];
    const fullHand = isSelfDrawn ? human.hand : [...human.hand, lastDiscard!.tile];
    const res = calculateHuFan(fullHand, isSelfDrawn);

    confetti({
      particleCount: 100,
      spread: 90,
      colors: ['#a855f7', '#fbbf24', '#f43f5e', '#ffffff']
    });

    setGameResult({
      winnerName: human.name,
      fan: res.fan,
      types: res.types,
      score: res.score
    });
    showToast(`🀄 大胡了！${res.types.join(' + ')}，获得 ${res.score} 分！`, 'success');
  };

  const handleHumanPeng = () => {
    if (!lastDiscard) return;
    const human = { ...players[0] };
    const t = lastDiscard.tile;
    // Remove 2 copies from hand
    let removed = 0;
    human.hand = human.hand.filter(tile => {
      if (tile === t && removed < 2) {
        removed++;
        return false;
      }
      return true;
    });
    human.melds.push({ type: 'PENG', tile: t });

    const newPlayers = [...players];
    newPlayers[0] = human;
    setPlayers(newPlayers);
    setCurrentTurn(0); // Human turn to discard
    showToast(`碰【${TILE_NAMES[t]}】！`, 'info');
  };

  const handleHumanGang = () => {
    if (!lastDiscard) return;
    const human = { ...players[0] };
    const t = lastDiscard.tile;
    let removed = 0;
    human.hand = human.hand.filter(tile => {
      if (tile === t && removed < 3) {
        removed++;
        return false;
      }
      return true;
    });
    human.melds.push({ type: 'GANG', tile: t });

    // Draw extra replacement tile from deck end
    if (deck.length > 0) {
      const extra = deck.pop()!;
      human.hand.push(extra);
    }

    const newPlayers = [...players];
    newPlayers[0] = human;
    setPlayers(newPlayers);
    setCurrentTurn(0);
    showToast(`杠【${TILE_NAMES[t]}】！`, 'success');
  };

  const human = players[0];
  const canHumanSelfHu = human && human.hand.length % 3 === 2 && canHu(human.hand);
  const canHumanHuOnDiscard = lastDiscard && lastDiscard.fromPlayer !== 0 && human && canHu([...human.hand, lastDiscard.tile]);
  const canHumanPengOnDiscard = lastDiscard && lastDiscard.fromPlayer !== 0 && human && canPeng(human.hand, lastDiscard.tile);
  const canHumanGangOnDiscard = lastDiscard && lastDiscard.fromPlayer !== 0 && human && canGang(human.hand, lastDiscard.tile, true);

  return (
    <div className="space-y-6">
      {/* Game Header Bar */}
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-600/30 text-fuchsia-300 border border-purple-400/30 font-bold">
              中国经典 136 规则 · 紫约麻将
            </span>
            <span className="text-xs text-purple-300">
              剩余牌墙：<span className="font-mono text-yellow-300 font-bold">{deck.length}</span> 张
            </span>
          </div>
          <div className="text-xs text-purple-300/70 mt-1">
            当前轮次：<span className="text-white font-bold">{players[currentTurn]?.name || '轮候中'}</span>
          </div>
        </div>

        <button
          onClick={startNewGame}
          className="px-3.5 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重新洗牌发牌</span>
        </button>
      </div>

      {/* Mahjong Board (Table View) */}
      <div className="relative min-h-[480px] rounded-3xl bg-gradient-to-b from-[#112a1d] via-[#0d2217] to-[#081810] border-4 border-amber-950/80 p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Table Felt Center */}
        <div className="absolute inset-0 bg-[radial-gradient(#153d2a_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        {/* Top Player (涂山璟) */}
        <div className="flex flex-col items-center space-y-1">
          <div className="flex items-center gap-2">
            <img src={players[2]?.avatar} alt="" className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-400" />
            <span className="text-xs font-semibold text-emerald-200">{players[2]?.name}</span>
            <span className="text-[10px] text-emerald-400/70">手牌: {players[2]?.hand.length} 张</span>
          </div>
          <div className="flex gap-0.5">
            {players[2]?.hand.map((_, i) => (
              <div key={i} className="w-5 h-8 bg-emerald-800 border border-emerald-600 rounded-t-sm shadow-sm" />
            ))}
          </div>
        </div>

        {/* Center: Discards & Last discard spotlight */}
        <div className="my-auto py-4 flex flex-col items-center justify-center space-y-3">
          {/* Last Discard Alert */}
          {lastDiscard && (
            <div className="px-4 py-2 rounded-2xl bg-black/60 border border-amber-400/40 backdrop-blur-md flex items-center gap-3 animate-in fade-in">
              <span className="text-xs text-amber-300">
                【{players[lastDiscard.fromPlayer]?.name}】打出：
              </span>
              <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-slate-900 font-bold text-sm shadow-lg border border-amber-300">
                {TILE_NAMES[lastDiscard.tile] || lastDiscard.tile}
              </div>
            </div>
          )}

          {/* Table Center Logo */}
          <div className="text-center opacity-20 pointer-events-none">
            <div className="text-3xl font-serif font-bold text-emerald-300">紫约麻将</div>
            <div className="text-xs text-emerald-400 font-mono">ZI MAHJONG TABLE</div>
          </div>
        </div>

        {/* Action Controls for Human Player */}
        <div className="flex justify-center gap-2 my-2 flex-wrap">
          {(canHumanSelfHu || canHumanHuOnDiscard) && (
            <button
              onClick={() => handleHumanHu(!!canHumanSelfHu)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold text-sm shadow-lg shadow-red-900/50 animate-bounce"
            >
              🀄 胡！({canHumanSelfHu ? '自摸' : '点炮'})
            </button>
          )}

          {canHumanPengOnDiscard && (
            <button
              onClick={handleHumanPeng}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold text-xs shadow-md"
            >
              碰！
            </button>
          )}

          {canHumanGangOnDiscard && (
            <button
              onClick={handleHumanGang}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md"
            >
              杠！
            </button>
          )}
        </div>

        {/* Bottom: Human Player Area */}
        <div className="flex flex-col items-center space-y-2">
          {/* Melds */}
          {human?.melds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-300/80">副露：</span>
              {human.melds.map((m, idx) => (
                <div key={idx} className="flex gap-0.5 px-1.5 py-0.5 rounded bg-black/40 border border-emerald-500/30">
                  <span className="text-[10px] text-yellow-300 font-bold">
                    {m.type === 'PENG' ? '碰' : '杠'} {TILE_NAMES[m.tile]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Tiles Rack */}
          <div className="flex items-end justify-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full pb-2">
            {human?.hand.map((tile, idx) => {
              const isLast = idx === human.hand.length - 1 && human.hand.length % 3 === 2;
              return (
                <button
                  key={idx}
                  onClick={() => handleHumanDiscard(idx)}
                  className={`relative group px-1 sm:px-2 py-2 sm:py-3 rounded-lg bg-gradient-to-b from-amber-50 via-white to-amber-100 text-slate-900 font-bold border-2 border-amber-300 shadow-xl transition-all transform hover:-translate-y-3 active:scale-95 flex flex-col items-center justify-between min-w-[34px] sm:min-w-[44px] h-[52px] sm:h-[68px] ${
                    isLast ? 'ring-2 ring-yellow-400 ml-2' : ''
                  }`}
                  title={`点击打出【${TILE_NAMES[tile] || tile}】`}
                >
                  <span className="text-[11px] sm:text-xs font-serif font-black text-slate-800">
                    {TILE_NAMES[tile]?.slice(0, 1) || tile}
                  </span>
                  <span className="text-[10px] sm:text-xs font-serif font-black text-purple-700">
                    {TILE_NAMES[tile]?.slice(1) || ''}
                  </span>
                  <span className="absolute -top-6 hidden group-hover:block px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white whitespace-nowrap">
                    出此牌
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-emerald-200 font-medium">
            {currentTurn === 0 ? '👈 轮到你出牌，点击手牌即可打出' : '⏳ 等待其他选手摸牌出牌...'}
          </div>
        </div>
      </div>

      {/* Hu Settlement Modal */}
      {gameResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1c0836] via-[#120526] to-[#0d031c] border-2 border-amber-400/60 p-6 shadow-2xl text-white space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-3xl">
              🏆
            </div>

            <h2 className="text-2xl font-bold font-serif text-amber-300">
              {gameResult.winnerName} 达成胡牌！
            </h2>

            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 space-y-2">
              <div className="text-xs text-purple-300">番型构成：</div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {gameResult.types.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-full bg-purple-600/30 text-fuchsia-300 text-xs border border-purple-400/30">
                    {t}
                  </span>
                ))}
              </div>
              <div className="pt-2 border-t border-purple-500/20 text-sm font-mono text-yellow-300">
                总计：{gameResult.fan} 番 · 结算积分：+{gameResult.score} 分
              </div>
            </div>

            <button
              onClick={startNewGame}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-900/40 hover:opacity-90"
            >
              再来一盘紫约麻将
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
