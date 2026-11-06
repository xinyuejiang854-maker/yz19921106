import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PhotoItem } from '../types';
import {
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Upload,
  Plus,
  X,
  Send,
  Flag,
  CheckCircle,
  Tag
} from 'lucide-react';

export const GalleryView: React.FC = () => {
  const { profile, showToast } = useApp();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadCategory, setUploadCategory] = useState<PhotoItem['category']>('剧照');
  const [uploadTags, setUploadTags] = useState('杨紫, 绝美生图');

  // Preview & Comment state
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [newComment, setNewComment] = useState('');

  const categories = ['全部', '剧照', '活动生图', '杂志大片', '饭制手绘', '舞台经典'];

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const url = activeCategory === '全部' ? '/api/photos' : `/api/photos?category=${encodeURIComponent(activeCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.photos) {
        setPhotos(data.photos);
      }
    } catch (e) {
      console.error('Fetch photos failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [activeCategory]);

  const handleLike = async (photoId: string) => {
    try {
      const res = await fetch(`/api/photos/${photoId}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPhotos(prev =>
          prev.map(p => {
            if (p.id === photoId) {
              const liked = data.isLiked;
              const likedBy = liked
                ? [...p.likedBy, 'user_current']
                : p.likedBy.filter(id => id !== 'user_current');
              return { ...p, likes: data.likes, likedBy };
            }
            return p;
          })
        );
        if (selectedPhoto && selectedPhoto.id === photoId) {
          setSelectedPhoto(prev => (prev ? { ...prev, likes: data.likes } : null));
        }
      }
    } catch (e) {
      showToast('点赞失败', 'warn');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadUrl.trim()) {
      showToast('请完整填写标题与图片地址', 'warn');
      return;
    }

    try {
      const tags = uploadTags.split(/[,， ]+/).filter(Boolean);
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle.trim(),
          url: uploadUrl.trim(),
          category: uploadCategory,
          tags
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || '上传成功！', 'success');
        setIsUploadOpen(false);
        setUploadTitle('');
        setUploadUrl('');
        fetchPhotos();
      } else {
        showToast(data.message || '上传失败', 'warn');
      }
    } catch (e) {
      showToast('上传出错，请稍后重试', 'warn');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片尺寸不能超过 5MB', 'warn');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddComment = async (photoId: string) => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/photos/${photoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setPhotos(prev =>
          prev.map(p => {
            if (p.id === photoId) {
              return { ...p, comments: [...p.comments, data.comment] };
            }
            return p;
          })
        );
        if (selectedPhoto && selectedPhoto.id === photoId) {
          setSelectedPhoto(prev => (prev ? { ...prev, comments: [...prev.comments, data.comment] } : null));
        }
        setNewComment('');
        showToast('评论发表成功！获得 +5 星光值', 'success');
      }
    } catch (e) {
      showToast('评论失败', 'warn');
    }
  };

  const handleReport = async (photoId: string) => {
    try {
      await fetch('/api/moderation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'photo', targetId: photoId, reason: '违规图片或侵权举报' })
      });
      showToast('举报已提交，感谢守护社区！', 'info');
    } catch (e) {
      showToast('举报失败', 'warn');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-950/50 to-purple-950/40 border border-purple-500/30 p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs border border-purple-400/30 mb-2">
            <ImageIcon className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>光影流转 · 记录杨紫的每一帧高光</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">星光相册</h1>
          <p className="text-xs sm:text-sm text-purple-200/70 mt-1 max-w-xl">
            收录影视经典剧照、红毯生图大片与紫米优秀饭制作品。支持上传、审核、点赞与深度互动。
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-purple-900/40 border border-purple-300/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>上传星光照片 (+20星光)</span>
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

      {/* Photos Grid */}
      {loading ? (
        <div className="py-20 text-center text-purple-300 text-sm">
          正在加载星光画廊... ✨
        </div>
      ) : photos.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-2xl bg-purple-950/20 border border-purple-500/20">
          <ImageIcon className="w-12 h-12 text-purple-400/40 mx-auto" />
          <p className="text-purple-300/80 text-sm">该分类下暂无照片，快来成为第一个上传者吧！</p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 rounded-lg bg-purple-600/30 text-purple-200 text-xs border border-purple-400/30 hover:bg-purple-600/50"
          >
            立即上传
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => {
            const isLiked = photo.likedBy.includes('user_current');
            return (
              <div
                key={photo.id}
                className="rounded-2xl overflow-hidden bg-purple-950/40 border border-purple-500/30 hover:border-purple-400/60 transition-all group flex flex-col shadow-lg"
              >
                {/* Photo Image with Lightbox click */}
                <div
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative h-64 overflow-hidden cursor-pointer"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e051d] via-transparent to-black/20" />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-purple-950/80 backdrop-blur-md text-[10px] text-purple-200 border border-purple-400/30">
                    {photo.category}
                  </div>
                  {photo.status === 'approved' && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md text-[10px] text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>已审核</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-sm font-bold text-white drop-shadow line-clamp-1">
                      {photo.title}
                    </h3>
                    <div className="text-[11px] text-purple-300/80 flex items-center justify-between mt-0.5">
                      <span>By {photo.author}</span>
                      <span>{photo.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-3 bg-purple-950/60 border-t border-purple-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLike(photo.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        isLiked ? 'text-pink-400 font-bold' : 'text-purple-300/80 hover:text-pink-300'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-pink-400' : ''}`} />
                      <span>{photo.likes}</span>
                    </button>

                    <button
                      onClick={() => setSelectedPhoto(photo)}
                      className="flex items-center gap-1 text-purple-300/80 hover:text-purple-100"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{photo.comments.length}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleReport(photo.id)}
                    className="p-1 rounded text-purple-400/50 hover:text-amber-400"
                    title="举报此照片"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Photo Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#14082c] border border-purple-500/40 p-6 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <h2 className="text-lg font-bold font-serif flex items-center gap-2">
                <Upload className="w-5 h-5 text-fuchsia-400" />
                上传杨紫星光照片
              </h2>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-800/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-purple-300 mb-1 font-medium">照片标题 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：长相思大结局小夭绝美剧照"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs text-purple-300 mb-1 font-medium">所属分类 *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-400"
                >
                  <option value="剧照">剧照</option>
                  <option value="活动生图">活动生图</option>
                  <option value="杂志大片">杂志大片</option>
                  <option value="饭制手绘">饭制手绘</option>
                  <option value="舞台经典">舞台经典</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-purple-300 mb-1 font-medium">
                  图片来源方式 (支持文件上传或外部URL)
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-purple-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
                  />
                  <input
                    type="url"
                    placeholder="或粘贴高清图片地址 URL (https://...)"
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                {uploadUrl && (
                  <div className="mt-2 h-36 rounded-xl overflow-hidden border border-purple-500/30">
                    <img src={uploadUrl} alt="预览" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-purple-300 mb-1 font-medium">标签 Tags (逗号分隔)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="杨紫, 长相思, 盛唐风华"
                  className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl bg-purple-950/40 text-purple-300 text-sm hover:bg-purple-900/40"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-sm font-medium shadow-md shadow-purple-900/40 hover:from-purple-500 hover:to-fuchsia-500"
                >
                  确认发布 (+20星光)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Lightbox & Comment Drawer */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-[#120726] border border-purple-500/40 overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Left Image View */}
            <div className="md:w-3/5 bg-black/50 flex items-center justify-center relative p-2 min-h-[300px]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/60 text-white md:hidden hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Right Details & Comments */}
            <div className="md:w-2/5 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-purple-500/20 bg-gradient-to-b from-[#15092c] to-[#0e051d]">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] border border-purple-400/30">
                      {selectedPhoto.category}
                    </span>
                    <h2 className="text-lg font-bold text-white font-serif mt-1">
                      {selectedPhoto.title}
                    </h2>
                    <div className="text-xs text-purple-300/70 mt-0.5">
                      上传者：{selectedPhoto.author} · {selectedPhoto.createdAt}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="p-1 rounded-lg text-purple-300/70 hover:text-white hidden md:block"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tags */}
                {selectedPhoto.tags && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPhoto.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-900/40 text-purple-300 text-[10px] border border-purple-500/20"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Like Button in Modal */}
                <div className="flex items-center gap-3 pt-1 border-b border-purple-500/20 pb-3">
                  <button
                    onClick={() => handleLike(selectedPhoto.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30 hover:bg-pink-500/30 transition-all text-xs font-medium"
                  >
                    <Heart className="w-4 h-4 fill-pink-400" />
                    <span>点赞 ({selectedPhoto.likes})</span>
                  </button>
                  <span className="text-xs text-purple-300/70">
                    评论 ({selectedPhoto.comments.length})
                  </span>
                </div>

                {/* Comments List */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {selectedPhoto.comments.length === 0 ? (
                    <div className="text-xs text-purple-400/70 py-4 text-center">
                      暂无评论，留下你对这组神仙生图的赞叹吧！💜
                    </div>
                  ) : (
                    selectedPhoto.comments.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-purple-200">{c.author}</span>
                          <span className="text-purple-400/60 font-mono text-[10px]">{c.createdAt}</span>
                        </div>
                        <p className="text-xs text-purple-100/90 leading-relaxed">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add Comment input */}
              <div className="pt-3 border-t border-purple-500/20 flex gap-2">
                <input
                  type="text"
                  placeholder="写下温暖友善的紫米心声..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(selectedPhoto.id)}
                  className="flex-1 px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={() => handleAddComment(selectedPhoto.id)}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>发送</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
