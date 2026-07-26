import { doc, p } from "./tiptap";
import type { SeedList } from "./types";

/**
 * 策展片单 — the core product. Order is the argument (顺序即立场): each
 * item's position is deliberate, and its `reasoning` says why it earns
 * that spot. `filmSlug` references `films.ts`; the list at sortOrder 0
 * becomes the homepage featured list.
 */
export const seedLists: SeedList[] = [
  {
    slug: "chinese-canon",
    title: "华语经典",
    theme: "从 1934 年的上海到 2000 年的香港，八部华语影片",
    titleEn: "The Chinese-Language Canon",
    themeEn: "Eight Chinese-language films, from Shanghai in 1934 to Hong Kong in 2000",
    intro: doc([
      p(
        "本片单收录八部华语影片，年代自 1934 年至 2000 年。其中四部摄于 1949 年以前的上海，三部出自台湾，一部为香港作品。排列不依年代先后：以 1948 年的《小城之春》起始，1934 年的《神女》次之，末为 2000 年的《花样年华》。",
      ),
    ]),
    introEn: doc([
      p(
        "This list gathers eight Chinese-language films made between 1934 and 2000. Four were produced in Shanghai before 1949, three in Taiwan and one in Hong Kong. They are not arranged by date: the list opens with Spring in a Small Town from 1948, follows it with The Goddess from 1934, and closes with In the Mood for Love from 2000.",
      ),
    ]),
    sortOrder: 0,
    // Deliberately a B&W film: list covers render through a hard grayscale
    // filter (see ADR 0015), so a colour cover would arrive desaturated.
    coverFilmSlug: "spring-in-a-small-town",
    items: [
      {
        filmSlug: "spring-in-a-small-town",
        reasoning: doc([
          p(
            "1948 年文华影业出品，全片五个角色，场景限于一座宅院与一段残破的城墙。1980 年代重新流通后，多次在华语影史评选中列于首位。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Produced by Wenhua in 1948, with five characters and its action confined to one courtyard house and a stretch of ruined town wall. Since returning to circulation in the 1980s it has placed first in several polls of Chinese-language cinema.",
          ),
        ]),
      },
      {
        filmSlug: "the-goddess",
        reasoning: doc([
          p(
            "1934 年联华影业出品，为名单中年代最早的一部，也是唯一的无声片。主演阮玲玉于次年去世，年二十四。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Produced by Lianhua in 1934, the earliest film here and the only silent one. Ruan Lingyu, who plays the lead, died the following year at twenty-four.",
          ),
        ]),
      },
      {
        filmSlug: "street-angel",
        reasoning: doc([
          p(
            "1937 年明星影片公司出品，袁牧之编导，周璇与赵丹主演。片中《四季歌》与《天涯歌女》两首插曲由田汉作词、贺绿汀配乐，至今仍在传唱。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Produced by Mingxing in 1937, written and directed by Yuan Muzhi, with Zhou Xuan and Zhao Dan. Its two songs, with lyrics by Tian Han and music arranged by He Luting, are still widely sung.",
          ),
        ]),
      },
      {
        filmSlug: "the-spring-river-flows-east",
        reasoning: doc([
          p(
            "1947 年昆仑影业出品，蔡楚生与郑君里合导，分上下两集，全长约三小时，在上海连映三个多月。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Produced by Kunlun in 1947 and directed by Cai Chusheng with Zheng Junli. Released in two parts running about three hours in total, it played in Shanghai for more than three months.",
          ),
        ]),
      },
      {
        filmSlug: "a-touch-of-zen",
        reasoning: doc([
          p(
            "1971 年台港合拍，胡金铨编导，为名单中唯一的类型片。1975 年它在戛纳获奖，是华语电影首次在该影展获得奖项。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "A 1971 Taiwan and Hong Kong co-production written and directed by King Hu, and the only genre film here. Its award at Cannes in 1975 was the first taken at that festival by a Chinese-language film.",
          ),
        ]),
      },
      {
        filmSlug: "a-time-to-live-a-time-to-die",
        reasoning: doc([
          p(
            "1985 年侯孝贤作品，取材自他在凤山的成长经历，多用固定长镜头，属台湾新电影时期的代表作之一。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Hou Hsiao-hsien's 1985 film, drawn from his own upbringing in Fengshan and built largely from fixed long takes. It is one of the principal works of the Taiwan New Cinema period.",
          ),
        ]),
      },
      {
        filmSlug: "a-brighter-summer-day",
        reasoning: doc([
          p(
            "1991 年杨德昌作品，为名单中篇幅最长的一部。演员多为非职业，张震拍摄时十四岁，其父张国柱在片中饰演他的父亲。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Edward Yang's 1991 film and the longest here. Most of the cast were non-professionals; Chang Chen was fourteen during the shoot, and his own father plays his father in the film.",
          ),
        ]),
      },
      {
        filmSlug: "in-the-mood-for-love",
        reasoning: doc([
          p("2000 年王家卫作品，为名单中年代最晚的一部；梁朝伟凭本片获该届戛纳最佳男演员奖。"),
        ]),
        reasoningEn: doc([
          p(
            "Wong Kar-wai's film from 2000, the most recent on the list, and the one for which Tony Leung took the acting award at Cannes that year.",
          ),
        ]),
      },
    ],
  },
  {
    slug: "into-black-and-white",
    title: "黑白影像入门",
    theme: "八部黑白影片，年代自 1928 年至 1960 年",
    titleEn: "A Black-and-White Primer",
    themeEn: "Eight black-and-white films, made between 1928 and 1960",
    introEn: doc([
      p(
        "Eight black-and-white films made between 1928 and 1960, from France, Italy, the United States, Japan and Sweden. The earliest is a silent. Colour processes were available when the other seven were made; black and white nonetheless remained standard practice in each of these industries, largely on grounds of cost.",
      ),
    ]),
    sortOrder: 1,
    coverFilmSlug: "seven-samurai",
    intro: doc([
      p(
        "本片单收录八部黑白影片，年代自 1928 年至 1960 年，出自法国、意大利、美国、日本与瑞典。其中最早的一部为默片。其余七部摄制时彩色工艺均已可用，而各国的常规产品仍以黑白为主，成本是主要原因。",
      ),
    ]),
    items: [
      {
        filmSlug: "bicycle-thieves",
        reasoning: doc([
          p("1948 年德西卡作品，摄影卡洛·蒙托里，全片在罗马街头以自然光拍摄，未使用摄影棚。"),
        ]),
        reasoningEn: doc([
          p(
            "De Sica's 1948 film, photographed by Carlo Montuori entirely on the streets of Rome in available light, with no studio work.",
          ),
        ]),
      },
      {
        filmSlug: "tokyo-story",
        reasoning: doc([
          p("1953 年小津安二郎作品，摄影厚田雄春。室内多用均匀的散射光，很少制造强烈的明暗对比。"),
        ]),
        reasoningEn: doc([
          p(
            "Ozu's 1953 film, photographed by Yūharu Atsuta. Interiors are lit evenly and diffusely, with little strong contrast between light and shadow.",
          ),
        ]),
      },
      {
        filmSlug: "seven-samurai",
        reasoning: doc([
          p(
            "1954 年黑泽明作品，摄影中井朝一，全片以阴天的自然光为主，结尾的战斗在泥地与人工降雨中完成。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Kurosawa's 1954 film, photographed by Asakazu Nakai largely in the flat light of overcast weather. Its final battle was staged in mud under artificial rain.",
          ),
        ]),
      },
      {
        filmSlug: "the-seventh-seal",
        reasoning: doc([
          p("1957 年伯格曼作品，以约三十五天拍成，摄影为贡纳尔·菲舍尔，获同年戛纳评审团特别奖。"),
        ]),
        reasoningEn: doc([
          p(
            "Bergman's 1957 film, shot in about thirty-five days and photographed by Gunnar Fischer. It took the special jury prize at Cannes that year.",
          ),
        ]),
      },
      {
        filmSlug: "citizen-kane",
        reasoning: doc([
          p(
            "1941 年威尔斯首部长片，摄影格雷格·托兰主动要求参与，片尾字幕将他与导演并列于同一张卡片上，这在当时极少见。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Welles's first feature, from 1941. Gregg Toland asked to shoot it, and the closing credits put his name on a single card with the director's, which was almost unheard of.",
          ),
        ]),
      },
      {
        filmSlug: "breathless",
        reasoning: doc([
          p(
            "摄影拉乌尔·库塔尔为戈达尔这部 1960 年的首作使用了为静照生产的高感光胶片，接成长卷，以便在自然光下于巴黎街头拍摄。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Raoul Coutard shot Godard's 1960 debut on high-speed stock made for stills photography, spliced into long rolls, so that the Paris streets could be filmed in available light.",
          ),
        ]),
      },
      {
        filmSlug: "la-strada",
        reasoning: doc([
          p(
            "1954 年费里尼作品，奥特罗·马泰利摄影，外景多在意大利中部的冬季拍摄，荒地与阴天构成全片的基调。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Fellini's 1954 film, photographed by Otello Martelli, its exteriors shot in central Italy in winter; waste ground and overcast light set the tone throughout.",
          ),
        ]),
      },
      {
        filmSlug: "the-passion-of-joan-of-arc",
        reasoning: doc([
          p(
            "1928 年德莱叶作品，摄影鲁道夫·马泰，全片以大量特写构成。演员一律不施粉黛，在当时是罕见的做法。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Dreyer's 1928 film, photographed by Rudolph Maté and built largely from close-ups. The cast wore no makeup, which was unusual at the time.",
          ),
        ]),
      },
    ],
  },
  {
    slug: "fellini-primer",
    title: "费里尼入门",
    theme: "三部影片，1954 至 1963 年的费里尼",
    titleEn: "A Fellini Primer",
    themeEn: "Three films, Fellini from 1954 to 1963",
    introEn: doc([
      p(
        "Three Fellini films, made between 1954 and 1963 and arranged by date. La Strada and Nights of Cabiria both star his wife Giulietta Masina, and those two films and 8½ each received the Academy Award for Best Foreign Language Film; Fellini won it four times in all.",
      ),
    ]),
    sortOrder: 2,
    coverFilmSlug: "otto-e-mezzo",
    intro: doc([
      p(
        "本片单收录费里尼的三部影片，摄于 1954 至 1963 年，依年代排列。《大路》与《卡比利亚之夜》的主演均为其妻朱丽叶塔·马西纳，两片与《八部半》先后获奥斯卡最佳外语片；费里尼一生四次获得该奖。",
      ),
    ]),
    items: [
      {
        filmSlug: "la-strada",
        reasoning: doc([
          p(
            "1954 年作品，费里尼由新现实主义转向的开始，也是他与作曲家尼诺·罗塔长期合作中的早期一部。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "From 1954, the start of Fellini's move away from neorealism, and an early film in his long working relationship with the composer Nino Rota.",
          ),
        ]),
      },
      {
        filmSlug: "le-notti-di-cabiria",
        reasoning: doc([
          p(
            "1957 年作品，马西纳凭此片获戛纳最佳女演员奖。这是费里尼最后一部以罗马底层为题材的影片。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "From 1957, and the film for which Masina took the acting award at Cannes. It is the last of Fellini's films set among the poor of Rome.",
          ),
        ]),
      },
      {
        filmSlug: "otto-e-mezzo",
        reasoning: doc([
          p(
            "1963 年作品，马斯楚安尼饰演的圭多是一名导演，为费里尼首次以拍电影本身为题材，此后的《朱丽叶与魔鬼》《罗马风情画》延续这一倾向。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "From 1963, and the first time Fellini took film-making itself as his subject, with Mastroianni as a director named Guido. Juliet of the Spirits and Roma continue in the same direction.",
          ),
        ]),
      },
    ],
  },
  {
    slug: "italian-neorealism",
    title: "意大利新现实主义",
    theme: "三部影片，战后意大利的实景与非职业演员",
    titleEn: "Italian Neorealism",
    themeEn: "Three films from postwar Italy, shot on location with non-professionals",
    introEn: doc([
      p(
        "Italian neorealism refers to a body of films made in Italy from about 1945 into the early 1950s, generally shot on location, often with non-professional actors, and concerned with poverty and unemployment after the war. Two of the three films here are by Fellini and mark the turn toward more personal subjects.",
      ),
    ]),
    sortOrder: 3,
    coverFilmSlug: "bicycle-thieves",
    intro: doc([
      p(
        "意大利新现实主义指 1945 年前后至 1950 年代初的一批意大利影片，多在实景拍摄，常用非职业演员，题材集中于战后的贫困与失业。本片单收录三部，其中两部为费里尼作品，标志这一路数向个人题材的转向。",
      ),
    ]),
    items: [
      {
        filmSlug: "bicycle-thieves",
        reasoning: doc([
          p(
            "1948 年德西卡作品，主演兰贝托·马乔拉尼原为工人，此前没有表演经验，全片在罗马实景拍摄。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "De Sica's 1948 film. Lamberto Maggiorani, its lead, was a factory worker with no previous acting experience, and the film was shot on location in Rome.",
          ),
        ]),
      },
      {
        filmSlug: "la-strada",
        reasoning: doc([
          p(
            "1954 年费里尼作品，仍在实景拍摄，但转向寓言式的人物关系，当时曾被部分左翼评论视为背离这一路数。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Fellini's 1954 film, still shot on location but turning toward a fable-like relationship between its characters. Some left-wing critics of the day treated it as a departure.",
          ),
        ]),
      },
      {
        filmSlug: "le-notti-di-cabiria",
        reasoning: doc([
          p(
            "1957 年费里尼作品，外景在罗马郊外实地拍摄，片中的棚户区与卡比利亚的住处均为实景，工作方式仍是这一路数的。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Fellini's 1957 film, shot on location on the outskirts of Rome, where the shanty settlement and Cabiria's own house are real places. The working method is still the movement's.",
          ),
        ]),
      },
    ],
  },
  {
    slug: "french-new-wave",
    title: "法国新浪潮",
    theme: "三部影片，1959 至 1962 年的法国",
    titleEn: "The French New Wave",
    themeEn: "Three films from France, 1959 to 1962",
    introEn: doc([
      p(
        "The French New Wave refers to a body of films made in France from the late 1950s. Most of the directors had written criticism first, many of them at Cahiers du Cinéma, and their films were commonly made cheaply, on location and with handheld cameras. One of the three here is by Truffaut and two are by Godard.",
      ),
    ]),
    sortOrder: 4,
    coverFilmSlug: "breathless",
    intro: doc([
      p(
        "法国新浪潮指 1950 年代末起的一批法国影片。多数导演此前为影评人，其中不少出自《电影手册》；作品以低成本、实景与手持摄影为常见做法。本片单收录三部，一部为特吕弗作品，两部为戈达尔作品。",
      ),
    ]),
    items: [
      {
        filmSlug: "the-400-blows",
        reasoning: doc([
          p(
            "1959 年特吕弗首部长片，让-皮埃尔·雷奥主演，取材自导演本人的少年经历，获该届戛纳最佳导演奖。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Truffaut's first feature, from 1959, starring Jean-Pierre Léaud and drawn from the director's own adolescence. It won the directing prize at Cannes that year.",
          ),
        ]),
      },
      {
        filmSlug: "breathless",
        reasoning: doc([
          p("1960 年戈达尔首部长片，故事大纲由特吕弗提供，获柏林电影节最佳导演银熊奖。"),
        ]),
        reasoningEn: doc([
          p(
            "Godard's first feature, from 1960, worked up from an outline by Truffaut. It took the Silver Bear for direction at Berlin.",
          ),
        ]),
      },
      {
        filmSlug: "vivre-sa-vie",
        reasoning: doc([
          p(
            "1962 年戈达尔作品，安娜·卡里娜主演，全片分十二段，每段前加字幕，获威尼斯电影节评审团特别奖。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Godard's 1962 film, with Anna Karina, divided into twelve sections each introduced by a title card. It received the special jury prize at Venice.",
          ),
        ]),
      },
    ],
  },
  {
    slug: "japanese-golden-age",
    title: "日本电影的黄金时代",
    theme: "六部影片，1950 至 1954 年的日本",
    titleEn: "The Golden Age of Japanese Cinema",
    themeEn: "Six films from Japan, 1950 to 1954",
    introEn: doc([
      p(
        "Six Japanese films made between 1950 and 1954, by Kurosawa, Ozu and Mizoguchi. Japanese cinema began taking prizes at European festivals in these years: Rashomon won the Golden Lion at Venice in 1951, and Ugetsu and Sansho the Bailiff took Silver Lions there in 1953 and 1954.",
      ),
    ]),
    sortOrder: 5,
    coverFilmSlug: "tokyo-story",
    intro: doc([
      p(
        "本片单收录六部日本影片，摄于 1950 至 1954 年，出自黑泽明、小津安二郎与沟口健二三人。日本影片自这一时期起在欧洲影展获奖：《罗生门》获 1951 年威尼斯金狮奖，《雨月物语》与《山椒大夫》分获 1953 与 1954 年威尼斯银狮奖。",
      ),
    ]),
    items: [
      {
        filmSlug: "rashomon",
        reasoning: doc([
          p(
            "1950 年黑泽明作品，改编自芥川龙之介的两则短篇，获 1951 年威尼斯金狮奖与次年奥斯卡荣誉奖。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Kurosawa's 1950 film, adapted from two stories by Ryūnosuke Akutagawa. It won the Golden Lion at Venice in 1951 and an honorary Academy Award the following year.",
          ),
        ]),
      },
      {
        filmSlug: "tokyo-story",
        reasoning: doc([
          p("1953 年小津作品，剧本与野田高梧合写。名单六部中只有本片与《生存》以当代为背景。"),
        ]),
        reasoningEn: doc([
          p(
            "Ozu's 1953 film, written with Kōgo Noda. It and Ikiru are the only two of these six set in the present day.",
          ),
        ]),
      },
      {
        filmSlug: "ugetsu",
        reasoning: doc([
          p("1953 年沟口健二作品，改编自上田秋成的同名小说集，摄影宫川一夫，获该届威尼斯银狮奖。"),
        ]),
        reasoningEn: doc([
          p(
            "Mizoguchi's 1953 film, adapted from Ueda Akinari's collection of the same name and photographed by Kazuo Miyagawa. It took a Silver Lion at Venice that year.",
          ),
        ]),
      },
      {
        filmSlug: "sansho-the-bailiff",
        reasoning: doc([
          p(
            "1954 年沟口健二作品，取材自森鸥外的同名小说。连同前两年的《西鹤一代女》与《雨月物语》，沟口连续三年在威尼斯获奖。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Mizoguchi's 1954 film, taken from Mori Ōgai's story of the same title. With The Life of Oharu and Ugetsu in the two preceding years, it gave him prizes at Venice three years running.",
          ),
        ]),
      },
      {
        filmSlug: "seven-samurai",
        reasoning: doc([
          p("1954 年黑泽明作品，东宝出品，片长约二百零七分钟，与《山椒大夫》同届在威尼斯获奖。"),
        ]),
        reasoningEn: doc([
          p(
            "Kurosawa's 1954 film for Toho, running about two hundred and seven minutes. It was honoured at the same Venice festival as Sansho the Bailiff.",
          ),
        ]),
      },
      {
        filmSlug: "ikiru",
        reasoning: doc([p("1952 年黑泽明作品，志村乔主演，获 1954 年柏林电影节特别奖。")]),
        reasoningEn: doc([
          p(
            "Kurosawa's 1952 film, with Takashi Shimura in the lead. It received a special prize at the Berlin festival in 1954.",
          ),
        ]),
      },
    ],
  },
  {
    slug: "silent-cinemas-last-light",
    title: "默片的最后光芒",
    theme: "六部默片，1922 至 1931 年",
    titleEn: "Silent Cinema's Last Light",
    themeEn: "Six silent films, 1922 to 1931",
    introEn: doc([
      p(
        "Six silent films made between 1922 and 1931, from Germany, the Soviet Union, France and the United States. Sound was introduced commercially in the United States from 1927, and silent production fell away quickly over the next few years. The latest film here, City Lights, was made after sound had become standard and was released without dialogue, carrying only a recorded score and effects.",
      ),
    ]),
    sortOrder: 6,
    coverFilmSlug: "sunrise",
    intro: doc([
      p(
        "本片单收录六部默片，年代自 1922 年至 1931 年，出自德国、苏联、法国与美国。有声片自 1927 年起在美国推广，此后数年各国默片产量迅速下降。名单中年代最晚的《城市之光》摄于有声片已成主流之后，仍以默片形式拍摄，只配音乐与音效。",
      ),
    ]),
    items: [
      {
        filmSlug: "battleship-potemkin",
        reasoning: doc([
          p(
            "1925 年爱森斯坦作品，摄影爱德华·蒂塞。影片在多国长期遭禁，英国的审查机构至 1954 年才准其公映。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Eisenstein's 1925 film, photographed by Eduard Tisse. It was banned in a number of countries for years; the British censors refused it a certificate until 1954.",
          ),
        ]),
      },
      {
        filmSlug: "metropolis",
        reasoning: doc([
          p("1927 年弗里茨·朗作品，为当时成本最高的德国影片，乌发公司因其开销陷入财务困境。"),
        ]),
        reasoningEn: doc([
          p(
            "Fritz Lang's 1927 film and the most expensive German production of its day; its cost pushed the UFA studio into financial difficulty.",
          ),
        ]),
      },
      {
        filmSlug: "nosferatu",
        reasoning: doc([
          p(
            "1922 年茂瑙作品，因未获授权改编《德古拉》遭诉讼，法院判决销毁拷贝，影片赖此前已流出的拷贝存世。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Murnau's 1922 film, an unauthorised adaptation of Dracula. The resulting lawsuit ended in an order to destroy the prints; it survives through copies that had already circulated.",
          ),
        ]),
      },
      {
        filmSlug: "the-passion-of-joan-of-arc",
        reasoning: doc([
          p(
            "1928 年德莱叶作品，台词取自 1431 年的审判记录，以字幕卡呈现。原始底片佚失，1981 年在奥斯陆一家精神病院寻得一份完整拷贝。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Dreyer's 1928 film, its words taken from the trial records of 1431 and carried on intertitles. The original negative was lost; a complete print was found in an Oslo psychiatric hospital in 1981.",
          ),
        ]),
      },
      {
        filmSlug: "sunrise",
        reasoning: doc([
          p(
            "1927 年茂瑙赴美后为福斯拍摄的第一部影片，在首届奥斯卡获三项奖，其中一项为仅设一届的艺术质量最佳作品奖。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "The first film Murnau made for Fox after moving to the United States, in 1927. It took three awards at the first Academy ceremony, one of them for unique and artistic picture, a category awarded only that year.",
          ),
        ]),
      },
      {
        filmSlug: "city-lights",
        reasoning: doc([
          p("1931 年卓别林作品，有声片当时已成主流，本片仍以默片拍摄，配乐由卓别林本人所作。"),
        ]),
        reasoningEn: doc([
          p(
            "Chaplin's 1931 film, made silent after sound had become standard, with a score he wrote himself.",
          ),
        ]),
      },
    ],
  },
  {
    slug: "film-noir",
    title: "黑色电影",
    theme: "四部影片，1931 至 1958 年",
    titleEn: "Film Noir",
    themeEn: "Four films, 1931 to 1958",
    introEn: doc([
      p(
        "Film noir is a category applied after the fact to a body of films, most of them made in Hollywood in the 1940s and 1950s, dealing with crime, shot in high contrast, and often using voiceover and flashback. French critics gave it the name in 1946. The earliest film here was made in Germany and is usually counted among the sources.",
      ),
    ]),
    sortOrder: 7,
    coverFilmSlug: "sunset-boulevard",
    intro: doc([
      p(
        "黑色电影是评论界事后归纳的一类影片，多摄于 1940 至 1950 年代的好莱坞，题材涉及犯罪，画面对比强烈，常用画外叙述与倒叙。这一名称由法国影评人于 1946 年提出。本片单收录四部，其中年代最早的一部摄于德国，通常被列为这一路数的来源之一。",
      ),
    ]),
    items: [
      {
        filmSlug: "m",
        reasoning: doc([
          p("1931 年弗里茨·朗的第一部有声片，彼得·洛主演，取材自当时德国关于连环杀人案的报道。"),
        ]),
        reasoningEn: doc([
          p(
            "Fritz Lang's first sound film, from 1931, with Peter Lorre, drawing on German press reports of serial killings.",
          ),
        ]),
      },
      {
        filmSlug: "double-indemnity",
        reasoning: doc([
          p(
            "1944 年比利·怀尔德作品，雷蒙德·钱德勒此前未写过剧本，两人合作过程并不融洽。影片获七项奥斯卡提名，一项未得。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Billy Wilder's 1944 film. Raymond Chandler had never written a screenplay before, and the collaboration went badly. It took seven Academy Award nominations and won none.",
          ),
        ]),
      },
      {
        filmSlug: "touch-of-evil",
        reasoning: doc([
          p(
            "1958 年奥逊·威尔斯作品，环球在他离开后重剪，1998 年另有一版依威尔斯当年的备忘录重新剪辑发行。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Orson Welles's 1958 film. Universal recut it after he left the production, and a version following his written memo was assembled and released in 1998.",
          ),
        ]),
      },
      {
        filmSlug: "sunset-boulevard",
        reasoning: doc([
          p(
            "1950 年比利·怀尔德作品，格洛丽亚·斯旺森与埃里希·冯·施特罗海姆主演，二人均为默片时期的从业者；本片获奥斯卡最佳故事与剧本奖。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Billy Wilder's 1950 film, with Gloria Swanson and Erich von Stroheim, both of whom had worked in the silent period. It received the Academy Award for best story and screenplay.",
          ),
        ]),
      },
    ],
  },
];
