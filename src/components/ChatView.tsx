import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';
import { socket } from '../utils/socket';
import {
  MessageSquare,
  Users,
  Send,
  Smile,
  Shield,
  MapPin,
  Sparkles,
  Radio
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const { profile, showToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string>('national');
  const [inputText, setInputText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const channels = [
    { id: 'national', name: '全国星河大厅', desc: '全网紫米大本营' },
    { id: 'huabei', name: '华北星区', desc: '北京 / 天津 / 河北 / 山西' },
    { id: 'huadong', name: '华东星区', desc: '上海 / 浙江 / 江苏 / 山东' },
    { id: 'huanan', name: '华南星区', desc: '广东 / 深圳 / 福建 / 海南' },
    { id: 'xinan', name: '华中与西南', desc: '四川 / 重庆 / 湖北 / 湖南' },
    { id: 'overseas', name: '港澳台与海外', desc: '全球紫米应援站' }
  ];

  const yangZiStickers = [
    { name: '锦觅吃葡萄', icon: '🍇', text: '[锦觅吃葡萄：甜透心扉]' },
    { name: '佟年比心', icon: '💖', text: '[佟年比心：一辈子那么长我都给你]' },
    { name: '小夭啃鸡腿', icon: '🍗', text: '[小夭啃鸡腿：回春堂开饭啦]' },
    { name: '何惟芳莳花', icon: '🌸', text: '[何惟芳莳花：芳华绝代盛唐富贵]' },
    { name: '小猴紫大笑', icon: '🐒', text: '[小猴紫哈哈大笑：超元气]' },
    { name: '大王姬威严', icon: '👑', text: '[大王姬小夭：有力自保有人相依]' },
    { name: '紫米为你撑腰', icon: '💜', text: '[紫米为你撑腰：一路相随]' },
    { name: '祝小猴紫生日快乐', icon: '🎂', text: '[11.06 生日快乐：岁岁常欢愉]' }
  ];

  const onlinePurpleRiceUsers = [
    { name: '紫约星河巡查使', region: '北京分会', badge: '管理员', avatar: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Lost_You_Forever_promotional_poster.jpg' },
    { name: '夭夭的九尾狐', region: '浙江分会', badge: '长相思剧粉', avatar: 'https://upload.wikimedia.org/wikipedia/zh/9/92/%E5%9B%BD%E8%89%B2%E8%8A%B3%E5%8D%8E%E6%B5%B7%E6%8A%A5.jpg' },
    { name: '盛唐紫牡丹', region: '陕西分会', badge: '芳华见证官', avatar: 'https://upload.wikimedia.org/wikipedia/en/6/61/Xiangmichenchen.jpg' },
    { name: '佟年小鱿鱼', region: '上海分会', badge: '亲爱的高级粉', avatar: 'https://upload.wikimedia.org/wikipedia/en/e/ed/Go_Go_Squid%21.jpg' },
    { name: '颜淡戏菡萏', region: '四川分会', badge: '沉香仙子', avatar: 'https://upload.wikimedia.org/wikipedia/en/6/61/Immortal_Samsara.jpg' },
    { name: '承欢相伴', region: '广东分会', badge: '承欢记粉', avatar: 'https://upload.wikimedia.org/wikipedia/zh/5/53/Best_Choice_Ever_%28%E6%89%BF%E6%AC%A2%E8%AE%B0%29.jpeg' }
  ];

  const fetchMessages = async (ch: string) => {
    try {
      const res = await fetch(`/api/chat/messages?channel=${ch}`);
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Fetch chat messages err:', e);
    }
  };

  useEffect(() => {
    fetchMessages(currentChannel);
    socket.send({ type: 'chat_switch_channel', channel: currentChannel });

    const unsub = socket.on('chat_new_message', (payload) => {
      if (payload.message && (payload.message.channel === currentChannel || payload.message.channel === 'national')) {
        setMessages((prev) => [...prev, payload.message]);
      }
    });

    return () => {
      unsub();
    };
  }, [currentChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string, type: 'text' | 'sticker' = 'text') => {
    if (!content.trim()) return;

    const fallbackAvatar = 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Yang_Zi_at_Ryo_band_promotion%2C_Wuhan_of_China%2C_12_April_2019.jpg';
    const payload = {
      type: 'chat_message',
      channel: currentChannel,
      content: content.trim(),
      messageType: type,
      userId: profile?.id || 'user_current',
      name: profile?.nickname || '星河小紫米',
      avatar: profile?.avatar || fallbackAvatar
    };

    socket.send(payload);

    // Optimistic local update
    const optimisticMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      channel: currentChannel,
      senderId: profile?.id || 'user_current',
      senderName: profile?.nickname || '星河小紫米',
      senderAvatar: profile?.avatar || fallbackAvatar,
      senderRegion: profile?.region || '全国紫米大厅',
      senderBadge: profile?.badges[0] || '紫米',
      content: content.trim(),
      type,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setShowStickers(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] min-h-[550px] rounded-3xl bg-[#0f0622]/90 border border-purple-500/30 overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col md:flex-row">
      {/* Left Sidebar: Channels */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-purple-500/20 bg-purple-950/30 p-3 sm:p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2 py-1 text-purple-200">
            <Radio className="w-4 h-4 text-fuchsia-400 animate-pulse" />
            <h2 className="text-sm font-bold tracking-wider font-serif">全国星区频道</h2>
          </div>

          <div className="space-y-1">
            {channels.map((ch) => {
              const active = currentChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setCurrentChannel(ch.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex flex-col ${
                    active
                      ? 'bg-purple-600/30 border border-purple-400/40 text-white shadow-md'
                      : 'text-purple-300/70 hover:bg-purple-900/30 hover:text-purple-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{ch.name}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" />}
                  </div>
                  <span className="text-[10px] text-purple-400/60 truncate mt-0.5">{ch.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Community Rules Notice */}
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-purple-300/70 space-y-1">
          <div className="flex items-center gap-1 font-semibold text-purple-200 text-xs">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>紫米文明聊天守则</span>
          </div>
          <p>理智追星，友善包容，严禁人身攻击与恶意刷屏，共同维护小猴紫温暖星河！</p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-[#130827] to-[#0d051a]">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-purple-500/20 flex items-center justify-between bg-purple-950/20">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-fuchsia-400">#</span>
              {channels.find((c) => c.id === currentChannel)?.name}
            </h2>
            <div className="text-[11px] text-purple-300/60">
              {channels.find((c) => c.id === currentChannel)?.desc} · 实时全双工在线
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-900/30 px-2.5 py-1 rounded-full border border-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>实时同步中</span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isMe = m.senderId === (profile?.id || 'user_current');
            const isSystem = m.type === 'system';

            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center my-2">
                  <div className="px-3.5 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-[11px] text-purple-300 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{m.content}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <img
                  src={m.senderAvatar}
                  alt={m.senderName}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-purple-400/40 shrink-0 mt-0.5"
                />
                <div className={`space-y-1 max-w-[78%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-300/80">
                    <span className="font-semibold text-purple-200">{m.senderName}</span>
                    {m.senderBadge && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-800/40 text-[9px] text-fuchsia-300 border border-purple-500/30">
                        {m.senderBadge}
                      </span>
                    )}
                    <span className="text-[10px] text-purple-400/60 font-mono">{m.createdAt}</span>
                  </div>

                  <div
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none border border-purple-400/30'
                        : 'bg-purple-950/60 text-purple-100 rounded-tl-none border border-purple-500/30'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Sticker Picker Drawer */}
        {showStickers && (
          <div className="p-3 bg-[#170a31] border-t border-purple-500/30 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in">
            {yangZiStickers.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s.text, 'sticker')}
                className="px-2.5 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-800/40 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2 transition-all hover:scale-102"
              >
                <span className="text-base">{s.icon}</span>
                <span className="truncate">{s.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-purple-500/20 bg-purple-950/30 flex items-center gap-2">
          <button
            onClick={() => setShowStickers(!showStickers)}
            className={`p-2 rounded-xl border transition-colors ${
              showStickers
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-purple-950/60 text-purple-300 border-purple-500/30 hover:bg-purple-900/40'
            }`}
            title="杨紫专属角色贴图"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            type="text"
            placeholder={`在 #${channels.find((c) => c.id === currentChannel)?.name} 畅聊紫米故事...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-400 placeholder:text-purple-400/40"
          />

          <button
            onClick={() => handleSendMessage(inputText)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium shadow-md shadow-purple-900/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">发送</span>
          </button>
        </div>
      </div>

      {/* Right Sidebar: Online Purple Rice Roster */}
      <div className="hidden lg:flex w-64 border-l border-purple-500/20 bg-purple-950/20 p-4 flex-col justify-between shrink-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-purple-200">
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider font-serif">
              <Users className="w-4 h-4 text-fuchsia-400" />
              <span>在线紫米成员</span>
            </div>
            <span className="text-[11px] font-mono text-fuchsia-300">
              {onlinePurpleRiceUsers.length + 1}
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
            {/* Myself */}
            <div className="p-2 rounded-xl bg-purple-800/30 border border-purple-400/30 flex items-center gap-2.5">
              <img
                src={profile?.avatar}
                alt="我"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-300"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                  <span>{profile?.nickname}</span>
                  <span className="text-[9px] text-fuchsia-300">(我)</span>
                </div>
                <div className="text-[10px] text-purple-300/70 truncate">{profile?.region}</div>
              </div>
            </div>

            {/* Other online fans */}
            {onlinePurpleRiceUsers.map((u, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center gap-2.5 hover:bg-purple-900/30 transition-colors"
              >
                <div className="relative">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-500/30"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#0f0622]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-purple-100 truncate flex items-center gap-1">
                    <span>{u.name}</span>
                  </div>
                  <div className="text-[10px] text-purple-400/70 flex items-center justify-between">
                    <span>{u.region}</span>
                    <span className="text-fuchsia-300/80">{u.badge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 text-[10px] text-purple-400/60 text-center border-t border-purple-500/20">
          全网紫米心连心 💜 紫约星河
        </div>
      </div>
    </div>
  );
};
