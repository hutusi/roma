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
    slug: "into-black-and-white",
    title: "黑白影像入门",
    theme: "如果你想从黑白电影开始，先看这八部",
    sortOrder: 0,
    coverFilmSlug: "seven-samurai",
    intro: doc([
      p(
        "黑白不是“还没有彩色”，而是一种主动的选择——让光与影承担全部的叙事。这份片单挑出八部风格迥异的杰作，跨越默片到新浪潮、欧洲到亚洲，作为进入这座宝库的第一道门。不必按顺序看，但每一部都足以让你相信：少了颜色，电影反而看得更清楚。",
      ),
    ]),
    items: [
      {
        filmSlug: "bicycle-thieves",
        reasoning: doc([
          p(
            "从最朴素的一部开始。没有技巧的炫耀，只有一对父子和一辆丢失的自行车，却让你第一次明白电影可以如此贴近生活的疼痛。",
          ),
        ]),
      },
      {
        filmSlug: "tokyo-story",
        reasoning: doc([
          p(
            "学会在“什么都没发生”里看见一切。小津固定的低机位，教你把注意力从情节转向人与人之间那些欲言又止的沉默。",
          ),
        ]),
      },
      {
        filmSlug: "seven-samurai",
        reasoning: doc([
          p(
            "再感受黑白如何迸发力量。雨中的决战证明，没有色彩，动作、天气与群像反而更有雕塑般的重量。",
          ),
        ]),
      },
      {
        filmSlug: "the-seventh-seal",
        reasoning: doc([
          p(
            "当你准备好面对更大的问题——死亡与信仰。伯格曼把最沉重的追问，拍成了一则你会记住一辈子的画面。",
          ),
        ]),
      },
      {
        filmSlug: "citizen-kane",
        reasoning: doc([
          p(
            "看一次“电影语言”本身。深焦、闪回、碎片叙事，二十五岁的威尔斯几乎一次性重写了电影能做什么。",
          ),
        ]),
      },
      {
        filmSlug: "breathless",
        reasoning: doc([
          p(
            "然后看规则如何被打破。戈达尔的跳接砸碎了古典剪辑，让你意识到你熟悉的“顺畅”原来只是一种约定。",
          ),
        ]),
      },
      {
        filmSlug: "la-strada",
        reasoning: doc([
          p("回到情感的原点。费里尼与马西纳提醒你，再前卫的形式，最终都是为了盛放一颗会痛的心。"),
        ]),
      },
      {
        filmSlug: "the-passion-of-joan-of-arc",
        reasoning: doc([
          p(
            "最后，直视一张脸。近百年前的默片，用连绵的特写证明：一张受难的脸，就足以成为整个宇宙。",
          ),
        ]),
      },
    ],
  },
  {
    slug: "fellini-primer",
    title: "费里尼入门",
    theme: "从马戏团到罗马：一位导演如何长出翅膀",
    titleEn: "A Fellini Primer",
    themeEn: "From the circus to Rome: how a director grew wings",
    introEn: doc([
      p(
        "Fellini's films are one dream that keeps getting bigger. Watched in this order, they show him setting out from the streets of neorealism and flying, step by step, toward the circus-ring confession that belongs to him alone. Three are enough \u2014 after that you will want the rest on your own.",
      ),
    ]),
    sortOrder: 1,
    coverFilmSlug: "otto-e-mezzo",
    intro: doc([
      p(
        "费里尼的电影像一场越做越大的梦。按这个顺序看，你会看到他如何从新现实主义的街道出发，一步步飞向只属于他自己的马戏团式的自白。三部足矣，之后你会自己想看完全部。",
      ),
    ]),
    items: [
      {
        filmSlug: "la-strada",
        reasoning: doc([
          p(
            "从这里开始：费里尼尚未离开新现实主义，却已长出翅膀。一个傻姑娘与一个粗汉，是他日后所有梦境的种子。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Start here: Fellini has not yet left neorealism, but the wings are already growing. A simple girl and a brute \u2014 the seed of every dream he would film later.",
          ),
        ]),
      },
      {
        filmSlug: "le-notti-di-cabiria",
        reasoning: doc([
          p(
            "再看他如何在苦难里种下希望。卡比利亚破碎又倔强的微笑，是费里尼对人类韧性的第一次礼赞。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "Then watch him plant hope inside hardship. Cabiria's broken, stubborn smile is Fellini's first tribute to human resilience.",
          ),
        ]),
      },
      {
        filmSlug: "otto-e-mezzo",
        reasoning: doc([
          p(
            "终点也是顶点。当他终于敢把“拍不出电影”的困境本身拍成电影，梦境与现实再无边界，翅膀彻底张开。",
          ),
        ]),
        reasoningEn: doc([
          p(
            "The end point is also the summit. When he finally dared to film the impossibility of making a film, dream and reality lost their border \u2014 and the wings opened all the way.",
          ),
        ]),
      },
    ],
  },
  {
    slug: "italian-neorealism",
    title: "意大利新现实主义",
    theme: "把摄影机搬到街上，让真实自己发声",
    sortOrder: 2,
    coverFilmSlug: "bicycle-thieves",
    intro: doc([
      p(
        "二战废墟之上，一群意大利人扛起摄影机走上街头，用非职业演员与真实的贫困，拍下了普通人的挣扎与尊严。这场运动短暂却影响深远，几乎为战后世界电影重设了良心的坐标。",
      ),
    ]),
    items: [
      {
        filmSlug: "bicycle-thieves",
        reasoning: doc([
          p(
            "运动的旗帜。德西卡用一辆丢失的自行车，把“没有故事的故事”拍成了最催泪的杰作，也定义了什么叫新现实主义。",
          ),
        ]),
      },
      {
        filmSlug: "la-strada",
        reasoning: doc([
          p(
            "运动的转身。费里尼在写实的尘土里注入寓言与诗意，预告了新现实主义如何向更私人的方向生长。",
          ),
        ]),
      },
      {
        filmSlug: "le-notti-di-cabiria",
        reasoning: doc([
          p(
            "运动的余晖。街头妓女的一夜，既是社会底层的写照，也已迈向费里尼式的马戏团梦境——写实与幻想在此交棒。",
          ),
        ]),
      },
    ],
  },
  {
    slug: "french-new-wave",
    title: "法国新浪潮",
    theme: "一群影评人拿起摄影机，重新发明电影",
    sortOrder: 3,
    coverFilmSlug: "breathless",
    intro: doc([
      p(
        "五十年代末，一群《电影手册》的年轻影评人厌倦了“优质电影”的陈规，索性自己上阵，用手持摄影、实景与即兴，把电影从摄影棚里解放出来。他们不只拍电影，更在用电影争论电影该是什么样子。",
      ),
    ]),
    items: [
      {
        filmSlug: "the-400-blows",
        reasoning: doc([
          p(
            "从最温柔的一部进入。特吕弗把自己的童年拍成新浪潮的开山之作，那个奔向大海的少年，是整场运动的心跳。",
          ),
        ]),
      },
      {
        filmSlug: "breathless",
        reasoning: doc([
          p(
            "再感受最激进的一击。戈达尔用满不在乎的跳接，宣告电影可以像生活一样任性、鲜活、随时脱轨。",
          ),
        ]),
      },
      {
        filmSlug: "vivre-sa-vie",
        reasoning: doc([
          p(
            "最后走向它思辨的深处。戈达尔用十二个段落解剖一个女人的堕落，让你看清新浪潮如何把电影变成一种思考方式。",
          ),
        ]),
      },
    ],
  },
  {
    slug: "japanese-golden-age",
    title: "日本电影的黄金时代",
    theme: "五十年代，一个国度同时拥有黑泽明、小津与沟口",
    sortOrder: 4,
    coverFilmSlug: "tokyo-story",
    intro: doc([
      p(
        "上世纪五十年代的日本影坛群星璀璨：黑泽明的力度、小津的克制、沟口的凄美，同时抵达各自的巅峰。它们把东方的美学与最普世的人性熔于一炉，让世界第一次看清了日本电影的深度。",
      ),
    ]),
    items: [
      {
        filmSlug: "rashomon",
        reasoning: doc([
          p("从这里叩开世界之门。黑泽明用一桩各执一词的凶案，把日本电影第一次推上国际舞台。"),
        ]),
      },
      {
        filmSlug: "tokyo-story",
        reasoning: doc([
          p("再沉入最静默的深处。小津用一对老夫妻的东京之行，道尽了亲情随时间稀释的残忍。"),
        ]),
      },
      {
        filmSlug: "ugetsu",
        reasoning: doc([
          p("感受沟口如水墨般流动的镜头，如何把民间怪谈拍成关于欲望与代价的凄美卷轴。"),
        ]),
      },
      {
        filmSlug: "sansho-the-bailiff",
        reasoning: doc([
          p("在沟口的另一则古老传说里，称量仁慈能否在残酷世间存续——姐姐投水的涟漪，久久不散。"),
        ]),
      },
      {
        filmSlug: "seven-samurai",
        reasoning: doc([
          p("回到黑泽明最恢弘的战场。三个多小时的史诗，把勇气、阶级与徒劳一并托起。"),
        ]),
      },
      {
        filmSlug: "ikiru",
        reasoning: doc([
          p("以最温柔的一部收束。一个将死的公务员在雪夜的秋千上，找到了活过一场的意义。"),
        ]),
      },
    ],
  },
  {
    slug: "silent-cinemas-last-light",
    title: "默片的最后光芒",
    theme: "在声音到来之前，电影已学会用光影歌唱",
    sortOrder: 5,
    coverFilmSlug: "sunrise",
    intro: doc([
      p(
        "有声电影的到来，让默片在最成熟的一刻戛然而止。但正是这最后的十年，默片把纯视觉的表达推向了此后再难企及的高度。这六部作品证明：不靠一句台词，电影也能讲尽恐惧、革命、爱与救赎。",
      ),
    ]),
    items: [
      {
        filmSlug: "battleship-potemkin",
        reasoning: doc([
          p("先上一堂剪辑课。爱森斯坦的敖德萨阶梯，让你亲眼看见镜头的碰撞如何迸出思想。"),
        ]),
      },
      {
        filmSlug: "metropolis",
        reasoning: doc([
          p("再仰望默片最宏伟的奇观。弗里茨·朗的未来之城，奠定了此后一切科幻的视觉母题。"),
        ]),
      },
      {
        filmSlug: "nosferatu",
        reasoning: doc([
          p("走进它最幽暗的角落。茂瑙让吸血鬼的影子爬上楼梯，把恐惧凝成纯粹的光学事件。"),
        ]),
      },
      {
        filmSlug: "the-passion-of-joan-of-arc",
        reasoning: doc([p("直面它最纯粹的强度。德莱叶连绵的特写，用一张受难的脸撑起整部电影。")]),
      },
      {
        filmSlug: "sunrise",
        reasoning: doc([
          p("感受它抒情的顶峰。茂瑙赴美后用流动的镜头，几乎不靠字幕就唱完了一支沉沦与救赎之歌。"),
        ]),
      },
      {
        filmSlug: "city-lights",
        reasoning: doc([
          p("以一个微笑作别。有声时代已至，卓别林却固执地证明：默片的深情，从未过时。"),
        ]),
      },
    ],
  },
  {
    slug: "film-noir",
    title: "黑色电影",
    theme: "百叶窗的阴影里，宿命正在收紧",
    sortOrder: 6,
    coverFilmSlug: "sunset-boulevard",
    intro: doc([
      p(
        "蛇蝎美人、犬儒的旁白、被阴影切割的画面，还有一步步收紧的宿命——黑色电影把战后美国的焦虑与欲望，浇筑成一种冷冽而华丽的风格。这份片单从它的德国源头一路走到最华美的挽歌。",
      ),
    ]),
    items: [
      {
        filmSlug: "m",
        reasoning: doc([
          p("从源头开始。弗里茨·朗把倾斜的阴影与追捕的天罗地网带出德国，成了黑色电影的祖父。"),
        ]),
      },
      {
        filmSlug: "double-indemnity",
        reasoning: doc([
          p("看这一类型如何定型。怀尔德与钱德勒的剧本，几乎逐条写下了黑色电影的语法。"),
        ]),
      },
      {
        filmSlug: "touch-of-evil",
        reasoning: doc([
          p("再看它华丽的堕落。威尔斯把腐败与边境的泥沼，拍成了黑色电影最邪魅的一次调度。"),
        ]),
      },
      {
        filmSlug: "sunset-boulevard",
        reasoning: doc([
          p("以最凄美的挽歌收场。当好莱坞亲手解剖自己，宿命的阴影终于漫过了造梦的殿堂。"),
        ]),
      },
    ],
  },
];
