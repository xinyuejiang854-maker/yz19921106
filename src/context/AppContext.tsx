import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { socket } from '../utils/socket';

export type NavTab = 'home' | 'gallery' | 'wishes' | 'chat' | 'larp' | 'games' | 'leaderboard' | 'profile';

interface AppContextType {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  profile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  starlightStats: {
    starlightPoints: number;
    companionDays: number;
    lightUpCount: number;
    wishesCount: number;
  };
  onlineCount: number;
  lightUpStar: () => Promise<void>;
  checkIn: () => Promise<string>;
  showToast: (msg: string, type?: 'info' | 'success' | 'warn') => void;
  toast: { message: string; type: 'info' | 'success' | 'warn' } | null;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [starlightStats, setStarlightStats] = useState({
    starlightPoints: 5201314,
    companionDays: 3280,
    lightUpCount: 89420,
    wishesCount: 6688
  });
  const [onlineCount, setOnlineCount] = useState<number>(368);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warn' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  };

  const refreshProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile');
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.error('Fetch profile err:', e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/birthday/support');
      const data = await res.json();
      if (data.success && data.stats) {
        setStarlightStats(data.stats);
      }
    } catch (e) {
      console.error('Fetch stats err:', e);
    }
  };

  useEffect(() => {
    refreshProfile();
    fetchStats();
    socket.connect();

    const unsubOnline = socket.on('online_count', (data) => {
      if (data.count) setOnlineCount(data.count);
    });

    return () => {
      unsubOnline();
    };
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        showToast('个人资料已保存至紫约星河！', 'success');
      }
    } catch (e) {
      showToast('保存失败，请稍后重试', 'warn');
    }
  };

  const lightUpStar = async () => {
    try {
      // Fire dreamy purple & gold confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c084fc', '#e879f9', '#fde047', '#a855f7', '#ffffff']
      });

      const res = await fetch('/api/birthday/lightup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStarlightStats(data.stats);
        if (profile) {
          setProfile({ ...profile, points: data.userPoints });
        }
        showToast('✨ 点亮星光成功！杨紫生日星河加持 +10 星光值！', 'success');
      }
    } catch (e) {
      showToast('点亮星光网络异常', 'warn');
    }
  };

  const checkIn = async (): Promise<string> => {
    try {
      const res = await fetch('/api/checkin', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 80,
          spread: 80,
          colors: ['#a855f7', '#d8b4fe', '#fbcfe8', '#fef08a']
        });
        refreshProfile();
        showToast(data.message, 'success');
        return data.message;
      } else {
        showToast(data.message, 'info');
        return data.message;
      }
    } catch (e) {
      showToast('签到失败，请稍后重试', 'warn');
      return '签到失败';
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        profile,
        updateProfile,
        starlightStats,
        onlineCount,
        lightUpStar,
        checkIn,
        showToast,
        toast,
        refreshProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
