import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { createMahjongDeck, sortTiles, canHu, canPeng, canGang, calculateHuFan } from './src/game/mahjongRules';
import { createDeck, sortCards, canBeat, Card } from './src/game/doudizhuRules';
import { assignUndercoverWords, tallyVotes, checkUndercoverWinner, YANG_ZI_WORD_PAIRS } from './src/game/undercoverRules';
import { LARP_SCRIPTS } from './src/data/larpScripts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-Memory Database Store for Real-Time Multi-User
interface AppStore {
  users: Record<string, any>;
  supportStats: {
    starlightPoints: number;
    companionDays: number;
    lightUpCount: number;
    wishesCount: number;
  };
  photos: any[];
  wishes: any[];
  chatMessages: any[];
  larpRooms: Record<string, any>;
  gameRooms: Record<string, any>;
  reports: any[];
}

const store: AppStore = {
  users: {
    'user_current': {
      id: 'user_current',
      username: 'purple_star',
      nickname: '星河小紫米',
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Yang_Zi_at_Ryo_band_promotion%2C_Wuhan_of_China%2C_12_April_2019.jpg',
      region: '北京紫米分会',
      bio: '与紫同行，未来可期！陪伴小猴紫的第 2860 天 ✨',
      points: 1314,
      signDays: 19,
      lastSignDate: '',
      role: 'user',
      badges: ['初代紫米', '长相思剧粉头子', '星愿守护者', '国色芳华见证官'],
      favoriteCharacter: '小夭 / 玟小六',
      createdAt: '2023-01-01'
    },
    'user_admin': {
      id: 'user_admin',
      username: 'admin_zi',
      nickname: '紫约星河巡查使 (管理员)',
      avatar: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Lost_You_Forever_promotional_poster.jpg',
      region: '总会管理员',
      bio: '紫约星河社区守护员，愿守护每一个紫米的星愿。',
      points: 99999,
      signDays: 365,
      role: 'admin',
      badges: ['星河创世使', '社区巡察官'],
      favoriteCharacter: '锦觅',
      createdAt: '2022-11-06'
    }
  },
  supportStats: {
    starlightPoints: 5201314,
    companionDays: 3280,
    lightUpCount: 89420,
    wishesCount: 6688
  },
  photos: [
    {
      id: 'photo_1',
      title: '《长相思》小夭 / 玟小六 官方剧照',
      url: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Lost_You_Forever_promotional_poster.jpg',
      category: '剧照',
      author: '夭夭的九尾狐',
      authorId: 'u_101',
      status: 'approved',
      likes: 1314,
      likedBy: ['user_current'],
      comments: [
        { id: 'c1', author: '小猴紫的大粉', authorAvatar: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Yang_Zi_at_Ryo_band_promotion%2C_Wuhan_of_China%2C_12_April_2019.jpg', content: '小夭眼神太有戏了，百看不厌！', createdAt: '10分钟前' }
      ],
      createdAt: '2026-11-05',
      tags: ['长相思', '小夭', '剧照大片']
    },
    {
      id: 'photo_2',
      title: '《国色芳华》何惟芳盛唐莳花官方海报',
      url: 'https://upload.wikimedia.org/wikipedia/zh/9/92/%E5%9B%BD%E8%89%B2%E8%8A%B3%E5%8D%8E%E6%B5%B7%E6%8A%A5.jpg',
      category: '剧照',
      author: '盛唐紫牡丹',
      authorId: 'u_102',
      status: 'approved',
      likes: 988,
      likedBy: [],
      comments: [],
      createdAt: '2026-11-04',
      tags: ['国色芳华', '何惟芳', '盛唐风华']
    },
    {
      id: 'photo_3',
      title: '杨紫线下品牌活动现场绝美生图',
      url: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Yang_Zi_at_Ryo_band_promotion%2C_Wuhan_of_China%2C_12_April_2019.jpg',
      category: '活动生图',
      author: '星芒摄影小紫米',
      authorId: 'u_103',
      status: 'approved',
      likes: 1520,
      likedBy: ['user_current'],
      comments: [],
      createdAt: '2026-11-03',
      tags: ['线下活动', '生图大片', '美神降临']
    },
    {
      id: 'photo_4',
      title: '《香蜜沉沉烬如霜》花界锦觅仙气剧照',
      url: 'https://upload.wikimedia.org/wikipedia/en/6/61/Xiangmichenchen.jpg',
      category: '剧照',
      author: '绘梦小紫',
      authorId: 'u_104',
      status: 'approved',
      likes: 888,
      likedBy: [],
      comments: [],
      createdAt: '2026-11-02',
      tags: ['香蜜沉沉烬如霜', '锦觅', '经典名场面']
    },
    {
      id: 'photo_5',
      title: '《亲爱的，热爱的》天才萝莉佟年',
      url: 'https://upload.wikimedia.org/wikipedia/en/e/ed/Go_Go_Squid%21.jpg',
      category: '剧照',
      author: '佟年小甜鱿',
      authorId: 'u_105',
      status: 'approved',
      likes: 765,
      likedBy: [],
      comments: [],
      createdAt: '2026-11-01',
      tags: ['亲爱的热爱的', '佟年', '甜愈经典']
    },
    {
      id: 'photo_6',
      title: '《承欢记》麦承欢清醒大女主海报',
      url: 'https://upload.wikimedia.org/wikipedia/zh/5/53/Best_Choice_Ever_%28%E6%89%BF%E6%AC%A2%E8%AE%B0%29.jpeg',
      category: '剧照',
      author: '独立承欢',
      authorId: 'u_106',
      status: 'approved',
      likes: 654,
      likedBy: [],
      comments: [],
      createdAt: '2026-10-30',
      tags: ['承欢记', '麦承欢', '都市大女主']
    },
    {
      id: 'photo_7',
      title: '《沉香如屑·沉香重华》四叶菡萏颜淡官方剧照',
      url: 'https://upload.wikimedia.org/wikipedia/en/6/61/Immortal_Samsara.jpg',
      category: '剧照',
      author: '菡萏香消',
      authorId: 'u_107',
      status: 'approved',
      likes: 920,
      likedBy: [],
      comments: [],
      createdAt: '2026-10-28',
      tags: ['沉香如屑', '颜淡', '四叶菡萏', '仙侠虐恋']
    },
    {
      id: 'photo_8',
      title: '《余生，请多指教》林之校大提琴暖心剧照',
      url: 'https://upload.wikimedia.org/wikipedia/zh/5/55/The_oath_of_love_official_poster.jpg',
      category: '剧照',
      author: '大提琴的指尖',
      authorId: 'u_108',
      status: 'approved',
      likes: 830,
      likedBy: [],
      comments: [],
      createdAt: '2026-10-25',
      tags: ['余生请多指教', '林之校', '暖心治愈']
    }
  ],
  wishes: [
    {
      id: 'w_1',
      author: '紫米守候者',
      authorAvatar: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Yang_Zi_at_Ryo_band_promotion%2C_Wuhan_of_China%2C_12_April_2019.jpg',
      category: '生日祝福',
      content: '小猴紫 11.06 生日快乐！愿你岁岁常欢愉，万事皆胜意，无论走多远，紫米永远是你的后盾！💜',
      likes: 1106,
      likedBy: ['user_current'],
      color: 'from-purple-900/40 to-indigo-900/40',
      createdAt: '2026-11-06'
    },
    {
      id: 'w_2',
      author: '长相思思无涯',
      authorAvatar: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Lost_You_Forever_promotional_poster.jpg',
      category: '新剧大爆',
      content: '预祝小猴紫每一部新剧收视长虹！国色芳华、青簪行、下一部作品永远大爆！期待演员杨紫闪闪发光！✨',
      likes: 688,
      likedBy: [],
      color: 'from-violet-900/40 to-fuchsia-900/40',
      createdAt: '2026-11-05'
    },
    {
      id: 'w_3',
      author: '佟年的小猫咪',
      authorAvatar: 'https://upload.wikimedia.org/wikipedia/en/e/ed/Go_Go_Squid%21.jpg',
      category: '平安顺遂',
      content: '拍戏一定要照顾好自己，注意保暖和休息，健健康康，开开心心，我们陪你走过每一个春夏秋冬！',
      likes: 520,
      likedBy: [],
      color: 'from-purple-950/40 to-slate-900/40',
      createdAt: '2026-11-04'
    }
  ],
  chatMessages: [
    {
      id: 'm_1',
      channel: 'national',
      senderId: 'u_sys',
      senderName: '星河引路人 (系统)',
      senderAvatar: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Yang_Zi_at_Ryo_band_promotion%2C_Wuhan_of_China%2C_12_April_2019.jpg',
      senderRegion: '紫约星河总控',
      senderBadge: '星河官方',
      content: '欢迎来到「紫约星河 ZI LAND」！杨紫专属粉丝星河已连接，与全国紫米一起点亮生日星芒！💜',
      type: 'system',
      createdAt: '08:00'
    },
    {
      id: 'm_2',
      channel: 'national',
      senderId: 'u_101',
      senderName: '夭夭的九尾狐',
      senderAvatar: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Lost_You_Forever_promotional_poster.jpg',
      senderRegion: '浙江紫米分会',
      senderBadge: '长相思剧粉',
      content: '姐妹们好呀！今天生日应援打卡了吗？相册里新传了超美剧照！',
      type: 'text',
      createdAt: '08:15'
    },
    {
      id: 'm_3',
      channel: 'national',
      senderId: 'u_102',
      senderName: '佟年小鱿鱼',
      senderAvatar: 'https://upload.wikimedia.org/wikipedia/en/e/ed/Go_Go_Squid%21.jpg',
      senderRegion: '上海紫米分会',
      senderBadge: '亲爱的高级粉',
      content: '打卡啦！刚去游戏大厅玩了谁是卧底和麻将，大家快来开房呀~',
      type: 'text',
      createdAt: '08:22'
    }
  ],
  larpRooms: {},
  gameRooms: {},
  reports: []
};

// Scripts imported from ./src/data/larpScripts

// Pre-create initial demo rooms
const demoLarpRoom = {
  id: 'larp_demo',
  name: '清水镇长相思官方公测房 #01',
  inviteCode: '8888',
  scriptId: LARP_SCRIPTS[0].id,
  scriptTitle: LARP_SCRIPTS[0].title,
  hostId: 'user_admin',
  hostName: '紫约星河巡查使',
  status: 'discuss',
  players: [
    { id: 'user_admin', name: '紫约星河巡查使', avatar: store.users['user_admin'].avatar, roleId: 'role_qiangxuan', roleName: '玱玹', isHost: true, isReady: true },
    { id: 'bot_xiaoliu', name: '紫米夭夭_01', avatar: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Lost_You_Forever_promotional_poster.jpg', roleId: 'role_xiaoliu', roleName: '玟小六', isHost: false, isReady: true, isBot: true },
    { id: 'bot_jing', name: '青丘璟心_02', avatar: 'https://upload.wikimedia.org/wikipedia/zh/9/92/%E5%9B%BD%E8%89%B2%E8%8A%B3%E5%8D%8E%E6%B5%B7%E6%8A%A5.jpg', roleId: 'role_jing', roleName: '涂山璟', isHost: false, isReady: true, isBot: true },
    { id: 'bot_xiangliu', name: '九头相柳_03', avatar: 'https://upload.wikimedia.org/wikipedia/en/6/61/Immortal_Samsara.jpg', roleId: 'role_xiangliu', roleName: '相柳', isHost: false, isReady: true, isBot: true }
  ],
  clues: LARP_SCRIPTS[0].clues,
  votes: {},
  createdAt: new Date().toISOString()
};
store.larpRooms[demoLarpRoom.id] = demoLarpRoom;

// REST API Endpoints

// 1. Current user profile
app.get('/api/auth/profile', (req, res) => {
  res.json({ success: true, profile: store.users['user_current'] });
});

app.put('/api/auth/profile', (req, res) => {
  const { nickname, region, bio, avatar, favoriteCharacter } = req.body;
  const current = store.users['user_current'];
  if (nickname) current.nickname = nickname.trim().slice(0, 20);
  if (region) current.region = region;
  if (bio) current.bio = bio.trim().slice(0, 100);
  if (avatar) current.avatar = avatar;
  if (favoriteCharacter) current.favoriteCharacter = favoriteCharacter;
  res.json({ success: true, profile: current });
});

// 2. Birthday Support & Light Up
app.get('/api/birthday/support', (req, res) => {
  res.json({
    success: true,
    stats: store.supportStats,
    birthdayDate: '1992-11-06',
    currentDate: '2026-11-06'
  });
});

app.post('/api/birthday/lightup', (req, res) => {
  store.supportStats.starlightPoints += 10;
  store.supportStats.lightUpCount += 1;
  store.users['user_current'].points += 10;
  res.json({
    success: true,
    stats: store.supportStats,
    userPoints: store.users['user_current'].points,
    message: '点亮星光成功！杨紫生日星河加持 +10 星光值 ✨'
  });
});

// 3. Daily checkin & streaks
app.post('/api/checkin', (req, res) => {
  const user = store.users['user_current'];
  const todayStr = '2026-11-06';
  if (user.lastSignDate === todayStr) {
    return res.json({ success: false, message: '今日已完成签到，明天继续来陪伴小猴紫吧！' });
  }

  user.signDays += 1;
  user.lastSignDate = todayStr;
  const reward = 50 + (user.signDays % 7) * 10;
  user.points += reward;

  // Check badges
  if (user.signDays >= 20 && !user.badges.includes('星河长情紫米')) {
    user.badges.push('星河长情紫米');
  }

  res.json({
    success: true,
    signDays: user.signDays,
    reward,
    totalPoints: user.points,
    message: `签到成功！连续签到 ${user.signDays} 天，获得 +${reward} 星光值！`
  });
});

// 4. Photos Gallery
app.get('/api/photos', (req, res) => {
  const { category, status } = req.query;
  let list = [...store.photos];
  if (category && category !== '全部') {
    list = list.filter(p => p.category === category);
  }
  if (status) {
    list = list.filter(p => p.status === status);
  } else {
    // Default show approved or my own
    list = list.filter(p => p.status === 'approved' || p.authorId === 'user_current');
  }
  res.json({ success: true, photos: list });
});

app.post('/api/photos', (req, res) => {
  const { title, url, category, tags } = req.body;
  if (!title || !url) {
    return res.status(400).json({ success: false, message: '照片标题和图片地址不能为空' });
  }
  const newPhoto = {
    id: `photo_${Date.now()}`,
    title: title.slice(0, 40),
    url,
    category: category || '剧照',
    author: store.users['user_current'].nickname,
    authorId: store.users['user_current'].id,
    status: 'approved', // Auto-approved for fan delight, or can be moderated in admin tab
    likes: 1,
    likedBy: ['user_current'],
    comments: [],
    createdAt: '刚刚',
    tags: Array.isArray(tags) ? tags : ['杨紫', '紫约星河']
  };
  store.photos.unshift(newPhoto);
  store.users['user_current'].points += 20;
  res.json({ success: true, photo: newPhoto, message: '照片上传发布成功！获得 +20 星光值' });
});

app.post('/api/photos/:id/like', (req, res) => {
  const photo = store.photos.find(p => p.id === req.params.id);
  if (!photo) return res.status(404).json({ success: false, message: '未找到照片' });
  const userId = 'user_current';
  const idx = photo.likedBy.indexOf(userId);
  if (idx >= 0) {
    photo.likedBy.splice(idx, 1);
    photo.likes = Math.max(0, photo.likes - 1);
  } else {
    photo.likedBy.push(userId);
    photo.likes += 1;
    store.users['user_current'].points += 2;
  }
  res.json({ success: true, likes: photo.likes, isLiked: photo.likedBy.includes(userId) });
});

app.post('/api/photos/:id/comments', (req, res) => {
  const photo = store.photos.find(p => p.id === req.params.id);
  if (!photo) return res.status(404).json({ success: false, message: '未找到照片' });
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: '评论内容不能为空' });
  }
  const comment = {
    id: `c_${Date.now()}`,
    author: store.users['user_current'].nickname,
    authorAvatar: store.users['user_current'].avatar,
    content: content.trim().slice(0, 200),
    createdAt: '刚刚'
  };
  photo.comments.push(comment);
  store.users['user_current'].points += 5;
  res.json({ success: true, comment });
});

