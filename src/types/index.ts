export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  region: string;
  bio: string;
  points: number;
  signDays: number;
  lastSignDate?: string;
  role: 'user' | 'admin' | 'moderator';
  badges: string[];
  favoriteCharacter: string;
  createdAt: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  url: string;
  category: '剧照' | '活动生图' | '杂志大片' | '饭制手绘' | '舞台经典';
  author: string;
  authorId: string;
  status: 'approved' | 'pending' | 'rejected';
  likes: number;
  likedBy: string[];
  comments: CommentItem[];
  createdAt: string;
  tags: string[];
}

export interface CommentItem {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface WishItem {
  id: string;
  author: string;
  authorAvatar: string;
  category: '生日祝福' | '新剧大爆' | '平安顺遂' | '星愿胶囊' | '紫米心语';
  content: string;
  likes: number;
  likedBy: string[];
  color: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  channel: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRegion: string;
  senderBadge?: string;
  content: string;
  type: 'text' | 'sticker' | 'system';
  stickerUrl?: string;
  createdAt: string;
}

export interface LarpRoom {
  id: string;
  name: string;
  inviteCode: string;
  scriptId: string;
  scriptTitle: string;
  hostId: string;
  hostName: string;
  status: 'waiting' | 'intro' | 'investigate' | 'discuss' | 'vote' | 'ended';
  players: LarpPlayer[];
  clues: LarpClue[];
  votes: Record<string, string>; // voterId -> targetPlayerId
  storyResult?: string;
  createdAt: string;
}

export interface LarpPlayer {
  id: string;
  name: string;
  avatar: string;
  roleId?: string;
  roleName?: string;
  roleDescription?: string;
  isHost: boolean;
  isReady: boolean;
  isBot?: boolean;
}

export interface LarpClue {
  id: string;
  title: string;
  content: string;
  location: string;
  discoveredBy?: string;
  isPublic: boolean;
}

export interface GameRoom {
  id: string;
  type: 'undercover' | 'mahjong' | 'doudizhu' | 'gomoku' | 'draw_guess' | 'trivia' | 'truth_dare';
  title: string;
  inviteCode: string;
  hostId: string;
  players: RoomPlayer[];
  maxPlayers: number;
  state: any;
  status: 'waiting' | 'playing' | 'ended';
  createdAt: string;
}

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  isBot?: boolean;
  score?: number;
}
