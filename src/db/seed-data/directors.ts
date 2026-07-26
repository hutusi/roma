import { doc, p } from "./tiptap";
import type { SeedDirector } from "./types";

/**
 * The directors behind the seeded canon. Every entry carries a plain-text
 * bio (enough on its own to publish) and, for the major figures, a
 * 创作历程 essay. Prose is original; no exhaustive filmographies — this is
 * a curatorial site, not a database.
 *
 * `tmdbPersonId` is pinned on every entry added from the 华语电影 block
 * onward. The portrait fallback searches by Latin name and takes the first
 * result with a photo, which happens to be right today but is a silent
 * failure when it is not — TMDB re-ranks, and a wrong portrait looks
 * exactly like a right one. The earlier entries predate that policy and
 * already carry seeded portraits, so backfilling them would be inert.
 */
export const seedDirectors: SeedDirector[] = [
  {
    slug: "federico-fellini",
    name: "Federico Fellini",
    nameZh: "费德里科·费里尼",
    bio: "意大利导演，1920–1993。早期作品属新现实主义，1960 年代后转向以记忆与梦境组织结构。代表作有《大路》《卡比利亚之夜》《八部半》，四度获奥斯卡最佳外语片奖。",
    careerEssay: doc([
      p(
        "费里尼 1940 年代为罗西里尼等人编剧，1950 年起独立执导。《大路》《骗子》《卡比利亚之夜》三片仍以战后意大利的边缘人物为题材，其中《大路》与《卡比利亚之夜》先后获奥斯卡最佳外语片奖。",
      ),
      p(
        "1960 年的《生活的甜蜜》以七个昼夜的段落取代连贯情节，此后《八部半》进一步取消梦境与当下的区隔，两者可在同一镜头内换位。1970 年代的《阿玛柯德》与《卡萨诺瓦》多在罗马电影城搭景完成，外景使用渐少。",
      ),
    ]),
    bioEn:
      "Italian director, 1920–1993. His early films belong to neorealism; from the 1960s he built them instead around memory and dream. La strada, Nights of Cabiria and 8½ are among the best known, and he received the Academy Award for Best Foreign Language Film four times.",
    careerEssayEn: doc([
      p(
        "Fellini wrote screenplays for Rossellini and others through the 1940s and began directing on his own in 1950. La strada, Il bidone and Nights of Cabiria still take their subjects from the margins of postwar Italy, and the first and third each received the Academy Award for Best Foreign Language Film.",
      ),
      p(
        "La Dolce Vita, in 1960, replaced continuous plot with seven days and nights of loosely linked episodes, and 8½ went further, removing the boundary between dream and present action so that the two could change places within a single shot. From the 1970s, Amarcord and Casanova were built largely on sets at Cinecittà, with location work falling away.",
      ),
    ]),
  },
  {
    slug: "ingmar-bergman",
    name: "Ingmar Bergman",
    nameZh: "英格玛·伯格曼",
    // Pinned: TMDB person search surfaces an actor namesake first (no photo).
    tmdbPersonId: 6648,
    bio: "瑞典导演，1918–2007。牧师之子，作品多围绕信仰、死亡与婚姻，大量使用面部特写。长期与摄影师斯文·尼克维斯特合作，另有大量舞台剧导演工作。",
    careerEssay: doc([
      p(
        "伯格曼 1940 年代起在瑞典电影业工作，同时长期担任舞台剧导演，两项工作贯穿其一生。1957 年完成的《第七封印》与《野草莓》确立了他在国际影展上的声誉。",
      ),
      p(
        "1960 年代起，作品规模缩小，人物减少，室内场景增多，《假面》《呼喊与细语》与电视剧集《婚姻生活》多围绕两三人之间的关系展开。同一时期起与摄影师斯文·尼克维斯特固定合作，晚期作品多在法罗岛拍摄。",
      ),
    ]),
    bioEn:
      "Swedish director, 1918–2007. The son of a pastor, he made films largely concerned with faith, death and marriage, relying heavily on the close-up. He worked with the cinematographer Sven Nykvist over many years and directed extensively for the stage.",
    careerEssayEn: doc([
      p(
        "Bergman worked in the Swedish film industry from the 1940s and directed extensively for the stage throughout his life, keeping both occupations in parallel. The Seventh Seal and Wild Strawberries, both completed in 1957, established his standing at international festivals.",
      ),
      p(
        "From the 1960s the films grew smaller, with fewer characters and more interiors: Persona, Cries and Whispers and the television serial Scenes from a Marriage turn on the relations between two or three people. He worked regularly with the cinematographer Sven Nykvist from that period onwards, and shot much of his later work on the island of Fårö.",
      ),
    ]),
  },
  {
    slug: "akira-kurosawa",
    name: "Akira Kurosawa",
    nameZh: "黑泽明",
    bio: "日本导演，1910–1998。作品兼及时代剧与现代题材，惯用多机位同时拍摄与长焦镜头。《罗生门》1951 年获威尼斯电影节金狮奖，为日本电影首次在国际影展获此奖项。",
    careerEssay: doc([
      p(
        "黑泽明 1936 年入 P.C.L.（东宝前身）任助理导演，1943 年首次独立执导。1950 年的《罗生门》在威尼斯电影节获奖后，其作品开始在日本以外发行。",
      ),
      p(
        "1950 至 60 年代多与三船敏郎合作，题材兼及时代剧与现代剧，动作场面惯用多机位同时拍摄与长焦镜头。1970 年《电车狂》票房失利后筹资一度困难，1975 年与苏联合拍《德尔苏·乌扎拉》，1980 年代的《影武者》与《乱》均有外国制片方参与投资。",
      ),
    ]),
    bioEn:
      "Japanese director, 1910–1998. He worked in both period and contemporary settings and habitually shot with several cameras at once and with long lenses. Rashomon received the Golden Lion at Venice in 1951, the first such award to a Japanese film.",
    careerEssayEn: doc([
      p(
        "Kurosawa joined P.C.L., the studio that became Toho, as an assistant director in 1936, and directed his first film in 1943. After Rashomon took the prize at Venice in 1950, his work began to be distributed outside Japan.",
      ),
      p(
        "Through the 1950s and 1960s he worked repeatedly with Toshiro Mifune, in both period and contemporary settings, shooting action with several cameras running at once and with long lenses. Financing became difficult after Dodes'ka-den failed commercially in 1970; he made Dersu Uzala with Soviet backing in 1975, and both Kagemusha and Ran in the 1980s drew on foreign investment.",
      ),
    ]),
  },
  {
    slug: "yasujiro-ozu",
    name: "Yasujirō Ozu",
    nameZh: "小津安二郎",
    bio: "日本导演，1903–1963。长期在松竹拍摄家庭题材，摄影机固定于接近榻榻米坐姿的低机位，极少移动，段落之间插入没有人物的空镜。生卒同为十二月十二日。",
    careerEssay: doc([
      p(
        "小津 1923 年入松竹，默片时期拍摄喜剧与青春题材，1930 年代逐步转向家庭题材。战时应征入伍，先后前往中国与新加坡，1946 年返回日本复工。",
      ),
      p(
        "战后作品几乎全为家庭题材，摄影机固定于低机位，取消移动镜头与淡入淡出，段落之间以没有人物的空镜衔接。1949 年的《晚春》起与野田高梧固定合作，此后每部剧本均由二人共同写成。1958 年起改用彩色拍摄。",
      ),
    ]),
    bioEn:
      "Japanese director, 1903–1963. He worked at Shochiku on domestic subjects, keeping the camera fixed low at about the height of a person seated on a tatami mat, moving it almost never, and placing shots of empty rooms between scenes. He was born and died on 12 December.",
    careerEssayEn: doc([
      p(
        "Ozu joined Shochiku in 1923, making comedies and youth pictures during the silent period and moving gradually towards domestic subjects in the 1930s. He was conscripted during the war, served in China and Singapore, and returned to work in Japan in 1946.",
      ),
      p(
        "His postwar films are almost entirely domestic. The camera is fixed low, camera movement and dissolves are dropped, and shots of empty space link the scenes. From Late Spring in 1949 he wrote every screenplay with Kogo Noda, and from 1958 he worked in colour.",
      ),
    ]),
  },
  {
    slug: "andrei-tarkovsky",
    name: "Andrei Tarkovsky",
    nameZh: "安德烈·塔可夫斯基",
    bio: "苏联导演，1932–1986。共完成七部长片，多以长镜头、水与火的影像及不作标示的时序为特征。1980 年代初离开苏联，此后在意大利与瑞典工作，著有《雕刻时光》。",
    careerEssay: doc([
      p(
        "塔可夫斯基 1960 年毕业于莫斯科国立电影学院，1962 年以《伊万的童年》获威尼斯电影节金狮奖。其后完成的《安德烈·卢布廖夫》在苏联多年未获正式公映。",
      ),
      p(
        "1970 年代的《飞向太空》《镜子》《潜行者》均由莫斯科电影制片厂出品，发行范围受限。1982 年赴意大利拍摄《乡愁》后不再返回苏联，最后一部作品《牺牲》在瑞典完成，1986 年在巴黎去世。",
      ),
    ]),
    bioEn:
      "Soviet director, 1932–1986. He completed seven features, marked by long takes, imagery of water and fire, and chronology left unmarked. He left the Soviet Union in the early 1980s and worked afterwards in Italy and Sweden. His book on filmmaking is Sculpting in Time.",
    careerEssayEn: doc([
      p(
        "Tarkovsky graduated from the state film school in Moscow in 1960 and received the Golden Lion at Venice for Ivan's Childhood in 1962. Andrei Rublev, which he completed next, went without official release in the Soviet Union for several years.",
      ),
      p(
        "Solaris, The Mirror and Stalker, all made for Mosfilm during the 1970s, were given restricted distribution. He travelled to Italy in 1982 to make Nostalghia and did not return; he completed his last film, The Sacrifice, in Sweden, and died in Paris in 1986.",
      ),
    ]),
  },
  {
    slug: "robert-bresson",
    name: "Robert Bresson",
    nameZh: "罗贝尔·布列松",
    bio: "法国导演，1901–1999。主张不用职业演员，要求出演者平读台词、不作表演，称之为「模特」；多用手部与物件的近景，配乐极少。代表作《死囚越狱》《扒手》《驴子巴特萨》。",
    careerEssay: doc([
      p(
        "布列松早年学绘画，1940 年被德军俘虏，关押逾一年。战后自 1943 年起执导长片，一生共完成十三部。",
      ),
      p(
        "自 1951 年的《乡村牧师日记》起，他不再使用职业演员，改用他称为「模特」的非职业者，要求其平读台词、不作表情。此后作品普遍取消配乐，以环境声与物件近景承担叙事，《死囚越狱》《扒手》《驴子巴特萨》均循此法。",
      ),
    ]),
    bioEn:
      "French director, 1901–1999. He declined to use professional actors, directing those he cast to speak flatly and without performing and calling them models; he relied on close shots of hands and objects and used little music. A Man Escaped, Pickpocket and Au Hasard Balthazar are among the best known.",
    careerEssayEn: doc([
      p(
        "Bresson trained as a painter, was taken prisoner by German forces in 1940 and held for more than a year. He directed features from 1943 onwards and completed thirteen in all.",
      ),
      p(
        "From Diary of a Country Priest in 1951 he stopped using professional actors, working instead with non-professionals he called models and directing them to speak flatly and without expression. The later films largely dispense with score, carrying the narrative through ambient sound and close shots of objects; A Man Escaped, Pickpocket and Au Hasard Balthazar all proceed this way.",
      ),
    ]),
  },
  {
    slug: "michelangelo-antonioni",
    name: "Michelangelo Antonioni",
    nameZh: "米开朗基罗·安东尼奥尼",
    bio: "意大利导演，1912–2007。作品多以现代城市与工业景观为背景，情节淡化，人物常置于构图边缘。1960 年代初的《奇遇》《夜》《蚀》通常合称一组。",
    careerEssay: doc([
      p(
        "安东尼奥尼 1940 年代从影评与纪录短片入行，1950 年起执导长片。1960 年的《奇遇》在戛纳电影节首映时观众中出现嘘声，其后获评审团奖。",
      ),
      p(
        "《奇遇》《夜》《蚀》通常合称一组，共同特征是情节淡化、人物置于构图边缘、由建筑与空间承担叙事。1964 年的《红色沙漠》为其第一部彩色片，拍摄中对实景直接施色。此后他在英国、美国与中国工作，1985 年中风后仍参与完成数部作品。",
      ),
    ]),
    bioEn:
      "Italian director, 1912–2007. His films are set largely in modern cities and industrial landscapes, with plot reduced and figures often placed at the edge of the frame. L'Avventura, La Notte and L'Eclisse, made in the early 1960s, are usually grouped together.",
    careerEssayEn: doc([
      p(
        "Antonioni came to film through criticism and documentary shorts in the 1940s and began directing features in 1950. L'Avventura was jeered by part of the audience at its Cannes premiere in 1960 and went on to take the Jury Prize there.",
      ),
      p(
        "L'Avventura, La Notte and L'Eclisse are usually grouped together, sharing a reduced plot, figures placed at the edge of the frame, and a reliance on architecture and space to carry the film. Red Desert, in 1964, was his first in colour, achieved by painting the locations themselves. He later worked in Britain, the United States and China, and took part in completing several films after a stroke in 1985.",
      ),
    ]),
  },
  {
    slug: "jean-luc-godard",
    name: "Jean-Luc Godard",
    nameZh: "让-吕克·戈达尔",
    bio: "法国导演，1930–2022。原为《电影手册》影评人，1960 年以《精疲力尽》转入导演，此后长期试验剪辑、声画关系与叙事形式，晚年多拍论文式影片。",
    careerEssay: doc([
      p(
        "戈达尔 1950 年代为《电影手册》撰稿，1960 年以《精疲力尽》转入导演。此后数年产量极高，至 1967 年已完成十五部长片，包括《随心所欲》《轻蔑》《狂人皮埃罗》。",
      ),
      p(
        "1968 年后他转向政治题材与集体署名，与人组建吉加·维尔托夫小组，作品不再进入常规发行。1970 年代末起以录像与胶片并行创作，1988 至 1998 年间完成八集的《电影史》，晚期作品多为论文式结构。",
      ),
    ]),
    bioEn:
      "French director, 1930–2022. He wrote criticism for Cahiers du Cinéma before directing Breathless in 1960, and spent the decades that followed experimenting with editing, with the relation of sound to image, and with narrative form, turning later to essay films.",
    careerEssayEn: doc([
      p(
        "Godard wrote for Cahiers du Cinéma through the 1950s and turned to directing with Breathless in 1960. He worked at great speed in the years that followed, completing fifteen features by 1967, among them Vivre sa Vie, Contempt and Pierrot le Fou.",
      ),
      p(
        "After 1968 he moved to political subjects and collective credit, forming the Dziga Vertov Group with others, and the work left normal distribution. From the late 1970s he worked in video alongside film, completed the eight-part Histoire(s) du cinéma between 1988 and 1998, and structured much of his late work as essay.",
      ),
    ]),
  },
  {
    slug: "francois-truffaut",
    name: "François Truffaut",
    nameZh: "弗朗索瓦·特吕弗",
    bio: "法国导演，1932–1984。原为《电影手册》影评人，1959 年以《四百击》获戛纳电影节最佳导演奖。此后围绕安托万·杜瓦内尔一角拍摄五部作品，均由让-皮埃尔·利奥主演。",
    careerEssay: doc([
      p(
        "特吕弗少年时期屡次逃学并一度被送入少年管教所，其后受影评人安德烈·巴赞照顾，为《电影手册》撰稿。1954 年他发表《法国电影的某种倾向》，抨击当时以文学改编为主的制片路线。",
      ),
      p(
        "1959 年以《四百击》转入导演，此后围绕安托万·杜瓦内尔一角完成五部作品，均由让-皮埃尔·利奥主演，时间跨度二十年。另有《祖与占》《日以继夜》等片，后者获奥斯卡最佳外语片奖。1984 年因脑瘤去世，年五十二。",
      ),
    ]),
    bioEn:
      "French director, 1932–1984. He wrote for Cahiers du Cinéma before directing The 400 Blows, which brought him the director's prize at Cannes in 1959. He went on to make five films following the character Antoine Doinel, played throughout by Jean-Pierre Léaud.",
    careerEssayEn: doc([
      p(
        "Truffaut truanted repeatedly as a boy and spent time in an observation centre for delinquents before the critic André Bazin took him in and brought him to Cahiers du Cinéma. In 1954 he published an attack on the literary-adaptation tradition then dominant in French production.",
      ),
      p(
        "He began directing with The 400 Blows in 1959 and went on to make five films following the character Antoine Doinel, played throughout by Jean-Pierre Léaud across twenty years. Jules and Jim and Day for Night are also among his best known; the latter received the Academy Award for Best Foreign Language Film. He died of a brain tumour in 1984, aged fifty-two.",
      ),
    ]),
  },
  {
    slug: "alfred-hitchcock",
    name: "Alfred Hitchcock",
    nameZh: "阿尔弗雷德·希区柯克",
    bio: "英裔美国导演，1899–1980。自英国默片时期从业，1939 年赴好莱坞，共导演长片逾五十部。作品多为惊悚题材，惯以观众已知而角色未知的信息差构造悬念。",
    careerEssay: doc([
      p(
        "希区柯克 1920 年代在英国入行，先做字幕卡设计，1925 年起执导。1929 年的《讹诈》为英国第一部有声长片。1939 年应制片人塞尔兹尼克之邀赴美，此后长期在好莱坞工作。",
      ),
      p(
        "他区分「惊吓」与「悬念」：前者依靠意外，后者依靠观众比角色先掌握信息。1950 至 60 年代的《后窗》《迷魂记》《西北偏北》《惊魂记》多围绕窥视、身份与罪责展开。1955 至 65 年间另主持电视剧集《希区柯克剧场》。他从未获奥斯卡最佳导演奖。",
      ),
    ]),
    bioEn:
      "British-American director, 1899–1980. He began in British silent films, moved to Hollywood in 1939, and directed more than fifty features. He worked chiefly in the thriller, and built suspense by giving the audience information the characters do not have.",
    careerEssayEn: doc([
      p(
        "Hitchcock entered the industry in Britain in the 1920s, designing title cards before directing from 1925. Blackmail, in 1929, was the first British sound feature. He moved to the United States in 1939 at the invitation of the producer David O. Selznick and worked in Hollywood thereafter.",
      ),
      p(
        "He distinguished surprise from suspense: the first depends on the unexpected, the second on the audience knowing more than the characters do. Rear Window, Vertigo, North by Northwest and Psycho, made between the mid-1950s and 1960, turn largely on watching, identity and guilt. He also presented the television series Alfred Hitchcock Presents between 1955 and 1965. He never received the Academy Award for Best Director.",
      ),
    ]),
  },
  {
    slug: "orson-welles",
    name: "Orson Welles",
    nameZh: "奥逊·威尔斯",
    bio: "美国导演、演员，1915–1985。二十五岁完成第一部影片《公民凯恩》。此后多部作品遭制片方重剪或未能完成，晚年主要在欧洲自行筹资拍片。",
    careerEssay: doc([
      p(
        "威尔斯先在舞台与广播工作，1938 年的广播剧《世界大战》引发听众恐慌。雷电华公司随后与他签下罕见的合约，给予剧本、剪辑与最终定剪的控制权，《公民凯恩》即在此条件下完成，时年二十五岁。",
      ),
      p(
        "此后他不再享有同等权限。《伟大的安巴逊》在他离美期间遭制片方大幅重剪，《历劫佳人》交片后亦被另行剪辑与补拍。1950 年代起他多在欧洲筹资，以演员报酬支持自己的项目，《堂吉诃德》等片始终未能完成。",
      ),
    ]),
    bioEn:
      "American director and actor, 1915–1985. He completed his first film, Citizen Kane, at twenty-five. Several of those that followed were recut by their studios or left unfinished, and he spent his later years raising money independently in Europe.",
    careerEssayEn: doc([
      p(
        "Welles worked first in theatre and radio; his 1938 broadcast of The War of the Worlds caused public alarm. RKO then signed him to an unusual contract giving him control of script, cast and final cut, and Citizen Kane was made under those terms when he was twenty-five.",
      ),
      p(
        "He never held equivalent authority again. The Magnificent Ambersons was heavily recut by the studio while he was out of the country, and Touch of Evil was recut and partly reshot after delivery. From the 1950s he raised money in Europe and funded his own projects with acting fees; several, among them a version of Don Quixote, were never finished.",
      ),
    ]),
  },
  {
    slug: "carl-theodor-dreyer",
    name: "Carl Theodor Dreyer",
    nameZh: "卡尔·西奥多·德莱叶",
    bio: "丹麦导演，1889–1968。一生完成长片十四部，题材多涉信仰与审判，惯用缓慢横移的长镜头与素净布景。代表作《圣女贞德蒙难记》《词语》。",
    careerEssay: doc([
      p(
        "德莱叶原为记者，1910 年代进入丹麦电影业，先任字幕撰写与编剧，1919 年起执导。1920 年代在瑞典、德国与法国拍片，1928 年在法国完成《圣女贞德蒙难记》。",
      ),
      p(
        "此后他长期难以获得投资，1930 至 40 年代仅完成《吸血鬼》与《愤怒之日》两部长片，一度回到报社工作。1955 年的《词语》与 1964 年的《葛楚》为其最后两部作品。一生共完成长片十四部。",
      ),
    ]),
    bioEn:
      "Danish director, 1889–1968. He completed fourteen features, most of them concerned with faith and judgment, and worked in slow lateral takes and spare settings. The Passion of Joan of Arc and Ordet are among the best known.",
    careerEssayEn: doc([
      p(
        "Dreyer worked as a journalist before entering the Danish film industry in the 1910s, writing titles and screenplays and directing from 1919. He made films in Sweden, Germany and France during the 1920s, completing The Passion of Joan of Arc in France in 1928.",
      ),
      p(
        "Funding proved difficult for long stretches afterwards. He completed only two features in the 1930s and 1940s, Vampyr and Day of Wrath, and returned for a time to newspaper work. Ordet in 1955 and Gertrud in 1964 were his last two films. He completed fourteen features in all.",
      ),
    ]),
  },
  {
    slug: "kenji-mizoguchi",
    name: "Kenji Mizoguchi",
    nameZh: "沟口健二",
    bio: "日本导演，1898–1956。作品多以女性的处境为中心，惯用长镜头与远景，避免以近景拍摄苦难场面。1950 年代连续三年在威尼斯电影节获奖。",
    careerEssay: doc([
      p(
        "沟口 1920 年代入日活，默片时期即已多产，战前作品包括《浪华悲歌》《祇园姊妹》。战时受审查限制，转拍《元禄忠臣藏》等题材。其早年作品多数已散佚。",
      ),
      p(
        "战后作品以《西鹤一代女》《雨月物语》《山椒大夫》为代表，三片先后在威尼斯电影节获奖，1952 至 1954 连续三年。他惯用一场一镜，摄影机缓慢横移，避免以近景拍摄苦难场面。1956 年因白血病去世，年五十八。",
      ),
    ]),
    bioEn:
      "Japanese director, 1898–1956. His films centre largely on the circumstances of women, and he worked in long takes and distant framings, keeping scenes of suffering out of close-up. He took prizes at Venice in three consecutive years during the 1950s.",
    careerEssayEn: doc([
      p(
        "Mizoguchi joined Nikkatsu in the 1920s and was already prolific in the silent period; his prewar work includes Osaka Elegy and Sisters of the Gion. Wartime censorship pushed him towards subjects such as The 47 Ronin. Most of his early films have not survived.",
      ),
      p(
        "His postwar work is represented by The Life of Oharu, Ugetsu and Sansho the Bailiff, which took prizes at Venice in three consecutive years from 1952. He worked in single takes for whole scenes, moving the camera slowly sideways and keeping suffering out of close-up. He died of leukaemia in 1956, aged fifty-eight.",
      ),
    ]),
  },
  {
    slug: "luis-bunuel",
    name: "Luis Buñuel",
    nameZh: "路易斯·布努埃尔",
    bio: "西班牙导演，1900–1983。1929 年与萨尔瓦多·达利合作《一条安达鲁狗》，此后长期流亡，在墨西哥拍片近二十年，晚年回到法国工作。作品常涉宗教与资产阶级题材。",
    careerEssay: doc([
      p(
        "布努埃尔与达利合作的《一条安达鲁狗》（1929）与《黄金时代》（1930）在巴黎放映后引发争议，后者一度遭禁。西班牙内战期间他为共和政府工作，其后流亡美国，在纽约现代艺术博物馆任职数年。",
      ),
      p(
        "1946 年起在墨西哥拍片近二十年，产量甚高，《被遗忘的人们》使他重获国际关注。1960 年代后主要在法国与西班牙工作，《维莉迪安娜》获戛纳金棕榈奖后在西班牙遭禁，《资产阶级的审慎魅力》获奥斯卡最佳外语片奖。",
      ),
    ]),
    bioEn:
      "Spanish director, 1900–1983. He made Un Chien Andalou with Salvador Dalí in 1929, then spent years in exile, working for close to two decades in Mexico before returning to France late in his career. Religion and the bourgeoisie recur throughout his work.",
    careerEssayEn: doc([
      p(
        "Un Chien Andalou (1929) and L'Age d'Or (1930), both made with Salvador Dalí, caused controversy on their Paris screenings, and the second was banned for a time. Buñuel worked for the Republican government during the Spanish Civil War and afterwards went into exile, spending several years at the Museum of Modern Art in New York.",
      ),
      p(
        "From 1946 he worked in Mexico for close to twenty years and at a high rate of production; Los Olvidados returned him to international attention. From the 1960s he worked mainly in France and Spain. Viridiana took the Palme d'Or at Cannes and was then banned in Spain, and The Discreet Charm of the Bourgeoisie received the Academy Award for Best Foreign Language Film.",
      ),
    ]),
  },
  {
    slug: "jean-renoir",
    name: "Jean Renoir",
    nameZh: "让·雷诺阿",
    bio: "法国导演，1894–1979。画家奥古斯特·雷诺阿之子，作品多用景深调度与连续的摄影机运动。1930 年代拍摄《大幻影》与《游戏规则》，二战期间赴美工作。",
    careerEssay: doc([
      p(
        "雷诺阿以父亲留下的画作变卖所得资助早期创作，1920 年代起拍摄默片。1930 年代与人民阵线关系密切，作品包括《兰基先生的罪行》《大幻影》《游戏规则》。",
      ),
      p(
        "《游戏规则》1939 年公映失利后遭删剪，其原始底片毁于战时。1940 年他离开法国赴美，在好莱坞工作数年，其后又赴印度拍摄《大河》。1950 年代返回欧洲，晚期作品多为彩色。1975 年获奥斯卡终身成就奖。",
      ),
    ]),
    bioEn:
      "French director, 1894–1979. The son of the painter Auguste Renoir, he worked in depth staging and continuous camera movement. He made Grand Illusion and The Rules of the Game in the 1930s and moved to the United States during the war.",
    careerEssayEn: doc([
      p(
        "Renoir financed his early work partly by selling paintings left by his father, and made silent films from the 1920s. He was closely associated with the Popular Front in the 1930s, when he made The Crime of Monsieur Lange, Grand Illusion and The Rules of the Game.",
      ),
      p(
        "The Rules of the Game failed on release in 1939 and was cut; its original negative was destroyed during the war. He left France in 1940 for the United States, worked in Hollywood for several years, and then went to India to make The River. He returned to Europe in the 1950s and worked mostly in colour thereafter. He received an honorary Academy Award in 1975.",
      ),
    ]),
  },
  {
    slug: "vittorio-de-sica",
    name: "Vittorio De Sica",
    nameZh: "维托里奥·德西卡",
    bio: "意大利导演、演员，1901–1974。先以演员成名，1940 年代起转向导演，与编剧柴伐蒂尼长期合作，多用非职业演员实景拍摄。四部作品获奥斯卡外语片相关奖项。",
    careerEssay: doc([
      p(
        "德西卡 1920 年代以舞台与银幕演员成名，1940 年起兼任导演。1943 年的《孩子们在注视我们》起与编剧柴伐蒂尼固定合作，此后二十余年共同完成多部作品。",
      ),
      p(
        "《擦鞋童》《偷自行车的人》《温别尔托·D》多用非职业演员实景拍摄，前两部先后获奥斯卡荣誉奖。1950 年代后期起他为筹措资金频繁接拍演员工作，作品风格转向喜剧与情节剧，《昨天、今天、明天》与《费尼兹花园》再获奥斯卡最佳外语片奖。",
      ),
    ]),
    bioEn:
      "Italian director and actor, 1901–1974. He was known first as an actor and turned to directing in the 1940s, working over many years with the screenwriter Cesare Zavattini and casting non-professionals on location. Four of his films were honoured by the Academy in its foreign-language categories.",
    careerEssayEn: doc([
      p(
        "De Sica became known in the 1920s as a stage and screen actor and began directing in 1940. From The Children Are Watching Us in 1943 he worked steadily with the screenwriter Cesare Zavattini, a collaboration that continued for more than twenty years.",
      ),
      p(
        "Shoeshine, Bicycle Thieves and Umberto D. were made largely with non-professionals on location, and the first two each received an Academy Honorary Award. From the late 1950s he took acting work frequently to raise money, and his own films moved towards comedy and melodrama; Yesterday, Today and Tomorrow and The Garden of the Finzi-Continis brought two further Academy Awards for foreign-language film.",
      ),
    ]),
  },
  {
    slug: "billy-wilder",
    name: "Billy Wilder",
    nameZh: "比利·怀尔德",
    bio: "奥地利裔美国导演、编剧，1906–2002。1930 年代因纳粹上台离开欧洲赴美，先以编剧起家，后自编自导。作品兼及黑色电影与喜剧，多与查尔斯·布拉克特、I·A·L·戴蒙德合作编剧。",
    careerEssay: doc([
      p(
        "怀尔德原在柏林做记者与编剧，1933 年纳粹上台后经巴黎赴美，其母与外祖母死于集中营。抵美初期以编剧为业，与查尔斯·布拉克特合作多年。",
      ),
      p(
        "1942 年起自编自导，作品兼及黑色电影与喜剧，包括《双重赔偿》《日落大道》《热情如火》《公寓春光》。1957 年起改与 I·A·L·戴蒙德合作编剧，直至 1981 年最后一部作品。共获奥斯卡奖六座。",
      ),
    ]),
    bioEn:
      "Austrian-American director and screenwriter, 1906–2002. He left Europe for the United States in the 1930s after the Nazis came to power, worked first as a screenwriter, and later directed his own scripts. He made both films noir and comedies, writing chiefly with Charles Brackett and later I. A. L. Diamond.",
    careerEssayEn: doc([
      p(
        "Wilder worked as a journalist and screenwriter in Berlin and left for Paris and then the United States after the Nazis came to power in 1933; his mother and grandmother died in the camps. He wrote for the studios on arrival, for many years with Charles Brackett.",
      ),
      p(
        "From 1942 he directed his own scripts, working across film noir and comedy in Double Indemnity, Sunset Boulevard, Some Like It Hot and The Apartment. From 1957 he wrote with I. A. L. Diamond instead, through to his last film in 1981. He received six Academy Awards.",
      ),
    ]),
  },
  {
    slug: "fritz-lang",
    name: "Fritz Lang",
    nameZh: "弗里茨·朗",
    bio: "奥地利裔导演，1890–1976。先在德国拍摄《大都会》《M就是凶手》等片，1933 年离开德国，此后在法国短暂停留并转赴好莱坞，在美国工作逾二十年，多拍犯罪与黑色电影。",
    careerEssay: doc([
      p(
        "朗 1919 年起在德国执导，默片时期完成《马布斯博士》《尼伯龙根》《大都会》等片，剧本多与其时的妻子特娅·冯·哈布合写。1931 年的《M就是凶手》为其第一部有声片。",
      ),
      p(
        "1933 年他离开德国，经巴黎于 1934 年抵美，此后在好莱坞工作逾二十年，多拍犯罪与黑色电影，包括《血红街道》《大内幕》。冯·哈布留在德国并加入纳粹党，两人就此分开。1950 年代末他回到德国拍摄最后三部影片。",
      ),
    ]),
    bioEn:
      "Austrian-born director, 1890–1976. He made Metropolis and M in Germany, left the country in 1933, and after a brief period in France worked in Hollywood for more than twenty years, largely on crime pictures and films noir.",
    careerEssayEn: doc([
      p(
        "Lang directed in Germany from 1919, completing Dr Mabuse, Die Nibelungen and Metropolis in the silent period, mostly from screenplays written with his then wife Thea von Harbou. M, in 1931, was his first sound film.",
      ),
      p(
        "He left Germany in 1933, reached the United States by way of Paris in 1934, and worked in Hollywood for more than twenty years, largely on crime pictures and films noir including Scarlet Street and The Big Heat. Von Harbou remained in Germany and joined the Nazi party; the marriage ended there. He returned to Germany in the late 1950s for his last three films.",
      ),
    ]),
  },
  {
    slug: "satyajit-ray",
    name: "Satyajit Ray",
    nameZh: "萨蒂亚吉特·雷伊",
    bio: "印度导演，1921–1992。原从事广告设计，1955 年以《大地之歌》转入电影，此后完成《阿普三部曲》。共导演约三十部影片，多以孟加拉语拍摄，并自任编剧与作曲。",
    careerEssay: doc([
      p(
        "雷伊在加尔各答从事广告设计与书籍装帧，1949 年协助让·雷诺阿在当地拍摄《大河》，其后在伦敦看到《偷自行车的人》，决定自行拍片。《大地之歌》断续拍摄约三年，由西孟加拉邦政府出资完成。",
      ),
      p(
        "此后他完成《阿普三部曲》，并在四十年间导演约三十部影片，多以孟加拉语拍摄，题材涵盖乡村、城市中产与历史。他兼任编剧、作曲与海报设计。1992 年获奥斯卡终身成就奖，同年去世。",
      ),
    ]),
    bioEn:
      "Indian director, 1921–1992. He worked in advertising design before making Pather Panchali in 1955, which he followed with the rest of the Apu Trilogy. He directed some thirty films, most of them in Bengali, and wrote and scored much of his own work.",
    careerEssayEn: doc([
      p(
        "Ray worked in advertising design and book illustration in Calcutta, assisted Jean Renoir on The River when it was shot there in 1949, and decided to make his own films after seeing Bicycle Thieves in London. Pather Panchali was shot intermittently over about three years and completed with funding from the government of West Bengal.",
      ),
      p(
        "He went on to finish the Apu Trilogy and directed some thirty films across four decades, most of them in Bengali, ranging over village life, the urban middle class and historical subjects. He also wrote, scored and designed posters for his own work. He received an honorary Academy Award in 1992, the year of his death.",
      ),
    ]),
  },
  {
    slug: "friedrich-wilhelm-murnau",
    name: "F. W. Murnau",
    nameZh: "弗里德里希·威廉·茂瑙",
    bio: "德国导演，1888–1931。默片时期作品包括《诺斯费拉图》《最卑贱的人》，1926 年赴美，为福斯拍摄《日出》。1931 年在加州死于车祸，时年四十二岁。",
    careerEssay: doc([
      p(
        "茂瑙 1919 年起在德国执导，早期作品多已散佚。1922 年的《诺斯费拉图》因未获授权改编《德古拉》遭诉讼，法院判决销毁拷贝。1924 年的《最卑贱的人》几乎不用字幕卡，以移动摄影承担叙事。",
      ),
      p(
        "1926 年他赴美，为福斯拍摄《日出》，该片在首届奥斯卡获三项奖。此后两部好莱坞作品受制片方干预。1931 年他与弗拉哈迪合作的《禁忌》完成后不久，在加州死于车祸，年四十二。",
      ),
    ]),
    bioEn:
      "German director, 1888–1931. His silent work includes Nosferatu and The Last Laugh. He moved to the United States in 1926 and made Sunrise for Fox. He died in a car accident in California in 1931, aged forty-two.",
    careerEssayEn: doc([
      p(
        "Murnau directed in Germany from 1919; most of his earliest films are lost. Nosferatu, in 1922, was an unauthorised adaptation of Dracula and the subject of a lawsuit that ended in an order to destroy the prints. The Last Laugh, in 1924, used almost no intertitles, carrying the story instead through camera movement.",
      ),
      p(
        "He moved to the United States in 1926 and made Sunrise for Fox, which took three awards at the first Academy ceremony. The two Hollywood films that followed were subject to studio interference. He died in a car accident in California in 1931, aged forty-two, shortly after completing Tabu with Robert Flaherty.",
      ),
    ]),
  },
  {
    slug: "charlie-chaplin",
    name: "Charlie Chaplin",
    nameZh: "查理·卓别林",
    bio: "英国导演、演员，1889–1977。以流浪汉一角成名，自编自导自演并为多部影片配乐，1919 年参与创办联美公司。1952 年赴英期间被美国吊销再入境许可，此后长居瑞士。",
    careerEssay: doc([
      p(
        "卓别林生于伦敦，童年家境贫困，母亲长期患病，他曾入济贫院。早年随剧团赴美巡演，1914 年进入电影业，翌年即已成名，流浪汉一角自此确立。1919 年与格里菲斯等人创办联美公司，取得自主发行权。",
      ),
      p(
        "有声片普及后，他仍以默片形式拍摄《城市之光》与《摩登时代》，并自任配乐。1940 年的《大独裁者》为其第一部有声长片。1947 年后因政治立场受美国当局调查，1952 年赴英期间再入境许可被吊销，此后定居瑞士，1972 年方短暂返美领取奥斯卡荣誉奖。",
      ),
    ]),
    bioEn:
      "British director and actor, 1889–1977. He became known for the character of the Tramp, and wrote, directed, starred in and scored much of his own work. He was among the founders of United Artists in 1919. His re-entry permit to the United States was revoked while he was travelling to Britain in 1952, and he settled in Switzerland.",
    careerEssayEn: doc([
      p(
        "Chaplin was born in London to a poor family; his mother was often ill and he spent time in the workhouse. He toured to the United States with a theatre company, entered films in 1914 and was well known within a year, establishing the character of the Tramp. In 1919 he founded United Artists with Griffith and others, gaining control of his own distribution.",
      ),
      p(
        "He continued to make silent films after sound arrived, scoring City Lights and Modern Times himself. The Great Dictator, in 1940, was his first with dialogue. From 1947 his politics drew the attention of the American authorities, and in 1952 his re-entry permit was revoked while he was travelling to Britain. He settled in Switzerland and returned to the United States only briefly, in 1972, to accept an honorary Academy Award.",
      ),
    ]),
  },
  {
    slug: "sergei-eisenstein",
    name: "Sergei Eisenstein",
    nameZh: "谢尔盖·爱森斯坦",
    bio: "苏联导演、电影理论家，1898–1948。以《战舰波将金号》等片实践其关于镜头对列的剪辑主张，另著有多种理论文字。1930 年代在墨西哥的拍摄计划未能完成，后期作品受官方审查影响。",
    careerEssay: doc([
      p(
        "爱森斯坦原习工程，内战期间随红军做宣传工作，其后转入戏剧，1924 年开始拍片。《战舰波将金号》为纪念 1905 年革命二十周年而作，1925 年完成。他同时著述与授课，1930 年代起任教于国立电影学院，所写的蒙太奇理论文章被广泛译介。",
      ),
      p(
        "1929 至 1932 年他在欧洲、好莱坞与墨西哥考察，在墨西哥拍摄的素材被投资方收回，影片未能完成。回国后《白静草原》拍至中途遭停。《亚历山大·涅夫斯基》与《伊凡雷帝》上集获斯大林奖，下集被禁，1958 年才公映，其时他已去世十年。",
      ),
    ]),
    bioEn:
      "Soviet director and film theorist, 1898–1948. He put his arguments about the collision of shots into practice in Battleship Potemkin and other films, and wrote extensively on theory. A project shot in Mexico in the 1930s was never completed, and his later work was subject to official interference.",
    careerEssayEn: doc([
      p(
        "Eisenstein trained as an engineer, did propaganda work with the Red Army during the civil war, moved into theatre, and began directing films in 1924. Battleship Potemkin was made for the twentieth anniversary of the 1905 revolution and finished in 1925. He wrote and taught alongside directing, joining the state film school in the 1930s; his essays on montage were widely translated.",
      ),
      p(
        "From 1929 to 1932 he travelled in Europe, Hollywood and Mexico, where the backers took possession of the footage and the film was never completed. Bezhin Meadow was stopped in production after his return. Alexander Nevsky and the first part of Ivan the Terrible won Stalin Prizes; the second part was banned and not released until 1958, ten years after his death.",
      ),
    ]),
  },
  {
    slug: "marcel-carne",
    name: "Marcel Carné",
    nameZh: "马塞尔·卡尔内",
    bio: "法国导演，1906–1996。1930 至 40 年代与编剧雅克·普莱维长期合作，作品多在摄影棚内搭景拍摄。《天堂的孩子》摄于德占期间，1945 年公映。",
    careerEssay: doc([
      p(
        "卡尔内做过雅克·费戴尔与雷内·克莱尔的助手，1936 年起独立执导。他与诗人雅克·普莱维合作了多部影片，包括《雾码头》与《天色破晓》，两片的布景均由亚历山大·特罗内设计、约瑟夫·科斯马配乐。",
      ),
      p(
        "《天堂的孩子》在德军占领期间拍摄，特罗内与科斯马因犹太身份只能匿名工作，影片至 1945 年才公映。战后卡尔内继续执导至七十年代，反响远不及前作；新浪潮一代批评家把他归入他们要反对的“品质传统”。",
      ),
    ]),
    bioEn:
      "French director, 1906–1996. He worked closely with the screenwriter Jacques Prévert through the 1930s and 1940s, shooting largely on constructed studio sets. Children of Paradise was made under the German occupation and released in 1945.",
    careerEssayEn: doc([
      p(
        "Carné assisted Jacques Feyder and René Clair before directing on his own from 1936. He made a series of films with the poet Jacques Prévert, among them Port of Shadows and Le Jour se lève, both designed by Alexandre Trauner with music by Joseph Kosma.",
      ),
      p(
        "Children of Paradise was shot under the German occupation, with Trauner and Kosma working anonymously because they were Jewish, and did not open until 1945. Carné went on directing into the 1970s to far less attention; the critics of the New Wave placed him in the tradition of quality they were writing against.",
      ),
    ]),
  },
  {
    slug: "elia-kazan",
    name: "Elia Kazan",
    nameZh: "伊利亚·卡赞",
    bio: "希腊裔美国导演，1909–2003。为演员工作室的创办人之一，在舞台与电影两方面工作。1952 年在众议院非美活动调查委员会作证并供出他人姓名，此事此后长期引发争议。",
    careerEssay: doc([
      p(
        "卡赞生于伊斯坦布尔的希腊家庭，幼年随父母移居美国。1930 年代在群剧社当演员，后转做导演，在百老汇首演了《欲望号街车》与《推销员之死》。1947 年他参与创办演员工作室，推广以斯坦尼斯拉夫斯基体系为本的表演训练。",
      ),
      p(
        "他执导的《君子协定》与《码头风云》先后获奥斯卡最佳导演奖。1952 年他在众议院非美活动委员会作证，供出八名曾加入共产党的群剧社旧同事，与不少同行就此决裂。1999 年他获奥斯卡终身成就奖时，会场有一部分人拒绝起立。",
      ),
    ]),
    bioEn:
      "Greek-American director, 1909–2003. He was among the founders of the Actors Studio and worked in both theatre and film. In 1952 he testified before the House Un-American Activities Committee and named others, which remained a matter of controversy for the rest of his life.",
    careerEssayEn: doc([
      p(
        "Kazan was born in Istanbul to a Greek family and moved to the United States as a child. He acted with the Group Theatre in the 1930s before turning to directing, and staged the first Broadway productions of A Streetcar Named Desire and Death of a Salesman. In 1947 he was among the founders of the Actors Studio, which taught an approach to acting derived from Stanislavski.",
      ),
      p(
        "He won Academy Awards for directing Gentleman's Agreement and On the Waterfront. In 1952 he testified before the House Un-American Activities Committee and named eight former Group Theatre colleagues who had belonged to the Communist Party, ending a number of those friendships for good. When he received an honorary Oscar in 1999, part of the audience declined to stand.",
      ),
    ]),
  },

  // ── 华语电影 ────────────────────────────────────────────────────────
  {
    slug: "fei-mu",
    name: "Fei Mu",
    nameZh: "费穆",
    tmdbPersonId: 233200,
    bio: "中国导演，1906–1951。1930 年代在上海拍片，作品包括《城市之夜》《孔夫子》。1948 年与梅兰芳合作《生死恨》，为中国第一部彩色影片。同年完成《小城之春》，1951 年病逝于香港，年四十五。",
    careerEssay: doc([
      p(
        "费穆 1932 年起在联华影业执导，早期作品有《城市之夜》《香雪海》《天伦》。抗战期间他留在上海，1940 年拍摄《孔夫子》。1948 年他与梅兰芳合作《生死恨》，为中国第一部彩色影片。",
      ),
      p(
        "同年完成的《小城之春》上映时正值内战末期，因不合当时对电影的要求而受批评，此后数十年少有放映。1949 年费穆移居香港，1951 年病逝，年四十五。八十年代影片重新流通后，在多次华语影史评选中位列前茅。",
      ),
    ]),
    bioEn:
      "Chinese director, 1906–1951. He worked in Shanghai through the 1930s, on films including Night in the City and Confucius. In 1948 he made Remorse at Death with Mei Lanfang, the first Chinese colour film, and completed Spring in a Small Town the same year. He died in Hong Kong in 1951, aged forty-five.",
    careerEssayEn: doc([
      p(
        "Fei Mu began directing for Lianhua in 1932; his early films include Night in the City, Sea of Fragrant Snow and Song of China. He remained in Shanghai through the war and made Confucius in 1940. In 1948 he filmed Mei Lanfang in the Peking opera Sheng si hen, the first Chinese colour feature.",
      ),
      p(
        "Spring in a Small Town, finished the same year, opened in the closing months of the civil war and was criticised for standing apart from politics; it was rarely shown for the next thirty years. Fei Mu moved to Hong Kong in 1949 and died there in 1951, aged forty-five. After the film returned to circulation in the 1980s it placed at or near the top of successive polls of Chinese-language cinema.",
      ),
    ]),
  },
  {
    slug: "wu-yonggang",
    name: "Wu Yonggang",
    nameZh: "吴永刚",
    tmdbPersonId: 1073182,
    bio: "中国导演，1907–1982。先在片场任美术，1934 年以二十七岁之龄编导第一部作品《神女》，由阮玲玉主演。此后长期在上海与北京两地拍片，作品逾二十部。",
    careerEssay: doc([
      p(
        "吴永刚出身美术，1920 年代在几家上海影业公司做布景与美工，1934 年首次执导，作品即《神女》。次年的《浪淘沙》让两个铐在一起的人流落荒岛，在当时的中国电影中题材罕见。",
      ),
      p(
        "1949 年后他继续在上海拍片，1957 年被划为右派，此后二十余年几乎未再执导。1980 年他与吴贻弓合导《巴山夜雨》，该片与《天云山传奇》并列获首届金鸡奖最佳故事片。",
      ),
    ]),
    bioEn:
      "Chinese director, 1907–1982. He worked first in art departments, and at twenty-seven wrote and directed his first film, The Goddess, with Ruan Lingyu. He went on to work in Shanghai and Beijing over several decades, directing more than twenty films.",
    careerEssayEn: doc([
      p(
        "Wu trained in art and spent the 1920s as a set designer at several Shanghai studios. He directed for the first time in 1934, with The Goddess. Waves Washing the Sand, the following year, strands two men handcuffed together on a desert island, a subject with few parallels in Chinese films of the period.",
      ),
      p(
        "He kept working in Shanghai after 1949 until he was labelled a rightist in 1957, after which he directed almost nothing for more than twenty years. He returned in 1980 with Evening Rain, co-directed with Wu Yigong, which shared the first Golden Rooster award for best feature with Legend of Tianyun Mountain.",
      ),
    ]),
  },
  {
    slug: "yuan-muzhi",
    name: "Yuan Muzhi",
    nameZh: "袁牧之",
    tmdbPersonId: 1173642,
    bio: "中国导演、演员，1909–1978。出身话剧舞台，1930 年代在上海任演员并转入导演，作品有《都市风光》《马路天使》。1949 年后任首任电影局局长，此后不再拍片。",
    careerEssay: doc([
      p(
        "袁牧之先以演技闻名，人称“千面人”。转到导演位置后，他做的第一件事是拿电影玩形式：《都市风光》用歌唱和西洋镜串起都市讽刺，被视作中国第一部音乐喜剧。",
      ),
      p(
        "《马路天使》则把这份聪明收进了人情里。妓女、歌女、吹鼓手、报贩挤在同一条弄堂，周璇唱《四季歌》，赵丹插科打诨，笑声底下是随时可能塌掉的生活。抗战爆发后他北上延安，后来成为新中国电影事业的第一任主事者，从此几乎不再导戏。",
      ),
    ]),
    bioEn:
      "Chinese director and actor, 1909–1978. He came from the stage, acted in Shanghai during the 1930s and turned to directing, making Scenes of City Life and Street Angel. After 1949 he served as the first head of the national film bureau and did not direct again.",
    careerEssayEn: doc([
      p(
        "Yuan Muzhi made his name as an actor first, nicknamed the man of a thousand faces. His first move as a director was to play with form: Scenes of City Life strings urban satire through songs and a peep-show frame, and is generally counted China's first musical comedy.",
      ),
      p(
        "Street Angel folds that cleverness back into feeling. A prostitute, a singsong girl, a trumpeter and a newspaper hawker are crowded into one lane; Zhou Xuan sings the Four Seasons Song, Zhao Dan clowns, and under the laughter is a life that could collapse at any moment. After the war with Japan broke out he went north to Yan'an, later becoming the first head of the new republic's film administration — and directed almost nothing again.",
      ),
    ]),
  },
  {
    slug: "cai-chusheng",
    name: "Cai Chusheng",
    nameZh: "蔡楚生",
    tmdbPersonId: 1112330,
    bio: "中国导演，1906–1968。1930 年代在联华影业拍片，作品包括《渔光曲》，该片 1935 年在莫斯科国际电影节获奖，为中国影片首次在国际影展获奖。1947 年与郑君里合导《一江春水向东流》。",
    careerEssay: doc([
      p(
        "蔡楚生出身贫寒，学徒出身，这让他始终相信电影必须先让普通人看懂。《渔光曲》讲渔家姐弟的破产与流离，1935 年在莫斯科拿下荣誉奖，是中国电影第一次在国际上获奖。",
      ),
      p(
        "《一江春水向东流》是这条路的终点，也是顶点。他与郑君里用三个多小时、一个家庭的八年，把抗战的全部代价具体到一个女人的脸上。影片连映三个多月，万人空巷。文革中他遭到批斗，1968 年含冤去世。",
      ),
    ]),
    bioEn:
      "Chinese director, 1906–1968. He worked at the Lianhua company in the 1930s, and his Song of the Fishermen took a prize at the Moscow International Film Festival in 1935, the first international festival award to a Chinese film. In 1947 he co-directed The Spring River Flows East with Zheng Junli.",
    careerEssayEn: doc([
      p(
        "Cai Chusheng was born poor and apprenticed young, and he never stopped believing a film had to be legible to ordinary people first. Song of the Fishermen follows a fishing family's ruin and dispersal; it took an honorable mention at Moscow in 1935, the first international prize any Chinese film had won.",
      ),
      p(
        "The Spring River Flows East is both the end of that road and its summit. With Zheng Junli he spent more than three hours and eight years of one family's life bringing the entire cost of the war to rest on a single woman's face. It ran for over three months to packed houses. During the Cultural Revolution he was denounced, and he died under persecution in 1968.",
      ),
    ]),
  },
  {
    slug: "zheng-junli",
    name: "Zheng Junli",
    nameZh: "郑君里",
    tmdbPersonId: 1112331,
    bio: "中国导演、演员，1911–1969。先以演员身份参演《大路》《马路天使》等片，1940 年代转入导演，与蔡楚生合导《一江春水向东流》，另导有《乌鸦与麻雀》。",
    careerEssay: doc([
      p(
        "郑君里三十年代是活跃的演员，也翻译表演理论。转做导演后，他把舞台上练出的对人的观察带进了片场——与蔡楚生合导《一江春水向东流》时，那些细碎的家庭场面几乎全是他的笔触。",
      ),
      p(
        "真正属于他自己的是《乌鸦与麻雀》：一栋上海石库门楼房里，房东、房客、投机者各怀鬼胎，政权更迭就在楼梯间发生。这部片子在 1949 年前后偷偷拍完，是中国电影里少有的群戏杰作。他在文革中入狱，1969 年死于狱中。",
      ),
    ]),
    bioEn:
      "Chinese director and actor, 1911–1969. He appeared as an actor in The Big Road and Street Angel among others before turning to directing in the 1940s, co-directing The Spring River Flows East with Cai Chusheng and directing Crows and Sparrows.",
    careerEssayEn: doc([
      p(
        "Zheng Junli was a working actor through the 1930s and a translator of acting theory besides. Turning director, he brought a stage-trained attention to people onto the set — co-directing The Spring River Flows East with Cai Chusheng, the small domestic scenes are almost entirely his hand.",
      ),
      p(
        "What is wholly his is Crows and Sparrows: in one Shanghai tenement a landlord, his tenants and a speculator all scheme past each other while a change of regime happens on the stairwell. Shot half in secret across 1949, it is one of the rare great ensemble films in Chinese cinema. He was imprisoned during the Cultural Revolution and died in custody in 1969.",
      ),
    ]),
  },
  {
    slug: "hou-hsiao-hsien",
    name: "Hou Hsiao-hsien",
    nameZh: "侯孝贤",
    tmdbPersonId: 64992,
    bio: "台湾导演，1947 年生。1980 年代初起为台湾新电影的主要导演之一，作品多用固定机位与远景长镜头，重要事件常发生在画面深处或画外。1989 年《悲情城市》获威尼斯电影节金狮奖。",
    careerEssay: doc([
      p(
        "侯孝贤从商业片起步，直到《风柜来的人》才找到自己的语法：远景、长镜头、不追戏剧高潮。《童年往事》把这套方法对准他自己的成长，祖母一次次说要走路回大陆，成为整部片的节拍器。",
      ),
      p(
        "《悲情城市》让他第一次直视台湾的历史伤口，也让华语电影第一次拿到威尼斯金狮。此后他越走越远：《戏梦人生》几乎不解释，《海上花》全片在室内的油灯下完成，《刺客聂隐娘》把武侠拍成了风与树叶的电影。",
      ),
    ]),
    bioEn:
      "Taiwanese director, born 1947. He was among the principal directors of Taiwan New Cinema from the early 1980s, working largely in fixed setups and distant long takes, with significant events often placed deep in the frame or outside it. A City of Sadness received the Golden Lion at Venice in 1989.",
    careerEssayEn: doc([
      p(
        "Hou began in commercial pictures and did not find his grammar until The Boys from Fengkuei: wide, long, uninterested in dramatic peaks. A Time to Live, a Time to Die turns that method on his own childhood, where a grandmother repeatedly announcing she will walk back to the mainland becomes the film's metronome.",
      ),
      p(
        "A City of Sadness was his first direct look at Taiwan's historical wound, and the first Golden Lion for a Chinese-language film. He kept going further out: The Puppetmaster barely explains itself, Flowers of Shanghai unfolds entirely by interior oil lamp, and The Assassin turns wuxia into a film about wind and leaves.",
      ),
    ]),
  },
  {
    slug: "edward-yang",
    name: "Edward Yang",
    nameZh: "杨德昌",
    tmdbPersonId: 143035,
    bio: "台湾导演，1947–2007。原学电机与计算机工程，在美国工作数年后返台拍片，为台湾新电影主要导演之一。2000 年以《一一》获戛纳电影节最佳导演奖。共完成长片七部。",
    careerEssay: doc([
      p(
        "杨德昌在美国读电机、做过电脑工程师，三十出头才回台湾拍片。这段经历留在他的结构里：《恐怖分子》像一道多线并置的方程式，人物彼此不识，命运却互相咬合。",
      ),
      p(
        "《牯岭街少年杀人事件》是他最庞大的一次演算——近四小时，上百个角色，六十年代台北的眷村、帮派、教室与停电，全部收束到一把刀上。晚年的《一一》则温和下来，用一个小男孩拍别人后脑勺的举动，说尽了人看不见自己的困境。2007 年病逝于洛杉矶。",
      ),
    ]),
    bioEn:
      "Taiwanese director, 1947–2007. He trained in electrical engineering and computing and worked in the United States for several years before returning to Taiwan to make films, becoming one of the principal directors of Taiwan New Cinema. Yi Yi brought him the director's prize at Cannes in 2000. He completed seven features.",
    careerEssayEn: doc([
      p(
        "Yang studied electrical engineering in the United States and worked as a computer engineer; he was past thirty before he came back to Taiwan to make films. The training stayed in his structures: Terrorizers runs like a simultaneous equation, its characters strangers to each other whose fates nonetheless interlock.",
      ),
      p(
        "A Brighter Summer Day is his largest computation — nearly four hours, a cast of over a hundred, the military dependents' villages and gangs and classrooms and blackouts of 1960s Taipei all converging on a single knife. The late Yi Yi softens: a small boy photographing the backs of people's heads says everything about our inability to see ourselves. He died in Los Angeles in 2007.",
      ),
    ]),
  },
  {
    slug: "wong-kar-wai",
    name: "Wong Kar-wai",
    nameZh: "王家卫",
    tmdbPersonId: 12453,
    bio: "香港导演，1958 年生。多不使用完整剧本，边拍边写，成片时长与结构常与开拍时设想不同。长期与摄影师杜可风、美术兼剪辑张叔平合作。2000 年以《花样年华》获戛纳最佳男演员等奖项，1997 年以《春光乍泄》获戛纳最佳导演奖。",
    careerEssay: doc([
      p(
        "王家卫从编剧起家，成名后却几乎不写完整剧本，靠现场与演员一起长出电影。《阿飞正传》里“一分钟的朋友”和无脚鸟，已经定下他一生的主题：时间、错过、无法着陆。",
      ),
      p(
        "与摄影师杜可风、美术张叔平的合作，把这份情绪变成了可见的东西——《重庆森林》的抽帧与霓虹，《春光乍泄》的布宜诺斯艾利斯，《花样年华》里张曼玉每一件不重样的旗袍。到《2046》，他索性把记忆本身写成了一列开不回去的火车。",
      ),
    ]),
    bioEn:
      "Hong Kong director, born 1958. He generally works without a finished screenplay, writing as he shoots, so that the length and structure of a film often differ from what was planned. He has worked over many years with the cinematographer Christopher Doyle and with William Chang as production designer and editor. Happy Together brought him the director's prize at Cannes in 1997.",
    careerEssayEn: doc([
      p(
        "Wong started as a screenwriter and then, once established, largely stopped writing finished scripts, growing his films on set with his actors instead. Days of Being Wild — the one-minute friend, the bird with no feet — already fixes the themes of his whole career: time, missed chances, the inability to land.",
      ),
      p(
        "His work with cinematographer Christopher Doyle and designer William Chang made that mood visible: the step-printing and neon of Chungking Express, the Buenos Aires of Happy Together, the procession of never-repeated cheongsams Maggie Cheung wears in In the Mood for Love. By 2046 he had simply written memory itself as a train that cannot go back.",
      ),
    ]),
  },
  {
    slug: "king-hu",
    name: "King Hu",
    nameZh: "胡金铨",
    tmdbPersonId: 83698,
    bio: "华语导演，1932–1997。生于北京，1949 年后在香港入行，先在邵氏任美术与演员，1960 年代转入导演，其后赴台湾拍片。作品多为明代背景的武侠片，动作段落以短镜头剪接完成。1975 年《侠女》在戛纳电影节获最高技术委员会大奖。",
    careerEssay: doc([
      p(
        "胡金铨生于北平，做过演员与美术，对明代掌故、京剧与佛理都下过功夫。《大醉侠》《龙门客栈》先后确立了他的招牌：客栈里的对峙、一触即发的静默，以及从戏曲借来的锣鼓节奏。",
      ),
      p(
        "《侠女》则把他推到了另一个层面。竹林一战至今是所有武侠动作的源头之一，而影片后半段忽然转入禅意，血战让位给了顿悟。1975 年它在戛纳拿下技术大奖，是华语电影首次在那里获得肯定。",
      ),
    ]),
    bioEn:
      "Chinese-language director, 1932–1997. Born in Beijing, he entered the industry in Hong Kong after 1949, working at Shaw Brothers in art departments and as an actor before turning to directing in the 1960s, and later worked in Taiwan. His films are largely wuxia set in the Ming dynasty, with action built from short takes. A Touch of Zen received the Grand Prize of the Technical Commission at Cannes in 1975.",
    careerEssayEn: doc([
      p(
        "Born in Beijing, King Hu worked as an actor and a designer and read seriously in Ming history, Peking opera, and Buddhism. Come Drink with Me and Dragon Inn established his signatures in turn: the standoff inside an inn, the silence a hair before violence, and a cutting rhythm borrowed from the opera percussion.",
      ),
      p(
        "A Touch of Zen pushed him somewhere else entirely. Its bamboo-forest duel remains one of the headwaters of all wuxia action, and then the film's second half turns abruptly contemplative, with bloodshed giving way to enlightenment. It won a technical prize at Cannes in 1975 — the first recognition a Chinese-language film received there.",
      ),
    ]),
  },

  // ── 战后与彩色 ──────────────────────────────────────────────────────
  {
    slug: "roberto-rossellini",
    name: "Roberto Rossellini",
    nameZh: "罗伯托·罗西里尼",
    tmdbPersonId: 4410,
    bio: "意大利导演，1906–1977。1945 年在德军撤离后不久拍摄《罗马，不设防的城市》，与其后的《战火》《德意志零年》合称战争三部曲。1950 年代与英格丽·褒曼合作数部影片，后期主要为电视拍摄历史题材。",
    careerEssay: doc([
      p(
        "《罗马，不设防的城市》几乎是在废墟里抢拍出来的——胶片是零星凑来的，街道是真的街道，群众演员刚刚经历过片中的事。它一举确立了新现实主义：不要摄影棚，不要明星，不要圆满。",
      ),
      p(
        "但罗西里尼很快离开了自己开创的运动。与英格丽·褒曼合作的《意大利之旅》几乎没有情节，只有一对夫妻在异乡的沉默里逐渐看清彼此——这部片子后来被新浪潮奉为现代电影的起点。",
      ),
    ]),
    bioEn:
      "Italian director, 1906–1977. He shot Rome, Open City shortly after the German withdrawal in 1945, and followed it with Paisan and Germany Year Zero, the three usually grouped together. He made several films with Ingrid Bergman in the 1950s and worked mainly on historical subjects for television in his later years.",
    careerEssayEn: doc([
      p(
        "Rome, Open City was very nearly stolen out of the rubble — the film stock was scraped together in short ends, the streets were real streets, and the extras had lived through what the picture depicts. It established neorealism at a stroke: no studio, no stars, no resolution.",
      ),
      p(
        "But Rossellini left the movement he had started almost immediately. Journey to Italy, made with Ingrid Bergman, has almost no plot at all — only a married couple coming to see each other clearly through the silence of a foreign country. The New Wave later canonized it as the beginning of modern cinema.",
      ),
    ]),
  },
  {
    slug: "masaki-kobayashi",
    name: "Masaki Kobayashi",
    nameZh: "小林正树",
    tmdbPersonId: 76978,
    bio: "日本导演，1916–1996。战时应征入伍，拒绝晋升，被派往满洲，其后在冲绳被俘。1950 年代起在松竹拍片，代表作有九个半小时的《人间的条件》三部曲与《切腹》。作品多涉个人与体制的冲突。",
    careerEssay: doc([
      p(
        "小林正树本人当过兵，且刻意拒绝升迁以示抗议，这份经历烧进了他所有作品。长达九小时的《人间的条件》几乎是他的自传，一个善良的人如何被战争一层层剥掉，直到只剩下不肯低头这一件事。",
      ),
      p(
        "《切腹》把同样的怒火装进了时代剧的外壳：一个浪人走进大名的庭院，用一个故事把整套武士道的体面拆得粉碎。到了《怪谈》他转向色彩与鬼故事，画面华丽如屏风，底下依旧是那份对权力的不信任。",
      ),
    ]),
    bioEn:
      "Japanese director, 1916–1996. Conscripted during the war, he refused promotion, was sent to Manchuria and was later held as a prisoner in Okinawa. He worked at Shochiku from the 1950s; his best-known films are the nine-and-a-half-hour trilogy The Human Condition and Harakiri. Conflict between an individual and an institution recurs throughout his work.",
    careerEssayEn: doc([
      p(
        "Kobayashi served, and deliberately refused promotion as a protest, and that experience is burned into everything he made. The nine-hour Human Condition is close to autobiography: a decent man stripped layer by layer by war until nothing is left but his refusal to bow.",
      ),
      p(
        "Harakiri packs the same anger into the shell of a period picture — a masterless samurai walks into a lord's courtyard and, by telling a story, dismantles the entire decorum of bushido. By Kwaidan he had turned to color and ghost stories, images as lavish as painted screens, with the same distrust of power underneath.",
      ),
    ]),
  },
  {
    slug: "mikio-naruse",
    name: "Mikio Naruse",
    nameZh: "成濑巳喜男",
    tmdbPersonId: 125690,
    bio: "日本导演，1905–1969。自默片时期起从业，共导演约八十九部影片，现存约六十部。作品多以女性的经济处境为中心，题材集中于家庭、旅舍与小本生意。多次改编林芙美子的小说。",
    careerEssay: doc([
      p(
        "成濑一生拍了八十多部片子，主角几乎都是女人——酒吧女招待、寡妇、被丈夫拖累的妻子。他不像沟口那样把她们写成受难者，也不像小津那样让她们体面地退场，而是让她们在账本、房租和一次次算计里熬下去。",
      ),
      p(
        "《浮云》是这条路的终点。一对在战时殖民地相爱的男女回到破败的东京，感情早已耗尽，却谁也走不开。有人说成濑的电影像水，看起来平静，底下的流速会把人卷走。",
      ),
    ]),
    bioEn:
      "Japanese director, 1905–1969. He worked from the silent period onwards and directed some eighty-nine films, of which about sixty survive. His work centres largely on the economic circumstances of women, set among families, lodging houses and small businesses. He adapted the novels of Fumiko Hayashi several times.",
    careerEssayEn: doc([
      p(
        "Naruse made more than eighty films and the protagonist is almost always a woman — a bar hostess, a widow, a wife dragged down by her husband. He does not write them as martyrs the way Mizoguchi does, nor let them exit with dignity the way Ozu does; he makes them endure, through account books and rent and one calculation after another.",
      ),
      p(
        "Floating Clouds is the end of that road. A man and a woman who fell in love in a wartime colony return to a ruined Tokyo with the feeling long since spent, and neither can leave. Naruse's films have been likened to water: placid on the surface, with a current underneath fast enough to carry you off.",
      ),
    ]),
  },
  {
    slug: "jacques-tati",
    name: "Jacques Tati",
    nameZh: "雅克·塔蒂",
    tmdbPersonId: 5763,
    bio: "法国导演、演员，1907–1982。原为音乐厅哑剧演员，1949 年起自编自导自演，共完成长片六部，多由其饰演的于洛先生串联。对白极少，笑料多依靠声音设计与场面调度。《游戏时间》票房失利使其破产。",
    careerEssay: doc([
      p(
        "塔蒂出身默剧，于洛先生这个角色——高个子、雨衣、烟斗、永远迈错一步——是他对现代生活的固定测量仪。《于洛先生的假期》里，他让海滨旅馆的每一个声音都成为笑点，而不是靠一句台词。",
      ),
      p(
        "《游戏时间》则近乎疯狂：他花光身家搭出一座钢铁玻璃的“塔蒂城”，用 70mm 宽银幕拍摄，画面里同时发生七八件事，观众得自己去找笑点。影片票房惨败，令他破产，却在今天被视作电影史上最精密的喜剧建筑。",
      ),
    ]),
    bioEn:
      "French director and actor, 1907–1982. He came from music-hall mime and from 1949 wrote, directed and starred in his own films, completing six features, most of them built around the character of Monsieur Hulot. Dialogue is minimal, and the comedy depends largely on sound design and staging. The commercial failure of Playtime bankrupted him.",
    careerEssayEn: doc([
      p(
        "Tati came out of mime, and Monsieur Hulot — tall, raincoated, pipe in mouth, forever half a step wrong — is his fixed instrument for measuring modern life. In Monsieur Hulot's Holiday he turns every sound in a seaside hotel into a joke, without recourse to a single line.",
      ),
      p(
        "Playtime is close to madness: he spent his entire fortune building a city of steel and glass, shot it in 70mm, and staged seven or eight things at once in every frame so that the audience has to find the jokes for itself. It failed catastrophically and bankrupted him. It is now regarded as the most precisely engineered comic architecture in cinema.",
      ),
    ]),
  },
  {
    slug: "stanley-kubrick",
    name: "Stanley Kubrick",
    nameZh: "斯坦利·库布里克",
    tmdbPersonId: 240,
    bio: "美国导演，1928–1999。少年时任《展望》杂志摄影记者，1950 年代转入电影，共完成长片十三部。1960 年代起长住英国，几乎所有作品均在当地拍摄。题材横跨战争、科幻、恐怖与历史片，每部筹备期均长。",
    careerEssay: doc([
      p(
        "库布里克的每部片子几乎都换一个类型——战争、黑色喜剧、科幻、恐怖、古装——但方法从不变：对称构图、缓慢推进的镜头、把人放在巨大结构的正中央，然后看着他缩小。",
      ),
      p(
        "《2001 太空漫游》是他最极端的一次实验，用近乎无声的十分钟开场与一段没有解释的结尾，逼观众自己完成意义。此后的《发条橙》《闪灵》都在同一个问题上打转：文明这层壳到底有多薄。",
      ),
    ]),
    bioEn:
      "American director, 1928–1999. He worked as a staff photographer for Look magazine in his teens and moved into film in the 1950s, completing thirteen features. From the 1960s he lived in England and shot almost everything there. He worked across war, science fiction, horror and period subjects, spending long periods in preparation on each.",
    careerEssayEn: doc([
      p(
        "Kubrick changed genre with nearly every film — war, black comedy, science fiction, horror, costume drama — but never changed method: symmetrical framing, the slow advancing camera, a man placed dead centre of an enormous structure and then watched as he shrinks.",
      ),
      p(
        "2001: A Space Odyssey is his most extreme experiment, opening with ten near-silent minutes and closing on an ending he refuses to explain, forcing the audience to complete the meaning itself. A Clockwork Orange and The Shining circle the same question afterwards: exactly how thin the shell of civilization is.",
      ),
    ]),
  },
  {
    slug: "michael-powell",
    name: "Michael Powell",
    nameZh: "迈克尔·鲍威尔",
    tmdbPersonId: 68424,
    bio: "英国导演，1905–1990。1939 年起与编剧埃默里克·普雷斯伯格合作，两人以「射箭者」名义联合署名编导制片，作品包括《红菱艳》《百战将军》。1960 年《偷窥狂》公映后遭猛烈抨击，其导演生涯此后大幅萎缩。",
    careerEssay: doc([
      p(
        "鲍威尔与普雷斯伯格以“射箭者”的名义联合署名，编剧与导演共享一个头衔，这在电影史上几乎绝无仅有。在崇尚纪录式冷静的英国影坛，他们偏要拍浓得化不开的特艺七彩情节剧——《黑水仙》《平步青云》《红菱艳》。",
      ),
      p(
        "鲍威尔的事业毁于《偷窥狂》：一个用摄影机杀人的故事，1960 年被批为下流，今天却成了关于「观看即暴力」的奠基文本。多年后是斯科塞斯等人把他从遗忘里请了回来。",
      ),
    ]),
    bioEn:
      "British director, 1905–1990. From 1939 he worked with the writer Emeric Pressburger, the two taking joint credit as writers, producers and directors under the name The Archers, on films including The Red Shoes and The Life and Death of Colonel Blimp. His career contracted sharply after the hostile reception of Peeping Tom in 1960.",
    careerEssayEn: doc([
      p(
        "Powell and Emeric Pressburger signed their films jointly as The Archers, an almost unheard-of arrangement in which writer and director shared a single credit. Against a British film culture that prized documentary sobriety, they made Technicolor melodramas of overwhelming intensity — Black Narcissus, A Matter of Life and Death, The Red Shoes.",
      ),
      p(
        "Powell's career was effectively ended by Peeping Tom, a film about a killer who films his victims that critics found obscene in 1960 and that is now taught as a founding text on the violence of looking. Scorsese was among those who later brought him back from obscurity.",
      ),
    ]),
  },
  {
    slug: "emeric-pressburger",
    name: "Emeric Pressburger",
    nameZh: "埃默里克·普雷斯伯格",
    tmdbPersonId: 37846,
    bio: "匈牙利裔英国编剧、导演，1902–1988。先后在德国与法国的电影业工作，因纳粹上台流亡英国。1939 年起与迈克尔·鲍威尔合作，两人以「射箭者」名义联合署名，共完成影片约二十部。",
    bioEn:
      "Hungarian-born British writer and director, 1902–1988. He worked in the German and then the French film industries before the rise of the Nazis drove him to Britain. From 1939 he worked with Michael Powell, the two taking joint credit under the name The Archers, on some twenty films.",
  },
  {
    slug: "david-lean",
    name: "David Lean",
    nameZh: "大卫·里恩",
    tmdbPersonId: 12238,
    bio: "英国导演，1908–1991。剪辑师出身，1940 年代先拍摄《相见恨晚》《远大前程》等中小型影片，1950 年代后转向大制作，包括《桂河大桥》《阿拉伯的劳伦斯》《日瓦戈医生》。两度获奥斯卡最佳导演奖。",
    careerEssay: doc([
      p(
        "很多人只记得后期的里恩，但他真正的功底在早年：《相见恨晚》全片发生在一个车站茶室，两个中年人克制的告别，是英国电影最精确的一次情感手术。",
      ),
      p(
        "《桂河大桥》之后他转向大银幕。《阿拉伯的劳伦斯》几乎重新定义了「史诗」——沙漠不是背景而是角色，而那位英雄越走越大，人却越来越碎。剪辑师的出身让他知道：真正的宏大来自节奏，而不是尺寸。",
      ),
    ]),
    bioEn:
      "British director, 1908–1991. He trained as an editor and made modestly scaled films in the 1940s, among them Brief Encounter and Great Expectations, before turning to large productions from the 1950s onwards, including The Bridge on the River Kwai, Lawrence of Arabia and Doctor Zhivago. He received the Academy Award for Best Director twice.",
    careerEssayEn: doc([
      p(
        "Lean is remembered for the late films, but the craft was laid down early: Brief Encounter takes place almost entirely in a station tea room, and the restrained parting of two middle-aged people is the most precise piece of emotional surgery in British cinema.",
      ),
      p(
        "After The Bridge on the River Kwai he moved onto the wide screen. Lawrence of Arabia effectively redefined the epic — the desert is a character rather than a backdrop, and the hero grows larger as the man inside him comes apart. The editor in him knew that real scale comes from rhythm, not from size.",
      ),
    ]),
  },
  {
    slug: "francis-ford-coppola",
    name: "Francis Ford Coppola",
    nameZh: "弗朗西斯·福特·科波拉",
    tmdbPersonId: 1776,
    bio: "美国导演，1939 年生。1970 年代拍摄《教父》《教父 2》与《对话》，1969 年创办美国活动影像公司。《现代启示录》在菲律宾拍摄逾一年，超支部分由其个人担保，此后长期负债。五度获奥斯卡奖。",
    careerEssay: doc([
      p(
        "七十年代属于科波拉。《教父》两部把类型片提升为美国资本与家族的史诗，《对话》则安静得像一部欧洲电影——同一个人在同一个十年里做到了这两件事。",
      ),
      p(
        "《现代启示录》几乎摧毁了他：菲律宾拍摄失控，台风毁掉布景，主演心脏病发，预算靠他抵押家产撑着。成片却因此带上了一种别的电影没有的疯狂——它不是关于越战的电影，它本身就是一次战争。",
      ),
    ]),
    bioEn:
      "American director, born 1939. He made The Godfather, The Godfather Part II and The Conversation in the 1970s, and founded the studio American Zoetrope in 1969. Apocalypse Now took more than a year to shoot in the Philippines, with the overruns guaranteed against his own property, leaving him in debt for years afterwards. He has received five Academy Awards.",
    careerEssayEn: doc([
      p(
        "The seventies belonged to Coppola. The two Godfather films lifted genre into an epic of American capital and family, while The Conversation is as quiet as a European art film — the same man did both inside the same decade.",
      ),
      p(
        "Apocalypse Now almost finished him: the Philippine shoot ran out of control, a typhoon destroyed the sets, his lead actor had a heart attack, and he mortgaged his own property to keep the budget alive. The finished film carries a derangement no other film has, precisely because of it. It is not a picture about the war in Vietnam so much as a war in its own right.",
      ),
    ]),
  },
];
