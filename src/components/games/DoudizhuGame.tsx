import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Card,
  createDeck,
  sortCards,
  canBeat,
  evaluateHand
} from '../../game/doudizhuRules';
import { RotateCcw, Crown, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayerState {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  hand: Card[];
  isLandlord: boolean;
}

export const DoudizhuGame: React.FC = () => {
  const { profile, showToast } = useApp();

  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [bottomCards, setBottomCards] = useState<Card[]>([]);
  const [phase, setPhase] = useState<'bidding' | 'playing' | 'ended'>('bidding');
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [lastPlay, setLastPlay] = useState<{ cards: Card[]; playerIdx: number } | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [winner, setWinner] = useState<PlayerState | null>(null);

  const startNewGame = () => {
    const fullDeck = createDeck();
    const p1Hand = sortCards(fullDeck.splice(0, 17));
    const p2Hand = sortCards(fullDeck.splice(0, 17));
    const p3Hand = sortCards(fullDeck.splice(0, 17));
    const bottom = sortCards(fullDeck.splice(0, 3));

    const initPlayers: PlayerState[] = [
      {
        id: 'p0',
        name: profile?.nickname || '星河小紫米 (我)',
        avatar: profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
        isBot: false,
        hand: p1Hand,
        isLandlord: false
      },
      {
        id: 'p1',
        name: '九头相柳_01',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
        isBot: true,
        hand: p2Hand,
        isLandlord: false
      },
      {
        id: 'p2',
        name: '青丘涂山璟_02',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
        isBot: true,
        hand: p3Hand,
        isLandlord: false
      }
    ];

    setPlayers(initPlayers);
    setBottomCards(bottom);
    setPhase('bidding');
    setCurrentTurn(0);
    setLastPlay(null);
    setSelectedCards(new Set());
    setWinner(null);
    showToast('🃏 斗地主发牌完毕！请选择是否【叫地主】', 'info');
  };

  useEffect(() => {
    startNewGame();
  }, []);

  // Bot Turn
  useEffect(() => {
    if (phase !== 'playing' || currentTurn === 0 || winner) return;

    const timer = setTimeout(() => {
      executeBotPlay(currentTurn);
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentTurn, phase, winner]);

  const executeBotPlay = (botIdx: number) => {
    const bot = { ...players[botIdx] };
    const prevCards = lastPlay && lastPlay.playerIdx !== botIdx ? lastPlay.cards : null;

    let toPlay: Card[] | null = null;

    if (!prevCards) {
      // Play lowest single card
      const lowest = bot.hand[bot.hand.length - 1];
      toPlay = [lowest];
    } else {
      // Find a single card or pair that can beat
      if (prevCards.length === 1) {
        const higher = bot.hand.filter(c => c.value > prevCards[0].value).reverse();
        if (higher.length > 0) toPlay = [higher[0]];
      }
    }

    if (toPlay && canBeat(toPlay, prevCards)) {
      // Play cards
      const playedIds = new Set(toPlay.map(c => c.id));
      bot.hand = bot.hand.filter(c => !playedIds.has(c.id));

      const newPlayers = [...players];
      newPlayers[botIdx] = bot;
      setPlayers(newPlayers);
      setLastPlay({ cards: toPlay, playerIdx: botIdx });
      showToast(`【${bot.name}】打出 ${toPlay.map(c => c.rank).join('')}`, 'info');

      // Win check
      if (bot.hand.length === 0) {
        setWinner(bot);
        setPhase('ended');
        return;
      }
    } else {
      showToast(`【${bot.name}】不出 (过)`, 'info');
    }

    setCurrentTurn((botIdx + 1) % 3);
  };

  // Human Bid
  const handleBidLandlord = (call: boolean) => {
    const newPlayers = [...players];
    if (call) {
      newPlayers[0].isLandlord = true;
      newPlayers[0].hand = sortCards([...newPlayers[0].hand, ...bottomCards]);
      showToast('🎉 你成为了地主！获得 3 张底牌', 'success');
    } else {
      // Bot 1 becomes landlord
      newPlayers[1].isLandlord = true;
      newPlayers[1].hand = sortCards([...newPlayers[1].hand, ...bottomCards]);
      showToast('【九头相柳】抢得地主！', 'info');
    }
    setPlayers(newPlayers);
    setPhase('playing');
    setCurrentTurn(call ? 0 : 1);
  };

  // Card Selection Toggle
  const toggleSelectCard = (id: string) => {
    setSelectedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Human Play
  const handleHumanPlay = () => {
    if (currentTurn !== 0 || phase !== 'playing') return;
    const human = { ...players[0] };
    const toPlay = human.hand.filter(c => selectedCards.has(c.id));

    const prevCards = lastPlay && lastPlay.playerIdx !== 0 ? lastPlay.cards : null;

    if (!canBeat(toPlay, prevCards)) {
      showToast('所选手牌不符合出牌规则或压不过上家', 'warn');
      return;
    }

    human.hand = human.hand.filter(c => !selectedCards.has(c.id));
    const newPlayers = [...players];
    newPlayers[0] = human;
    setPlayers(newPlayers);
    setLastPlay({ cards: toPlay, playerIdx: 0 });
    setSelectedCards(new Set());
    showToast(`你打出了 ${toPlay.map(c => c.rank).join(' ')}`, 'info');

    if (human.hand.length === 0) {
      setWinner(human);
      setPhase('ended');
      confetti({ particleCount: 90, spread: 80, colors: ['#c084fc', '#fde047'] });
      showToast('🏆 恭喜获胜！率先出清所有手牌！', 'success');
      return;
    }

    setCurrentTurn(1);
  };

  const handleHumanPass = () => {
    if (!lastPlay || lastPlay.playerIdx === 0) {
      showToast('当前是你主动出牌，不能跳过', 'warn');
      return;
    }
    showToast('你选择不出 (过)', 'info');
    setSelectedCards(new Set());
    setCurrentTurn(1);
  };

  const human = players[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-600/30 text-fuchsia-300 border border-purple-400/30 font-bold">
            经典斗地主 · 扑克牌室
          </span>
          <div className="text-xs text-purple-300 mt-1">
            当前轮次：<span className="text-white font-bold">{players[currentTurn]?.name || '准备中'}</span>
          </div>
        </div>

        <button
          onClick={startNewGame}
          className="px-3.5 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重新洗牌</span>
        </button>
      </div>

      {/* Poker Table */}
      <div className="relative min-h-[460px] rounded-3xl bg-gradient-to-b from-[#1b1035] via-[#110724] to-[#0a0316] border-4 border-purple-900/60 p-4 sm:p-6 shadow-2xl flex flex-col justify-between">
        {/* Top: 3 Bottom Cards */}
        <div className="flex flex-col items-center space-y-1">
          <div className="text-[10px] text-purple-300/80 font-mono">地主底牌 (3张)</div>
          <div className="flex gap-2">
            {bottomCards.map((c, idx) => (
              <div
                key={idx}
                className="w-10 h-14 rounded-lg bg-amber-50 border border-amber-300 shadow-md flex flex-col items-center justify-center text-slate-900 font-bold text-xs"
              >
                <span className={c.suit === '♥' || c.suit === '♦' ? 'text-red-600' : 'text-slate-900'}>
                  {c.rank}
                </span>
                <span className="text-[10px]">{c.suit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Bot Opponents & Last Played Cards */}
        <div className="grid grid-cols-3 items-center py-4">
          {/* Bot 1 (Left) */}
          <div className="flex flex-col items-start space-y-1 pl-2">
            <div className="flex items-center gap-1.5">
              <img src={players[1]?.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-400" />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{players[1]?.name}</span>
                  {players[1]?.isLandlord && <Crown className="w-3 h-3 text-yellow-400" />}
                </div>
                <div className="text-[10px] text-purple-300">手牌: {players[1]?.hand.length} 张</div>
              </div>
            </div>
          </div>

          {/* Center Play Zone */}
          <div className="flex flex-col items-center justify-center space-y-2">
            {lastPlay ? (
              <div className="flex flex-col items-center space-y-1">
                <div className="text-[10px] text-purple-300">
                  【{players[lastPlay.playerIdx]?.name}】打出：
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {lastPlay.cards.map((c, i) => (
                    <div
                      key={i}
                      className="w-8 sm:w-9 h-12 sm:h-13 rounded-lg bg-white border border-purple-300 shadow-md flex flex-col items-center justify-center text-slate-900 font-bold text-xs"
                    >
                      <span className={c.suit === '♥' || c.suit === '♦' ? 'text-red-600' : 'text-slate-900'}>
                        {c.rank}
                      </span>
                      <span className="text-[9px]">{c.suit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-purple-400/50">桌面等待出牌...</div>
            )}
          </div>

          {/* Bot 2 (Right) */}
          <div className="flex flex-col items-end space-y-1 pr-2">
            <div className="flex items-center gap-1.5">
              <div className="text-right">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                  {players[2]?.isLandlord && <Crown className="w-3 h-3 text-yellow-400" />}
                  <span>{players[2]?.name}</span>
                </div>
                <div className="text-[10px] text-purple-300">手牌: {players[2]?.hand.length} 张</div>
              </div>
              <img src={players[2]?.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-400" />
            </div>
          </div>
        </div>

        {/* Bottom Actions for Human */}
        <div className="flex flex-col items-center space-y-2">
          {phase === 'bidding' && (
            <div className="flex gap-3">
              <button
                onClick={() => handleBidLandlord(true)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg"
              >
                👑 叫地主
              </button>
              <button
                onClick={() => handleBidLandlord(false)}
                className="px-5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-medium"
              >
                不叫 (过)
              </button>
            </div>
          )}

          {phase === 'playing' && currentTurn === 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleHumanPlay}
                disabled={selectedCards.size === 0}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md disabled:opacity-40"
              >
                出牌 ({selectedCards.size}张)
              </button>
              {lastPlay && lastPlay.playerIdx !== 0 && (
                <button
                  onClick={handleHumanPass}
                  className="px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-medium"
                >
                  不出 (过)
                </button>
              )}
            </div>
          )}

          {/* Human Hand Cards */}
          <div className="flex items-end justify-center -space-x-3 sm:-space-x-4 overflow-x-auto max-w-full pb-2 px-4">
            {human?.hand.map((card) => {
              const isSelected = selectedCards.has(card.id);
              const isRed = card.suit === '♥' || card.suit === '♦';
              return (
                <button
                  key={card.id}
                  onClick={() => toggleSelectCard(card.id)}
                  className={`relative w-9 sm:w-12 h-16 sm:h-20 rounded-xl bg-gradient-to-b from-white to-slate-100 border-2 border-slate-300 shadow-xl flex flex-col justify-between p-1 transition-all transform hover:-translate-y-4 ${
                    isSelected ? '-translate-y-4 ring-2 ring-yellow-400 border-yellow-400 z-10' : 'hover:z-10'
                  }`}
                >
                  <div className={`text-left text-xs font-black leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                    <div>{card.rank}</div>
                    <div className="text-[10px]">{card.suit}</div>
                  </div>
                  <div className={`text-right text-[10px] font-bold ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                    {card.rank}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Win Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1c0836] to-[#0d031c] border-2 border-amber-400 p-6 text-white text-center space-y-4">
            <div className="text-4xl">👑</div>
            <h2 className="text-xl font-bold font-serif text-yellow-300">
              {winner.name} 获得胜利！
            </h2>
            <p className="text-xs text-purple-200">
              率先出完全部手牌，恭喜获胜！获得 +30 星光值
            </p>
            <button
              onClick={startNewGame}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-medium text-xs"
            >
              再来一局斗地主
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
