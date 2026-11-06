import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Heart,
  Calendar,
  Flame,
  Award,
  Gamepad2,
  Users,
  Image as ImageIcon,
  MessageCircle,
  ArrowRight,
  Star
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { setCurrentTab, starlightStats, lightUpStar } = useApp();

  const works = [
    {
      title: '《长相思》第一、二季',
      role: '小夭 / 玟小六',
      year: '2023 - 2024',
      quote: '“有力自保、有人相依、有处可去，愿你一世安乐无忧。”',
      tag: '爆款仙侠大剧 · 腾讯视频年度剧王',
      cover: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Lost_You_Forever_promotional_poster.jpg',
      badge: '大王姬 / 回春堂六哥'
    },
    {
      title: '《国色芳华》',
      role: '何惟芳',
      year: '2025 - 2026',
      quote: '“商海浮沉，匠心不改；芳华绝代，自立盛唐。”',
      tag: '盛唐经商传奇 · 巨制品质爆款',
      cover: 'https://upload.wikimedia.org/wikipedia/zh/9/92/%E5%9B%BD%E8%89%B2%E8%8A%B3%E5%8D%8E%E6%B5%B7%E6%8A%A5.jpg',
      badge: '百花匠人 / 芳华坊主'
    },
    {
      title: '《香蜜沉沉烬如霜》',
      role: '锦觅',
      year: '2018',
      quote: '“繁花似锦觅安宁，淡云流水度此生。”',
      tag: '国民现象级仙侠爆款 · 演技封神',
      cover: 'https://upload.wikimedia.org/wikipedia/en/6/61/Xiangmichenchen.jpg',
      badge: '花界少主 / 水神长女'
    },
    {
      title: '《亲爱的，热爱的》',
      role: '佟年',
      year: '2019',
      quote: '“一辈子那么长，我都给你。”',
      tag: '全民甜愈热潮 · 现男友与鱿小鱼',
      cover: 'https://upload.wikimedia.org/wikipedia/en/e/ed/Go_Go_Squid%21.jpg',
      badge: '天才学霸 / 萝莉歌手'
    },
    {
      title: '《承欢记》',
      role: '麦承欢',
      year: '2024',
      quote: '“承欢父母，更要先承欢自己，做独立清醒的大女主。”',
      tag: '都市情感大剧 · 央视八套收视冠军',
      cover: 'https://upload.wikimedia.org/wikipedia/zh/5/53/Best_Choice_Ever_%28%E6%89%BF%E6%AC%A2%E8%AE%B0%29.jpeg',
      badge: '独立大女主'
    },
    {
      title: '《沉香如屑·沉香重华》',
      role: '颜淡',
      year: '2022',
      quote: '“半生执念半生空，菡萏一瓣护苍生。”',
      tag: '四海八荒绝恋 · 上古四叶菡萏',
      cover: 'https://upload.wikimedia.org/wikipedia/en/6/61/Immortal_Samsara.jpg',
      badge: '四叶菡萏仙子'
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-purple-900/40 via-[#160a2f]/60 to-[#0e051d]/80 border border-purple-500/30 p-6 sm:p-10 lg:p-14 shadow-2xl backdrop-blur-xl">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs sm:text-sm font-medium">
              <Sparkles className="w-4 h-4 text-fuchsia-400 animate-spin" />
              <span>11.06 杨紫生日星光盛典 · 全国紫米专属星河</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-serif">
              <span className="block text-purple-100">执紫之手，</span>
              <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-200 bg-clip-text text-transparent">
                共赴璀璨星河
              </span>
            </h1>

            <p className="text-purple-200/80 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
              从国民闺女「夏雪」到绝美大王姬「小夭」，从天才学霸「佟年」到百花匠人「何惟芳」。
              欢迎来到「紫约星河 ZI LAND」—— 这里汇聚全国千万紫米的深情守护，实时畅聊、生日应援、星光相册、多人剧本杀与丰富联机游戏大厅！
            </p>

            {/* Birthday Interactive Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={lightUpStar}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm sm:text-base shadow-xl shadow-purple-900/40 border border-purple-300/40 flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span>点亮生日星光 (+10星光)</span>
              </button>

              <button
                onClick={() => setCurrentTab('wishes')}
                className="px-6 py-3.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/50 text-purple-200 font-medium text-sm sm:text-base border border-purple-500/40 flex items-center gap-2 transition-all hover:border-purple-400"
              >
                <Heart className="w-5 h-5 text-pink-400" />
                <span>投递星愿祝福</span>
              </button>

              <button
                onClick={() => setCurrentTab('games')}
                className="px-6 py-3.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/50 text-indigo-200 font-medium text-sm sm:text-base border border-indigo-500/40 flex items-center gap-2 transition-all hover:border-indigo-400"
              >
                <Gamepad2 className="w-5 h-5 text-indigo-300" />
                <span>进入游戏大厅</span>
              </button>
            </div>
          </div>

          {/* Birthday Countdown & Live Starlight Meter Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-purple-900/50 via-indigo-950/60 to-purple-950/70 border border-purple-400/30 p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                    <Calendar className="w-5 h-5 text-fuchsia-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white font-serif">11.06 生日专属盛典</h2>
                    <p className="text-xs text-purple-300/70">Yang Zi Birthday Support</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-mono font-bold border border-pink-500/30">
                  庆生盛典中 🎂
                </span>
              </div>

              {/* Starlight Metrics */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/20">
                  <div className="text-[11px] text-purple-300/70 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>星河总星光值</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-yellow-300 mt-1">
                    {starlightStats.starlightPoints.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-purple-400 mt-0.5">全网紫米共同筑起</div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/20">
                  <div className="text-[11px] text-purple-300/70 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-purple-300" />
                    <span>长情陪伴天数</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-fuchsia-300 mt-1">
                    {starlightStats.companionDays} <span className="text-xs text-purple-200">天</span>
                  </div>
                  <div className="text-[10px] text-purple-400 mt-0.5">春华秋实，始终如一</div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/20">
                  <div className="text-[11px] text-purple-300/70 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    <span>累计点亮次数</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-purple-200 mt-1">
                    {starlightStats.lightUpCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-purple-400 mt-0.5">点亮每一次闪耀瞬间</div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500/20">
                  <div className="text-[11px] text-purple-300/70 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    <span>送达祝福条数</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-pink-300 mt-1">
                    {starlightStats.wishesCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-purple-400 mt-0.5">满载全网紫米心愿</div>
                </div>
              </div>

              {/* Interactive Starlight Progress */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-purple-200/80">
                  <span>2026 生日应援大目标</span>
                  <span className="font-mono text-fuchsia-300">92% 完成度</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-purple-950/80 border border-purple-500/30 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-300 rounded-full transition-all duration-700"
                    style={{ width: '92%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Portals Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif flex items-center gap-2">
              <span className="text-fuchsia-400">✦</span> 紫米专属空间导航
            </h2>
            <p className="text-xs sm:text-sm text-purple-300/70">
              探索互动社区，与全国紫米一起玩游戏、看相册、发祝福
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setCurrentTab('gallery')}
            className="group cursor-pointer rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-400/60 p-5 transition-all shadow-lg hover:shadow-purple-900/40 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5 text-fuchsia-300" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-200">星光相册</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed">
                高画质影视剧照、活动生图、杂志大片、饭制手绘作品，支持上传与点赞评论。
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs text-purple-300 font-medium group-hover:translate-x-1 transition-transform">
              <span>立即浏览</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          <div
            onClick={() => setCurrentTab('chat')}
            className="group cursor-pointer rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-400/60 p-5 transition-all shadow-lg hover:shadow-purple-900/40 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-indigo-300" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-200">全国实时聊天室</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed">
                全国星河大厅及各大地区紫米分会，支持角色专属表情包与在线好友交流。
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs text-indigo-300 font-medium group-hover:translate-x-1 transition-transform">
              <span>加入热聊</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          <div
            onClick={() => setCurrentTab('larp')}
            className="group cursor-pointer rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-400/60 p-5 transition-all shadow-lg hover:shadow-purple-900/40 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-600/30 border border-fuchsia-400/40 flex items-center justify-center text-fuchsia-300 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-fuchsia-300" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-fuchsia-200">杨紫剧宇宙剧本杀</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed">
                《长相思·清水镇失窃案》《芳华盛宴》等多剧本，在线选角、搜证、圆桌讨论与真相揭秘。
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs text-fuchsia-300 font-medium group-hover:translate-x-1 transition-transform">
              <span>创建/加入房间</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          <div
            onClick={() => setCurrentTab('games')}
            className="group cursor-pointer rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-400/60 p-5 transition-all shadow-lg hover:shadow-purple-900/40 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/30 border border-violet-400/40 flex items-center justify-center text-violet-300 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-5 h-5 text-violet-300" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-violet-200">联机游戏大厅</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed">
                谁是卧底、麻将、斗地主、五子棋、你画我猜、OST猜歌与答题挑战，规则完整可玩！
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs text-violet-300 font-medium group-hover:translate-x-1 transition-transform">
              <span>立即开战</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Representative Works Showcase */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              杨紫璀璨光影代表作
            </h2>
            <p className="text-xs sm:text-sm text-purple-300/70">
              每一个角色都倾注热忱，每一段故事都深入人心
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work, idx) => (
            <div
              key={idx}
              className="rounded-2xl overflow-hidden bg-purple-950/40 border border-purple-500/30 hover:border-purple-400/60 transition-all hover:shadow-xl hover:shadow-purple-900/30 flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={work.cover}
                  alt={work.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e051d] via-transparent to-black/30" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-purple-950/80 backdrop-blur-md text-[11px] font-medium text-purple-200 border border-purple-400/30">
                  {work.year}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-fuchsia-950/80 backdrop-blur-md text-[11px] font-medium text-fuchsia-200 border border-fuchsia-400/30">
                  {work.badge}
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white font-serif">{work.title}</h3>
                  <div className="text-xs text-purple-300/90 font-medium">饰 {work.role}</div>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-purple-200/80 italic font-serif leading-relaxed">
                  {work.quote}
                </p>
                <div className="pt-2 border-t border-purple-500/20 text-[11px] text-purple-400 font-mono flex items-center justify-between">
                  <span>{work.tag}</span>
                  <span className="text-fuchsia-300">经典名场面 ✦</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
