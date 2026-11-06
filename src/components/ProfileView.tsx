import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Trash2
} from 'lucide-react';

const PRESET_AVATARS = [
  { label: '小夭绝美回眸', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80' },
  { label: '盛唐惟芳莳花', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80' },
  { label: '红毯高定星光', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80' },
  { label: '元气甜妹佟年', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80' },
  { label: '上古菡萏颜淡', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80' }
];

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
  const [avatar, setAvatar] = useState(profile?.avatar || PRESET_AVATARS[0].url);
  const [isEditing, setIsEditing] = useState(false);
  const [adminTab, setAdminTab] = useState<'profile' | 'moderation'>('profile');

  // Reports state for admin
  const [mockReports, setMockReports] = useState([
    { id: 'r1', targetType: '评论', targetId: 'c_99', reason: '存在拉踩言论', status: '待处理' },
    { id: 'r2', targetType: '相册', targetId: 'p_88', reason: '模糊非杨紫相关广告', status: '已下架' }
  ]);

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
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResolveReport = (id: string) => {
    setMockReports(prev => prev.filter(r => r.id !== id));
    showToast('举报已处理并移出队列！', 'success');
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Top Profile Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-purple-900/50 via-[#14082c] to-[#0c041d] border border-purple-500/40 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with glowing ring */}
          <div className="relative group">
            <img
              src={profile?.avatar || avatar}
              alt={profile?.nickname}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-purple-400/50 shadow-2xl shadow-purple-900/60"
            />
            {isEditing && (
              <label className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-xs text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                换头像
                <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
              </label>
            )}
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
                  <span>编辑资料</span>
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
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#14082c] border border-purple-400/40 space-y-4 text-white">
          <h2 className="text-base font-bold font-serif flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-fuchsia-400" />
            <span>修改紫米专属名片</span>
          </h2>

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
              placeholder="例如：小夭、玟小六、何惟芳、佟年、锦觅"
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

          <div>
            <label className="block text-xs text-purple-300 mb-1.5">选择经典剧照头像预设</label>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setAvatar(av.url)}
                  className={`relative rounded-full shrink-0 border-2 transition-all ${
                    avatar === av.url ? 'border-yellow-400 ring-2 ring-purple-400 scale-105' : 'border-transparent'
                  }`}
                >
                  <img src={av.url} alt={av.label} className="w-12 h-12 rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-purple-950/40 text-purple-300 text-xs"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存修改</span>
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
