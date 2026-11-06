import React, { useState } from 'react';
import { MahjongGame } from './games/MahjongGame';
import { UndercoverGame } from './games/UndercoverGame';
import { DoudizhuGame } from './games/DoudizhuGame';
import { GomokuGame } from './games/GomokuGame';
import { DrawGuessGame } from './games/DrawGuessGame';
import { TriviaGame } from './games/TriviaGame';
import { TruthDareGame } from './games/TruthDareGame';
import {
  Gamepad2,
  Sparkles,
  Award,
  Layers,
  HelpCircle,
  Dice5,
  Pencil,
  Grid3X3
} from 'lucide-react';

type GameType = 'mahjong' | 'undercover' | 'doudizhu' | 'gomoku' | 'draw_guess' | 'trivia' | 'truth_dare';

export const GameLobbyView: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameType>('mahjong');

  const gameOptions: Array<{
    id: GameType;
    title: string;
    tag: string;
    icon: string;
    desc: string;
  }> = [
    { id: 'mahjong', title: '紫约麻将', tag: '136规则·真实碰杠胡', icon: '🀄', desc: '4人对局，发牌摸牌打牌，碰杠胡牌与番型计分结算' },
    { id: 'undercover', title: '谁是卧底', tag: '杨紫角色篇', icon: '🎭', desc: '经典平民与卧底分配，轮流陈述，投票指认与淘汰结算' },
    { id: 'doudizhu', title: '经典斗地主', tag: '扑克对局', icon: '🃏', desc: '54张全套扑克，叫地主、出牌压牌、顺子炸弹与王炸' },
    { id: 'gomoku', title: '星河五子棋', tag: '15×15对弈', icon: '⚪', desc: '经典黑白落子，五连珠智能胜负裁决与人机切磋' },
    { id: 'draw_guess', title: '你画我猜', tag: '紫米创意画布', icon: '🎨', desc: '在线画板自由挥洒，多色笔刷，实时猜词即刻揭秘' },
    { id: 'trivia', title: '猜歌答题挑战', tag: '影视OST与台词', icon: '✨', desc: '长相思、香蜜、亲爱的高光剧情与角色细节答题' },
    { id: 'truth_dare', title: '真心话大冒险', tag: '星愿转盘', icon: '💜', desc: '专属紫米聚会破冰卡牌，畅聊对小猴紫的真情实感' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Lobby Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-900/40 via-violet-950/50 to-indigo-950/40 border border-purple-500/30 p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs border border-purple-400/30 mb-2">
            <Gamepad2 className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>多人联机 · 真实规则闭环与实时游戏状态</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">紫米联机游戏大厅</h1>
          <p className="text-xs sm:text-sm text-purple-200/70 mt-1 max-w-xl">
            专为紫米打造的沉浸娱乐天地：完整规则麻将、谁是卧底、斗地主、五子棋、你画我猜与角色问答。可单人切磋或与在线紫米伴侣同台竞技！
          </p>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {gameOptions.map((g) => {
          const isActive = activeGame === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveGame(g.id)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-1.5 ${
                isActive
                  ? 'bg-purple-600/40 border-purple-400 text-white shadow-lg shadow-purple-900/30 ring-1 ring-purple-300'
                  : 'bg-purple-950/30 border-purple-500/20 text-purple-300/80 hover:bg-purple-900/30 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{g.icon}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-300" />}
              </div>
              <div>
                <div className="text-xs font-bold truncate">{g.title}</div>
                <div className="text-[10px] text-purple-400/80 truncate mt-0.5">{g.tag}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Render Active Game Container */}
      <div className="rounded-3xl bg-[#110729]/80 border border-purple-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        {activeGame === 'mahjong' && <MahjongGame />}
        {activeGame === 'undercover' && <UndercoverGame />}
        {activeGame === 'doudizhu' && <DoudizhuGame />}
        {activeGame === 'gomoku' && <GomokuGame />}
        {activeGame === 'draw_guess' && <DrawGuessGame />}
        {activeGame === 'trivia' && <TriviaGame />}
        {activeGame === 'truth_dare' && <TruthDareGame />}
      </div>
    </div>
  );
};
