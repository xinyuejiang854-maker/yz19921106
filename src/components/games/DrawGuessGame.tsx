import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { socket } from '../../utils/socket';
import { Palette, RotateCcw, Send, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

const YANG_ZI_DRAW_WORDS = [
  '紫藤花',
  '红九尾狐',
  '香蜜葡萄',
  '大王姬',
  '生日蛋糕',
  '向日葵',
  '小猴子',
  '回春堂药丸',
  '盛唐牡丹',
  '紫米饭团'
];

export const DrawGuessGame: React.FC = () => {
  const { profile, showToast } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentWord, setCurrentWord] = useState(YANG_ZI_DRAW_WORDS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#c084fc');
  const [brushSize, setBrushSize] = useState(4);
  const [guessInput, setGuessInput] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: string; text: string; isCorrect?: boolean }>>([
    { sender: '紫约伴侣', text: '游戏开始啦！猜猜画板上画的是杨紫相关的什么事物？' }
  ]);
  const [hasGuessedCorrect, setHasGuessedCorrect] = useState(false);

  const colors = ['#ffffff', '#c084fc', '#ec4899', '#fde047', '#38bdf8', '#4ade80', '#fb923c', '#000000'];

  // Start new round
  const nextWord = () => {
    const next = YANG_ZI_DRAW_WORDS[Math.floor(Math.random() * YANG_ZI_DRAW_WORDS.length)];
    setCurrentWord(next);
    clearCanvas();
    setHasGuessedCorrect(false);
    setChatLog(prev => [...prev, { sender: '系统', text: `换新词啦！词长：${next.length} 个字` }]);
    showToast(`换词完毕！当前绘画词为【${next}】`, 'info');
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#170b2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    clearCanvas();

    const unsub = socket.on('draw_stroke_broadcast', (data) => {
      if (data.stroke) {
        drawRemoteStroke(data.stroke);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  const drawRemoteStroke = (stroke: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(stroke.fromX, stroke.fromY);
    ctx.lineTo(stroke.toX, stroke.toY);
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();

    // Broadcast stroke to other connected players
    socket.send({
      type: 'draw_stroke',
      stroke: { fromX: x, fromY: y, toX: x, toY: y, color: brushColor, size: brushSize }
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleGuessSubmit = () => {
    const text = guessInput.trim();
    if (!text) return;

    const isMatch = text === currentWord;

    setChatLog(prev => [
      ...prev,
      {
        sender: profile?.nickname || '星河小紫米',
        text,
        isCorrect: isMatch
      }
    ]);

    setGuessInput('');

    if (isMatch) {
      setHasGuessedCorrect(true);
      confetti({ particleCount: 80, spread: 80, colors: ['#c084fc', '#fde047', '#ffffff'] });
      showToast(`🎉 恭喜回答正确！答案就是【${currentWord}】！获得 +20 星光值`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-600/30 text-fuchsia-300 border border-purple-400/30 font-bold">
            紫米创意涂鸦 · 你画我猜
          </span>
          <div className="text-xs text-purple-300 mt-1">
            当前绘画目标：
            <span className="text-yellow-300 font-bold ml-1 text-sm bg-purple-900/50 px-2 py-0.5 rounded border border-purple-400/30">
              【{currentWord}】
            </span>
            <span className="text-purple-400/70 text-[11px] ml-2">（在画板作画或在右侧猜词）</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/40 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>清空画板</span>
          </button>
          <button
            onClick={nextWord}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
          >
            换一个词
          </button>
        </div>
      </div>

      {/* Main Board & Guess Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Canvas Area */}
        <div className="lg:col-span-8 space-y-3">
          <div className="rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-2xl bg-[#170b2e]">
            <canvas
              ref={canvasRef}
              width={640}
              height={400}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-[320px] sm:h-[380px] cursor-crosshair block"
            />
          </div>

          {/* Color & Size Toolbar */}
          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-purple-300">画笔颜色：</span>
              <div className="flex gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    className={`w-6 h-6 rounded-full border transition-transform ${
                      brushColor === c ? 'scale-125 border-white ring-2 ring-purple-400' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-purple-300">粗细：</span>
              <input
                type="range"
                min={2}
                max={20}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24 accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Guess & Chat Feed */}
        <div className="lg:col-span-4 rounded-3xl bg-[#120726] border border-purple-500/30 p-4 flex flex-col justify-between h-[420px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
                <span>实时竞猜区</span>
              </span>
              {hasGuessedCorrect && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  ✓ 本轮已猜中
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {chatLog.map((c, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-xl text-xs ${
                    c.isCorrect
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 font-bold'
                      : 'bg-purple-950/40 text-purple-200'
                  }`}
                >
                  <span className="font-semibold text-purple-300">{c.sender}：</span>
                  <span>{c.text}</span>
                  {c.isCorrect && <span className="ml-1 text-yellow-300">🎉 答对了！</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-purple-500/20 flex gap-2">
            <input
              type="text"
              placeholder="猜猜画的是什么..."
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuessSubmit()}
              className="flex-1 px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-purple-400"
            />
            <button
              onClick={handleGuessSubmit}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>猜</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
