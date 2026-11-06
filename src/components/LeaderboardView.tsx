import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Award,
  Calendar,
  Gift,
  Flame,
  Star,
  CheckCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { profile, checkIn, showToast } = useApp();
  const [rankings, setRankings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'points' | 'badges'>('points');

  const allBadges = [
    {
      id: 'b1',
      name: '初代紫米',
      desc: '陪伴杨紫一路成长、守望相助的骨灰级粉丝专属勋章',
      icon: '💜',
      color: 'from-purple-600 to-indigo-600'
    },
    {
      id: 'b2',
      name: '长相思剧粉头子',
      desc: '清水镇医馆名誉主事，熟知小夭、璟、柳、玹一切羁绊',
      icon: '🦊',
      color: 'from-pink-600 to-purple-600'
    },
    {
      id: 'b3',
      name: '国色芳华见证官',
      desc: '见证何惟芳盛唐芳华绝代，百花匠人挚友',
      icon: '🌸',
      color: 'from-amber-600 to-rose-600'
    },
    {
      id: 'b4',
      name: '雀圣紫米',
      desc: '在紫约麻将桌上达成清一色或七对大满贯',
      icon: '🀄',
      color: 'from-emerald-600 to-teal-600'
    },
    {
      id: 'b5',
      name: '卧底神探',
      desc: '在谁是卧底游戏中成功指认潜伏卧底累计 5 次',
      icon: '🕵️‍♀️',
      color: 'from-violet-600 to-indigo-700'
    },
    {
      id: 'b6',
      name: '星愿守护者',
      desc: '累计为小猴紫投递祝福或点亮生日星光超过 50 次',
      icon: '✨',
      color: 'from-yellow-600 to-amber-600'
    }
  ];

  const fetchRankings = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.success && data.rankings) {
        setRankings(data.rankings);
      }
    } catch (e) {
      console.error('Fetch rankings failed:', e);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-900/40 via-violet-950/50 to-indigo-950/40 border border-purple-500/30 p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs border border-purple-400/30 mb-2">
            <Trophy className="w-3.5 h-3.5 text-yellow-300" />
            <span>荣耀星河 · 紫米长情陪伴见证</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">积分排行榜与荣誉勋章</h1>
          <p className="text-xs sm:text-sm text-purple-200/70 mt-1 max-w-xl">
            每日签到、参与社区游戏、点赞相册与投递星愿均可积累星光值，解锁稀有粉丝专属勋章！
          </p>
        </div>

        <button
          onClick={() => checkIn()}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-purple-900/40 border border-purple-300/30 active:scale-95 transition-all"
        >
          <Gift className="w-4 h-4 text-yellow-300" />
          <span>每日签到打卡 (+50星光)</span>
        </button>
      </div>

      {/* Daily Check-in Streak Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 to-indigo-950/40 border border-purple-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 shrink-0">
            <Calendar className="w-6 h-6 text-yellow-200" />
          </div>
          <div>
            <div className="text-xs text-purple-300">当前已连续陪伴签到</div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-white flex items-center gap-2">
              <span className="font-mono text-yellow-300">{profile?.signDays || 1}</span>
              <span className="text-sm text-purple-300">天</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30">
                长情同行
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center sm:text-right">
            <div className="text-xs text-purple-300">我的星光值积分</div>
            <div className="text-2xl font-bold font-mono text-fuchsia-300">
              {profile?.points || 0}
            </div>
          </div>
          <button
            onClick={() => checkIn()}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md active:scale-95"
          >
            立即打卡
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('points')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'points'
              ? 'bg-purple-600 text-white border border-purple-400/50 shadow-md'
              : 'bg-purple-950/40 text-purple-200/70 hover:bg-purple-900/40'
          }`}
        >
          星光积分总榜
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'badges'
              ? 'bg-purple-600 text-white border border-purple-400/50 shadow-md'
              : 'bg-purple-950/40 text-purple-200/70 hover:bg-purple-900/40'
          }`}
        >
          紫米荣誉勋章墙 ({allBadges.length})
        </button>
      </div>

      {/* Tab 1: Leaderboard */}
      {activeTab === 'points' && (
        <div className="rounded-3xl overflow-hidden bg-purple-950/30 border border-purple-500/30 shadow-2xl backdrop-blur-xl">
          <div className="p-4 sm:p-5 border-b border-purple-500/20 flex items-center justify-between text-xs text-purple-300 font-semibold">
            <span>排名 / 紫米成员</span>
            <div className="flex items-center gap-8 pr-2">
              <span className="hidden sm:inline">地区分会</span>
              <span>累计星光值</span>
            </div>
          </div>

          <div className="divide-y divide-purple-500/10">
            {rankings.map((user) => (
              <div
                key={user.rank}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-purple-900/20 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      user.rank === 1
                        ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-500/40'
                        : user.rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'text-purple-300 bg-purple-900/40'
                    }`}
                  >
                    {user.rank}
                  </div>

                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-purple-400/30"
                  />

                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.badge && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-600/30 text-[10px] text-fuchsia-300 border border-purple-400/30 hidden sm:inline">
                          {user.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-purple-300/70 mt-0.5 sm:hidden">{user.region}</div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <span className="text-xs text-purple-300/80 hidden sm:inline">{user.region}</span>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-yellow-300">
                      {user.points.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-purple-400 ml-1">星光</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Badges */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allBadges.map((badge) => {
            const isUnlocked = profile?.badges.includes(badge.name);
            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isUnlocked
                    ? 'bg-purple-900/40 border-purple-400/60 shadow-lg shadow-purple-900/30'
                    : 'bg-purple-950/20 border-purple-500/20 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${badge.color} flex items-center justify-center text-2xl shadow-md`}>
                      {badge.icon}
                    </div>
                    {isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        已佩戴
                      </span>
                    ) : (
                      <span className="text-[10px] text-purple-400">待解锁</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white font-serif">{badge.name}</h3>
                  <p className="text-xs text-purple-200/70 leading-relaxed">{badge.desc}</p>
                </div>

                <div className="pt-2 border-t border-purple-500/20 text-[10px] text-purple-400 font-mono">
                  {isUnlocked ? '✦ 荣誉已点亮' : '参与对应活动即可获取'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
