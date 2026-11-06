import React, { useState } from 'react';
import { useApp, NavTab } from '../context/AppContext';
import {
  Sparkles,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Gamepad2,
  Trophy,
  User,
  Menu,
  X,
  Compass,
  Gift
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentTab, setCurrentTab, profile, onlineCount, checkIn } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: '星河首页', icon: <Compass className="w-4 h-4" /> },
    { id: 'gallery', label: '星光相册', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'wishes', label: '星愿祝福墙', icon: <Heart className="w-4 h-4" /> },
    { id: 'chat', label: '紫米聊天室', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'larp', label: '多人剧本杀', icon: <Users className="w-4 h-4" /> },
    { id: 'games', label: '联机游戏大厅', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'leaderboard', label: '榜单与勋章', icon: <Trophy className="w-4 h-4" /> },
    { id: 'profile', label: '个人主页', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0c051a]/85 backdrop-blur-md border-b border-purple-500/20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => {
            setCurrentTab('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 via-violet-600 to-fuchsia-400 p-[1.5px] shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#110626] rounded-[10px] flex items-center justify-center">
              <span className="text-lg">🌙</span>
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fuchsia-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-wider bg-gradient-to-r from-purple-200 via-fuchsia-200 to-white bg-clip-text text-transparent font-serif">
                紫约星河
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                ZI LAND
              </span>
            </div>
            <div className="text-[10px] text-purple-300/60 font-light hidden sm:block">
              杨紫粉丝专属社交娱乐星河 · 11.06 生日应援
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white bg-purple-600/30 shadow-inner shadow-purple-400/20 border border-purple-400/40'
                    : 'text-purple-200/70 hover:text-purple-100 hover:bg-purple-900/30'
                }`}
              >
                <span className={isActive ? 'text-fuchsia-300' : 'text-purple-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right side controls: Online count, checkin, user badge */}
        <div className="flex items-center gap-2.5">
          {/* Online badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-purple-300">{onlineCount}</span>
            <span className="text-purple-300/70">紫米在线</span>
          </div>

          {/* Quick Check-in Button */}
          <button
            onClick={() => checkIn()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-medium text-white shadow-md shadow-purple-900/30 transition-all active:scale-95 border border-purple-400/30"
          >
            <Gift className="w-3.5 h-3.5 text-yellow-300" />
            <span>每日签到</span>
          </button>

          {/* User Profile avatar preview */}
          {profile && (
            <button
              onClick={() => setCurrentTab('profile')}
              className="flex items-center gap-2 p-1 pl-2 rounded-full bg-purple-900/30 border border-purple-500/30 hover:border-purple-400 transition-all text-left"
              title="查看紫米个人主页"
            >
              <div className="hidden md:block">
                <div className="text-xs font-medium text-purple-100 max-w-[80px] truncate">
                  {profile.nickname}
                </div>
                <div className="text-[10px] text-fuchsia-300 font-mono">
                  {profile.points} 星光
                </div>
              </div>
              <img
                src={profile.avatar}
                alt={profile.nickname}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-400/40"
              />
            </button>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-purple-900/40 text-purple-200 hover:text-white lg:hidden border border-purple-500/30"
            aria-label="打开菜单"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#110729]/95 border-b border-purple-500/30 px-4 py-3 space-y-1 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between py-2 border-b border-purple-500/20 mb-2">
            <div className="text-xs text-purple-300">
              在线紫米：<span className="font-mono text-fuchsia-300">{onlineCount}</span> 人
            </div>
            <div className="text-xs text-purple-300">
              星光值：<span className="font-mono text-yellow-300">{profile?.points || 0}</span>
            </div>
          </div>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600/30 text-white border border-purple-400/40'
                    : 'text-purple-200/80 hover:bg-purple-900/30 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-fuchsia-300' : 'text-purple-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
