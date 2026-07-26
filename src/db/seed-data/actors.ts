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
    bio: "日本演员，1920–1997。1947 年入东宝，与黑泽明合作十六部影片，包括《罗生门》《七武士》《用心棒》。1961 年与 1965 年两度获威尼斯电影节最佳男演员奖。1963 年起自组制片公司。",
    bioEn:
      "Japanese actor, 1920–1997. He joined Toho in 1947 and appeared in sixteen films with Akira Kurosawa, among them Rashomon, Seven Samurai and Yojimbo. He received the award for Best Actor at Venice twice, in 1961 and 1965, and set up his own production company in 1963.",
  },
  {
    slug: "setsuko-hara",
    name: "Setsuko Hara",
    nameZh: "原节子",
    primaryRole: "actor",
    tmdbPersonId: 95504,
    bio: "日本演员，1920–2015。1935 年出道，战后参演小津安二郎六部影片，其中三部饰演名为纪子的角色。1963 年小津去世同年息影，此后长居镰仓，不再公开露面，至 2015 年去世。",
    bioEn:
      "Japanese actor, 1920–2015. She began appearing in films in 1935 and after the war worked on six films with Ozu, playing a character named Noriko in three of them. She stopped acting in 1963, the year Ozu died, and lived in Kamakura without public appearances until her death in 2015.",
  },
  {
    slug: "giulietta-masina",
    name: "Giulietta Masina",
    nameZh: "朱丽叶塔·马西纳",
    primaryRole: "actor",
    tmdbPersonId: 5402,
    bio: "意大利演员，1921–1994。1943 年与费德里科·费里尼结婚，此后参演其多部影片，包括《大路》《卡比利亚之夜》《朱丽叶与魔鬼》。1957 年以《卡比利亚之夜》获戛纳电影节最佳女演员奖。",
    bioEn:
      "Italian actor, 1921–1994. She married Federico Fellini in 1943 and appeared in a number of his films, including La strada, Nights of Cabiria and Juliet of the Spirits. She received the award for Best Actress at Cannes in 1957 for Nights of Cabiria.",
  },
  {
    slug: "marcello-mastroianni",
    name: "Marcello Mastroianni",
    nameZh: "马塞洛·马斯楚安尼",
    primaryRole: "actor",
    tmdbPersonId: 5676,
    bio: "意大利演员，1924–1996。参演影片逾一百五十部，与费里尼合作《生活的甜蜜》《八部半》等六部作品，另与安东尼奥尼、维斯康蒂、德西卡等人合作。三度获奥斯卡最佳男主角提名。",
    bioEn:
      "Italian actor, 1924–1996. He appeared in more than a hundred and fifty films, working with Fellini six times, including La Dolce Vita and 8½, and also with Antonioni, Visconti and De Sica. He was nominated three times for the Academy Award for Best Actor.",
  },
  {
    slug: "takashi-shimura",
    name: "Takashi Shimura",
    nameZh: "志村乔",
    primaryRole: "actor",
    tmdbPersonId: 7453,
    bio: "日本演员，1905–1982。参演影片逾两百部，与黑泽明合作二十一部，包括《罗生门》《生之欲》《七武士》。另出演 1954 年的《哥斯拉》。",
    bioEn:
      "Japanese actor, 1905–1982. He appeared in more than two hundred films and worked with Kurosawa twenty-one times, including Rashomon, Ikiru and Seven Samurai. He also appeared in the 1954 Godzilla.",
  },
  {
    slug: "chishu-ryu",
    name: "Chishū Ryū",
    nameZh: "笠智众",
    primaryRole: "actor",
    tmdbPersonId: 33135,
    bio: "日本演员，1904–1993。1925 年入松竹，参演小津安二郎影片逾五十部，多饰演父亲一角，包括《晚春》《东京物语》《秋刀鱼之味》。演艺生涯延续逾六十年。",
    bioEn:
      "Japanese actor, 1904–1993. He joined Shochiku in 1925 and appeared in more than fifty of Ozu's films, frequently as the father, including Late Spring, Tokyo Story and An Autumn Afternoon. His career spanned more than sixty years.",
  },
  {
    slug: "anna-karina",
    name: "Anna Karina",
    nameZh: "安娜·卡里娜",
    primaryRole: "actor",
    tmdbPersonId: 18197,
    bio: "丹麦裔法国演员，1940–2019。原在哥本哈根做模特，1960 年起参演让-吕克·戈达尔的影片，共七部，包括《随心所欲》《狂人皮埃罗》。两人于 1961 至 1965 年间为夫妻。",
    bioEn:
      "Danish-French actor, 1940–2019. She worked as a model in Copenhagen before appearing from 1960 in seven films by Jean-Luc Godard, among them Vivre sa Vie and Pierrot le Fou. The two were married between 1961 and 1965.",
  },
  {
    slug: "marilyn-monroe",
    name: "Marilyn Monroe",
    nameZh: "玛丽莲·梦露",
    primaryRole: "actor",
    tmdbPersonId: 3149,
    bio: "美国演员，1926–1962。1950 年代主演多部喜剧与歌舞片，包括《绅士爱美人》《七年之痒》《热情如火》，并凭后者获金球奖最佳女主角。1962 年在洛杉矶去世，年三十六。",
    bioEn:
      "American actor, 1926–1962. She starred in a number of comedies and musicals in the 1950s, among them Gentlemen Prefer Blondes, The Seven Year Itch and Some Like It Hot, for which she received a Golden Globe. She died in Los Angeles in 1962, aged thirty-six.",
  },
  {
    slug: "marlon-brando",
    name: "Marlon Brando",
    nameZh: "马龙·白兰度",
    primaryRole: "actor",
    tmdbPersonId: 3084,
    bio: "美国演员，1924–2004。演员工作室出身，1951 年以《欲望号街车》成名，1954 年凭《码头风云》、1972 年凭《教父》两获奥斯卡最佳男主角奖，后者他拒绝领取。",
    bioEn:
      "American actor, 1924–2004. He trained at the Actors Studio and became known with A Streetcar Named Desire in 1951. He received the Academy Award for Best Actor twice, for On the Waterfront in 1954 and The Godfather in 1972, declining the second.",
  },
  {
    slug: "jeanne-moreau",
    name: "Jeanne Moreau",
    nameZh: "让娜·莫罗",
    primaryRole: "actor",
    tmdbPersonId: 14812,
    bio: "法国演员，1928–2017。原为法兰西喜剧院成员，1950 年代后期起参演路易·马勒、特吕弗、安东尼奥尼等人的影片，包括《夜》《朱尔与吉姆》。1960 年获戛纳电影节最佳女演员奖。",
    bioEn:
      "French actor, 1928–2017. She began at the Comédie-Française and from the late 1950s appeared in films by Louis Malle, Truffaut and Antonioni, among them La Notte and Jules and Jim. She received the award for Best Actress at Cannes in 1960.",
  },
  {
    slug: "max-von-sydow",
    name: "Max von Sydow",
    nameZh: "马克斯·冯·叙多",
    primaryRole: "actor",
    tmdbPersonId: 2201,
    bio: "瑞典演员，1929–2020。参演英格玛·伯格曼影片十一部，包括《第七封印》《处女泉》。1960 年代后期起在国际影坛工作，两度获奥斯卡提名，2002 年入法国籍。",
    bioEn:
      "Swedish actor, 1929–2020. He appeared in eleven films by Ingmar Bergman, including The Seventh Seal and The Virgin Spring. From the late 1960s he worked internationally, received two Academy Award nominations, and took French citizenship in 2002.",
  },
  {
    slug: "anthony-perkins",
    name: "Anthony Perkins",
    nameZh: "安东尼·博金斯",
    primaryRole: "actor",
    tmdbPersonId: 7301,
    bio: "美国演员，1932–1992。1957 年以《铁汉柔情》获奥斯卡提名，1960 年在《惊魂记》中饰演诺曼·贝茨，此后四度重演该角色。1992 年因艾滋病相关疾病去世。",
    bioEn:
      "American actor, 1932–1992. He received an Academy Award nomination for Friendly Persuasion in 1957 and played Norman Bates in Psycho in 1960, returning to the part four times afterwards. He died of an AIDS-related illness in 1992.",
  },
  {
    slug: "gloria-swanson",
    name: "Gloria Swanson",
    nameZh: "葛洛丽亚·斯旺森",
    primaryRole: "actor",
    tmdbPersonId: 8629,
    bio: "美国演员，1899–1983。默片时期的主要明星之一，1920 年代亦自任制片。有声片时期作品渐少，1950 年在《日落大道》中饰演过气默片女星诺玛·戴斯蒙德，获奥斯卡提名。",
    bioEn:
      "American actor, 1899–1983. She was among the leading stars of the silent period and also produced her own films in the 1920s. Her output declined after the arrival of sound, and in 1950 she played the forgotten silent star Norma Desmond in Sunset Boulevard, for which she was nominated for an Academy Award.",
  },

  // ── 华语电影 ────────────────────────────────────────────────────────
  {
    slug: "ruan-lingyu",
    name: "Ruan Lingyu",
    nameZh: "阮玲玉",
    primaryRole: "actor",
    tmdbPersonId: 1021587,
    bio: "中国演员，1910–1935。十六岁入行，共参演影片二十九部，包括《神女》《新女性》。1935 年三月自尽，年二十四，葬礼引发大规模围观，鲁迅曾就此事撰文。",
    bioEn:
      "Chinese actor, 1910–1935. She entered the industry at sixteen and appeared in twenty-nine films, among them The Goddess and New Women. She took her own life in March 1935 at twenty-four; the funeral drew enormous crowds, and Lu Xun wrote an essay on the affair.",
  },
  {
    slug: "zhou-xuan",
    name: "Zhou Xuan",
    nameZh: "周璇",
    primaryRole: "actor",
    tmdbPersonId: 1366187,
    bio: "中国演员、歌手，1920–1957。1930 年代在上海以歌唱与电影两栖成名，参演《马路天使》并演唱其中两首插曲，录制唱片逾两百首。1957 年病逝于上海，年三十七。",
    bioEn:
      "Chinese actor and singer, 1920–1957. She became known in Shanghai in the 1930s in both singing and film, appeared in Street Angel and performed two of its songs, and recorded more than two hundred titles. She died in Shanghai in 1957, aged thirty-seven.",
  },
  {
    slug: "wei-wei",
    name: "Wei Wei",
    nameZh: "韦伟",
    primaryRole: "actor",
    tmdbPersonId: 236193,
    // Birth year per TMDB; no death date recorded there. Left open rather
    // than asserting one we cannot verify — confirm before adding.
    bio: "中国演员，1922–2023。1940 年代在上海文华影业拍片，1948 年在费穆的《小城之春》中饰演周玉纹。1950 年代迁居香港，此后在当地影视界工作。",
    bioEn:
      "Chinese actor, 1922–2023. She worked at the Wenhua company in Shanghai in the 1940s and played Zhou Yuwen in Fei Mu's Spring in a Small Town in 1948. She moved to Hong Kong in the 1950s and worked there in film and television.",
  },
  {
    slug: "maggie-cheung",
    name: "Maggie Cheung",
    nameZh: "张曼玉",
    primaryRole: "actor",
    tmdbPersonId: 1338,
    bio: "香港演员，1964 年生。1983 年经选美入行，早期多演喜剧，其后转向剧情片。1992 年以《阮玲玉》获柏林电影节最佳女演员奖，2004 年以《清洁》获戛纳电影节最佳女演员奖。",
    bioEn:
      "Hong Kong actor, born 1964. She entered the industry through a beauty pageant in 1983 and worked mainly in comedies before turning to dramatic roles. She received the award for Best Actress at Berlin in 1992 for Center Stage and at Cannes in 2004 for Clean.",
  },
  {
    slug: "tony-leung-chiu-wai",
    name: "Tony Leung Chiu-wai",
    nameZh: "梁朝伟",
    primaryRole: "actor",
    tmdbPersonId: 1337,
    bio: "香港演员，1962 年生。自无线电视训练班出身，与王家卫合作七部影片，包括《重庆森林》《春光乍泄》《花样年华》。2000 年以《花样年华》获戛纳电影节最佳男演员奖。",
    bioEn:
      "Hong Kong actor, born 1962. He trained at the TVB actors' course and has worked with Wong Kar-wai on seven films, among them Chungking Express, Happy Together and In the Mood for Love. He received the award for Best Actor at Cannes in 2000 for In the Mood for Love.",
  },
  {
    slug: "hsu-feng",
    name: "Hsu Feng",
    nameZh: "徐枫",
    primaryRole: "actor",
    tmdbPersonId: 130394,
    bio: "台湾演员、制片人，1950 年生。1960 年代末起参演胡金铨的影片，包括《侠女》《龙门客栈》。1980 年代转任制片，创办汤臣电影公司，出品《霸王别姬》，该片 1993 年获戛纳电影节金棕榈奖。",
    bioEn:
      "Taiwanese actor and producer, born 1950. From the late 1960s she appeared in King Hu's films, including A Touch of Zen and Dragon Inn. She turned to producing in the 1980s and founded Tomson Films, which produced Farewell My Concubine, awarded the Palme d'Or at Cannes in 1993.",
  },
  {
    slug: "tatsuya-nakadai",
    name: "Tatsuya Nakadai",
    nameZh: "仲代达矢",
    primaryRole: "actor",
    tmdbPersonId: 70131,
    bio: "日本演员，1932–2025。参演影片逾一百部，与黑泽明合作五部，包括《用心棒》《影武者》《乱》，另主演小林正树的《切腹》与《人间的条件》。",
    bioEn:
      "Japanese actor, 1932–2025. He appeared in more than a hundred films, working with Kurosawa five times, including Yojimbo, Kagemusha and Ran, and starring in Masaki Kobayashi's Harakiri and The Human Condition.",
  },
  {
    slug: "james-stewart",
    name: "James Stewart",
    nameZh: "詹姆斯·斯图尔特",
    primaryRole: "actor",
    tmdbPersonId: 854,
    bio: "美国演员，1908–1997。1930 年代起在好莱坞工作，二战期间在美国陆军航空队服役并参与轰炸任务。与希区柯克合作四部影片，包括《后窗》《迷魂记》。1941 年获奥斯卡最佳男主角奖。",
    bioEn:
      "American actor, 1908–1997. He worked in Hollywood from the 1930s and served in the United States Army Air Forces during the war, flying combat missions. He made four films with Hitchcock, among them Rear Window and Vertigo. He received the Academy Award for Best Actor in 1941.",
  },
];
