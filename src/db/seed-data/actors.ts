import type { SeedDirector } from "./types";

/**
 * Curated actors (primaryRole "actor" — canonical URL /actor/[slug]).
 * 收录即推荐 applies to people: only actors who anchor the corpus get
 * entries; every other cast credit stays an unlinked film_cast row.
 * `tmdbPersonId` is always pinned — the portrait search fallback can't be
 * trusted for actors with namesakes. Cast rows point here via
 * `personSlug` in films.ts; link-cast.ts backfills existing databases.
 *
 * Ordered: multi-film anchors first, then single-film icons.
 */
export const seedActors: SeedDirector[] = [
  {
    slug: "toshiro-mifune",
    name: "Toshiro Mifune",
    nameZh: "三船敏郎",
    primaryRole: "actor",
    tmdbPersonId: 7450,
    bio: "日本演员，1920–1997。黑泽明的银幕化身，十六部合作片里的火山：狂放的强盗、伪装成疯犬的武士、剃刀般的浪人，动作快过思想，却总在某个瞬间露出羞怯。",
    bioEn:
      "Japanese actor, 1920–1997. Kurosawa's screen incarnation across sixteen films — a volcano of an actor whose bandits, mad-dog samurai and razor-sharp ronin move faster than thought, then betray a sudden shyness.",
  },
  {
    slug: "setsuko-hara",
    name: "Setsuko Hara",
    nameZh: "原节子",
    primaryRole: "actor",
    tmdbPersonId: 95504,
    bio: "日本演员，1920–2015。小津镜头里三个「纪子」的面孔：微笑之下藏着拒绝与哀伤。1963 年息影后半个世纪深居简出，把「永远的女儿」留在了银幕上。",
    bioEn:
      "Japanese actor, 1920–2015. The face of Ozu's three Norikos — a smile with refusal and grief folded inside it. She retired in 1963 and lived half a century in seclusion, leaving the eternal daughter on screen.",
  },
  {
    slug: "giulietta-masina",
    name: "Giulietta Masina",
    nameZh: "朱丽叶塔·马西纳",
    primaryRole: "actor",
    tmdbPersonId: 5402,
    bio: "意大利演员，1921–1994。费里尼的妻子与缪斯，被称作「女卓别林」：杰尔索米娜与卡比利亚的那双眼睛，把喜剧的天真和悲剧的知情放在同一张脸上。",
    bioEn:
      "Italian actor, 1921–1994. Fellini's wife and muse, often called a female Chaplin: the eyes of Gelsomina and Cabiria hold comic innocence and tragic knowledge in a single face.",
  },
  {
    slug: "marcello-mastroianni",
    name: "Marcello Mastroianni",
    nameZh: "马塞洛·马斯楚安尼",
    primaryRole: "actor",
    tmdbPersonId: 5676,
    bio: "意大利演员，1924–1996。现代主义电影的疲惫面孔：费里尼的另一个自我、安东尼奥尼的失语丈夫。他把「无所作为」演成了一种优雅，也演成了一种病。",
    bioEn:
      "Italian actor, 1924–1996. The weary face of modernist cinema — Fellini's alter ego, Antonioni's speechless husband. He played inertia as an elegance, and as an illness.",
  },
  {
    slug: "takashi-shimura",
    name: "Takashi Shimura",
    nameZh: "志村乔",
    primaryRole: "actor",
    tmdbPersonId: 7453,
    bio: "日本演员，1905–1982。黑泽明班底的另一根支柱：《七武士》里沉稳的勘兵卫，《生之欲》里在秋千上唱歌的渡边。三船是火，他是承接火焰的大地。",
    bioEn:
      "Japanese actor, 1905–1982. The other pillar of Kurosawa's company: Kambei's calm authority in Seven Samurai, Watanabe singing on the swing in Ikiru. Mifune was the fire; Shimura was the ground that received it.",
  },
  {
    slug: "chishu-ryu",
    name: "Chishū Ryū",
    nameZh: "笠智众",
    primaryRole: "actor",
    tmdbPersonId: 33135,
    bio: "日本演员，1904–1993。小津电影里近乎恒常的父亲：语调平缓，坐姿端正，把告别说成「是吗」。他用几十年的克制证明，最深的情感可以几乎不动声色。",
    bioEn:
      "Japanese actor, 1904–1993. The near-constant father of Ozu's cinema — level voice, upright posture, farewells spoken as a quiet 'is that so.' Decades of restraint proving the deepest feeling can pass almost without expression.",
  },
  {
    slug: "anna-karina",
    name: "Anna Karina",
    nameZh: "安娜·卡里娜",
    primaryRole: "actor",
    tmdbPersonId: 18197,
    bio: "丹麦裔法国演员，1940–2019。新浪潮的面孔：戈达尔七部影片里的娜娜与玛丽安娜，会突然对着镜头眨眼。她让「被拍摄」本身成了表演的一部分。",
    bioEn:
      "Danish-French actor, 1940–2019. The face of the New Wave: Godard's Nana and Marianne across seven films, liable to wink straight into the lens. She made being filmed part of the performance itself.",
  },
  {
    slug: "marilyn-monroe",
    name: "Marilyn Monroe",
    nameZh: "玛丽莲·梦露",
    primaryRole: "actor",
    tmdbPersonId: 3149,
    bio: "美国演员，1926–1962。被神话吞没的喜剧演员：《热情如火》里的糖果·凯恩证明，她的节奏感和脆弱感一样精确。银幕形象越亮，人越看不见。",
    bioEn:
      "American actor, 1926–1962. A comedian swallowed by her own myth: Sugar Kane in Some Like It Hot proves her timing was as precise as her fragility. The brighter the image burned, the harder the person was to see.",
  },
  {
    slug: "marlon-brando",
    name: "Marlon Brando",
    nameZh: "马龙·白兰度",
    primaryRole: "actor",
    tmdbPersonId: 3084,
    bio: "美国演员，1924–2004。方法派表演的分水岭：《码头风云》里的特里让「我本可以有出息」成了整代人的台词。他之后，银幕上的男人换了一种呼吸方式。",
    bioEn:
      "American actor, 1924–2004. The watershed of Method acting: Terry Malloy's 'I coulda been a contender' became a generation's line. After him, men on screen breathed differently.",
  },
  {
    slug: "jeanne-moreau",
    name: "Jeanne Moreau",
    nameZh: "让娜·莫罗",
    primaryRole: "actor",
    tmdbPersonId: 14812,
    bio: "法国演员，1928–2017。智性与感官在同一张脸上：安东尼奥尼的莉迪亚、特吕弗的凯瑟琳、马勒的电梯之夜。她走路的样子本身就是一种叙事。",
    bioEn:
      "French actor, 1928–2017. Intellect and sensuality on one face: Antonioni's Lidia, Truffaut's Catherine, Malle's night in the elevator. The way she walked was already narration.",
  },
  {
    slug: "max-von-sydow",
    name: "Max von Sydow",
    nameZh: "马克斯·冯·叙多",
    primaryRole: "actor",
    tmdbPersonId: 2201,
    bio: "瑞典演员，1929–2020。伯格曼的十一部影片里，他是与死神对弈的骑士、面对沉默上帝的信徒。那张骨骼分明的脸，天生适合承载形而上的重量。",
    bioEn:
      "Swedish actor, 1929–2020. Across eleven Bergman films he was the knight who played chess with Death, the believer facing a silent God — a face whose architecture was built for metaphysical weight.",
  },
  {
    slug: "anthony-perkins",
    name: "Anthony Perkins",
    nameZh: "安东尼·博金斯",
    primaryRole: "actor",
    tmdbPersonId: 7301,
    bio: "美国演员，1932–1992。诺曼·贝茨既成就也囚禁了他：那种彬彬有礼的紧张、随时会碎的微笑，让「邻家男孩」从此成了悬疑本身。",
    bioEn:
      "American actor, 1932–1992. Norman Bates both made and imprisoned him: that courteous nervousness, a smile always about to crack — after him, the boy next door was suspense itself.",
  },
  {
    slug: "gloria-swanson",
    name: "Gloria Swanson",
    nameZh: "葛洛丽亚·斯旺森",
    primaryRole: "actor",
    tmdbPersonId: 8629,
    bio: "美国演员，1899–1983。默片时代的女王，在《日落大道》里扮演被有声片抛下的女王：诺玛·德斯蒙德是表演，也是一次带着刀锋的自我注解。",
    bioEn:
      "American actor, 1899–1983. A queen of the silent era who, in Sunset Boulevard, played a queen the talkies left behind: Norma Desmond is a performance, and a self-annotation with a blade in it.",
  },
];
