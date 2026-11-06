import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WishItem } from '../types';
import {
  Heart,
  Sparkles,
  Plus,
  X,
  Send,
  Flame,
  Star,
  MessageSquareHeart
} from 'lucide-react';

export const WishWallView: React.FC = () => {
  const { showToast } = useApp();
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [loading, setLoading] = useState(true);

  // New wish modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wishContent, setWishContent] = useState('');
  const [wishCategory, setWishCategory] = useState<WishItem['category']>('生日祝福');
  const [selectedColor, setSelectedColor] = useState('from-purple-900/50 to-indigo-900/50');

  const categories = ['全部', '生日祝福', '新剧大爆', '平安顺遂', '星愿胶囊', '紫米心语'];

  const colorThemes = [
    { label: '星河深紫', value: 'from-purple-900/50 to-indigo-900/50', border: 'border-purple-500/40' },
    { label: '薰衣草梦', value: 'from-violet-900/50 to-fuchsia-900/50', border: 'border-fuchsia-500/40' },
    { label: '暮色琉璃', value: 'from-indigo-950/50 to-purple-900/50', border: 'border-indigo-500/40' },
    { label: '银河月辉', value: 'from-slate-900/60 to-purple-950/60', border: 'border-purple-400/40' }
  ];

  const fetchWishes = async () => {
    try {
      setLoading(true);
      const url = activeCategory === '全部' ? '/api/wishes' : `/api/wishes?category=${encodeURIComponent(activeCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.wishes) {
        setWishes(data.wishes);
      }
    } catch (e) {
      console.error('Fetch wishes failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, [activeCategory]);

  const handleLike = async (wishId: string) => {
    try {
      const res = await fetch(`/api/wishes/${wishId}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWishes(prev =>
          prev.map(w => {
            if (w.id === wishId) {
              const liked = data.isLiked;
              const likedBy = liked
                ? [...w.likedBy, 'user_current']
                : w.likedBy.filter(id => id !== 'user_current');
              return { ...w, likes: data.likes, likedBy };
            }
            return w;
          })
        );
      }
    } catch (e) {
      showToast('点赞失败', 'warn');
    }
  };

  const handleCreateWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishContent.trim()) {
      showToast('请输入您的祝福心语', 'warn');
      return;
    }

    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: wishCategory,
          content: wishContent.trim(),
          color: selectedColor
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || '祝福已放入星河！', 'success');
        setIsModalOpen(false);
        setWishContent('');
        fetchWishes();
      }
    } catch (e) {
      showToast('投递祝福失败，请稍后重试', 'warn');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-900/40 via-violet-950/50 to-purple-950/40 border border-purple-500/30 p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs border border-purple-400/30 mb-2">
            <MessageSquareHeart className="w-3.5 h-3.5 text-pink-300" />
            <span>千言万语 · 汇入杨紫专属星愿池</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">生日祝福墙与星愿池</h1>
          <p className="text-xs sm:text-sm text-purple-200/70 mt-1 max-w-xl">
            每一片发光的紫色星笺，都盛着紫米对小猴紫最赤诚纯粹的期许。11.06 生日快乐，平安顺遂！
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-purple-900/40 border border-purple-300/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>写星愿祝福 (+15星光)</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-purple-600 text-white border border-purple-400/50 shadow-md shadow-purple-900/30'
                : 'bg-purple-950/40 text-purple-200/70 hover:text-white hover:bg-purple-900/40 border border-purple-500/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Wish Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-purple-300 text-sm">
          正在接收星河祝福... ✨
        </div>
      ) : wishes.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-2xl bg-purple-950/20 border border-purple-500/20">
          <Heart className="w-12 h-12 text-pink-400/40 mx-auto" />
          <p className="text-purple-300/80 text-sm">暂无该分类祝福，快投递第一张星笺吧！</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-purple-600/30 text-purple-200 text-xs border border-purple-400/30 hover:bg-purple-600/50"
          >
            写下祝福
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishes.map((wish) => {
            const isLiked = wish.likedBy.includes('user_current');
            return (
              <div
                key={wish.id}
                className={`rounded-2xl bg-gradient-to-br ${wish.color} border border-purple-500/30 hover:border-purple-400/60 p-5 shadow-lg backdrop-blur-md flex flex-col justify-between transition-all hover:-translate-y-1`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-950/80 text-[10px] text-purple-300 border border-purple-400/30">
                      {wish.category}
                    </span>
                    <span className="text-[10px] text-purple-300/70 font-mono">
                      {wish.createdAt}
                    </span>
                  </div>

                  <p className="text-sm text-purple-100 font-serif leading-relaxed whitespace-pre-wrap">
                    {wish.content}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={wish.authorAvatar}
                      alt={wish.author}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-purple-400/30"
                    />
                    <span className="text-xs text-purple-200 font-medium">{wish.author}</span>
                  </div>

                  <button
                    onClick={() => handleLike(wish.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-xs ${
                      isLiked
                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                        : 'bg-purple-900/30 text-purple-300/80 hover:text-white border border-purple-500/20'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-pink-400' : ''}`} />
                    <span>{wish.likes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write Wish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#14082c] border border-purple-500/40 p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h2 className="text-lg font-bold font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                投递杨紫专属星愿
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-800/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWish} className="space-y-4">
              <div>
                <label className="block text-xs text-purple-300 mb-1 font-medium">星愿主题 *</label>
                <select
                  value={wishCategory}
                  onChange={(e) => setWishCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-400"
                >
                  <option value="生日祝福">生日祝福 (11.06 生日快乐)</option>
                  <option value="新剧大爆">新剧大爆 (国色芳华、青簪行)</option>
                  <option value="平安顺遂">平安顺遂 (健康开怀每一天)</option>
                  <option value="星愿胶囊">星愿胶囊 (给未来的杨紫与自己)</option>
                  <option value="紫米心语">紫米心语 (想对小猴紫说的悄悄话)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-purple-300 mb-1 font-medium">祝福内容 *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="写下你最真挚的祝福与心愿...（200字以内）"
                  value={wishContent}
                  onChange={(e) => setWishContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-400 placeholder:text-purple-400/40 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs text-purple-300 mb-1 font-medium">星笺色调</label>
                <div className="grid grid-cols-2 gap-2">
                  {colorThemes.map((c, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedColor(c.value)}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border ${
                        selectedColor === c.value
                          ? `${c.border} bg-purple-800/40 text-white ring-1 ring-purple-400`
                          : 'border-purple-500/20 bg-purple-950/40 text-purple-300'
                      }`}
                    >
                      <span>{c.label}</span>
                      <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${c.value}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950/40 text-purple-300 text-sm hover:bg-purple-900/40"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium shadow-md shadow-purple-900/40 hover:from-purple-500 hover:to-pink-500 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>投递星愿 (+15星光)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
