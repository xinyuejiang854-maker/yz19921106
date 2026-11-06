import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, RotateCw, Heart, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

const TRUTH_CARDS = [
  '最喜欢小猴紫的哪部剧？哪一个瞬间最戳中你的心？',
  '你是因为哪一个角色或者哪一个综艺镜头正式入坑紫米的？',
  '如果能穿越到杨紫演过的电视剧里成为其中一个角色，你想成为谁？为什么？',
  '你曾经向身边的朋友安利杨紫，最成功或者最难忘的一次经历是什么？',
  '在所有杨紫演过的角色的结局中，哪一个最让你意难平？',
  '用三个形容词来描述你眼中的杨紫。',
  '11.06 生日这一天，你最想对小猴紫说的真心话是什么？'
];

const DARE_CARDS = [
  '在全国紫米聊天室里发送一句小夭、锦觅或佟年的高光经典台词！',
  '模仿杨紫标志性的元气小猴紫大笑，并发送文字“哈哈哈猴紫最棒”！',
  '在星光相册中为你最喜欢的一张剧照留下 20 字以上的深情夸夸评论！',
  '为杨紫 11.06 生日录制或哼唱一句《长相思》或《香蜜》的主题曲！',
  '在星愿墙上为《国色芳华》投递一张新剧收视长虹的专属星笺！',
  '为杨紫的所有待播作品点赞并送出 10 次星光值助力！'
];

export const TruthDareGame: React.FC = () => {
  const { showToast } = useApp();
  const [mode, setMode] = useState<'truth' | 'dare'>('truth');
  const [currentPrompt, setCurrentPrompt] = useState<string>(TRUTH_CARDS[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const newRot = rotation + 720 + Math.floor(Math.random() * 360);
    setRotation(newRot);

    setTimeout(() => {
      setIsSpinning(false);
      const deck = mode === 'truth' ? TRUTH_CARDS : DARE_CARDS;
      const pick = deck[Math.floor(Math.random() * deck.length)];
      setCurrentPrompt(pick);
      confetti({ particleCount: 50, spread: 70, colors: ['#c084fc', '#f43f5e'] });
      showToast(`抽到了！快完成你的紫米挑战吧~`, 'info');
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-600/30 text-fuchsia-300 border border-purple-400/30 font-bold">
          紫米星愿聚会 · 真心话大冒险
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => { setMode('truth'); setCurrentPrompt(TRUTH_CARDS[0]); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'truth'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-950/50 text-purple-300 hover:text-white'
            }`}
          >
            真心话
          </button>
          <button
            onClick={() => { setMode('dare'); setCurrentPrompt(DARE_CARDS[0]); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'dare'
                ? 'bg-pink-600 text-white'
                : 'bg-purple-950/50 text-purple-300 hover:text-white'
            }`}
          >
            大冒险
          </button>
        </div>
      </div>

      {/* Spinning Star Wheel */}
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <div
          className="w-44 h-44 rounded-full bg-gradient-to-tr from-purple-800 via-fuchsia-700 to-indigo-900 border-4 border-purple-400 shadow-2xl flex items-center justify-center transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="w-36 h-36 rounded-full border-2 border-dashed border-purple-300/40 flex items-center justify-center text-4xl">
            {mode === 'truth' ? '💜' : '🔥'}
          </div>
        </div>

        {/* Pointer */}
        <div className="absolute -top-1 w-4 h-6 bg-yellow-400 clip-polygon shadow-md z-10" />
      </div>

      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-medium shadow-lg shadow-purple-900/40 flex items-center gap-2 mx-auto active:scale-95 disabled:opacity-50"
      >
        <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
        <span>转动星愿转盘抽取题目</span>
      </button>

      {/* Prompt Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-[#180833] to-[#0e0420] border-2 border-purple-400/40 space-y-3 shadow-2xl backdrop-blur-xl">
        <div className="text-xs font-bold text-fuchsia-300 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>{mode === 'truth' ? '紫米真心话' : '紫米大冒险'}</span>
        </div>
        <p className="text-sm sm:text-base font-serif text-white leading-relaxed font-semibold">
          “{currentPrompt}”
        </p>
      </div>
    </div>
  );
};
