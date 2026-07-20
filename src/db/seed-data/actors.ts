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

  // ── 华语电影 ────────────────────────────────────────────────────────
  {
    slug: "ruan-lingyu",
    name: "Ruan Lingyu",
    nameZh: "阮玲玉",
    primaryRole: "actor",
    tmdbPersonId: 1021587,
    bio: "中国演员，1910–1935。默片时代最好的一张脸：不靠字幕卡，只用眼睑与嘴角完成整段独白。1935 年自尽，年仅二十四岁，遗书上写着“人言可畏”。",
    bioEn:
      "Chinese actor, 1910–1935. The finest face of the silent era, capable of delivering an entire monologue with an eyelid and the corner of a mouth, no intertitle required. She took her own life in 1935 at twenty-four, leaving a note that read: gossip is a fearful thing.",
  },
  {
    slug: "zhou-xuan",
    name: "Zhou Xuan",
    nameZh: "周璇",
    primaryRole: "actor",
    tmdbPersonId: 1366187,
    bio: "中国演员、歌手，1920–1957。“金嗓子”，《马路天使》里唱《四季歌》与《天涯歌女》的歌女；歌声甜，命运苦，三十七岁病逝于上海。",
    bioEn:
      "Chinese actor and singer, 1920–1957. The “golden voice” of her generation and the singsong girl of Street Angel, where she performs the Four Seasons Song and The Wandering Songstress. The voice is sweet and the life was not; she died in Shanghai at thirty-seven.",
  },
  {
    slug: "wei-wei",
    name: "Wei Wei",
    nameZh: "韦伟",
    primaryRole: "actor",
    tmdbPersonId: 236193,
    // Birth year per TMDB; no death date recorded there. Left open rather
    // than asserting one we cannot verify — confirm before adding.
    bio: "中国演员，1922 年生。《小城之春》里的周玉纹：一部几乎没有事件的电影，全靠她走在城墙上的步子与几次不敢落下的目光撑住。",
    bioEn:
      "Chinese actor, born 1922. As Zhou Yuwen in Spring in a Small Town she carries a film in which almost nothing happens — held up entirely by the way she walks the ruined city wall and by the glances she cannot quite let land.",
  },
  {
    slug: "maggie-cheung",
    name: "Maggie Cheung",
    nameZh: "张曼玉",
    primaryRole: "actor",
    tmdbPersonId: 1338,
    bio: "香港演员，1964 年生。从选美与打闹喜剧起步，最终成为华语电影最精准的表演者之一：《花样年华》里她二十多件旗袍下的隐忍，比任何台词都清楚。",
    bioEn:
      "Hong Kong actor, born 1964. She began in beauty pageants and knockabout comedies and became one of the most precise performers in Chinese-language cinema; the restraint she holds beneath two dozen cheongsams in In the Mood for Love says more than any line of dialogue.",
  },
  {
    slug: "tony-leung-chiu-wai",
    name: "Tony Leung Chiu-wai",
    nameZh: "梁朝伟",
    primaryRole: "actor",
    tmdbPersonId: 1337,
    bio: "香港演员，1962 年生。王家卫的常用面孔，擅长演“不说”：《花样年华》结尾他对着吴哥窟的石洞说话，观众一个字也听不见，却全都懂了。",
    bioEn:
      "Hong Kong actor, born 1962. Wong Kar-wai's recurring face, and a specialist in the unsaid: at the close of In the Mood for Love he speaks into a hollow in the stone at Angkor and the audience hears not one word of it, yet understands all of it.",
  },
  {
    slug: "hsu-feng",
    name: "Hsu Feng",
    nameZh: "徐枫",
    primaryRole: "actor",
    tmdbPersonId: 130394,
    bio: "台湾演员、制片人，1950 年生。胡金铨镜头下的侠女杨慧贞，冷峻、不笑、几乎没有台词；后来转任制片，促成了《霸王别姬》。",
    bioEn:
      "Taiwanese actor and producer, born 1950. As Yang Hui-zhen in A Touch of Zen she is severe, unsmiling, and nearly wordless. She later turned producer and brought Farewell My Concubine into being.",
  },
  {
    slug: "tatsuya-nakadai",
    name: "Tatsuya Nakadai",
    nameZh: "仲代达矢",
    primaryRole: "actor",
    tmdbPersonId: 70131,
    bio: "日本演员，1932–2025。三船之外黑泽明的另一极：《乱》里的秀虎从暴君走到疯癫，白面妆下几乎只剩眼睛在演；《切腹》里则用一柄竹刀讨回全部尊严。",
    bioEn:
      "Japanese actor, 1932–2025. Kurosawa's other pole beside Mifune: his Hidetora in Ran walks from tyrant to madman with almost nothing left acting but the eyes beneath the white makeup, and in Harakiri he reclaims an entire family's dignity with a bamboo blade.",
  },
  {
    slug: "james-stewart",
    name: "James Stewart",
    nameZh: "詹姆斯·斯图尔特",
    primaryRole: "actor",
    tmdbPersonId: 854,
    bio: "美国演员，1908–1997。好莱坞最可信的好人，也正因如此，希区柯克用他来演坏掉的人：《迷魂记》里的痴迷与控制，恰恰因为那张脸本该无害才令人不安。",
    bioEn:
      "American actor, 1908–1997. Hollywood's most trustworthy decent man, which is precisely why Hitchcock cast him as men coming apart: the obsession and control of Vertigo unsettle exactly because that face was supposed to be harmless.",
  },
];