// 5. Wishes Wall
app.get('/api/wishes', (req, res) => {
  const { category } = req.query;
  let list = [...store.wishes];
  if (category && category !== '全部') {
    list = list.filter(w => w.category === category);
  }
  res.json({ success: true, wishes: list });
});

app.post('/api/wishes', (req, res) => {
  const { category, content, color } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: '愿望内容不能为空' });
  }
  const colors = [
    'from-purple-900/40 to-indigo-900/40',
    'from-violet-900/40 to-fuchsia-900/40',
    'from-indigo-950/40 to-purple-900/40',
    'from-purple-950/40 to-slate-900/40'
  ];
  const newWish = {
    id: `w_${Date.now()}`,
    author: store.users['user_current'].nickname,
    authorAvatar: store.users['user_current'].avatar,
    category: category || '生日祝福',
    content: content.trim().slice(0, 300),
    likes: 1,
    likedBy: ['user_current'],
    color: color || colors[Math.floor(Math.random() * colors.length)],
    createdAt: '刚刚'
  };
  store.wishes.unshift(newWish);
  store.supportStats.wishesCount += 1;
  store.users['user_current'].points += 15;
  res.json({ success: true, wish: newWish, message: '星愿已投递至紫约星河！获得 +15 星光值' });
});

app.post('/api/wishes/:id/like', (req, res) => {
  const wish = store.wishes.find(w => w.id === req.params.id);
  if (!wish) return res.status(404).json({ success: false, message: '未找到祝福' });
  const userId = 'user_current';
  const idx = wish.likedBy.indexOf(userId);
  if (idx >= 0) {
    wish.likedBy.splice(idx, 1);
    wish.likes = Math.max(0, wish.likes - 1);
  } else {
    wish.likedBy.push(userId);
    wish.likes += 1;
  }
  res.json({ success: true, likes: wish.likes, isLiked: wish.likedBy.includes(userId) });
});

