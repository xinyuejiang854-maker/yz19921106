export interface DramaStill {
  id: string;
  title: string;
  role: string;
  drama: string;
  year: string;
  url: string;
  description: string;
  category: '剧照' | '活动生图' | '杂志大片' | '舞台经典';
  tags: string[];
}

export const AUTHENTIC_DRAMA_STILLS: DramaStill[] = [
  {
    id: 'still_cxs',
    title: '《长相思》小夭 / 玟小六 官方剧照大片',
    role: '小夭 / 玟小六 / 皓苓玖瑶',
    drama: '长相思',
    year: '2023 - 2024',
    url: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Lost_You_Forever_promotional_poster.jpg',
    description: '腾讯视频年度剧王《长相思》，杨紫精湛诠释清水镇回春堂医师玟小六与皓苓大王姬小夭，从嬉笑红尘到执掌风云，眼神戏直击人心。',
    category: '剧照',
    tags: ['长相思', '小夭', '玟小六', '官方剧照']
  },
  {
    id: 'still_gsfh',
    title: '《国色芳华》何惟芳 盛唐莳花百花匠人',
    role: '何惟芳 / 芳华坊主',
    drama: '国色芳华',
    year: '2025 - 2026',
    url: 'https://upload.wikimedia.org/wikipedia/zh/9/92/%E5%9B%BD%E8%89%B2%E8%8A%B3%E5%8D%8E%E6%B5%B7%E6%8A%A5.jpg',
    description: '盛唐经商传奇大剧《国色芳华》，杨紫演绎百花匠人何惟芳，自立自强破茧成蝶，开创芳华商号盛世。',
    category: '剧照',
    tags: ['国色芳华', '何惟芳', '盛唐风华', '官方海报']
  },
  {
    id: 'still_xm',
    title: '《香蜜沉沉烬如霜》锦觅 花界绝世仙子',
    role: '锦觅 / 水神少主',
    drama: '香蜜沉沉烬如霜',
    year: '2018',
    url: 'https://upload.wikimedia.org/wikipedia/en/6/61/Xiangmichenchen.jpg',
    description: '国民现象级爆款仙侠大剧《香蜜沉沉烬如霜》，杨紫饰演锦觅“繁花似锦觅安宁，淡云流水度此生”，红遍海内外。',
    category: '剧照',
    tags: ['香蜜沉沉烬如霜', '锦觅', '经典神剧']
  },
  {
    id: 'still_qadhra',
    title: '《亲爱的，热爱的》佟年 元气甜愈学霸',
    role: '佟年 / 鱿小鱼',
    drama: '亲爱的，热爱的',
    year: '2019',
    url: 'https://upload.wikimedia.org/wikipedia/en/e/ed/Go_Go_Squid%21.jpg',
    description: '全民甜愈热潮《亲爱的，热爱的》，杨紫饰演19岁计算机天才少女佟年，纯真坚韧、元气满满，引爆夏日热潮。',
    category: '剧照',
    tags: ['亲爱的热爱的', '佟年', '甜愈经典']
  },
  {
    id: 'still_chj',
    title: '《承欢记》麦承欢 独立清醒都市大女主',
    role: '麦承欢',
    drama: '承欢记',
    year: '2024',
    url: 'https://upload.wikimedia.org/wikipedia/zh/5/53/Best_Choice_Ever_%28%E6%89%BF%E6%AC%A2%E8%AE%B0%29.jpeg',
    description: '央视八套收视冠军《承欢记》，杨紫细腻诠释麦承欢从承欢父母到承欢自我、独立从容的现代女性成长之路。',
    category: '剧照',
    tags: ['承欢记', '麦承欢', '都市大女主', '央视冠军']
  },
  {
    id: 'still_cxrx',
    title: '《沉香如屑·沉香重华》颜淡 上古菡萏仙子',
    role: '颜淡',
    drama: '沉香如屑',
    year: '2022',
    url: 'https://upload.wikimedia.org/wikipedia/en/6/61/Immortal_Samsara.jpg',
    description: '《沉香如屑》，本为上古遗族四叶菡萏之首的颜淡，为爱剖半颗心，历经千难险阻不负本真。',
    category: '剧照',
    tags: ['沉香如屑', '颜淡', '仙侠经典']
  },
  {
    id: 'still_ys',
    title: '《余生，请多指教》林之校 纯真大提琴手',
    role: '林之校',
    drama: '余生，请多指教',
    year: '2022',
    url: 'https://upload.wikimedia.org/wikipedia/zh/5/55/The_oath_of_love_official_poster.jpg',
    description: '《余生，请多指教》大提琴少女林之校，乐观坚毅，用琴声和真心治愈生活中的阴霾。',
    category: '剧照',
    tags: ['余生请多指教', '林之校', '暖心治愈']
  },
  {
    id: 'still_live',
    title: '杨紫线下品牌盛典 绝美活动高清现场照',
    role: '演员杨紫',
    drama: '线下盛典',
    year: '盛典经典',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Yang_Zi_at_Ryo_band_promotion%2C_Wuhan_of_China%2C_12_April_2019.jpg',
    description: '杨紫出席品牌活动线下高清抓拍，优雅从容，笑容灵动，状态极佳。',
    category: '活动生图',
    tags: ['线下活动', '活动生图', '杨紫美图', '优雅灵动']
  }
];

export const AUTHENTIC_AVATARS = [
  {
    id: 'av_live',
    label: '杨紫盛典绝美生图',
    role: '杨紫',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Yang_Zi_at_Ryo_band_promotion%2C_Wuhan_of_China%2C_12_April_2019.jpg'
  },
  {
    id: 'av_cxs',
    label: '《长相思》小夭',
    role: '小夭 / 玟小六',
    url: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Lost_You_Forever_promotional_poster.jpg'
  },
  {
    id: 'av_gsfh',
    label: '《国色芳华》何惟芳',
    role: '何惟芳',
    url: 'https://upload.wikimedia.org/wikipedia/zh/9/92/%E5%9B%BD%E8%89%B2%E8%8A%B3%E5%8D%8E%E6%B5%B7%E6%8A%A5.jpg'
  },
  {
    id: 'av_xm',
    label: '《香蜜》锦觅仙子',
    role: '锦觅',
    url: 'https://upload.wikimedia.org/wikipedia/en/6/61/Xiangmichenchen.jpg'
  },
  {
    id: 'av_tn',
    label: '《亲爱的》佟年',
    role: '佟年',
    url: 'https://upload.wikimedia.org/wikipedia/en/e/ed/Go_Go_Squid%21.jpg'
  },
  {
    id: 'av_chj',
    label: '《承欢记》麦承欢',
    role: '麦承欢',
    url: 'https://upload.wikimedia.org/wikipedia/zh/5/53/Best_Choice_Ever_%28%E6%89%BF%E6%AC%A2%E8%AE%B0%29.jpeg'
  },
  {
    id: 'av_cxrx',
    label: '《沉香如屑》颜淡',
    role: '颜淡',
    url: 'https://upload.wikimedia.org/wikipedia/en/6/61/Immortal_Samsara.jpg'
  },
  {
    id: 'av_ys',
    label: '《余生》林之校',
    role: '林之校',
    url: 'https://upload.wikimedia.org/wikipedia/zh/5/55/The_oath_of_love_official_poster.jpg'
  }
];
