import { doc, h2, p, quote } from "./tiptap";
import type { SeedFilm } from "./types";

/**
 * The seeded canon — ~50 black-and-white classics in the Criterion/MUBI
 * spirit. Every `editorialNote` is original prose, 200–500 code points
 * (the publish gate). `directorSlugs` reference `directors.ts`; images and
 * `publishedAt` are wired by `seed-content.ts`. `isBlackAndWhite` defaults
 * to true, so it is only set where a title would be an exception.
 */
export const seedFilms: SeedFilm[] = [
  // ── Federico Fellini ──────────────────────────────────────────────
  {
    slug: "otto-e-mezzo",
    titleZh: "八部半",
    titleZhHk: "八部半",
    titleZhTw: "八又二分之一",
    titleOriginal: "Otto e mezzo",
    titleEn: "8½",
    year: 1963,
    countries: ["意大利", "法国"],
    runtimeMinutes: 138,
    aspectRatio: "1.85:1",
    editorialNote:
      "费里尼把创作的困境本身拍成了电影：一个拍不出电影的导演，被记忆、欲望与负疚缠绕，最终在马戏团式的圆圈舞里与自己的人生和解。它是关于艺术家中年危机最诚实的自白，也是电影语言的一次彻底解放——梦境、回忆与现实在同一个镜头里自由换场，不需要任何过渡的借口。黑白摄影在这里不是怀旧，而是让光成为叙事者：吉迪的白衬衫、修女的黑袍、浴场的蒸汽，都是心理的直接显影。半个多世纪过去，几乎所有关于创作者自我怀疑的电影都活在它的阴影里。如果你只看一部费里尼，看这一部。",
    editorialNoteEn:
      "Fellini turned the crisis of making a film into the film itself: a director who cannot make his movie, besieged by memory, desire, and guilt, until a circus-ring dance reconciles him with everything his life has been. It remains the most honest confession of an artist's midlife doubt ever put on screen, and a wholesale liberation of film language \u2014 dream, memory, and the present tense trade places within a single shot and never ask permission. The black-and-white photography here is not nostalgia; it makes light itself the narrator: Guido's white shirt, the nuns' black habits, the steam of the spa are psychology made directly visible. More than half a century on, nearly every film about a creator's self-doubt still lives in its shadow. If you watch only one Fellini, watch this one; if you have watched them all, watch this one again.",
    essay: doc([
      h2("困境如何成为形式"),
      p(
        "传统电影把混乱整理成情节，《八部半》却让混乱本身成为结构。它不解决主角的危机，而是邀请你住进这份危机，直到你发现自己也在其中。",
      ),
      quote("接受生活的全部，才谈得上开始拍电影。"),
    ]),
    cast: [
      { name: "Marcello Mastroianni", zhName: "马塞洛·马斯楚安尼", character: "Guido" },
      { name: "Claudia Cardinale", zhName: "克劳迪娅·卡汀娜", character: "Claudia" },
      { name: "Anouk Aimée", zhName: "阿努克·艾梅", character: "Luisa" },
    ],
    directorSlugs: ["federico-fellini"],
    watchLinks: [
      {
        platform: "The Criterion Channel",
        region: "INTL",
        url: "https://www.criterionchannel.com/",
      },
    ],
  },
  {
    slug: "la-strada",
    titleZh: "大路",
    titleZhTw: "大路",
    titleOriginal: "La strada",
    titleEn: "The Road",
    year: 1954,
    countries: ["意大利"],
    runtimeMinutes: 108,
    aspectRatio: "1.37:1",
    editorialNote:
      "费里尼尚未离开新现实主义，却已长出翅膀。《大路》讲一个被卖给流浪艺人的傻姑娘杰索米娜，跟着粗暴的赞巴诺卖艺为生，直到死亡才让这个铁石心肠的男人明白自己失去了什么。朱丽叶塔·马西纳用小丑般的脸演出了近乎圣愚的天真，让最卑微的生命也闪着神性的光。这不是一部愤怒控诉社会的电影，而是一则关于爱与孤独的寓言：我们常常在失去之后，才认得出曾拥有的东西。结尾赞巴诺在海边的恸哭，是电影史上最沉重的一次迟到的觉悟。",
    editorialNoteEn:
      "Fellini had not yet left neorealism, but the wings were already growing. La strada follows Gelsomina, a simple-hearted girl sold to the traveling strongman Zampano, who bullies her across the roads of postwar Italy until death finally teaches this stone of a man what he has lost. Giulietta Masina plays her with a clown's face and a holy fool's innocence, letting the humblest of lives shine with something close to grace. This is not a film of social protest; it is a parable about love and loneliness \u2014 we tend to recognize what we had only after it is gone. Zampano's sobbing collapse on the beach in the final scene is one of cinema's heaviest arrivals of understanding, and it arrives, as understanding usually does, too late.",
    cast: [
      { name: "Giulietta Masina", zhName: "朱丽叶塔·马西纳", character: "Gelsomina" },
      { name: "Anthony Quinn", zhName: "安东尼·奎因", character: "Zampanò" },
    ],
    directorSlugs: ["federico-fellini"],
  },
  {
    slug: "le-notti-di-cabiria",
    titleZh: "卡比利亚之夜",
    titleZhTw: "卡比利亞之夜",
    titleOriginal: "Le notti di Cabiria",
    titleEn: "Nights of Cabiria",
    year: 1957,
    countries: ["意大利", "法国"],
    runtimeMinutes: 110,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个罗马街头的妓女卡比利亚，一次次被欺骗、被抢劫、被抛弃，却一次次重新相信爱情。费里尼与马西纳这对夫妻，把一个最容易被写成悲剧的题材，拍成了对人类韧性的礼赞。影片最后那个著名的长镜头——卡比利亚刚被未婚夫骗走全部积蓄，眼含泪水走在路上，一群年轻人载歌载舞地经过，她抬起头，对着镜头几乎是对着我们，露出一个破碎又倔强的微笑。那一刻，绝望与希望同时在场。马西纳凭这个角色摘得戛纳影后，她那张仿佛不谙世事的脸，把苦难与天真同时写尽。这是电影送给所有跌倒又爬起的人的一封情书。",
    editorialNoteEn:
      "A Roman streetwalker named Cabiria is cheated, robbed, and abandoned, over and over \u2014 and over and over she decides to believe in love again. Fellini and Masina, husband and wife, took a subject that invites easy tragedy and made a tribute to human resilience instead. In the famous final shot, Cabiria \u2014 freshly swindled out of her savings by the fiance she trusted \u2014 walks down a road with tears in her eyes as a band of young revelers passes around her; she lifts her head and gives the camera, gives us, a broken and stubborn smile. Despair and hope stand in the same frame. Masina won Best Actress at Cannes for the role; her seemingly guileless face carries suffering and innocence in a single expression. This is cinema's love letter to everyone who has fallen down and gotten up again.",
    cast: [{ name: "Giulietta Masina", zhName: "朱丽叶塔·马西纳", character: "Cabiria" }],
    directorSlugs: ["federico-fellini"],
  },

  // ── Ingmar Bergman ────────────────────────────────────────────────
  {
    slug: "the-seventh-seal",
    titleZh: "第七封印",
    titleZhHk: "第七封印",
    titleZhTw: "第七封印",
    titleOriginal: "Det sjunde inseglet",
    titleEn: "The Seventh Seal",
    year: 1957,
    countries: ["瑞典"],
    runtimeMinutes: 96,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个从十字军东征归来的骑士，在黑死病肆虐的中世纪与死神下起一盘棋，只为在死前弄清上帝是否存在。伯格曼把最古老的恐惧——死亡与神的沉默——拍成了一则既凝重又意外幽默的寓言。海边棋局、教堂告解、火刑柱上的女巫，一幕幕逼问着信仰的意义；而那对天真的杂耍夫妻，则是黑暗中留下的微光。影片以死神领着众人在山脊上跳起“死亡之舞”收尾，成为电影史上最著名的画面之一。它诞生于二战的余悸与核阴影之下，至今仍是每个在信与不信之间挣扎者的镜子。",
    essay: doc([
      h2("与沉默对弈"),
      p(
        "骑士要的不是长生，而是一个答案。伯格曼的残酷与温柔在于：他既不许诺上帝存在，也不忍心让善良彻底落空。",
      ),
      quote("信仰是一种折磨，像爱一个躲在黑暗里、始终不肯现身的人。"),
    ]),
    cast: [
      { name: "Max von Sydow", zhName: "马克斯·冯·叙多", character: "Antonius Block" },
      { name: "Bengt Ekerot", zhName: "本格特·埃克罗特", character: "Death" },
    ],
    directorSlugs: ["ingmar-bergman"],
  },
  {
    slug: "wild-strawberries",
    titleZh: "野草莓",
    titleZhTw: "野草莓",
    titleOriginal: "Smultronstället",
    titleEn: "Wild Strawberries",
    year: 1957,
    countries: ["瑞典"],
    runtimeMinutes: 91,
    aspectRatio: "1.37:1",
    editorialNote:
      "一位年迈的医学教授驱车前往领取荣誉学位，一路上却被梦境、回忆与懊悔层层拦截。伯格曼让老人重返童年采野草莓的夏日、重历爱情的失落，在时间的褶皱里审判自己一生的冷漠。由默片大师维克多·舍斯特勒姆亲自出演，那张苍老的脸承载了整个二十世纪对孤独的理解。这是一部关于和解的电影：不是与他人，而是与那个逐渐变得铁石心肠的自己。当老人在片尾终于梦见父母在河边向他招手，冰封的心在一瞬间融化——衰老原来也可以是一次迟来的温柔的醒悟。",
    cast: [
      { name: "Victor Sjöström", zhName: "维克多·舍斯特勒姆", character: "Isak Borg" },
      { name: "Bibi Andersson", zhName: "毕比·安德松", character: "Sara" },
    ],
    directorSlugs: ["ingmar-bergman"],
  },
  {
    slug: "persona",
    titleZh: "假面",
    titleZhHk: "假面",
    titleZhTw: "假面",
    titleOriginal: "Persona",
    titleEn: "Persona",
    year: 1966,
    countries: ["瑞典"],
    runtimeMinutes: 83,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个突然拒绝说话的女演员，与照顾她的护士在海边独处，两个女人的身份逐渐渗透、交换、直至难分彼此。伯格曼在这里抛弃了一切故事的安全感，让胶片自燃、让银幕断裂，把电影本身的虚构性推到台前。这是他最难解也最大胆的作品：关于身份、沉默与我们戴给世界的那副面具。丽芙·乌曼与毕比·安德松两张脸在著名的叠印镜头里合为一张，成为二十世纪现代主义电影最令人不安的图像。它拒绝被讲清楚，却在每一次重看时都逼你面对：所谓“自我”，是否只是一场无人拆穿的表演。",
    directorSlugs: ["ingmar-bergman"],
  },
  {
    slug: "the-virgin-spring",
    titleZh: "处女泉",
    titleZhTw: "處女之泉",
    titleOriginal: "Jungfrukällan",
    titleEn: "The Virgin Spring",
    year: 1960,
    countries: ["瑞典"],
    runtimeMinutes: 89,
    aspectRatio: "1.37:1",
    editorialNote:
      "中世纪的瑞典，一个虔诚人家的少女在去教堂途中被牧羊人奸杀，凶手却阴差阳错借宿到死者父亲的家中。当真相败露，父亲手刃仇人，随即在女儿倒下之处涌出一眼清泉。伯格曼借一则古老民谣，逼问最尖锐的神义论问题：全能的上帝为何容许无辜者受难。父亲在泉边跪地立誓建起教堂的一幕，既是忏悔也是与沉默之神的艰难和解。冷峻的黑白影像与几乎残酷的克制，让暴力与神迹并置，毫不煽情却直抵灵魂。这部为伯格曼赢得奥斯卡的作品，是他信仰追问的一次凛冽结晶。",
    directorSlugs: ["ingmar-bergman"],
  },

  // ── Akira Kurosawa ────────────────────────────────────────────────
  {
    slug: "seven-samurai",
    titleZh: "七武士",
    titleZhHk: "七武士",
    titleZhTw: "七武士",
    titleOriginal: "七人の侍",
    titleEn: "Seven Samurai",
    year: 1954,
    countries: ["日本"],
    runtimeMinutes: 207,
    aspectRatio: "1.37:1",
    editorialNote:
      "战国乱世，一座饱受山贼劫掠的村庄，请来七个走投无路的浪人守护稻谷与性命。黑泽明用三个多小时建起一整座关于勇气、阶级与徒劳的史诗：招募、备战、决战，节奏如鼓点般层层推进，泥泞中的雨战至今仍是动作场面的标尺。但它真正动人的，是武士与农民之间那道无法弥合的裂缝——胜利属于活下来的农民，而武士只留下几座土坟。“这一仗我们又输了。”志村乔的这句叹息，把英雄主义拉回了历史的尘土。此后无数关于“乌合之众集结成队”的电影，都欠它一份师承。",
    essay: doc([
      h2("运动即叙事"),
      p(
        "黑泽明用长焦、多机位与突然的静止，让每一次冲锋都有重量。观众不是在看故事，而是被卷进故事的物理之中。",
      ),
    ]),
    cast: [
      { name: "Toshiro Mifune", zhName: "三船敏郎", character: "菊千代" },
      { name: "Takashi Shimura", zhName: "志村乔", character: "岛田勘兵卫" },
    ],
    directorSlugs: ["akira-kurosawa"],
    watchLinks: [
      {
        platform: "The Criterion Channel",
        region: "INTL",
        url: "https://www.criterionchannel.com/",
      },
    ],
  },
  {
    slug: "rashomon",
    titleZh: "罗生门",
    titleZhHk: "羅生門",
    titleZhTw: "羅生門",
    titleOriginal: "羅生門",
    titleEn: "Rashomon",
    year: 1950,
    countries: ["日本"],
    runtimeMinutes: 88,
    aspectRatio: "1.37:1",
    editorialNote:
      "一桩树林里的凶案，四个当事人给出四套彼此矛盾的证词，包括借巫女之口开口的死者。黑泽明由此把一个简单的谋杀，拍成了关于真相是否存在的哲学迷宫。摄影机第一次大胆地对着太阳穿行于密林，光影斑驳，如同人心的暧昧。每个人的叙述都在维护自己的体面，真相反而在自利的雾中永远退场。“罗生门”从此成为一个世界通用的词，指代那种各执一词、无从裁断的困境。而结尾樵夫收养弃婴的微光，又为这份对人性的怀疑留了一线不肯熄灭的信任。它让世界第一次看见了日本电影。",
    cast: [
      { name: "Toshiro Mifune", zhName: "三船敏郎", character: "多襄丸" },
      { name: "Machiko Kyō", zhName: "京町子", character: "真砂" },
    ],
    directorSlugs: ["akira-kurosawa"],
  },
  {
    slug: "ikiru",
    titleZh: "生之欲",
    titleZhHk: "留芳頌",
    titleZhTw: "生之慾",
    titleOriginal: "生きる",
    titleEn: "Ikiru",
    year: 1952,
    countries: ["日本"],
    runtimeMinutes: 143,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个庸碌了三十年、只会盖章的市政科长，被诊断出胃癌只剩数月可活。在纵酒与彷徨之后，他决定用最后的时间，顶着官僚系统的层层推诿，把一片臭水沟建成一座小公园。黑泽明用近乎残酷的诚实拷问：人怎样才算真正活过？影片后半程干脆跳到主人公的葬礼，让同事们在酒后争论他究竟做了什么——记忆与推诿之间，一个人的意义被反复称量。志村乔在雪夜的秋千上轻声哼唱的一幕，是电影史上最动人的死亡与新生。它提醒每一个在体制中麻木的人：意义不在别处，只在你肯不肯为一件小事燃尽自己。",
    cast: [{ name: "Takashi Shimura", zhName: "志村乔", character: "渡边勘治" }],
    directorSlugs: ["akira-kurosawa"],
  },
  {
    slug: "yojimbo",
    titleZh: "用心棒",
    titleZhHk: "用心棒",
    titleZhTw: "大鏢客",
    titleOriginal: "用心棒",
    titleEn: "Yojimbo",
    year: 1961,
    countries: ["日本"],
    runtimeMinutes: 110,
    aspectRatio: "2.35:1",
    editorialNote:
      "一个无名浪人踱进一座被两帮恶势力撕扯的小镇，索性把自己卖给双方，坐看他们自相残杀。黑泽明把西部片的骨架移植到幕末的日本，又用三船敏郎耸肩、抓痒、痞气十足的表演，造出了一个全新的反英雄。风卷尘沙的空镜、干脆利落的杀阵，把冷峻与黑色幽默调成一味。这部电影反过来又催生了莱昂内的《荒野大镖客》，一个形象就此在东西方之间来回投胎，成就了“独行客涤荡罪恶小镇”的永恒母题。冷峻的幽默之下，是黑泽明对暴力与贪婪毫不留情的嘲讽。它证明娱乐性与作者性从来不必二选一。",
    cast: [{ name: "Toshiro Mifune", zhName: "三船敏郎", character: "桑畑三十郎" }],
    directorSlugs: ["akira-kurosawa"],
  },

  // ── Yasujirō Ozu ──────────────────────────────────────────────────
  {
    slug: "tokyo-story",
    titleZh: "东京物语",
    titleZhHk: "東京物語",
    titleZhTw: "東京物語",
    titleOriginal: "東京物語",
    titleEn: "Tokyo Story",
    year: 1953,
    countries: ["日本"],
    runtimeMinutes: 136,
    aspectRatio: "1.37:1",
    editorialNote:
      "一对老夫妻从乡下到东京探望儿女，却发现忙于生计的孩子们把他们当成负担，唯有战死儿子的遗孀待他们最好。小津用他标志性的低机位与几乎静止的镜头，拍下家庭最平常也最残忍的真相：亲情会随距离与时间悄然稀释，而我们总要到来不及时才懂得。没有争吵，没有戏剧化的转折，只有茶杯、火车与欲言又止的沉默。母亲归乡后骤然离世，留下父亲独对空荡的房子——那份克制到极点的哀伤，比任何嚎哭都更叫人心碎。这是电影献给“子欲养而亲不待”的一首挽歌，也是很多人到了一定年纪才敢重看的作品。",
    essay: doc([
      h2("低处的凝视"),
      p(
        "小津把摄影机放在跪坐者的视线高度，几乎从不移动。世界因此不再被“表现”，而是被静静地“看着”——像家人围坐时那种不动声色的注视。",
      ),
    ]),
    cast: [
      { name: "Chishū Ryū", zhName: "笠智众", character: "平山周吉" },
      { name: "Setsuko Hara", zhName: "原节子", character: "纪子" },
    ],
    directorSlugs: ["yasujiro-ozu"],
  },
  {
    slug: "late-spring",
    titleZh: "晚春",
    titleZhHk: "晚春",
    titleZhTw: "晚春",
    titleOriginal: "晩春",
    titleEn: "Late Spring",
    year: 1949,
    countries: ["日本"],
    runtimeMinutes: 108,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个与父亲相依为命的女儿，因不愿离开而迟迟不肯出嫁，父亲便谎称自己要再娶，好逼她走进属于自己的人生。小津把一桩再寻常不过的婚事，拍成了关于付出与放手的深潭。原节子的笑容明亮得近乎透明，笑意底下却涌动着不舍与体谅。片尾父亲独自削着苹果，果皮断落，房间空了——那一刻，成全孩子的孤独具象成了一个简单的动作。没有一句台词点破，却道尽了为人父母的甘苦。这是小津“嫁女”母题的起点，也是他最温柔的一次心碎。原节子与笠智众的这次合作，就此开启了小津战后最动人的一系列家庭电影。",
    cast: [
      { name: "Chishū Ryū", zhName: "笠智众", character: "曾宫周吉" },
      { name: "Setsuko Hara", zhName: "原节子", character: "曾宫纪子" },
    ],
    directorSlugs: ["yasujiro-ozu"],
  },
  {
    slug: "early-summer",
    titleZh: "麦秋",
    titleZhHk: "麥秋",
    titleZhTw: "麥秋",
    titleOriginal: "麦秋",
    titleEn: "Early Summer",
    year: 1951,
    countries: ["日本"],
    runtimeMinutes: 125,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个到了适婚年龄的女儿，在家人为她张罗体面婚事时，却出人意料地选择嫁给邻家带着孩子的丧偶医生。小津把镜头对准三代同堂的大家庭，看它如何在一桩婚事中不动声色地走向解体。他不评判任何人的选择，只是让生活像麦子成熟那样自然发生。餐桌、走廊、海边沙丘上的空镜，把聚散离合酿成了淡淡的、带着咸味的诗。结尾老夫妇望着熟透的麦田感叹“我们已经很幸福了”，是小津对无常人生最豁达的注解：家终会散，而正因为会散，此刻的团圆才值得珍重。",
    cast: [{ name: "Setsuko Hara", zhName: "原节子", character: "间宫纪子" }],
    directorSlugs: ["yasujiro-ozu"],
  },

  // ── Andrei Tarkovsky ──────────────────────────────────────────────
  {
    slug: "andrei-rublev",
    titleZh: "安德烈·卢布廖夫",
    titleZhTw: "安德烈·盧布列夫",
    titleOriginal: "Андрей Рублёв",
    titleEn: "Andrei Rublev",
    year: 1966,
    countries: ["苏联"],
    runtimeMinutes: 205,
    aspectRatio: "2.35:1",
    editorialNote:
      "以十五世纪圣像画家卢布廖夫为轴，塔可夫斯基拍下了一个艺术家如何在鞑靼铁蹄、饥荒与暴力中丧失又重拾信仰的漫长历程。影片由八个篇章缀成，气象恢弘却又粗粝真实，把中世纪罗斯的泥泞、苦难与偶尔迸发的神性一并托起。最著名的“铸钟”一段，一个少年在毫无把握中赌上性命铸出巨钟，钟声轰然响起的那一刻，几乎是对一切创造行为的献词。黑白的苦难在结尾骤然转为卢布廖夫真迹的彩色特写——艺术终于从血与土里升起。这是关于信仰、暴力与创作代价的沉思，也是塔可夫斯基“雕刻时光”的第一座丰碑。",
    directorSlugs: ["andrei-tarkovsky"],
  },
  {
    slug: "ivans-childhood",
    titleZh: "伊万的童年",
    titleZhTw: "伊凡的少年時代",
    titleOriginal: "Иваново детство",
    titleEn: "Ivan's Childhood",
    year: 1962,
    countries: ["苏联"],
    runtimeMinutes: 95,
    aspectRatio: "1.37:1",
    editorialNote:
      "十二岁的伊万在战争中失去全家，成了红军的侦察兵，穿行于生死之间的前线沼泽。塔可夫斯基的处女作就已显露天才：他让梦境与战争交替浮现，明亮的童年闪回与阴冷的现实互为伤口。倒映的白桦、滴水的地窖、被炮火犁过的荒原，都被拍出了一种令人窒息的诗意。伊万把整个童年献给了复仇，也因此被战争彻底吞噬。影片没有一处正面歌颂英勇，只是静静记录一个孩子如何被时代碾碎。它一举拿下威尼斯金狮，宣告了一位把苦难拍成挽歌的诗人导演的诞生。",
    directorSlugs: ["andrei-tarkovsky"],
  },

  // ── Robert Bresson ────────────────────────────────────────────────
  {
    slug: "pickpocket",
    titleZh: "扒手",
    titleZhTw: "扒手",
    titleOriginal: "Pickpocket",
    titleEn: "Pickpocket",
    year: 1959,
    countries: ["法国"],
    runtimeMinutes: 76,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个自视甚高的青年沉迷于扒窃，把偷盗当作对平庸世界的智力反叛，直到爱与被捕才让他真正低头。布列松剥去一切表演的痕迹，让手指、目光与物件的运动承担全部叙事。地铁站、火车里那几段扒窃的“手部芭蕾”，被剪辑得如同一场精密的仪式，紧张却毫不煽情。这是他“恩典”主题最凝练的一次表达：救赎不来自主人公的悔悟，而来自监狱铁窗前那一句“我走了多么远的路才到你身边”。全片仅七十余分钟，却把犯罪、骄傲与爱写得像一则冷峻的祈祷。理解布列松，不妨从这里开始。",
    directorSlugs: ["robert-bresson"],
  },
  {
    slug: "au-hasard-balthazar",
    titleZh: "驴子巴特萨",
    titleZhHk: "巴達薩驢的遭遇",
    titleZhTw: "驢子巴達薩",
    titleOriginal: "Au hasard Balthazar",
    titleEn: "Au Hasard Balthazar",
    year: 1966,
    countries: ["法国", "瑞典"],
    runtimeMinutes: 95,
    aspectRatio: "1.37:1",
    editorialNote:
      "一头名叫巴特萨的驴子，从一个主人辗转到另一个主人，默默承受人间的爱抚、鞭打、利用与遗弃，最终死在羊群之中。布列松借这头驴的一生，写下了一部关于圣徒、苦难与人类残忍的寓言。驴子从不表演情绪，正因如此，它那双温顺的眼睛成了一面镜子，照出周遭每一个人的贪婪与软弱。结尾它中弹后缓缓卧倒在阳光下的草坡上，羊群围拢过来——那是电影史上最接近“殉道”的死亡。没有一句说教，却让戈达尔感叹“这就是整个世界”。它要求的不是理解，而是凝视与谦卑。",
    directorSlugs: ["robert-bresson"],
  },

  // ── Michelangelo Antonioni ────────────────────────────────────────
  {
    slug: "lavventura",
    titleZh: "奇遇",
    titleZhHk: "迷情",
    titleZhTw: "情事",
    titleOriginal: "L'avventura",
    titleEn: "L'Avventura",
    year: 1960,
    countries: ["意大利", "法国"],
    runtimeMinutes: 144,
    aspectRatio: "1.85:1",
    editorialNote:
      "一群富人乘游艇出海，一个女人在荒岛上离奇失踪，然而电影很快放弃了寻找，转而凝视她的情人与好友如何在寻人途中彼此吸引。安东尼奥尼故意抽掉悬疑的答案，把注意力交给现代人之间无法填补的空洞。人物常被压到画面一角，让岩石、建筑与空旷的街道占据中心，仿佛环境本身就在制造疏离。这份“反情节”曾在戛纳招致嘘声，却很快被奉为现代主义电影的里程碑。它不提供故事的满足，只留下一种挥之不去的怅惘：我们如此靠近，却谁也无法真正抵达谁。看它，需要放下对答案的执念。",
    directorSlugs: ["michelangelo-antonioni"],
  },
  {
    slug: "la-notte",
    titleZh: "夜",
    titleZhTw: "夜",
    titleOriginal: "La notte",
    titleEn: "La Notte",
    year: 1961,
    countries: ["意大利", "法国"],
    runtimeMinutes: 122,
    aspectRatio: "1.85:1",
    editorialNote:
      "一对婚姻走到尽头的夫妻，用一整夜的时间——探望病危的友人、参加喧闹的派对、在清晨的高尔夫球场上摊牌——确认爱情已经死去。安东尼奥尼让米兰的现代建筑成为冷漠的共谋，玻璃幕墙映出的是无处安放的空虚。让娜·莫罗独自穿行城市的长段落，几乎没有对白，却把一个女人的幻灭写得淋漓尽致。片尾丈夫读起多年前写给妻子的情书，却记不得那是自己所写——最痛的不是背叛，而是激情如何在日常里悄无声息地蒸发。这是“疏离三部曲”中最冷静的一部，献给所有在长久关系里感到彼此陌生的人。",
    cast: [
      { name: "Jeanne Moreau", zhName: "让娜·莫罗", character: "Lidia" },
      { name: "Marcello Mastroianni", zhName: "马塞洛·马斯楚安尼", character: "Giovanni" },
    ],
    directorSlugs: ["michelangelo-antonioni"],
  },
  {
    slug: "leclisse",
    titleZh: "蚀",
    titleZhTw: "蝕",
    titleOriginal: "L'eclisse",
    titleEn: "L'Eclisse",
    year: 1962,
    countries: ["意大利", "法国"],
    runtimeMinutes: 126,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个刚结束一段感情的女子，与在证券交易所里追逐金钱的年轻经纪人短暂相恋，却始终无法真正投入。安东尼奥尼“疏离三部曲”的终章，把现代情感的虚无推向极致。喧嚣的股市与空荡的街角形成刺目的对照，爱情像日食一样，明明发生过，却迅速被阴影吞没。影片最惊人的是结尾：两人约好再见，镜头却在约定的街角空等了七分钟，只有路灯、水桶、陌生人的脸，恋人始终没有出现。这段“无人的蒙太奇”宣告了现代人情感的彻底缺席，也把电影语言推到了抽象的边缘。它冷峻得近乎残酷，却精准得令人心悸。",
    directorSlugs: ["michelangelo-antonioni"],
  },

  // ── Jean-Luc Godard ───────────────────────────────────────────────
  {
    slug: "breathless",
    titleZh: "精疲力尽",
    titleZhHk: "斷了氣",
    titleZhTw: "斷了氣",
    titleOriginal: "À bout de souffle",
    titleEn: "Breathless",
    year: 1960,
    countries: ["法国"],
    runtimeMinutes: 90,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个崇拜好莱坞硬汉的小混混偷车杀警，拉着美国女友在巴黎街头亡命，最终被她出卖。戈达尔的处女作用满不在乎的跳接，砸碎了古典剪辑的连贯，宣告一种全新的电影语法就此诞生。手持摄影、实景街拍、直视镜头的挑衅，把即兴与随性变成了美学。贝尔蒙多叼着烟摸嘴唇的痞气、塞贝格在香榭丽舍卖报的侧脸，成了新浪潮永恒的图腾。它不在乎故事是否严密，只在乎电影能否像生活一样任性、鲜活、随时脱轨。六十年后再看，那股横冲直撞的青春气息依旧扑面而来。这是现代电影的一声发令枪。",
    essay: doc([
      h2("跳接作为宣言"),
      p(
        "跳接不是失误，而是态度：戈达尔剪掉了让叙事“顺滑”的那几帧，好让你时刻记得，你在看的是电影，而电影可以为所欲为。",
      ),
    ]),
    cast: [
      { name: "Jean-Paul Belmondo", zhName: "让-保罗·贝尔蒙多", character: "Michel" },
      { name: "Jean Seberg", zhName: "让·塞贝格", character: "Patricia" },
    ],
    directorSlugs: ["jean-luc-godard"],
  },
  {
    slug: "vivre-sa-vie",
    titleZh: "随心所欲",
    titleZhHk: "隨心所欲",
    titleZhTw: "賴活",
    titleOriginal: "Vivre sa vie",
    titleEn: "Vivre sa Vie",
    year: 1962,
    countries: ["法国"],
    runtimeMinutes: 80,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个想当演员的年轻女子娜娜，一步步沦为妓女，最终死于一场荒谬的交易。戈达尔用十二个带标题的段落，像论文又像素描地拆解一个女人的堕落与尊严。安娜·卡里娜的脸在片中被反复凝视——她在影院里对着德莱叶的《圣女贞德》落泪的一幕，把两个受难的女性隔着三十年重叠在一起。影片穿插哲学对话、街头实录与直视镜头的独白，冷静得近乎残酷，却又饱含爱意。它既是新浪潮对类型的又一次解构，也是戈达尔写给卡里娜的一封情书。自由与被出卖，在这里只有一线之隔。",
    cast: [{ name: "Anna Karina", zhName: "安娜·卡里娜", character: "Nana" }],
    directorSlugs: ["jean-luc-godard"],
  },

  // ── François Truffaut ─────────────────────────────────────────────
  {
    slug: "the-400-blows",
    titleZh: "四百击",
    titleZhHk: "四百擊",
    titleZhTw: "四百擊",
    titleOriginal: "Les quatre cents coups",
    titleEn: "The 400 Blows",
    year: 1959,
    countries: ["法国"],
    runtimeMinutes: 99,
    aspectRatio: "2.35:1",
    editorialNote:
      "十三岁的安托万被冷漠的父母、刻板的学校与不被理解的世界一步步推向街头与教养院。特吕弗把自己的童年拍成了新浪潮的开山之作，镜头始终与少年平视，从不居高临下地评判。逃学、偷打字机、被审讯——每一次“胡闹”背后，都是一个渴望被爱却屡屡碰壁的灵魂。影片以一个长镜头收尾：安托万从教养院逃出，一路奔向从未见过的大海，在浪花前停下，回头望向镜头，画面定格。那个既自由又茫然的眼神，成了电影史上最动人的结尾之一。它温柔地告诉每个曾是“问题少年”的人：你并不孤单。",
    cast: [{ name: "Jean-Pierre Léaud", zhName: "让-皮埃尔·利奥", character: "Antoine Doinel" }],
    directorSlugs: ["francois-truffaut"],
  },

  // ── Alfred Hitchcock ──────────────────────────────────────────────
  {
    slug: "psycho",
    titleZh: "惊魂记",
    titleZhHk: "觸目驚心",
    titleZhTw: "驚魂記",
    titleOriginal: "Psycho",
    titleEn: "Psycho",
    year: 1960,
    countries: ["美国"],
    runtimeMinutes: 109,
    aspectRatio: "1.85:1",
    editorialNote:
      "一个卷款潜逃的女秘书，在荒僻的汽车旅馆遇上腼腆的老板诺曼·贝茨，随即在浴室里被刺身亡——而这仅仅是电影的前半段。希区柯克用这场石破天惊的“中途弑主角”，彻底颠覆了观众对安全感的一切预期。淋浴谋杀那七十余个镜头的凌厉剪辑与伯纳德·赫尔曼尖啸的弦乐，成为影史最著名的段落。他把恐怖从哥特城堡搬进了寻常的汽车旅馆，暗示真正的怪物就藏在最普通的人心里。这部低成本黑白片重新定义了惊悚片的尺度与伦理，也让一代观众从此不敢安心洗澡。悬念大师最锋利的一击。",
    cast: [
      { name: "Anthony Perkins", zhName: "安东尼·博金斯", character: "Norman Bates" },
      { name: "Janet Leigh", zhName: "珍妮特·利", character: "Marion Crane" },
    ],
    directorSlugs: ["alfred-hitchcock"],
  },
  {
    slug: "shadow-of-a-doubt",
    titleZh: "辣手摧花",
    titleZhTw: "辣手摧花",
    titleOriginal: "Shadow of a Doubt",
    titleEn: "Shadow of a Doubt",
    year: 1943,
    countries: ["美国"],
    runtimeMinutes: 108,
    aspectRatio: "1.37:1",
    editorialNote:
      "小镇少女查理满心欢喜地迎来同名的舅舅来访，却渐渐察觉这位迷人的长辈很可能是连环杀害寡妇的凶手。希区柯克本人最钟爱的作品之一，把恐怖悄悄植入最安稳的美国小镇与最亲密的家庭内部。他让甥舅二人如镜像般彼此映照，善与恶的界线因血缘而愈发暧昧不安。餐桌上舅舅那段厌世的独白，冷不防撕开了体面生活的假面。没有异国城堡，只有白栅栏后的日常，危险却因此更贴近骨髓。这是希区柯克对“恶就住在隔壁”这一命题最优雅也最阴冷的演绎。",
    directorSlugs: ["alfred-hitchcock"],
  },

  // ── Orson Welles ──────────────────────────────────────────────────
  {
    slug: "citizen-kane",
    titleZh: "公民凯恩",
    titleZhHk: "大國民",
    titleZhTw: "大國民",
    titleOriginal: "Citizen Kane",
    titleEn: "Citizen Kane",
    year: 1941,
    countries: ["美国"],
    runtimeMinutes: 119,
    aspectRatio: "1.37:1",
    editorialNote:
      "报业大亨凯恩临终吐出的一个词“玫瑰花蕾”，牵出记者对他一生的层层追查，也拼出一幅关于权力、孤独与美国梦幻灭的碎片肖像。年仅二十五岁的威尔斯集编导演于一身，用深焦摄影、天花板入镜、时间跳跃的叙事，几乎一次性刷新了电影语言的边界。凯恩从理想主义的青年一路膨胀为众叛亲离的孤家寡人，那座塞满收藏却空无一人的庄园，是二十世纪对成功最尖锐的反讽。“玫瑰花蕾”的谜底，最终指向的是被金钱买不回的童年。它常年高居影史最伟大作品之列，至今仍是每个学电影者绕不开的起点。",
    essay: doc([
      h2("深焦里的权力"),
      p(
        "威尔斯让前景与背景同样清晰，人物于是被困在自己搭建的巨大空间里。景深不只是技法，它就是这部电影的主题：凯恩拥有整个画面，却填不满其中的空。",
      ),
    ]),
    cast: [{ name: "Orson Welles", zhName: "奥逊·威尔斯", character: "Charles Foster Kane" }],
    directorSlugs: ["orson-welles"],
  },
  {
    slug: "touch-of-evil",
    titleZh: "历劫佳人",
    titleZhHk: "歷劫佳人",
    titleZhTw: "歷劫佳人",
    titleOriginal: "Touch of Evil",
    titleEn: "Touch of Evil",
    year: 1958,
    countries: ["美国"],
    runtimeMinutes: 95,
    aspectRatio: "1.85:1",
    editorialNote:
      "美墨边境小镇发生汽车爆炸案，一个墨西哥缉毒官与一个腐败臃肿的美国警长就此展开较量。威尔斯自导自演那个道德溃烂的警长，把黑色电影的堕落美学推向巅峰。影片开场那个长达三分多钟、跨越街区与国界的著名长镜头，从装置炸弹一直跟到它爆炸，堪称调度史上的奇迹。倾斜的构图、逼仄的阴影与霓虹，把边境拍成了善恶难辨的泥沼。“他是个烂人，可他有直觉。”这句盖棺定论，道尽了威尔斯对人性含混的迷恋。作为经典黑色电影的一记华丽终章，它的邪魅至今无人能及。",
    cast: [
      { name: "Charlton Heston", zhName: "查尔顿·赫斯顿", character: "Ramon Vargas" },
      { name: "Orson Welles", zhName: "奥逊·威尔斯", character: "Hank Quinlan" },
    ],
    directorSlugs: ["orson-welles"],
  },

  // ── Carl Theodor Dreyer ───────────────────────────────────────────
  {
    slug: "the-passion-of-joan-of-arc",
    titleZh: "圣女贞德蒙难记",
    titleZhHk: "聖女貞德受難記",
    titleZhTw: "聖女貞德受難記",
    titleOriginal: "La passion de Jeanne d'Arc",
    titleEn: "The Passion of Joan of Arc",
    year: 1928,
    countries: ["法国"],
    runtimeMinutes: 82,
    aspectRatio: "1.33:1",
    editorialNote:
      "德莱叶依据真实审判记录，重现贞德受审、受辱直至火刑的最后时日。他几乎全程使用特写，让镜头贴近一张张脸——审判者的傲慢、贞德的泪水与信仰，在毫无修饰的皮肤纹理间纤毫毕现。法尔康内蒂奉献了电影史上最震撼的表演之一，据说她的泪水是真实痛苦的结晶。没有华丽布景，没有配乐（默片），只有面孔与信念的正面交锋，把一场宗教审判拍成了灵魂的酷刑。当火焰终于升起，殉道与救赎合为一体。这部近百年前的默片，至今仍是“电影能否承载超验之物”这一问题最有力的回答。",
    directorSlugs: ["carl-theodor-dreyer"],
  },
  {
    slug: "ordet",
    titleZh: "词语",
    titleZhTw: "復活",
    titleOriginal: "Ordet",
    titleEn: "Ordet",
    year: 1955,
    countries: ["丹麦"],
    runtimeMinutes: 126,
    aspectRatio: "1.37:1",
    editorialNote:
      "丹麦乡间一个笃信上帝的农家，因信仰的分歧、疯癫的次子与一场难产的死亡而陷入危机，直到影片结尾迎来一场令人屏息的复活。德莱叶用极其克制、缓慢横移的长镜头，把日常的厨房与病榻拍出了祭坛般的庄严。他不解释、不煽情，只是耐心地让怀疑与信念在白墙之间交锋。当自称是基督的次子握住死者的手，奇迹真的发生——那一刻，最理性的观众也被逼到神迹的门前。这是电影史上少有的、敢于正面呈现“复活”而毫不滑向廉价的作品。它要求的不是相信，而是屏住呼吸的敬畏。",
    directorSlugs: ["carl-theodor-dreyer"],
  },

  // ── Kenji Mizoguchi ───────────────────────────────────────────────
  {
    slug: "ugetsu",
    titleZh: "雨月物语",
    titleZhHk: "雨月物語",
    titleZhTw: "雨月物語",
    titleOriginal: "雨月物語",
    titleEn: "Ugetsu",
    year: 1953,
    countries: ["日本"],
    runtimeMinutes: 96,
    aspectRatio: "1.37:1",
    editorialNote:
      "战乱年代，两个贪图富贵与虚名的农夫抛下妻子外出闯荡，一个迷失在女鬼的温柔乡里，一个荒唐地做起了武士，最终都在幻梦破灭后尝到苦果。沟口健二用如水墨般流动的长镜头，把民间怪谈拍成了关于欲望与代价的凄美卷轴。雾中泛舟、幽宅夜宴的段落，虚实交融，美得令人心惊。当陶匠归家，亡妻的鬼魂已在灶前默默为他备好晚饭——那份跨越生死的温柔，比任何控诉都更叫人痛惜。影片对战争中被牺牲的女性寄予了最深的悲悯。它是日本电影黄金时代最精致的鬼故事，也是一则关于男人虚荣的永恒寓言。",
    directorSlugs: ["kenji-mizoguchi"],
  },
  {
    slug: "sansho-the-bailiff",
    titleZh: "山椒大夫",
    titleZhHk: "山椒大夫",
    titleZhTw: "山椒大夫",
    titleOriginal: "山椒大夫",
    titleEn: "Sansho the Bailiff",
    year: 1954,
    countries: ["日本"],
    runtimeMinutes: 124,
    aspectRatio: "1.37:1",
    editorialNote:
      "平安时代，一对姐弟因父亲仗义执言而家破人亡，被拐卖为奴，在残暴的庄头山椒大夫手下受尽折磨。沟口健二把这则古老传说，拍成了关于仁慈能否在残酷世间存续的沉思。姐姐安寿为掩护弟弟逃走而从容投水的一幕，湖面只余一圈涟漪，克制得令人肝肠寸断。多年后弟弟秉承父训释放奴隶、寻回失明的老母，却已物是人非。沟口的镜头始终保持着悲悯的距离，让苦难在优雅的构图中显得愈发沉重。“人若没有慈悲，便不算人。”父亲的教诲贯穿全片。这是对权力之恶与人性之善最庄重的一次称量。",
    directorSlugs: ["kenji-mizoguchi"],
  },

  // ── Luis Buñuel ───────────────────────────────────────────────────
  {
    slug: "los-olvidados",
    titleZh: "被遗忘的人们",
    titleZhTw: "被遺忘的人們",
    titleOriginal: "Los olvidados",
    titleEn: "The Young and the Damned",
    year: 1950,
    countries: ["墨西哥"],
    runtimeMinutes: 80,
    aspectRatio: "1.37:1",
    editorialNote:
      "墨西哥城的贫民窟里，一群无人照管的少年在暴力与饥饿中彼此伤害，走向注定的毁灭。布努埃尔把超现实主义的锋利，狠狠扎进了最残酷的社会现实。他拒绝廉价的同情，既不美化穷人也不宽恕他们，只是冷静地展示贫困如何制造出恶。片中那段少年梦见母亲递来血淋淋生肉的超现实梦境，把弗洛伊德式的欲望与匮乏一并揭开。结尾少年的尸体被随意扔上垃圾车、抛入沟渠，是对“被遗忘者”命运最刺骨的注脚。它一举让布努埃尔在墨西哥东山再起，也证明超现实主义可以是最尖锐的现实批判。",
    directorSlugs: ["luis-bunuel"],
  },
  {
    slug: "un-chien-andalou",
    titleZh: "一条安达鲁狗",
    titleZhTw: "安達魯之犬",
    titleOriginal: "Un chien andalou",
    titleEn: "An Andalusian Dog",
    year: 1929,
    countries: ["法国"],
    runtimeMinutes: 21,
    aspectRatio: "1.33:1",
    editorialNote:
      "布努埃尔与画家达利联手炮制的这部十余分钟的默片，以一记割裂眼球的镜头开场，宣告了超现实主义电影的诞生。手掌里爬出蚂蚁、钢琴上拖着腐驴与神父、时间字幕胡乱跳跃——它拒绝一切逻辑与解释，只忠实于梦与潜意识的自由联想。两位作者立下规矩：任何能被理性说通的画面一律删去。正因如此，它至今仍保有令人不安的原始冲击力，像一场无法被驯服的噩梦。作为电影先锋派最著名的一次爆破，它不是用来“看懂”的，而是用来经受的。近百年过去，那把划过眼球的剃刀依旧让人本能地闭眼。",
    directorSlugs: ["luis-bunuel"],
  },

  // ── Jean Renoir ───────────────────────────────────────────────────
  {
    slug: "the-rules-of-the-game",
    titleZh: "游戏规则",
    titleZhHk: "遊戲規則",
    titleZhTw: "遊戲規則",
    titleOriginal: "La règle du jeu",
    titleEn: "The Rules of the Game",
    year: 1939,
    countries: ["法国"],
    runtimeMinutes: 106,
    aspectRatio: "1.37:1",
    editorialNote:
      "一群贵族与仆人齐聚乡间庄园狩猎作乐，情欲、谎言与阶级的游戏在楼上楼下同时上演，最终以一场荒唐的误杀收场。雷诺阿用流动的场面调度与纵深构图，让主仆、宾客在同一空间里进进出出，织成一幅战前法国社会的群像。他不审判任何人，因为“每个人都有他的理由”。狩猎场上兔子成片倒下的段落，冷不防预言了即将到来的战争屠戮。影片公映时惨遭嘘骂与删剪，二战后才被重新发现，如今稳居影史殿堂。它是喜剧也是挽歌，笑着送别一个行将崩塌的旧世界，优雅之下藏着刺骨的悲凉。",
    directorSlugs: ["jean-renoir"],
  },
  {
    slug: "grand-illusion",
    titleZh: "大幻影",
    titleZhHk: "大幻影",
    titleZhTw: "大幻影",
    titleOriginal: "La grande illusion",
    titleEn: "Grand Illusion",
    year: 1937,
    countries: ["法国"],
    runtimeMinutes: 113,
    aspectRatio: "1.37:1",
    editorialNote:
      "一战期间，几个法国军官沦为德军战俘，在一次次越狱中，雷诺阿让我们看到：真正的界线不在国与国之间，而在阶级与阶级之间。贵族出身的法国上尉与德国典狱长惺惺相惜，跨越敌意；平民战俘则彼此扶持，跨越出身。影片几乎没有一个正面的战斗场面，却把战争的荒谬与人性的高贵拍得动人至深。德国军官放走两名越狱者、望着他们消失在中立国雪原的一幕，是对“敌人”这个概念最温柔的消解。“大幻影”既指人们以为这是最后一场战争的天真，也指所有终将被战争碾碎的美好。这是一部伟大的反战宣言。",
    directorSlugs: ["jean-renoir"],
  },

  // ── Vittorio De Sica ──────────────────────────────────────────────
  {
    slug: "bicycle-thieves",
    titleZh: "偷自行车的人",
    titleZhHk: "單車竊賊",
    titleZhTw: "單車失竊記",
    titleOriginal: "Ladri di biciclette",
    titleEn: "Bicycle Thieves",
    year: 1948,
    countries: ["意大利"],
    runtimeMinutes: 89,
    aspectRatio: "1.37:1",
    editorialNote:
      "战后罗马，一个失业已久的男人好不容易找到贴海报的工作，赖以谋生的自行车却在第一天被偷。他带着年幼的儿子走遍全城寻找，最终在绝望中自己也伸手去偷，当场被擒，尊严碎在儿子眼前。德西卡用非职业演员、真实街道与几近纪录的镜头，把新现实主义推向顶峰。没有反派，没有奇迹，只有贫穷如何一点点逼一个老实人走投无路。结尾父子俩手牵手消失在人群中，父亲流泪，儿子紧握他的手——那份沉默的原谅，比任何台词都更沉重。它是电影同情心的标尺，也是对普通人尊严最深的凝视。",
    cast: [{ name: "Lamberto Maggiorani", zhName: "兰贝托·马乔拉尼", character: "Antonio Ricci" }],
    directorSlugs: ["vittorio-de-sica"],
  },

  // ── Billy Wilder ──────────────────────────────────────────────────
  {
    slug: "sunset-boulevard",
    titleZh: "日落大道",
    titleZhHk: "紅樓金粉",
    titleZhTw: "日落大道",
    titleOriginal: "Sunset Blvd.",
    titleEn: "Sunset Boulevard",
    year: 1950,
    countries: ["美国"],
    runtimeMinutes: 110,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个潦倒的编剧误入过气默片女星的豪宅，成了她重返银幕幻梦里的囚徒与情人，故事由他漂在泳池里的尸体倒叙讲起。怀尔德让好莱坞亲手解剖自己，写下了一封写给电影工业的黑色情书。葛洛丽亚·斯旺森饰演的诺玛，活在昔日光环里不肯醒来，那句“是电影变小了”的台词，道尽了被时代抛弃者的偏执与悲凉。片尾她踩着幻觉走下楼梯、对着新闻镜头念出“我准备好拍特写了”的一幕，疯狂与凄美交织，成为影史绝唱。它犬儒、尖刻，却对所有被名利吞噬的失败者怀着深深的怜悯。黑色电影里最华丽的一曲挽歌。",
    cast: [
      { name: "Gloria Swanson", zhName: "葛洛丽亚·斯旺森", character: "Norma Desmond" },
      { name: "William Holden", zhName: "威廉·霍尔登", character: "Joe Gillis" },
    ],
    directorSlugs: ["billy-wilder"],
  },
  {
    slug: "some-like-it-hot",
    titleZh: "热情如火",
    titleZhHk: "熱情如火",
    titleZhTw: "熱情如火",
    titleOriginal: "Some Like It Hot",
    titleEn: "Some Like It Hot",
    year: 1959,
    countries: ["美国"],
    runtimeMinutes: 121,
    aspectRatio: "1.66:1",
    editorialNote:
      "两个撞见黑帮火并的落魄乐手，为躲追杀乔装成女人混进全女子乐队，一路笑料百出，还各自卷进啼笑皆非的恋情。怀尔德把变装、错认与追逐的喜剧机器开到最欢，节奏行云流水，笑点却始终锋利精准。玛丽莲·梦露演活了天真又落寞的歌女，为影片添了几分甜与愁。最妙的是那个被公认影史最佳的收尾台词——当男人坦白自己是男人，痴情的富翁只耸耸肩：“人无完人。”一句话把所有身份的执念轻轻化解，宽容得叫人拍案。它证明最上乘的喜剧，底子里往往藏着最豁达的人生态度。历久弥新的欢乐经典。",
    cast: [
      { name: "Marilyn Monroe", zhName: "玛丽莲·梦露", character: "Sugar Kane" },
      { name: "Jack Lemmon", zhName: "杰克·莱蒙", character: "Jerry / Daphne" },
    ],
    directorSlugs: ["billy-wilder"],
  },
  {
    slug: "double-indemnity",
    titleZh: "双重赔偿",
    titleZhHk: "雙重賠償",
    titleZhTw: "雙重保險",
    titleOriginal: "Double Indemnity",
    titleEn: "Double Indemnity",
    year: 1944,
    countries: ["美国"],
    runtimeMinutes: 107,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个精明的保险推销员被蛇蝎美人勾引，合谋杀死她的丈夫骗取双倍理赔，却在完美犯罪的裂缝里一步步走向自毁。怀尔德与钱德勒联手写就的剧本，字字锋利如刀，把宿命的黑色气质浇筑得密不透风。百叶窗切割出的条状阴影、烟雾缭绕的独白、一步步收紧的调查，几乎定义了什么叫“黑色电影”。斯坦威克脚踝上的脚链、麦克默里绝望的忏悔录音，成了这一类型的图腾。最动人的反而是主人公与理赔调查员之间那份别扭的情谊——罪案之外，仍有人惦记着你。作为黑色电影的奠基之作，它的冷峻与精巧至今难以超越。",
    directorSlugs: ["billy-wilder"],
  },

  // ── Fritz Lang ────────────────────────────────────────────────────
  {
    slug: "metropolis",
    titleZh: "大都会",
    titleZhHk: "大都會",
    titleZhTw: "大都會",
    titleOriginal: "Metropolis",
    titleEn: "Metropolis",
    year: 1927,
    countries: ["德国"],
    runtimeMinutes: 153,
    aspectRatio: "1.33:1",
    editorialNote:
      "在一座未来都市里，享乐的精英高居云端，成千上万的工人却在地底像齿轮般被驱使，直到一位圣女般的少女与一个机器人点燃了阶级的火药桶。弗里茨·朗以惊人的想象力，建起了电影史上第一座反乌托邦的钢铁之城——摩天楼、地下工厂、发疯的机械人玛丽亚，几乎奠定了此后所有科幻片的视觉母题。表现主义的光影与浩大的群众场面，至今仍震撼人心。“头脑与双手之间，必须有心作中介。”影片这句略显天真的调解，包裹着对工业文明最早的忧惧。作为默片时代最宏伟的奇观之一，它的每一帧都在为未来造梦。",
    directorSlugs: ["fritz-lang"],
  },
  {
    slug: "m",
    titleZh: "M就是凶手",
    titleZhHk: "M",
    titleZhTw: "M",
    titleOriginal: "M",
    titleEn: "M",
    year: 1931,
    countries: ["德国"],
    runtimeMinutes: 117,
    aspectRatio: "1.19:1",
    editorialNote:
      "一座城市被连环杀害儿童的凶手笼罩在恐惧中，警察与黑帮竟同时展开搜捕，最终由地下世界把凶手押上私刑的审判台。弗里茨·朗的第一部有声片，创造性地用声音编织罗网——凶手吹的那段《培尔·金特》口哨，成了暴露他的致命标记。彼得·洛饰演的杀人犯在片尾那段声嘶力竭的辩白，把一个恶魔还原成了被冲动奴役的病人，逼观众直面“该不该由暴民来定罪”的伦理深渊。倾斜的阴影、空荡的街道，把整座城市拍成了追捕的天罗地网。它既是黑色电影的源头，也是对私刑与集体狂热最早的警醒。声画合谋的开山杰作。",
    cast: [{ name: "Peter Lorre", zhName: "彼得·洛", character: "Hans Beckert" }],
    directorSlugs: ["fritz-lang"],
  },

  // ── Satyajit Ray ──────────────────────────────────────────────────
  {
    slug: "pather-panchali",
    titleZh: "大地之歌",
    titleZhHk: "小路之歌",
    titleZhTw: "大路之歌",
    titleOriginal: "পথের পাঁচালী",
    titleEn: "Pather Panchali",
    year: 1955,
    countries: ["印度"],
    runtimeMinutes: 125,
    aspectRatio: "1.37:1",
    editorialNote:
      "孟加拉乡村，一个贫苦家庭的男孩阿普与姐姐在饥饿、疾病与四季流转中长大，见证亲人的离去与生活的坚韧。雷伊的处女作，把印度乡村的贫困拍出了近乎透明的诗意。孩子们第一次穿过白茫茫的芦苇丛、看见远处火车轰鸣而过的一幕，是电影史上最纯净的惊奇之一。姐姐病逝、全家在雨季后黯然离乡的段落，哀而不伤，托起了生命本身的重量。西塔琴大师拉维·香卡的配乐如泣如诉，让苦难流淌成歌。作为《阿普三部曲》的开篇，它以最朴素的日常证明：第三世界的角落，也能盛放最普世的诗与尊严。世界电影因它而更辽阔。",
    directorSlugs: ["satyajit-ray"],
  },

  // ── F. W. Murnau ──────────────────────────────────────────────────
  {
    slug: "sunrise",
    titleZh: "日出",
    titleZhHk: "日出",
    titleZhTw: "日出",
    titleOriginal: "Sunrise: A Song of Two Humans",
    titleEn: "Sunrise",
    year: 1927,
    countries: ["美国"],
    runtimeMinutes: 94,
    aspectRatio: "1.20:1",
    editorialNote:
      "一个被城里女人蛊惑的农夫，起意淹死自己的妻子，却在下手的一刻幡然悔悟，两人由此在城市里重新坠入爱河，找回了几乎失去的婚姻。茂瑙赴美后的第一部作品，把德国表现主义的流动摄影与好莱坞的抒情熔于一炉，几乎不靠字幕就讲完了一个关于沉沦与救赎的寓言。沼泽夜行、城市游乐场、暴风雨中的失散与重逢，每一个段落都是纯粹的视觉诗。它拿下了第一届奥斯卡的“最佳独特艺术作品”奖——一个再未颁发的奖项，仿佛专为它而设。作为默片艺术的巅峰之一，它证明了电影可以完全用光影来歌唱。",
    directorSlugs: ["friedrich-wilhelm-murnau"],
  },
  {
    slug: "nosferatu",
    titleZh: "诺斯费拉图",
    titleZhHk: "不死殭屍",
    titleZhTw: "吸血鬼",
    titleOriginal: "Nosferatu",
    titleEn: "Nosferatu",
    year: 1922,
    countries: ["德国"],
    runtimeMinutes: 94,
    aspectRatio: "1.33:1",
    editorialNote:
      "茂瑙未经授权改编《德古拉》，塑造出电影史上第一个真正令人毛骨悚然的吸血鬼——秃头、尖耳、指爪修长的奥洛克伯爵。他不是风度翩翩的贵族，而是携瘟疫而来的死亡本身。影片大量实景拍摄，把喀尔巴阡山的荒凉与港口小城的阴郁拍出了梦魇般的质感。伯爵的影子缓缓爬上楼梯、扼住少女心脏的一幕，把恐惧凝成了纯粹的光学事件，至今仍被无数电影引用致敬。为躲避版权诉讼，本片一度被判销毁，幸有零星拷贝存世。作为德国表现主义与恐怖类型的开山之作，它那具佝偻的身影，早已成为死亡最古老的面孔。",
    directorSlugs: ["friedrich-wilhelm-murnau"],
  },

  // ── Charlie Chaplin ───────────────────────────────────────────────
  {
    slug: "city-lights",
    titleZh: "城市之光",
    titleZhHk: "城市之光",
    titleZhTw: "城市之光",
    titleOriginal: "City Lights",
    titleEn: "City Lights",
    year: 1931,
    countries: ["美国"],
    runtimeMinutes: 87,
    aspectRatio: "1.33:1",
    editorialNote:
      "有声时代已经到来，卓别林却固执地为流浪汉夏尔洛拍了一部近乎默片的杰作。他爱上一个卖花的盲女，为筹钱替她治眼，又是拳击又是讨好醉汉富翁，闹出无数笑料，最终自己进了监狱。喜剧的引擎一路轰鸣，却全为那个催泪的结尾蓄力：重见光明的姑娘认不出眼前这个落魄的恩人，直到握住他的手才恍然大悟。“是你吗？”——夏尔洛半是羞涩半是期盼的最后一个笑容，被公认为影史最动人的收场。笑与泪在这里合为一体，把小人物的深情托到了极致。卓别林用它证明：默片的表达力，从未过时。",
    cast: [{ name: "Charlie Chaplin", zhName: "查理·卓别林", character: "The Tramp" }],
    directorSlugs: ["charlie-chaplin"],
  },
  {
    slug: "modern-times",
    titleZh: "摩登时代",
    titleZhHk: "摩登時代",
    titleZhTw: "摩登時代",
    titleOriginal: "Modern Times",
    titleEn: "Modern Times",
    year: 1936,
    countries: ["美国"],
    runtimeMinutes: 87,
    aspectRatio: "1.37:1",
    editorialNote:
      "在流水线上拧螺丝拧到精神崩溃的夏尔洛，被卷进机器的齿轮、被当成测试喂食机的小白鼠，又阴差阳错卷入罢工与牢狱，只为在大萧条里挣一口饭吃。卓别林用最欢乐的肢体喜剧，包裹起对工业文明最尖锐的批判：人如何在机械与效率的碾压下沦为零件。喂食机失控、齿轮间穿行的段落，是对异化最生动的漫画。影片结尾，夏尔洛与流浪女孩相互搀扶，走向朝阳下未知的前路——纵然一无所有，也要笑着走下去。作为默片时代的谢幕之作，它把喜剧、抗议与温情熔于一炉，至今仍是小人物对抗时代的一面旗帜。",
    cast: [{ name: "Charlie Chaplin", zhName: "查理·卓别林", character: "A Factory Worker" }],
    directorSlugs: ["charlie-chaplin"],
  },

  // ── Sergei Eisenstein ─────────────────────────────────────────────
  {
    slug: "battleship-potemkin",
    titleZh: "战舰波将金号",
    titleZhHk: "波坦金戰艦",
    titleZhTw: "波坦金戰艦",
    titleOriginal: "Броненосец «Потёмкин»",
    titleEn: "Battleship Potemkin",
    year: 1925,
    countries: ["苏联"],
    runtimeMinutes: 75,
    aspectRatio: "1.33:1",
    editorialNote:
      "1905年，波将金号战舰上的水兵因不堪腐烂的伙食与欺压而起义，敖德萨市民群起响应，却遭沙皇军队血腥镇压。爱森斯坦以此为素材，把蒙太奇理论付诸最震撼的实践：镜头与镜头的碰撞，迸发出单个画面无法承载的情感与思想。著名的“敖德萨阶梯”段落，婴儿车沿石阶失控滚落、军靴齐步逼近，短短几分钟成为剪辑史上被引用最多的一课。它宣扬革命，却也超越了宣传，把集体的悲怆凝成了永恒的节奏。作为默片时代的巅峰之一，它重新定义了电影“如何思考”。近百年来，凡谈剪辑者，几乎无人能绕过这座阶梯。",
    directorSlugs: ["sergei-eisenstein"],
  },

  // ── Marcel Carné ──────────────────────────────────────────────────
  {
    slug: "children-of-paradise",
    titleZh: "天堂的孩子",
    titleZhHk: "天堂的孩子",
    titleZhTw: "天上人間",
    titleOriginal: "Les enfants du paradis",
    titleEn: "Children of Paradise",
    year: 1945,
    countries: ["法国"],
    runtimeMinutes: 190,
    aspectRatio: "1.37:1",
    editorialNote:
      "十九世纪巴黎的“犯罪大道”上，一个哑剧演员、一个花花公子、一个演员与一个贵族，同时爱上了神秘的女子加朗斯。卡尔内与诗人普莱维在纳粹占领下秘密拍就的这部鸿篇，把剧场、表演与得不到的爱交织成一幅法国电影最华美的画卷。哑剧大师巴洛用无声的身体道尽相思，比任何台词都更催人泪下。近三小时的篇幅里，舞台上下、真情与假意彼此渗透，最终有情人在狂欢的人潮中永远失散。它被许多法国人奉为民族电影的骄傲，是“诗意现实主义”的绝唱。在最黑暗的年代拍出如此绚烂的作品，本身就是一种不屈的宣言。",
    directorSlugs: ["marcel-carne"],
  },

  // ── Elia Kazan ────────────────────────────────────────────────────
  {
    slug: "on-the-waterfront",
    titleZh: "码头风云",
    titleZhHk: "岸上風雲",
    titleZhTw: "岸上風雲",
    titleOriginal: "On the Waterfront",
    titleEn: "On the Waterfront",
    year: 1954,
    countries: ["美国"],
    runtimeMinutes: 108,
    aspectRatio: "1.37:1",
    editorialNote:
      "一个当过拳击手、如今给码头黑帮跑腿的青年，在良心与义气之间挣扎，最终决定站出来指证盘剥工人的工会恶霸。卡赞调教出的马龙·白兰度，把方法派表演带上了新的高度——那段在出租车里对哥哥说出“我本可以是个人物，本可以是个真正的角色”的独白，成了美国电影史上最著名的时刻之一。粗粝的码头实景、赫尔曼式的配乐、赤裸的道德挣扎，让影片既是社会剧也是灵魂的救赎。有人从中读出卡赞为自己在麦卡锡时代作证的辩护，这层暧昧反而让它更加复杂动人。关于告密、勇气与自我救赎，它给出了灼热的回答。",
    cast: [{ name: "Marlon Brando", zhName: "马龙·白兰度", character: "Terry Malloy" }],
    directorSlugs: ["elia-kazan"],
  },
];