// 6. Chat messages REST fallback
app.get('/api/chat/messages', (req, res) => {
  const { channel = 'national' } = req.query;
  const msgs = store.chatMessages.filter(m => m.channel === channel);
  res.json({ success: true, messages: msgs.slice(-50) });
});

// 7. LARP Scripts & Rooms
app.get('/api/larp/scripts', (req, res) => {
  res.json({ success: true, scripts: LARP_SCRIPTS });
});

app.get('/api/larp/rooms', (req, res) => {
  res.json({ success: true, rooms: Object.values(store.larpRooms) });
});

app.post('/api/larp/rooms', (req, res) => {
  const { scriptId, name } = req.body;
  const script = LARP_SCRIPTS.find(s => s.id === scriptId) || LARP_SCRIPTS[0];
  const roomId = `larp_${Date.now()}`;
  const room = {
    id: roomId,
    name: name || `${script.title} 专属房`,
    inviteCode: String(Math.floor(1000 + Math.random() * 9000)),
    scriptId: script.id,
    scriptTitle: script.title,
    hostId: 'user_current',
    hostName: store.users['user_current'].nickname,
    status: 'waiting',
    players: [
      {
        id: 'user_current',
        name: store.users['user_current'].nickname,
        avatar: store.users['user_current'].avatar,
        roleId: script.roles[0].id,
        roleName: script.roles[0].name,
        isHost: true,
        isReady: true
      }
    ],
    clues: script.clues,
    votes: {},
    createdAt: new Date().toISOString()
  };
  store.larpRooms[roomId] = room;
  res.json({ success: true, room });
});

