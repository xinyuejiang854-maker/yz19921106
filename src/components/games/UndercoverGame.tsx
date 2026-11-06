import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  YANG_ZI_WORD_PAIRS,
  assignUndercoverWords,
  tallyVotes,
  checkUndercoverWinner,
  UndercoverPlayerState
} from '../../game/undercoverRules';
import { Eye, EyeOff, RotateCcw, Vote, Award, MessageSquare, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const UndercoverGame: React.FC = () => {
  const { profile, showToast } = useApp();

  const [players, setPlayers] = useState<UndercoverPlayerState[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<'check_word' | 'describe' | 'vote' | 'result'>('check_word');
  const [revealedWord, setRevealedWord] = useState(false);
  const [statementInput, setStatementInput] = useState('');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [winner, setWinner] = useState<'civilians' | 'undercovers' | null>(null);
  const [gamePair, setGamePair] = useState({ civilian: '', undercover: '' });

  const startNewGame = () => {
    const playerRoster = [
      { id: 'p0', name: profile?.nickname || '星河小紫米 (我)' },
      { id: 'p1', name: '夭夭的九尾狐' },
      { id: 'p2', name: '盛唐紫牡丹' },
      { id: 'p3', name: '佟年小鱿鱼' },
      { id: 'p4', name: '黄瀛子小摩托' }
    ];

    const { civilianWord, undercoverWord, roles } = assignUndercoverWords(
      playerRoster.map(p => p.id),
      1
    );

    const initPlayers: UndercoverPlayerState[] = playerRoster.map(p => ({
      id: p.id,
      name: p.name,
      isUndercover: roles[p.id].isUndercover,
      word: roles[p.id].word,
      isAlive: true,
      statement: '',
      hasStated: false
    }));

    setPlayers(initPlayers);
    setGamePair({ civilian: civilianWord, undercover: undercoverWord });
    setCurrentRound(1);
    setPhase('check_word');
    setRevealedWord(false);
    setStatementInput('');
    setVotes({});
    setWinner(null);
    showToast('🎭 谁是卧底新局已开！请查看你的底牌词语', 'info');
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const handleStartDescribe = () => {
    setPhase('describe');

    // Generate smart statements for bots
    const updated = players.map(p => {
      if (p.id === 'p0') return p;
      const genericStatements = [
        `这个和杨紫演过的经典作品很有渊源~`,
        `名字很有仙气/灵气，大家都很喜欢！`,
        `常常出现在我们的追剧回忆里。`,
        `非常有代表性，特征很明显。`,
        `是紫米们非常熟悉的存在！`
      ];
      return {
        ...p,
        statement: genericStatements[Math.floor(Math.random() * genericStatements.length)],
        hasStated: true
      };
    });
    setPlayers(updated);
  };

  const handleHumanSubmitStatement = () => {
    if (!statementInput.trim()) {
      showToast('请输入一句话描述你的词语', 'warn');
      return;
    }
    const updated = players.map(p =>
      p.id === 'p0' ? { ...p, statement: statementInput.trim(), hasStated: true } : p
    );
    setPlayers(updated);
    showToast('描述已提交！全员描述完毕，进入投票环节', 'success');
    setPhase('vote');
  };

  const handleVote = (targetId: string) => {
    const newVotes: Record<string, string> = { ...votes, p0: targetId };

    // Bots vote
    players.filter(p => p.id !== 'p0' && p.isAlive).forEach(bot => {
      const candidates = players.filter(c => c.isAlive && c.id !== bot.id);
      const choice = candidates[Math.floor(Math.random() * candidates.length)];
      newVotes[bot.id] = choice.id;
    });

    setVotes(newVotes);

    // Tally
    const tally = tallyVotes(newVotes);
    if (tally.eliminatedId) {
      const eliminated = players.find(p => p.id === tally.eliminatedId);
      const updatedPlayers = players.map(p =>
        p.id === tally.eliminatedId ? { ...p, isAlive: false } : p
      );
      setPlayers(updatedPlayers);
      showToast(`玩家【${eliminated?.name}】获得最高票数被投出局！`, 'info');

      // Check win
      const win = checkUndercoverWinner(updatedPlayers);
      if (win) {
        setWinner(win);
        setPhase('result');
        if (win === 'civilians') {
          confetti({ particleCount: 70, spread: 80, colors: ['#a855f7', '#fbbf24'] });
        }
      } else {
        // Next round
        setCurrentRound(r => r + 1);
        setPhase('describe');
        setStatementInput('');
      }
    } else {
      showToast('本轮平票，无人被投出！继续下一轮发言', 'info');
      setCurrentRound(r => r + 1);
      setPhase('describe');
    }
  };

  const myPlayer = players.find(p => p.id === 'p0');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-600/30 text-fuchsia-300 border border-purple-400/30 font-bold">
            杨紫角色篇 · 谁是卧底
          </span>
          <div className="text-xs text-purple-300 mt-1">
            当前阶段：
            <span className="text-white font-bold ml-1">
              {phase === 'check_word' && '1. 查验底牌词语'}
              {phase === 'describe' && `2. 第 ${currentRound} 轮轮流描述`}
              {phase === 'vote' && '3. 投票指认卧底'}
              {phase === 'result' && '4. 胜负结算'}
            </span>
          </div>
        </div>

        <button
          onClick={startNewGame}
          className="px-3.5 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>新开一局</span>
        </button>
      </div>

      {/* Secret Word Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/50 via-indigo-950/60 to-purple-950/50 border border-purple-400/30 text-center space-y-3">
        <div className="text-xs text-purple-300 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-fuchsia-300" />
          <span>你的专属底牌词语</span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-widest px-6 py-2 rounded-2xl bg-purple-950/80 border border-purple-400/40 shadow-inner">
            {revealedWord ? myPlayer?.word : '••••••'}
          </div>
          <button
            onClick={() => setRevealedWord(!revealedWord)}
            className="p-2.5 rounded-xl bg-purple-600/40 text-purple-200 hover:bg-purple-600 border border-purple-400/30"
            title={revealedWord ? '隐藏词语' : '查看词语'}
          >
            {revealedWord ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {phase === 'check_word' && (
          <button
            onClick={handleStartDescribe}
            className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-xs sm:text-sm shadow-md"
          >
            我记住了，开始第 1 轮发言 ➔
          </button>
        )}
      </div>

      {/* Players Circle & Statements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((p) => {
          const isMe = p.id === 'p0';
          return (
            <div
              key={p.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                !p.isAlive
                  ? 'bg-red-950/20 border-red-500/20 opacity-50'
                  : isMe
                  ? 'bg-purple-800/30 border-purple-400'
                  : 'bg-purple-950/40 border-purple-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{p.name}</span>
                  {isMe && <span className="text-[10px] text-fuchsia-300">(我)</span>}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    p.isAlive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {p.isAlive ? '存活' : '已淘汰'}
                </span>
              </div>

              {/* Statement Bubble */}
              <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/20 min-h-[50px] flex items-center text-xs text-purple-200">
                {p.statement ? (
                  <span>“{p.statement}”</span>
                ) : (
                  <span className="text-purple-400/50 italic">尚未发言</span>
                )}
              </div>

              {/* Vote Button */}
              {phase === 'vote' && p.isAlive && !isMe && (
                <button
                  onClick={() => handleVote(p.id)}
                  className="w-full py-1.5 rounded-xl bg-pink-600/40 hover:bg-pink-600 border border-pink-400/30 text-white text-xs font-medium"
                >
                  投票指认此人是卧底
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Describe input for Human */}
      {phase === 'describe' && myPlayer?.isAlive && (
        <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/30 flex gap-2">
          <input
            type="text"
            placeholder="用一句话描述你的词（不能直接说出词中字眼）..."
            value={statementInput}
            onChange={(e) => setStatementInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleHumanSubmitStatement()}
            className="flex-1 px-4 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-purple-400"
          />
          <button
            onClick={handleHumanSubmitStatement}
            className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-medium hover:bg-purple-500"
          >
            提交描述
          </button>
        </div>
      )}

      {/* Result Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#190733] to-[#0c031a] border-2 border-purple-400 p-6 shadow-2xl text-white space-y-4 text-center">
            <div className="text-4xl">🎉</div>
            <h2 className="text-2xl font-bold font-serif text-yellow-300">
              {winner === 'civilians' ? '平民阵营胜利！' : '卧底阵营获胜！'}
            </h2>
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200 space-y-1">
              <div>平民词：<span className="font-bold text-white">{gamePair.civilian}</span></div>
              <div>卧底词：<span className="font-bold text-pink-300">{gamePair.undercover}</span></div>
              <div className="pt-2 text-purple-400">
                真实卧底是：{players.find(p => p.isUndercover)?.name}
              </div>
            </div>
            <button
              onClick={startNewGame}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-xs"
            >
              再来一局谁是卧底
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
