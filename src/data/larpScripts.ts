export interface LarpScriptRole {
  id: string;
  name: string;
  title: string;
  title2?: string;
  secret: string;
  objective: string;
}

export interface LarpScriptClue {
  id: string;
  title: string;
  content: string;
  location: string;
  isPublic: boolean;
}

export interface LarpScriptDefinition {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  description: string;
  roles: LarpScriptRole[];
  clues: LarpScriptClue[];
  culpritRoleId: string;
  truth: string;
}

export const LARP_SCRIPTS: LarpScriptDefinition[] = [
  {
    id: 'script_changxiangsi',
    title: '《皓月长相思：清水镇失窃迷案》',
    subtitle: '古装仙侠 / 阵营推理 / 情感抉择 (4-6人)',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    description: '清水镇医馆「回春堂」内，镇馆灵药「九转还魂丹」于月圆之夜离奇失窃，现场留下一瓣紫金神莲与不明足迹。玟小六、涂山璟、相柳、玱玹各自怀揣秘密齐聚于此……',
    roles: [
      { id: 'role_xiaoliu', name: '玟小六', title: '回春堂执业医师', secret: '实为皓苓大王姬小夭，昨夜曾悄悄潜入丹房取药救治受伤的小白蛇。', objective: '查明真凶，保全回春堂众人安危，隐藏自己的大王姬身份。' },
      { id: 'role_jing', name: '涂山璟 (叶十七)', title: '青丘二公子', secret: '昨夜见有人影靠近丹房，悄悄设下了青丘防护灵阵，却被人以狐族密法破解。', objective: '协助玟小六洗脱嫌疑，寻找家族旧案线索。' },
      { id: 'role_xiangliu', name: '相柳', title: '辰荣义军军师 / 防风邶', secret: '辰荣伤兵急需灵药，昨夜确曾派属下潜入，但到达时灵药已被捷足先登。', objective: '获取灵药下落，阻止西炎暗探在清水镇扩散。' },
      { id: 'role_qiangxuan', name: '玱玹', title: '西炎王孙 (轩老板)', title2: '酒铺掌柜', secret: '奉命追查王姬下落并筹措军资，昨夜追踪一名黑衣人至丹房外。', objective: '找到失窃灵药，确认小六真实身世。' },
      { id: 'role_azhao', name: '阿念', title: '高辛二王姬', secret: '因赌气偷跑出宫，昨夜在回春堂屋顶赏月，目睹了偷盗者的身形。', objective: '保护玱玹哥哥，找出抢走丹药的恶徒。' }
    ],
    clues: [
      { id: 'c_1', title: '碎裂的玉瓶残片', content: '丹房地面上发现盛放九转丹的玉瓶碎片，上面带有淡淡的寒冰冷香与海潮气息。', location: '回春堂丹房', isPublic: true },
      { id: 'c_2', title: '青丘玉佩流苏', content: '窗棂上挂着一缕极细的银丝流苏，正是青丘商行特供材质。', location: '后院窗台', isPublic: true },
      { id: 'c_3', title: '西炎密信残页', content: '写有“月圆夜、起事、取药勿留活口”的烧焦字迹。', location: '酒铺暗格', isPublic: false },
      { id: 'c_4', title: '冰魄九转药香', content: '相柳身旁隐约有冰晶凝结，而小六袖口沾有药草汁液。', location: '石桥边', isPublic: true }
    ],
    culpritRoleId: 'role_jing',
    truth: '真正拿走丹药的乃是受涂山篌密探诱导的青丘暗桩，涂山璟为救属下性命提前调包并藏匿于回春堂地窖枯井中。若指认出涂山璟调包真相且保护了小六身份，全员达成真结局【长相思·月照归舟】！'
  },
  {
    id: 'script_guose',
    title: '《芳华盛宴：牡丹奇香迷踪》',
    subtitle: '盛唐经商 / 悬疑谍影 / 牡丹奇香 (4-6人)',
    cover: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80',
    description: '长安名动天下的牡丹名园内，御赐绝品「国色金腰带」一夜之间枯萎变色，花蕊中赫然发现剧毒乌头散……培育大师何惟芳、蒋长扬与京城贵客卷入风波。',
    roles: [
      { id: 'role_heweifang', name: '何惟芳', title: '百花匠人 / 芳华坊主', secret: '牡丹名花被投毒前，曾收到神秘来信索要秘传莳花谱。', objective: '拯救牡丹名品，找出企图陷害芳华坊的幕后黑手。' },
      { id: 'role_jiangchangyang', name: '蒋长扬', title: '花鸟使 / 潜龙暗卫', secret: '假借赏花之名，暗中监视刺史与外邦商队的暗号往来。', objective: '揪出利用名花走私军情密卷的内应。' },
      { id: 'role_shangke', name: '刘畅', title: '商贾贵胄', secret: '欠下巨额赌债，企图盗取莳花秘方变卖抵债。', objective: '嫁祸他人，谋夺国色牡丹经营特权。' },
      { id: 'role_yushi', name: '沈大人', title: '御史台按察', secret: '掌握了朝中重臣贪墨牡丹贡银的账本。', objective: '顺藤摸瓜，将贪墨党羽一网打尽。' }
    ],
    clues: [
      { id: 'cg_1', title: '被调换的花泥', content: '国色牡丹根部土壤掺杂了西域孔雀石粉与乌头研磨物。', location: '牡丹花坛', isPublic: true },
      { id: 'cg_2', title: '沾染金粉的袖口', content: '刘畅的织锦外袍上留有一抹极为细碎的花粉痕迹。', location: '雅间客座', isPublic: true },
      { id: 'cg_3', title: '秘传莳花谱残页', content: '从水榭石缝中搜出的纸页，边缘有撕裂痕迹。', location: '曲江池畔', isPublic: false }
    ],
    culpritRoleId: 'role_shangke',
    truth: '刘畅买通花匠在花泥中投毒，妄图让名花枯萎从而低价抄底芳华坊。何惟芳早有防备，以金蝉脱壳之计保住了真花！'
  }
];