// 8. Leaderboard & Badges
app.get('/api/leaderboard', (req, res) => {
  const mockRanking = [
    { rank: 1, name: '小猴紫的大元老', avatar: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Yang_Zi_at_Ryo_band_promotion%2C_Wuhan_of_China%2C_12_April_2019.jpg', region: '北京紫米分会', points: 9860, signDays: 120, badge: '初代紫米' },
    { rank: 2, name: '长相思思小夭', avatar: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Lost_You_Forever_promotional_poster.jpg', region: '浙江紫米分会', points: 8750, signDays: 98, badge: '长相思剧粉头子' },
    { rank: 3, name: '国色芳华何惟芳', avatar: 'https://upload.wikimedia.org/wikipedia/zh/9/92/%E5%9B%BD%E8%89%B2%E8%8A%B3%E5%8D%8E%E6%B5%B7%E6%8A%A5.jpg', region: '盛唐紫米分会', points: 7920, signDays: 85, badge: '国色芳华见证官' },
    { rank: 4, name: '星河小紫米 (我)', avatar: store.users['user_current'].avatar, region: store.users['user_current'].region, points: store.users['user_current'].points, signDays: store.users['user_current'].signDays, badge: '星愿守护者' },
    { rank: 5, name: '佟年的小猫咪', avatar: 'https://upload.wikimedia.org/wikipedia/en/e/ed/Go_Go_Squid%21.jpg', region: '广东紫米分会', points: 5200, signDays: 60, badge: '亲爱的高级粉' }
  ];
  res.json({ success: true, rankings: mockRanking, myPoints: store.users['user_current'].points });
});

// 9. Moderation reporting
app.post('/api/moderation/report', (req, res) => {
  const { targetType, targetId, reason } = req.body;
  store.reports.push({
    id: `rep_${Date.now()}`,
    targetType,
    targetId,
    reason: reason || '不当言论/违规内容',
    reporterId: 'user_current',
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  res.json({ success: true, message: '举报已提交，感谢守护健康温暖的紫米社区！' });
});

// HTTP Server setup
const server = http.createServer(app);

// WebSocket Server for Multi-User Realtime Synchronization
const wss = new WebSocketServer({ server, path: '/ws' });

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  name: string;
  avatar: string;
  currentChannel: string;
  gameRoomId?: string;
}

const clients = new Map<WebSocket, ConnectedClient>();

wss.on('connection', (ws) => {
  clients.set(ws, {
    ws,
    userId: 'user_current',
    name: '星河小紫米',
    avatar: store.users['user_current'].avatar,
    currentChannel: 'national'
  });

  // Send current online count
  broadcastOnlineCount();

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      const client = clients.get(ws);
      if (!client) return;

      switch (msg.type) {
        case 'auth':
          client.userId = msg.userId || client.userId;
          client.name = msg.name || client.name;
          client.avatar = msg.avatar || client.avatar;
          broadcastOnlineCount();
          break;

        case 'chat_switch_channel':
          client.currentChannel = msg.channel;
          break;

        case 'chat_message': {
          const newMsg = {
            id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            channel: msg.channel || client.currentChannel || 'national',
            senderId: client.userId,
            senderName: client.name,
            senderAvatar: client.avatar,
            senderRegion: store.users['user_current'].region,
            senderBadge: store.users['user_current'].badges[0] || '紫米',
            content: (msg.content || '').slice(0, 500),
            type: msg.messageType || 'text',
            stickerUrl: msg.stickerUrl,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          store.chatMessages.push(newMsg);
          // Broadcast to everyone in channel
          broadcastToChannel(newMsg.channel, {
            type: 'chat_new_message',
            message: newMsg
          });
          break;
        }

        case 'larp_state_update': {
          const room = store.larpRooms[msg.roomId];
          if (room) {
            Object.assign(room, msg.updates);
            broadcastLarpRoom(room.id, {
              type: 'larp_room_updated',
              room
            });
          }
          break;
        }

        case 'draw_stroke': {
          // Broadcast drawing canvas coordinates
          for (const [cWs, c] of clients.entries()) {
            if (cWs !== ws && cWs.readyState === WebSocket.OPEN) {
              cWs.send(JSON.stringify({
                type: 'draw_stroke_broadcast',
                stroke: msg.stroke
              }));
            }
          }
          break;
        }

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (e) {
      console.error('WS parse error:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcastOnlineCount();
  });
});

function broadcastOnlineCount() {
  const count = clients.size + 128; // Add realistic fan base presence
  const payload = JSON.stringify({
    type: 'online_count',
    count
  });
  for (const clientWs of clients.keys()) {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(payload);
    }
  }
}

function broadcastToChannel(channel: string, payload: any) {
  const str = JSON.stringify(payload);
  for (const [cWs, c] of clients.entries()) {
    if (cWs.readyState === WebSocket.OPEN && (c.currentChannel === channel || channel === 'national')) {
      cWs.send(str);
    }
  }
}

function broadcastLarpRoom(roomId: string, payload: any) {
  const str = JSON.stringify(payload);
  for (const cWs of clients.keys()) {
    if (cWs.readyState === WebSocket.OPEN) {
      cWs.send(str);
    }
  }
}

// Vite middleware mounting in development mode
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ZI LAND] Server running on http://0.0.0.0:${PORT}`);
});
