import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AUTHENTIC_AVATARS } from '../data/yangziMedia';
import {
  User,
  Shield,
  MapPin,
  Heart,
  Award,
  Sparkles,
  Edit3,
  Save,
  CheckCircle,
  Flag,
  Trash2,
  Camera,
  Upload,
  Link,
  RefreshCw,
  Star
} from 'lucide-react';

const REGIONS = [
  '全国紫米大厅',
  '北京紫米分会',
  '上海紫米分会',
  '浙江紫米分会',
  '广东紫米分会',
  '江苏紫米分会',
  '四川紫米分会',
  '山东紫米分会',
  '湖北紫米分会',
  '港澳台与海外紫米应援站'
];

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, showToast } = useApp();

  const [nickname, setNickname] = useState(profile?.nickname || '星河小紫米');
  const [region, setRegion] = useState(profile?.region || '北京紫米分会');
  const [bio, setBio] = useState(profile?.bio || '与紫同行，未来可期！陪伴小猴紫的第 2860 天 ✨');
  const [favoriteCharacter, setFavoriteCharacter] = useState(profile?.favoriteCharacter || '小夭 / 玟小六');
  const [avatar, setAvatar] = useState(profile?.avatar || AUTHENTIC_AVATARS[0].url);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Reports state for admin
  const [mockReports, setMockReports] = useState([
    { id: 'r1', targetType: '评论', targetId: 'c_99', reason: '存在拉踩言论', status: '待处理' },
    { id: 'r2', targetType: '相册', targetId: 'p_88', reason: '非杨紫相关引战图片', status: '已下架' }
  ]);

  // Direct quick file upload from profile card
  const handleDirectAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('请选择有效的图片文件（JPG/PNG/WebP/GIF）', 'warn');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('图片尺寸不能超过 8MB', 'warn');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatar(dataUrl);
        await updateProfile({ avatar: dataUrl });
        showToast('🎉 自定义头像已上传并全站同步！', 'success');
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      showToast('读取图片失败，请重试', 'warn');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      nickname,
      region,
      bio,
      favoriteCharacter,
      avatar
    });
    setIsEditing(false);
    showToast('资料名片更新成功！', 'success');
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) {
      showToast('请输入有效的图片链接', 'warn');
      return;
    }
    setAvatar(customUrlInput.trim());
    setCustomUrlInput('');
    showToast('已载入自定义网络头像预览', 'info');
  };

  const handleResolveReport = (id: string) => {
    setMockReports(prev => prev.filter(r => r.id !== id));
    showToast('举报已处理并移出队列！', 'success');
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Hidden file input for direct upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectAvatarUpload}
        className="hidden"
      />

      {/* Top Profile Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-purple-900/50 via-[#14082c] to-[#0c041d] border border-purple-500/40 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with glowing ring & Quick Upload button */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="点击直接更换头像">
              <img
                src={profile?.avatar || avatar}
                alt={profile?.nickname}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-purple-400/50 shadow-2xl shadow-purple-900/60 group-hover:brightness-90 transition-all"
              />
              <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                <Camera className="w-5 h-5 mb-1 text-fuchsia-300" />
                <span className="text-[11px] font-medium">点击换头像</span>
              </div>
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/75 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-fuchsia-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Quick Upload Local Avatar Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 rounded-full bg-purple-600/30 hover:bg-purple-600/60 text-purple-200 border border-purple-400/30 text-[11px] font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Upload className="w-3 h-3 text-fuchsia-300" />
              <span>上传本地头像</span>
            </button>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">
                    {profile?.nickname}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs border border-purple-400/30">
                    {profile?.role === 'admin' ? '🛡️ 星河管理员' : '紫米认证成员'}
                  </span>
                </div>
                <div className="text-xs text-purple-300/80 mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-fuchsia-300" />
                  <span>{profile?.region}</span>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-800/50 border border-purple-400/30 text-xs font-medium text-white flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>编辑资料 / 选剧照头像</span>
                </button>
              ) : null}
            </div>

            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-light">
              {profile?.bio}
            </p>

            {/* Badges showcase */}
            <div className="pt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {profile?.badges.map((b, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-purple-600/30 border border-purple-400/30 text-[11px] text-fuchsia-200 font-medium"
                >
                  ✦ {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-purple-500/20 text-center">
          <div>
            <div className="text-xs text-purple-400">星光值积分</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-yellow-300 mt-1">
              {profile?.points || 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-purple-400">连续签到天数</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-fuchsia-300 mt-1">
              {profile?.signDays || 1} 天
            </div>
          </div>
          <div>
            <div className="text-xs text-purple-400">本命影视角色</div>
            <div className="text-sm sm:text-base font-bold text-purple-100 mt-1 truncate">
              {profile?.favoriteCharacter || '小夭'}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#14082c] border border-purple-400/40 space-y-5 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <h2 className="text-base font-bold font-serif flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-fuchsia-400" />
              <span>修改紫米专属名片 & 头像配置</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-purple-400 hover:text-white"
            >
              收起
            </button>
          </div>

          {/* Avatar Section with 3 Options: Local File Upload, Preset Drama Stills, Direct URL */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-fuchsia-400" />
                <span>头像设置（支持本地图片上传 / 经典剧照 / 自定义网络URL）</span>
              </label>
              <span className="text-[11px] text-fuchsia-300 font-mono">
                当前预览
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt="Avatar preview"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-fuchsia-400/60 shadow-lg"
                />
              </div>

              <div className="flex-1 space-y-2 w-full">
                {/* Method 1: Local File Upload */}
                <div className="flex items-center gap-2">
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setAvatar(event.target.result as string);
                          showToast('本地图片载入成功，点击保存即可生效！', 'info');
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5 shadow"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>选择手机/电脑本地图片上传</span>
                  </button>
                  <span className="text-[10px] text-purple-400">支持 JPG, PNG, WebP (≤8MB)</span>
                </div>

                {/* Method 2: Direct URL */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="或粘贴自定义头像图片链接 (https://...)"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-1.5 rounded-xl bg-purple-800/60 hover:bg-purple-700/60 text-purple-200 text-xs"
                  >
                    应用链接
                  </button>
                </div>
              </div>
            </div>

            {/* Method 3: Official Authentic Drama Stills Presets */}
            <div className="pt-2 border-t border-purple-500/20">
              <label className="block text-[11px] text-purple-300 mb-2">
                或快速选用杨紫经典角色官方剧照头像：
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AUTHENTIC_AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setAvatar(av.url)}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all text-left ${
                      avatar === av.url
                        ? 'border-fuchsia-400 bg-purple-600/30 shadow-md ring-1 ring-fuchsia-400'
                        : 'border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/30'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-white truncate">{av.label}</div>
                      <div className="text-[9px] text-purple-300/70 truncate">{av.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-purple-300 mb-1">紫米昵称</label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs text-purple-300 mb-1">所属地区分会</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-xs"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-purple-300 mb-1">最钟爱的影视角色</label>
            <input
              type="text"
              value={favoriteCharacter}
              onChange={(e) => setFavoriteCharacter(e.target.value)}
              placeholder="例如：小夭、玟小六、何惟芳、佟年、锦觅、麦承欢"
              className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-purple-300 mb-1">个性签名 / 陪伴感言</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-purple-950/40 text-purple-300 text-xs hover:bg-purple-900/40"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存修改并同步</span>
            </button>
          </div>
        </form>
      )}

      {/* Admin Moderation & Community Security Panel */}
      <div className="rounded-3xl bg-[#120726]/80 border border-purple-500/30 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-fuchsia-400" />
            <h2 className="text-base font-bold text-white font-serif">社区内容审核与清朗安全管理</h2>
          </div>
          <span className="text-[10px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/30">
            清朗星河守护
          </span>
        </div>

        <p className="text-xs text-purple-200/70 leading-relaxed">
          紫约星河社区配备自动化违规关键词过滤、反刷分频控、图片合规审核与人工举报复核机制。维护温暖、理性、充满爱的杨紫粉丝家园。
        </p>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-purple-300">举报待审核队列 ({mockReports.length})：</div>
          {mockReports.length === 0 ? (
            <div className="text-xs text-purple-400/70 p-3 rounded-xl bg-purple-950/30 text-center">
              暂无待处理举报，星河环境清朗安宁！
            </div>
          ) : (
            mockReports.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white">【{r.targetType}】</span>
                  <span className="text-purple-300 ml-1">原因：{r.reason}</span>
                </div>
                <button
                  onClick={() => handleResolveReport(r.id)}
                  className="px-3 py-1 rounded-lg bg-purple-600/40 hover:bg-purple-600 text-purple-200 text-[11px]"
                >
                  完成复核
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
