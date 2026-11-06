import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LarpRoom, LarpPlayer, LarpClue } from '../types';
import { LARP_SCRIPTS } from '../data/larpScripts';
import { socket } from '../utils/socket';
import {
  Users,
  Search,
  Key,
  Shield,
  Sparkles,
  BookOpen,
  Vote,
  Award,
  ChevronRight,
  UserPlus,
  Play,
  RotateCcw,
  CheckCircle,
  Eye,
  Lock
} from 'lucide-react';

export const LarpView: React.FC = () => {
  const { profile, showToast } = useApp();
  const [rooms, setRooms] = useState<LarpRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<LarpRoom | null>(null);
  const [selectedScriptId, setSelectedScriptId] = useState<string>(LARP_SCRIPTS[0].id);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [newRoomName, setNewRoomName] = useState('清水镇长相思紫米推理房');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // In-room state
  const [myVote, setMyVote] = useState<string>('');
  const [revealedClues, setRevealedClues] = useState<Set<string>>(new Set(['c_1', 'c_2']));

  const activeScript = LARP_SCRIPTS.find(s => s.id === (currentRoom?.scriptId || selectedScriptId)) || LARP_SCRIPTS[0];

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/larp/rooms');
      const data = await res.json();
      if (data.success && data.rooms) {
        setRooms(data.rooms);
        if (currentRoom) {
          const updated = data.rooms.find((r: LarpRoom) => r.id === currentRoom.id);
          if (updated) setCurrentRoom(updated);
        }
      }
    } catch (e) {
      console.error('Fetch larp rooms err:', e);
    }
  };

  useEffect(() => {
    fetchRooms();

    const unsub = socket.on('larp_room_updated', (data) => {
      if (data.room && currentRoom && data.room.id === currentRoom.id) {
        setCurrentRoom(data.room);
      }
    });

    return () => {
      unsub();
    };
  }, [currentRoom?.id]);

  const handleCreateRoom = async () => {
    try {
      const res = await fetch('/api/larp/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId: selectedScriptId,
          name: newRoomName.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.room) {
        setCurrentRoom(data.room);
        setIsCreatingRoom(false);
        showToast('剧本杀房间创建成功！', 'success');
      }
    } catch (e) {
      showToast('创建房间失败', 'warn');
    }
  };

  const handleJoinByCode = () => {
    const code = inviteCodeInput.trim();
    if (!code) {
      showToast('请输入房间邀请码', 'warn');
      return;
    }
    const found = rooms.find(r => r.inviteCode === code);
    if (found) {
      setCurrentRoom(found);
      showToast(`成功加入【${found.name}】！`, 'success');
    } else {
      showToast('未找到该邀请码对应的房间', 'warn');
    }
  };

  const handleAddBotPlayer = () => {
    if (!currentRoom) return;
    const botNames = ['紫米小夭_01', '青丘璟心_02', '九头相柳_03', '西炎玱玹_04', '高辛阿念_05'];
    const availableRole = activeScript.roles.find(
      r => !currentRoom.players.some(p => p.roleId === r.id)
    );
    if (!availableRole) {
      showToast('角色席位已满！', 'info');
      return;
    }

    const botId = `bot_${Date.now()}`;
    const botAvatars = [
      'https://upload.wikimedia.org/wikipedia/en/4/4d/Lost_You_Forever_promotional_poster.jpg',
      'https://upload.wikimedia.org/wikipedia/zh/9/92/%E5%9B%BD%E8%89%B2%E8%8A%B3%E5%8D%8E%E6%B5%B7%E6%8A%A5.jpg',
      'https://upload.wikimedia.org/wikipedia/en/6/61/Xiangmichenchen.jpg',
      'https://upload.wikimedia.org/wikipedia/en/e/ed/Go_Go_Squid%21.jpg'
    ];
    const newBot: LarpPlayer = {
      id: botId,
      name: botNames[currentRoom.players.length % botNames.length],
      avatar: botAvatars[currentRoom.players.length % botAvatars.length],
      roleId: availableRole.id,
      roleName: availableRole.name,
      roleDescription: availableRole.title,
      isHost: false,
      isReady: true,
      isBot: true
    };

    const updated = {
      ...currentRoom,
      players: [...currentRoom.players, newBot]
    };
    setCurrentRoom(updated);
    socket.send({ type: 'larp_state_update', roomId: currentRoom.id, updates: { players: updated.players } });
    showToast(`紫米伴侣【${newBot.name}】已就位！`, 'success');
  };

  const handleSelectRole = (roleId: string) => {
    if (!currentRoom) return;
    const role = activeScript.roles.find(r => r.id === roleId);
    if (!role) return;

    const myId = profile?.id || 'user_current';
    const updatedPlayers = currentRoom.players.map(p => {
      if (p.id === myId) {
        return {
          ...p,
          roleId: role.id,
          roleName: role.name,
          roleDescription: role.title
        };
      }
      return p;
    });

    // If not in players list, add myself
    if (!updatedPlayers.some(p => p.id === myId)) {
      updatedPlayers.push({
        id: myId,
        name: profile?.nickname || '星河小紫米',
        avatar: profile?.avatar || 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Yang_Zi_at_Ryo_band_promotion%2C_Wuhan_of_China%2C_12_April_2019.jpg',
        roleId: role.id,
        roleName: role.name,
        roleDescription: role.title,
        isHost: currentRoom.hostId === myId,
        isReady: true
      });
    }

    const updated = { ...currentRoom, players: updatedPlayers };
    setCurrentRoom(updated);
    socket.send({ type: 'larp_state_update', roomId: currentRoom.id, updates: { players: updatedPlayers } });
    showToast(`已选择角色【${role.name}】！`, 'success');
  };

  const handleSwitchPhase = (nextStatus: LarpRoom['status']) => {
    if (!currentRoom) return;
    const updated = { ...currentRoom, status: nextStatus };
    setCurrentRoom(updated);
    socket.send({ type: 'larp_state_update', roomId: currentRoom.id, updates: { status: nextStatus } });
    showToast(`剧本杀阶段切换至：${getPhaseLabel(nextStatus)}`, 'info');
  };

  const handleCastVote = (targetPlayerId: string) => {
    if (!currentRoom) return;
    const myId = profile?.id || 'user_current';
    const newVotes = { ...currentRoom.votes, [myId]: targetPlayerId };
    setMyVote(targetPlayerId);

    // Bot automatic vote for realism
    currentRoom.players.filter(p => p.isBot).forEach(bot => {
      if (!newVotes[bot.id]) {
        // Vote random player or culprit
        const others = currentRoom.players.filter(p => p.id !== bot.id);
        const randomTarget = others[Math.floor(Math.random() * others.length)];
        newVotes[bot.id] = randomTarget.id;
      }
    });

    const updated = { ...currentRoom, votes: newVotes };
    setCurrentRoom(updated);
    socket.send({ type: 'larp_state_update', roomId: currentRoom.id, updates: { votes: newVotes } });
    showToast('投票已提交！', 'success');
  };

  const getPhaseLabel = (s: LarpRoom['status']) => {
    switch (s) {
      case 'waiting': return '1. 备战就绪 & 选角';
      case 'intro': return '2. 剧本阅读 & 身世私密';
      case 'investigate': return '3. 现场搜证 & 破译线索';
      case 'discuss': return '4. 圆桌辩论 & 集中推理';
      case 'vote': return '5. 最终指认 & 投票真凶';
      case 'ended': return '6. 真相揭晓 & 结局复盘';
    }
  };

  const myId = profile?.id || 'user_current';
  const myPlayer = currentRoom?.players.find(p => p.id === myId);
  const myRole = activeScript.roles.find(r => r.id === myPlayer?.roleId);

  return (
    <div className="space-y-8 pb-16">
      {/* If not in a room: Show Script Lobby & Rooms */}
      {!currentRoom ? (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-950/50 to-purple-950/40 border border-purple-500/30 p-6 sm:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs border border-purple-400/30 mb-2">
                <Users className="w-3.5 h-3.5 text-fuchsia-300" />
                <span>沉浸式角色扮演 · 杨紫影视宇宙经典还原</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">多人推理剧本杀</h1>
              <p className="text-xs sm:text-sm text-purple-200/70 mt-1 max-w-xl">
                化身小夭、涂山璟、相柳、何惟芳等经典角色，在清水镇与大唐盛市探寻离奇谜案，搜证推理，指认真凶！
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsCreatingRoom(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-purple-900/40 border border-purple-300/30 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>创建剧本房间</span>
              </button>
            </div>
          </div>

          {/* Quick Join by Code */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-purple-200">
              <Key className="w-4 h-4 text-fuchsia-400" />
              <span>已有好友开房？输入 4 位邀请码快速加入：</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="例如：8888"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-white text-xs w-32 focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={handleJoinByCode}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
              >
                加入房间
              </button>
            </div>
          </div>

          {/* Available Scripts Showcase */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span>官方推理剧本库</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {LARP_SCRIPTS.map((script) => (
                <div
                  key={script.id}
                  className="rounded-2xl overflow-hidden bg-purple-950/40 border border-purple-500/30 hover:border-purple-400/50 p-5 space-y-4 shadow-lg backdrop-blur-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-44 rounded-xl overflow-hidden relative">
                      <img
                        src={script.cover}
                        alt={script.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[10px] font-medium text-fuchsia-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-400/30">
                          {script.subtitle}
                        </span>
                        <h3 className="text-lg font-bold text-white font-serif mt-1">
                          {script.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-purple-200/80 leading-relaxed">
                      {script.description}
                    </p>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-purple-300">出场角色阵容：</div>
                      <div className="flex flex-wrap gap-1.5">
                        {script.roles.map((r) => (
                          <span
                            key={r.id}
                            className="px-2 py-0.5 rounded-md bg-purple-900/50 border border-purple-500/20 text-[10px] text-purple-200"
                          >
                            {r.name} · {r.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedScriptId(script.id);
                      setNewRoomName(`${script.title} 紫米公测房`);
                      setIsCreatingRoom(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600/40 hover:bg-purple-600/70 border border-purple-400/30 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>选择此剧本开启房间</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Public Rooms */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-purple-200 flex items-center justify-between">
              <span>当前正在开放的剧本房间 ({rooms.length})</span>
              <button
                onClick={fetchRooms}
                className="text-xs text-purple-400 hover:text-purple-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>刷新房间</span>
              </button>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 hover:border-purple-400/50 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-fuchsia-300 font-mono bg-purple-900/40 px-2 py-0.5 rounded border border-purple-500/20">
                        邀请码: {room.inviteCode}
                      </span>
                      <span className="text-[10px] text-purple-300/80">
                        {getPhaseLabel(room.status)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{room.name}</h3>
                    <p className="text-[11px] text-purple-300/70">{room.scriptTitle}</p>
                    <div className="text-[11px] text-purple-400">
                      房主: {room.hostName} · 玩家: {room.players.length} 人
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentRoom(room)}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium"
                  >
                    进入房间
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Create Room Modal */}
          {isCreatingRoom && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
              <div className="w-full max-w-md rounded-2xl bg-[#15082e] border border-purple-500/40 p-6 shadow-2xl text-white space-y-4">
                <h3 className="text-base font-bold font-serif">创建紫米剧本杀房间</h3>
                <div>
                  <label className="block text-xs text-purple-300 mb-1">选择剧本</label>
                  <select
                    value={selectedScriptId}
                    onChange={(e) => setSelectedScriptId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-xs"
                  >
                    {LARP_SCRIPTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-purple-300 mb-1">房间名称</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsCreatingRoom(false)}
                    className="px-4 py-2 rounded-xl bg-purple-950/40 text-purple-300 text-xs"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-medium"
                  >
                    立即创建
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Inside Room: Multi-stage State Machine */
        <div className="space-y-6">
          {/* Room Top Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-600/30 text-fuchsia-300 text-xs font-mono font-bold border border-purple-400/30">
                  邀请码: {currentRoom.inviteCode}
                </span>
                <span className="text-xs text-purple-300">房主：{currentRoom.hostName}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-white font-serif mt-1">
                {currentRoom.name}
              </h1>
              <div className="text-xs text-purple-300/70">{currentRoom.scriptTitle}</div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleAddBotPlayer}
                className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30 text-xs text-purple-200 flex items-center gap-1.5"
                title="添加模拟紫米伴侣测试体验"
              >
                <UserPlus className="w-3.5 h-3.5 text-yellow-300" />
                <span>添加紫米AI伴侣</span>
              </button>

              <button
                onClick={() => setCurrentRoom(null)}
                className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/40 border border-purple-500/20 text-xs text-purple-300"
              >
                退出房间
              </button>
            </div>
          </div>

          {/* Phase Stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(['waiting', 'intro', 'investigate', 'discuss', 'vote', 'ended'] as const).map((stage, idx) => {
              const isActive = currentRoom.status === stage;
              return (
                <button
                  key={stage}
                  onClick={() => handleSwitchPhase(stage)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isActive
                      ? 'bg-purple-600/40 border-purple-400 text-white shadow-lg'
                      : 'bg-purple-950/20 border-purple-500/20 text-purple-300/60 hover:text-purple-200'
                  }`}
                >
                  <div className="text-[10px] font-mono text-purple-400">阶段 0{idx + 1}</div>
                  <div className="text-xs font-bold mt-0.5 truncate">{getPhaseLabel(stage).slice(3)}</div>
                </button>
              );
            })}
          </div>

          {/* Stage 1: Role Selection & Waiting */}
          {currentRoom.status === 'waiting' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-900/20 border border-purple-500/20 text-xs text-purple-200 flex items-center justify-between">
                <span>请各位玩家选择自己心仪的角色席位，满员或准备完成后由房主切换下一阶段：</span>
                <button
                  onClick={() => handleSwitchPhase('intro')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium"
                >
                  开启剧本阅读 ➔
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeScript.roles.map((r) => {
                  const assignedPlayer = currentRoom.players.find(p => p.roleId === r.id);
                  const isMine = assignedPlayer?.id === myId;
                  return (
                    <div
                      key={r.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isMine
                          ? 'bg-purple-800/40 border-purple-400 ring-1 ring-purple-400/50'
                          : assignedPlayer
                          ? 'bg-purple-950/40 border-purple-500/20'
                          : 'bg-purple-950/20 border-purple-500/20 hover:border-purple-400/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-fuchsia-300">{r.title}</span>
                          {assignedPlayer ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                              {assignedPlayer.name} 已入座
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-400">
                              空位
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white font-serif mt-1">{r.name}</h3>
                        <p className="text-xs text-purple-300/70 mt-1">使命：{r.objective}</p>
                      </div>

                      {!assignedPlayer ? (
                        <button
                          onClick={() => handleSelectRole(r.id)}
                          className="w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                        >
                          入座此角色
                        </button>
                      ) : isMine ? (
                        <div className="text-center text-xs text-fuchsia-300 font-medium py-1">
                          ✓ 当前是你的角色
                        </div>
                      ) : (
                        <div className="text-center text-xs text-purple-400/60 py-1">已被其他紫米选择</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stage 2: Intro & Secret Background */}
          {currentRoom.status === 'intro' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-950/50 border border-purple-500/30 space-y-4">
                <div className="flex items-center gap-2 text-fuchsia-300 text-xs font-semibold">
                  <Lock className="w-4 h-4" />
                  <span>你的专属身世与绝密档案 (仅你自己可见，请勿提前泄露)：</span>
                </div>
                <div className="text-lg font-bold text-white font-serif">
                  角色：{myRole?.name || '未选定'} ({myRole?.title})
                </div>
                <div className="p-4 rounded-xl bg-purple-950/70 border border-purple-500/30 text-sm text-purple-100 leading-relaxed font-serif">
                  {myRole?.secret || '昨夜你曾来到丹房，一切因你而起……'}
                </div>
                <div className="text-xs text-yellow-300">
                  🎯 本局你的终极目标：{myRole?.objective}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSwitchPhase('investigate')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                >
                  前往搜证调查现场 ➔
                </button>
              </div>
            </div>
          )}

          {/* Stage 3: Clue Investigation */}
          {currentRoom.status === 'investigate' && (
            <div className="space-y-4">
              <div className="text-xs text-purple-300">
                现场遗留了关键证物，点击探索揭秘详细证言与痕迹：
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeScript.clues.map((clue) => {
                  const isDiscovered = revealedClues.has(clue.id) || clue.isPublic;
                  return (
                    <div
                      key={clue.id}
                      className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-fuchsia-300 flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5" />
                          <span>地点：{clue.location}</span>
                        </span>
                        {isDiscovered ? (
                          <span className="text-[10px] text-emerald-400">已搜证公开</span>
                        ) : (
                          <button
                            onClick={() => setRevealedClues(new Set([...revealedClues, clue.id]))}
                            className="px-2.5 py-1 rounded bg-purple-600/40 text-purple-200 text-[10px] hover:bg-purple-600"
                          >
                            搜寻此地
                          </button>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white">{clue.title}</h3>
                      {isDiscovered ? (
                        <p className="text-xs text-purple-200 leading-relaxed font-serif">
                          {clue.content}
                        </p>
                      ) : (
                        <div className="text-xs text-purple-400/60 italic">【该线索暂未勘验】</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSwitchPhase('discuss')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                >
                  进入圆桌辩论 ➔
                </button>
              </div>
            </div>
          )}

          {/* Stage 4: Discussion */}
          {currentRoom.status === 'discuss' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-900/30 border border-purple-500/30 space-y-3">
                <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                  <Users className="w-4 h-4 text-fuchsia-300" />
                  <span>圆桌推理与发言阶段</span>
                </h3>
                <p className="text-xs text-purple-200/80 leading-relaxed">
                  请各位玩家结合自己的秘密和搜证线索轮流陈述，互相质询时间线与行动动机。准备就绪后进入最终指认投票。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {currentRoom.players.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center gap-3">
                    <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-purple-400/30" />
                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[11px] text-fuchsia-300">扮演：{p.roleName || '未指定'}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSwitchPhase('vote')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                >
                  发起真凶投票 ➔
                </button>
              </div>
            </div>
          )}

          {/* Stage 5: Final Voting */}
          {currentRoom.status === 'vote' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/30 space-y-2">
                <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                  <Vote className="w-5 h-5 text-pink-400" />
                  <span>最终真凶指认时刻</span>
                </h3>
                <p className="text-xs text-purple-200/80">
                  谁才是调换丹药/投毒作案的幕后真凶？请慎重投出你的一票：
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentRoom.players.map((p) => {
                  const voteCount = Object.values(currentRoom.votes).filter(v => v === p.id).length;
                  const isSelected = myVote === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleCastVote(p.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-pink-900/40 border-pink-500 ring-2 ring-pink-400/40'
                          : 'bg-purple-950/40 border-purple-500/30 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{p.name}</span>
                        <span className="text-xs text-pink-300 font-mono font-bold">
                          {voteCount} 票
                        </span>
                      </div>
                      <div className="text-xs text-fuchsia-300 mt-1">角色：{p.roleName}</div>
                      <div className="text-[10px] text-purple-400 mt-2">
                        {isSelected ? '✓ 你已投票' : '点击投票指认'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSwitchPhase('ended')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-medium"
                >
                  揭晓全案真相与结局 ➔
                </button>
              </div>
            </div>
          )}

          {/* Stage 6: Truth & Ending Reveal */}
          {currentRoom.status === 'ended' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900/60 via-indigo-950/70 to-purple-950/80 border border-purple-400/40 space-y-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 text-yellow-300 text-sm font-bold font-serif">
                <Award className="w-5 h-5 text-yellow-400" />
                <span>剧本杀结局复盘 · 真相大白</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">
                  案件全貌真相还原
                </h2>
                <div className="p-4 rounded-2xl bg-purple-950/70 border border-purple-500/30 text-sm text-purple-100 leading-relaxed font-serif">
                  {activeScript.truth}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleSwitchPhase('waiting')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium"
                >
                  再来一局
                </button>
                <button
                  onClick={() => setCurrentRoom(null)}
                  className="px-5 py-2.5 rounded-xl bg-purple-950/60 text-purple-200 text-xs border border-purple-500/30 hover:bg-purple-900/40"
                >
                  返回剧本大厅
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
