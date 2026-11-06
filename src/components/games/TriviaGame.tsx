import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCircle, CheckCircle2, XCircle, Trophy, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
}

const QUESTIONS: TriviaQuestion[] = [
  {
    question: '《长相思》中，小夭在清水镇隐姓埋名时所用的身份名字是什么？',
    options: ['玟小六', '叶十七', '防风邶', '轩老板'],
    correctIndex: 0,
    explanation: '小夭流落清水镇时化名“玟小六”，在回春堂以医师身份悬壶济世。',
    source: '《长相思》'
  },
  {
    question: '《亲爱的，热爱的》中佟年在网吧第一次见到韩商言时，给他做的是什么宵夜？',
    options: ['豪华泡面套餐', '现熬红豆粥', '爱心煎蛋年糕', '提拉米苏蛋糕'],
    correctIndex: 0,
    explanation: '佟年为了吸引韩商言注意，特意亲手精心准备了豪华版泡面宵夜套餐。',
    source: '《亲爱的，热爱的》'
  },
  {
    question: '《香蜜沉沉烬如霜》的主题曲《不染》中，“一壶清酒 一身尘灰”下一句歌词是？',
    options: ['一念来回度余生相对', '一念相思度浮生几岁', '一枝寒梅待花开几回', '一腔热血伴白首齐眉'],
    correctIndex: 0,
    explanation: '毛不易演唱的《不染》经典歌词：“一壶清酒 一身尘灰 一念来回度余生相对”。',
    source: '《香蜜沉沉烬如霜》OST'
  },
  {
    question: '杨紫领衔主演的盛唐经商大剧《国色芳华》中，女主角的名字是？',
    options: ['何惟芳', '陆雪琪', '贺顿', '麦承欢'],
    correctIndex: 0,
    explanation: '杨紫在《国色芳华》中饰演独立自强的百花匠人“何惟芳”。',
    source: '《国色芳华》'
  },
  {
    question: '在《香蜜沉沉烬如霜》中，锦觅体内服下的、让她断情绝爱的神丹是？',
    options: ['陨丹', '九转金丹', '驻颜丹', '避尘珠'],
    correctIndex: 0,
    explanation: '花神梓芬为让女儿免受情劫之苦，在锦觅出生时为她服下了“陨丹”。',
    source: '《香蜜沉沉烬如霜》'
  },
  {
    question: '杨紫的官方粉丝名称“紫米”专属应援色是？',
    options: ['紫色 / 紫金星河色', '粉红色', '纯明黄色', '天蓝色'],
    correctIndex: 0,
    explanation: '杨紫粉丝紫米的专属应援色为浪漫璀璨的紫色星河！',
    source: '紫米应援文化'
  }
];

export const TriviaGame: React.FC = () => {
  const { profile, updateProfile, showToast } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const q = QUESTIONS[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === q.correctIndex) {
      setScore(s => s + 20);
      showToast('回答正确！+20 星光值', 'success');
      confetti({ particleCount: 40, spread: 60, colors: ['#c084fc', '#fde047'] });
    } else {
      showToast('回答错误，继续加油！', 'warn');
    }
  };

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      if (profile) {
        updateProfile({ points: profile.points + score });
      }
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsAnswered(false);
    setIsCompleted(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-600/30 text-fuchsia-300 border border-purple-400/30 font-bold">
          光影记忆 · 猜歌与角色问答挑战
        </span>
        <span className="text-xs text-purple-300">
          得分：<span className="font-mono text-yellow-300 font-bold">{score}</span> 分
        </span>
      </div>

      {!isCompleted ? (
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#180a33] to-[#0e041f] border border-purple-400/30 space-y-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-purple-300/80">
            <span>第 {currentIndex + 1} / {QUESTIONS.length} 题 · {q.source}</span>
            <span className="font-mono text-fuchsia-300">进度 {Math.round(((currentIndex + 1) / QUESTIONS.length) * 100)}%</span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white font-serif leading-relaxed">
            {q.question}
          </h2>

          <div className="space-y-2.5">
            {q.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === q.correctIndex;
              let btnStyle = 'bg-purple-950/50 border-purple-500/30 text-purple-200 hover:bg-purple-900/40';

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-red-950/70 border-red-500 text-red-200';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="p-4 rounded-xl bg-purple-950/70 border border-purple-500/30 space-y-3 animate-in fade-in">
              <div className="text-xs text-purple-200 leading-relaxed font-serif">
                💡 <span className="font-bold text-white">解析：</span>{q.explanation}
              </div>
              <button
                onClick={handleNext}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
              >
                {currentIndex < QUESTIONS.length - 1 ? '下一题 ➔' : '查看最终答题战报 ➔'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#180a33] to-[#0e041f] border border-amber-400/40 text-center space-y-5 shadow-2xl">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold font-serif text-white">答题挑战达成！</h2>
          <div className="text-sm text-purple-200">
            你本次获得了 <span className="text-2xl font-bold font-mono text-yellow-300">{score}</span> 分！
          </div>
          <p className="text-xs text-purple-300/80">
            不愧是真爱紫米，对小猴紫的作品与经典名场面了如指掌！积分已自动计入你的主页。
          </p>
          <button
            onClick={restartQuiz}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium"
          >
            再挑战一次
          </button>
        </div>
      )}
    </div>
  );
};
