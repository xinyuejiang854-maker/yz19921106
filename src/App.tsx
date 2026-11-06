import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { StarryBackground } from './components/StarryBackground';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { GalleryView } from './components/GalleryView';
import { WishWallView } from './components/WishWallView';
import { ChatView } from './components/ChatView';
import { LarpView } from './components/LarpView';
import { GameLobbyView } from './components/GameLobbyView';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { Sparkles, Heart } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentTab, setCurrentTab, toast } = useApp();

  useEffect(() => {
    // Check URL parameters for tab navigation
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['home', 'gallery', 'wishes', 'chat', 'larp', 'games', 'leaderboard', 'profile'].includes(tabParam)) {
      setCurrentTab(tabParam as any);
    }
  }, []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative selection:bg-purple-600 selection:text-white">
      {/* Interactive Dreamy Starry Background Canvas */}
      <StarryBackground />

      {/* Fan Non-official Community Disclaimer Notice */}
      <DisclaimerBanner />

      {/* Main Glassmorphic Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 relative z-10">
        {currentTab === 'home' && <HomeView />}
        {currentTab === 'gallery' && <GalleryView />}
        {currentTab === 'wishes' && <WishWallView />}
        {currentTab === 'chat' && <ChatView />}
        {currentTab === 'larp' && <LarpView />}
        {currentTab === 'games' && <GameLobbyView />}
        {currentTab === 'leaderboard' && <LeaderboardView />}
        {currentTab === 'profile' && <ProfileView />}
      </main>

      {/* Elegant Footer */}
      <footer className="relative z-10 border-t border-purple-500/20 bg-[#090317]/90 backdrop-blur-md py-8 text-center text-xs text-purple-300/70 space-y-3">
        <div className="flex items-center justify-center gap-2 text-purple-200 font-serif font-bold text-sm">
          <span>🌙 紫约星河 ZI LAND</span>
          <span className="text-purple-400">·</span>
          <span>杨紫粉丝专属社交娱乐星河</span>
        </div>
        <p className="max-w-2xl mx-auto px-4 leading-relaxed text-[11px] text-purple-300/60">
          执紫之手，共赴璀璨星河。本站为紫米自发非官方社区，与杨紫本人及其团队无商业隶属关系。
          倡导文明追星、理智应援、专注优秀作品，守护最纯粹的光影热爱。💜
        </p>
        <div className="text-[10px] text-purple-400/50 font-mono">
          © 2026 ZI LAND · All for Yang Zi & Purple Rice Fans · 11.06 生日应援
        </div>
      </footer>

      {/* Global Toast Notification */}
      {toast && (
        <aside
          aria-label="系统通知"
          className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 pointer-events-none"
        >
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-purple-900/90 border-purple-400/60 text-white shadow-purple-900/50'
                : toast.type === 'warn'
                ? 'bg-amber-950/90 border-amber-500/60 text-amber-200 shadow-amber-950/50'
                : 'bg-indigo-950/90 border-indigo-500/60 text-indigo-100 shadow-indigo-950/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-fuchsia-300 shrink-0 animate-pulse" />
            <span>{toast.message}</span>
          </div>
        </aside>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
