import { doc, p } from "./tiptap";
import type { SeedDirector } from "./types";

/**
 * The directors behind the seeded canon. Every entry carries a plain-text
 * bio (enough on its own to publish) and, for the major figures, a
 * 创作历程 essay. Prose is original; no exhaustive filmographies — this is
 * a curatorial site, not a database.
 */
export const seedDirectors: SeedDirector[] = [
  {
    slug: "federico-fellini",
    name: "Federico Fellini",
    nameZh: "费德里科·费里尼",
    bio: "意大利导演，1920–1993。从新现实主义的街道出发，最终走进梦境与马戏团，把私人记忆拍成了公共的神话。",
    careerEssay: doc([
      p(
        "费里尼的前半生属于新现实主义。《大路》里还残留着战后意大利的尘土与饥饿，但那头流浪艺人赞巴诺的眼泪已经不只是社会问题，而是灵魂的问题。",
      ),
      p(
        "《八部半》是分水岭。从这里开始，他不再假装摄影机是客观的：回忆、欲望、白日梦挤进同一个画面，谁也不必让路。晚期的《阿玛柯德》与《船续前行》干脆把整个世界搭成布景，因为对费里尼来说，真实从来都是被记忆重新导演过的。",
      ),
    ]),
    bioEn:
      "Italian director, 1920–1993. He set out from the streets of neorealism and walked into dreams and circus rings, filming private memory until it became public myth.",
    careerEssayEn: doc([
      p(
        "The first half of Fellini's career belonged to neorealism. La strada still carries the dust and hunger of postwar Italy, but the strongman Zampano's tears are already less a social question than a question of the soul.",
      ),
      p(
        "8½ is the watershed. From there on he stopped pretending the camera was objective: memory, desire, and daydream crowd into the same frame, and none of them yields. In the late films — Amarcord, And the Ship Sails On — he simply built the whole world as a set, because for Fellini the real was always something memory had already re-directed.",
      ),
    ]),
  },
  {
    slug: "ingmar-bergman",
    name: "Ingmar Bergman",
    nameZh: "英格玛·伯格曼",
    // Pinned: TMDB person search surfaces an actor namesake first (no photo).
    tmdbPersonId: 6648,
    bio: "瑞典导演，1918–2007。牧师之子，一生向沉默的上帝提问，把信仰、死亡与婚姻的裂缝逼到人脸的特写里。",
    careerEssay: doc([
      p(
        "伯格曼的电影几乎都发生在两三个人之间，却承载着最大的问题：上帝是否存在，若不存在，人如何活下去。《第七封印》让骑士与死神下棋，把这问题摆成了寓言。",
      ),
      p(
        "到了《假面》，寓言被剥掉，只剩下两张女人的脸互相渗透、吞噬。此后他越来越不需要中世纪或象征，一间夏屋、一段婚姻就足以让沉默变得震耳欲聋。摄影师尼克维斯特的光，是他探照人脸的手术灯。",
      ),
    ]),
    bioEn:
      "Swedish director, 1918–2007. A pastor's son who spent his life interrogating a silent God, driving faith, death, and the fault lines of marriage into the close-up of a human face.",
    careerEssayEn: doc([
      p(
        "Almost every Bergman film unfolds among just two or three people, and yet each one shoulders the largest question there is: whether God exists, and if He does not, how a person is to go on living. The Seventh Seal sets a knight down to play chess with Death and casts that question as a parable.",
      ),
      p(
        "By Persona the parable has been stripped away, leaving only two women's faces seeping into and consuming one another. From there on he needed the Middle Ages and its symbols less and less; a summer house, a single marriage, was enough to make silence deafening. The light of his cinematographer Sven Nykvist was the surgical lamp he trained on the human face.",
      ),
    ]),
  },
  {
    slug: "akira-kurosawa",
    name: "Akira Kurosawa",
    nameZh: "黑泽明",
    bio: "日本导演，1910–1998。以西方的叙事力量重铸东方题材，让运动、天气与群像在银幕上迸发出雕塑般的力度。",
    careerEssay: doc([
      p(
        "黑泽明是最懂得让电影“动”起来的导演之一。《七武士》的雨中决战、《罗生门》穿过树林的移动镜头，都把摄影机变成了参与者而非旁观者。",
      ),
      p(
        "但他真正的主题是人如何在混乱与谎言中确认意义。《生之欲》里一个将死的公务员在雪夜的秋千上找到了答案；《罗生门》却告诉我们真相可能永远无法抵达。晚年他转向色彩与史诗，底色仍是同一份人道主义的焦虑。",
      ),
    ]),
    bioEn:
      "The Japanese director (1910–1998) who recast Eastern material with the narrative force of the West, making movement, weather, and the massed crowd erupt across the screen with a sculptor's weight.",
    careerEssayEn: doc([
      p(
        "Few directors have understood better than Kurosawa how to make a film move. The rain-lashed final battle of Seven Samurai, the camera threading through the forest in Rashomon — each of these turns the lens into a participant rather than a bystander.",
      ),
      p(
        "But his true subject is how a person holds on to meaning in the midst of chaos and lies. In Ikiru, a dying civil servant finds his answer on a playground swing in the falling snow; Rashomon, by contrast, tells us the truth itself may be forever out of reach. In his later years he turned toward color and epic scale, yet the ground note never changed — the same humanist disquiet, unresolved.",
      ),
    ]),
  },
  {
    slug: "yasujiro-ozu",
    name: "Yasujirō Ozu",
    nameZh: "小津安二郎",
    bio: "日本导演，1903–1963。用固定的低机位与四季的重复，拍尽了家庭的聚散，是电影史上最克制也最深情的目光。",
    careerEssay: doc([
      p(
        "小津几乎一辈子只拍一个故事：孩子长大，父母老去，家庭在婚嫁与死亡中悄悄解体。他把摄影机放在榻榻米的高度，几乎从不移动，让人物端坐着，向时间本身让步。",
      ),
      p(
        "这种极简是一种纪律。空镜头里的走廊、晾着的衣服、驶过的火车，承担了所有没有说出口的情绪。看懂小津，往往是在自己也开始送别至亲的年纪。",
      ),
    ]),
    bioEn:
      "Japanese director, 1903–1963. From a fixed low camera and the endless turning of the seasons he drew the whole quiet cycle of a family gathering and coming apart — the most restrained, and most tender, gaze in all of cinema.",
    careerEssayEn: doc([
      p(
        "Ozu spent almost his entire life telling a single story: children grow up, parents grow old, and the household quietly dissolves through marriage and death. He set the camera at the height of a tatami mat and hardly ever moved it, letting his people sit upright and give way to time itself.",
      ),
      p(
        "That minimalism is a discipline. The empty shots — a corridor, laundry hung out to dry, a train sliding past — carry every feeling no one manages to say aloud. And you tend to understand Ozu only once you have reached the age of seeing your own loved ones off.",
      ),
    ]),
  },
  {
    slug: "andrei-tarkovsky",
    name: "Andrei Tarkovsky",
    nameZh: "安德烈·塔可夫斯基",
    bio: "苏联导演，1932–1986。以缓慢、水、火与记忆构筑“雕刻时光”的电影，把胶片当作通向信仰与乡愁的祭坛。",
    careerEssay: doc([
      p(
        "塔可夫斯基把电影称作“雕刻时光”。他的长镜头不是炫技，而是要求观众放弃日常的时间感，进入一种近乎祈祷的凝视——雨水浸透废墟，火焰缓缓吞噬木屋。",
      ),
      p(
        "从《伊万的童年》到《安德烈·卢布廖夫》，他反复追问艺术家在暴力与怀疑中如何保持创造的信念。西方时期的《乡愁》与《牺牲》，把这份追问推向了殉道般的顶点。",
      ),
    ]),
    bioEn:
      'A Soviet director (1932–1986) who built his films out of slowness, water, fire, and memory — "sculpting in time," he called it — treating the strip of film as an altar that opens onto faith and longing.',
    careerEssayEn: doc([
      p(
        'Tarkovsky called cinema "sculpting in time." His long takes are never a display of virtuosity; they ask you to give up your everyday sense of time and settle into something close to prayer — rain soaking through ruins, fire creeping slowly through a wooden house.',
      ),
      p(
        "From Ivan's Childhood to Andrei Rublev, he returned again and again to a single question: how the artist keeps faith in the act of creation amid violence and doubt. Nostalghia and The Sacrifice, the films of his final years working in the West, carry that question to a martyr's pitch.",
      ),
    ]),
  },
  {
    slug: "robert-bresson",
    name: "Robert Bresson",
    nameZh: "罗贝尔·布列松",
    bio: "法国导演，1901–1999。反对“表演”，只用非职业“模特”、手与声音，锤炼出电影史上最纯粹、最严苛的风格。",
    careerEssay: doc([
      p(
        "布列松厌恶戏剧腔。他让非职业演员反复重复动作直到掏空一切表情，只留下手、脚、目光与物件的运动。他称他们为“模特”而非演员。",
      ),
      p(
        "这种“去戏剧化”反而释放出惊人的精神强度。《扒手》里手指的芭蕾、《驴子巴特萨》里一头驴承受的人间罪恶，都指向他毕生的主题：恩典如何在最卑微处降临。他的极简主义影响了此后所有相信“少即是多”的导演。",
      ),
    ]),
    bioEn:
      'French director, 1901–1999. He rejected acting itself, working only with non-professional "models," with hands and with sound, to forge the purest and most exacting style in all of cinema.',
    careerEssayEn: doc([
      p(
        'Bresson despised theatricality. He would have his non-professional actors repeat a gesture over and over until every last trace of expression had drained away, leaving only the movement of hands, feet, glances, and objects. He refused to call them actors at all; they were his "models."',
      ),
      p(
        "That very stripping-away of drama is what unleashes his astonishing spiritual intensity. The ballet of fingers in Pickpocket, the sins of the world laid upon the back of a single donkey in Au Hasard Balthazar — everything points to the theme he pursued all his life: how grace descends upon the lowliest of places. His minimalism left its mark on every director since who has believed that less is more.",
      ),
    ]),
  },
  {
    slug: "michelangelo-antonioni",
    name: "Michelangelo Antonioni",
    nameZh: "米开朗基罗·安东尼奥尼",
    bio: "意大利导演，1912–2007。用建筑般的构图与漫长的留白，记录现代人之间无法弥合的疏离与情感的荒漠。",
    careerEssay: doc([
      p(
        "安东尼奥尼拍的是“情感的建筑学”。在《奇遇》中一个女人失踪了，电影却拒绝寻找答案，转而凝视留下的人如何在空旷的岛屿与城市里彼此失联。",
      ),
      p(
        "他把人物压缩到画面边缘，让墙壁、街道与工业风景占据中心，因为在他看来，现代人的孤独正是被这些空间塑造的。“爱情三部曲”之后的《红色沙漠》让色彩也染上了神经质，疏离由此有了颜色。",
      ),
    ]),
    bioEn:
      "Italian director, 1912–2007. With architectural compositions and long, unhurried stretches of emptiness, he chronicled the unbridgeable estrangement between modern people and the emotional deserts they wander.",
    careerEssayEn: doc([
      p(
        "What Antonioni filmed was an architecture of feeling. In L'Avventura a woman vanishes, and yet the film refuses to go looking for an answer; it turns instead to watch the people she left behind lose each other across empty islands and emptier cities.",
      ),
      p(
        "He presses his figures to the edges of the frame and lets walls, streets, and industrial landscapes hold the center, convinced that modern loneliness is something these spaces build in us. After the trilogy of love, Red Desert let color itself turn neurotic, and estrangement, at last, had a hue.",
      ),
    ]),
  },
  {
    slug: "jean-luc-godard",
    name: "Jean-Luc Godard",
    nameZh: "让-吕克·戈达尔",
    bio: "法国导演，1930–2022。新浪潮最激进的破坏者与重建者，一生都在拆解电影语言，逼它重新学会说话。",
    careerEssay: doc([
      p(
        "戈达尔的《精疲力尽》用跳接砸碎了古典剪辑的连贯性，宣告电影可以像思想一样任性地跳跃。此后他把引文、字幕、直视镜头统统请进画面，让虚构随时提醒你它是虚构。",
      ),
      p(
        "六十年代末他愈发政治化，几乎放弃了叙事。但即便在最艰涩的时期，他也始终在追问同一件事：图像与声音能否承载真理？他不是在拍电影，而是在用电影思考电影。",
      ),
    ]),
    bioEn:
      "French director, 1930–2022. The New Wave's most radical wrecker and rebuilder, he spent a lifetime taking cinema's language apart and forcing it to learn to speak all over again.",
    careerEssayEn: doc([
      p(
        "With Breathless, Godard took the jump cut and shattered the seamless continuity of classical editing, announcing that a film could leap as freely and as willfully as a thought. From then on he ushered quotations, title cards, and looks straight down the lens into the frame, so that the fiction was forever reminding you it was a fiction.",
      ),
      p(
        "By the late sixties he had turned ever more political and all but abandoned storytelling. Yet even at his most forbidding he kept circling the same question: can images and sounds hold truth? He was never simply making films — he was using film to think about film.",
      ),
    ]),
  },
  {
    slug: "francois-truffaut",
    name: "François Truffaut",
    nameZh: "弗朗索瓦·特吕弗",
    bio: "法国导演，1932–1984。从影评人到新浪潮旗手，用最温柔的目光拍下童年、书籍与对电影本身的痴迷。",
    careerEssay: doc([
      p(
        "特吕弗曾是《电影手册》最尖刻的笔，提出“作者论”，把导演推上了作品署名者的位置。转身拍片，他却是新浪潮里最抒情、最念旧的一个。",
      ),
      p(
        "《四百击》里那个奔向大海的少年安托万，几乎是他自己的化身，并在此后的系列里陪他一起长大。无论是《祖与占》还是《日以继夜》，他镜头里始终有一种对生活与虚构双重的、几近感激的爱。",
      ),
    ]),
    bioEn:
      "French director, 1932–1984. He came to filmmaking from criticism, a standard-bearer of the New Wave who turned the tenderest of gazes on childhood, on books, and on his own lifelong infatuation with cinema itself.",
    careerEssayEn: doc([
      p(
        "Truffaut was once the most caustic pen at Cahiers du Cinéma, the critic who championed the auteur theory and installed the director as the true author of a film. Yet the moment he stepped behind the camera himself, he turned out to be the most lyrical and nostalgic figure the New Wave ever produced.",
      ),
      p(
        "The boy Antoine racing toward the sea at the end of The 400 Blows is very nearly Truffaut's own double, a self who would go on growing up beside him across the films that followed. Whether in Jules and Jim or Day for Night, his camera carries a doubled, almost grateful love — for life and for fiction alike.",
      ),
    ]),
  },
  {
    slug: "alfred-hitchcock",
    name: "Alfred Hitchcock",
    nameZh: "阿尔弗雷德·希区柯克",
    bio: "英裔美国导演，1899–1980。“悬念大师”，把观众的恐惧与窥视欲变成一门可以精密计算的电影工程。",
    careerEssay: doc([
      p(
        "希区柯克区分“惊吓”与“悬念”：让观众比角色先知道桌下有炸弹，等待才成了折磨。他毕生都在操纵这份等待，把观众变成共谋。",
      ),
      p(
        "从英国时期到好莱坞，他把类型片提升为对窥视、罪疚与欲望的深层研究。《惊魂记》用一场淋浴谋杀改写了观众能被如何对待的底线，也证明了商业类型可以是最锋利的作者电影。",
      ),
    ]),
    bioEn:
      "British-American director, 1899–1980. The Master of Suspense, who turned the audience's fear and voyeurism into a precisely engineered machine of cinema.",
    careerEssayEn: doc([
      p(
        "Hitchcock drew the crucial line between surprise and suspense: let the audience know, before the characters do, that there is a bomb under the table, and the mere act of waiting becomes torment. His whole career was an exercise in manipulating that wait, until the viewer is no longer a spectator but an accomplice.",
      ),
      p(
        "From his British years to Hollywood, he raised the genre picture into a deep inquiry into voyeurism, guilt, and desire. Psycho, with a single shower murder, rewrote the limits of what an audience could be made to endure — and proved that a commercial genre could be the sharpest auteur cinema of all.",
      ),
    ]),
  },
  {
    slug: "orson-welles",
    name: "Orson Welles",
    nameZh: "奥逊·威尔斯",
    bio: "美国导演、演员，1915–1985。二十五岁便以《公民凯恩》重写电影语法，此后一生与好莱坞的资金与剪刀缠斗。",
    careerEssay: doc([
      p(
        "威尔斯带着舞台与广播的胆识闯入电影，《公民凯恩》的深焦摄影、天花板入镜与时间碎片，几乎一次性刷新了何为“电影感”。",
      ),
      p(
        "此后他的作品屡屡被制片厂剪坏、抽资，却仍在《历劫佳人》的长镜头开场、《审判》的迷宫布景里迸发天才。他是好莱坞供养又背叛的巨人，残缺的作品比许多人完整的一生更有分量。",
      ),
    ]),
    bioEn:
      "American director and actor, 1915–1985. At twenty-five he rewrote the grammar of cinema with Citizen Kane, and spent the rest of his life wrestling Hollywood for its money and against its scissors.",
    careerEssayEn: doc([
      p(
        "Welles came to film carrying the nerve of the stage and the radio studio, and Citizen Kane redrew the rules almost in a single stroke — its deep-focus photography, its ceilinged frames, its splintered chronology all but reinvented what it means for an image to feel cinematic.",
      ),
      p(
        "From then on his films were repeatedly recut and defunded by the studios, yet the genius broke through anyway: in the unbroken crane shot that opens Touch of Evil, in the labyrinthine sets of The Trial. He was the giant Hollywood both nourished and betrayed, and his mutilated, unfinished work still carries more weight than many artists' whole and intact lives.",
      ),
    ]),
  },
  {
    slug: "carl-theodor-dreyer",
    name: "Carl Theodor Dreyer",
    nameZh: "卡尔·西奥多·德莱叶",
    bio: "丹麦导演，1889–1968。以近乎宗教的严谨拍摄信仰、殉难与神迹，每一部都像用光雕刻的祭品。",
    careerEssay: doc([
      p(
        "德莱叶产量极少，却每一部都逼近电影的精神极限。《圣女贞德蒙难记》几乎全用特写，让一张受难的脸成为整部默片的战场。",
      ),
      p(
        "他相信影像可以承载超验之物。《词语》以一场平静得令人战栗的复活收尾，逼迫最理性的观众直面神迹的可能。他的白墙、缓移与静默，是对灵魂的一种耐心测量。",
      ),
    ]),
    bioEn:
      "A Danish director, 1889–1968, who filmed faith, martyrdom, and miracle with an almost religious rigor — every one of his films an offering carved out of light.",
    careerEssayEn: doc([
      p(
        "Dreyer made only a handful of films, yet each one pushes to the spiritual limit of what cinema can do. The Passion of Joan of Arc is built almost entirely from close-ups, until a single suffering face becomes the battlefield on which the whole silent film is fought.",
      ),
      p(
        "He believed an image could carry the transcendent. Ordet closes on a resurrection so quiet it makes you shudder, cornering even the most rational viewer into facing the possibility of a miracle. His white walls, his slow tracking shots, his silences are a patient way of taking the measure of the soul.",
      ),
    ]),
  },
  {
    slug: "kenji-mizoguchi",
    name: "Kenji Mizoguchi",
    nameZh: "沟口健二",
    bio: "日本导演，1898–1956。以流动的长镜头与对女性苦难的凝视，把封建社会的残酷拍成了凄美的卷轴。",
    careerEssay: doc([
      p(
        "沟口偏爱“一场一镜”，让摄影机像卷轴般缓缓横移，把人物置于命运的全景之中而不轻易切近。这份距离里藏着最深的悲悯。",
      ),
      p(
        "他一生反复拍摄被出卖、被牺牲的女性——《雨月物语》的幽灵妻子、《山椒大夫》里投水守护手足的安寿。美与残酷在他镜头里从不分离，苦难被拍得越是优雅，越是叫人心碎。",
      ),
    ]),
    bioEn:
      "The Japanese director Kenji Mizoguchi (1898–1956) turned the cruelty of feudal society into something like a mournful hand scroll, unrolling his flowing long takes with a gaze fixed steadily on the suffering of women.",
    careerEssayEn: doc([
      p(
        "Mizoguchi favored one scene, one shot: he let the camera glide sideways like an unrolling scroll, holding his figures within the full panorama of their fate rather than cutting in close. It is in that very distance that his deepest compassion hides.",
      ),
      p(
        "All his life he returned again and again to women who are betrayed and sacrificed — the ghost wife of Ugetsu, Anju in Sansho the Bailiff, who drowns herself to shield her brother. In his frames beauty and cruelty are never parted; the more gracefully he films their suffering, the more it breaks your heart.",
      ),
    ]),
  },
  {
    slug: "luis-bunuel",
    name: "Luis Buñuel",
    nameZh: "路易斯·布努埃尔",
    bio: "西班牙导演，1900–1983。超现实主义的老顽童，一生用冷静的幽默解剖宗教、欲望与资产阶级的虚伪。",
    careerEssay: doc([
      p(
        "布努埃尔从《一条安达鲁狗》割裂眼球的一刀起，就把梦、欲望与亵渎请上了银幕。他从不解释符号，只让它们像梦一样自明又不可解。",
      ),
      p(
        "流亡墨西哥时期，他用《被遗忘的人们》把超现实的锋利对准了贫民窟的残酷现实。晚年回到欧洲，《资产阶级的审慎魅力》则以微笑戳破体面世界的荒诞。反叛之下，是一颗始终清醒的道德之心。",
      ),
    ]),
    bioEn:
      "Spanish director, 1900–1983. The grand old imp of surrealism, who spent a lifetime dissecting religion, desire, and bourgeois hypocrisy with a cool, deadpan wit.",
    careerEssayEn: doc([
      p(
        "From the first stroke of the razor in Un Chien Andalou, splitting an eye open, Buñuel summoned dream, desire, and blasphemy onto the screen. He never explains his symbols; he simply lets them stand, the way a dream does — self-evident and impossible to decode.",
      ),
      p(
        "In exile in Mexico, Los Olvidados turned that surrealist edge on the brutal reality of the slums. Back in Europe in his later years, The Discreet Charm of the Bourgeoisie punctures the absurdity of the respectable world with nothing more than a smile. Beneath all the mischief beats a moral heart that never once loses its clarity.",
      ),
    ]),
  },
  {
    slug: "jean-renoir",
    name: "Jean Renoir",
    nameZh: "让·雷诺阿",
    bio: "法国导演，1894–1979。画家之子，以流动的场面调度与宽厚的人道主义，被誉为“电影的人性本身”。",
    careerEssay: doc([
      p(
        "雷诺阿的镜头总在呼吸、游走，让人物在纵深的空间里自由进出。他厌恶把人简单地分成好坏，《游戏规则》里每个人都可笑又可怜，包括他自己扮演的那一个。",
      ),
      p(
        "《大幻影》在战俘营里谈的却是阶级如何跨越国界，友谊如何跨越敌意。“每个人都有他的理由”，这句台词几乎是他全部电影的信条：理解先于审判。",
      ),
    ]),
    bioEn:
      "French director, 1894–1979. The son of the painter Auguste Renoir, he brought to the screen a camera that seems to flow and a humanism so wide-hearted that he has been called the very humanity of cinema.",
    careerEssayEn: doc([
      p(
        "Renoir's camera is always breathing, always drifting, letting his characters wander freely in and out of a deep, living space. He could not bear to sort people neatly into the good and the bad: in The Rules of the Game everyone is at once ridiculous and worthy of pity, including the man he plays himself.",
      ),
      p(
        "The Grand Illusion is set inside a prisoner-of-war camp, yet what it is really about is how class can reach across a national border and how friendship can outlast enmity. Everyone has their reasons, runs the line that is very nearly the creed of his entire body of work: to understand before you judge.",
      ),
    ]),
  },
  {
    slug: "vittorio-de-sica",
    name: "Vittorio De Sica",
    nameZh: "维托里奥·德西卡",
    bio: "意大利导演，1901–1974。新现实主义的良心，用非职业演员与真实街道，拍下战后小人物的尊严与心碎。",
    careerEssay: doc([
      p(
        "德西卡与编剧柴伐蒂尼一起，把摄影机搬到罗马的街头，用真实的失业者演出真实的绝望。《偷自行车的人》里一对父子在城市里徒劳寻找，几乎不需要情节就令人落泪。",
      ),
      p(
        "他的伟大在于从最朴素的事件里看见人的尊严如何被贫穷一点点碾碎。《温别尔托·D》对一位孤独老人的凝视，至今仍是电影同情心的标尺。",
      ),
    ]),
    bioEn:
      "Italian director, 1901–1974. The conscience of neorealism, who cast nonprofessional actors against the backdrop of real streets to record the dignity and heartbreak of ordinary people in the rubble of the postwar years.",
    careerEssayEn: doc([
      p(
        "Together with his screenwriter Cesare Zavattini, De Sica carried the camera out into the streets of Rome and let real unemployed men act out a despair they knew firsthand. In Bicycle Thieves, a father and son search the city in vain for a stolen bicycle, and the film needs almost no plot at all to bring you to tears.",
      ),
      p(
        "His greatness lies in seeing, within the plainest of events, exactly how poverty grinds a person's dignity down bit by bit. The unhurried gaze of Umberto D. upon one lonely old man remains, to this day, the measure by which we take the compassion of the movies.",
      ),
    ]),
  },
  {
    slug: "billy-wilder",
    name: "Billy Wilder",
    nameZh: "比利·怀尔德",
    bio: "奥地利裔美国导演，1906–2002。犬儒与温情兼备的剧本大师，在黑色电影与喜剧之间游刃有余。",
    careerEssay: doc([
      p(
        "怀尔德是好莱坞最锋利的笔。他能把谋杀写成《双重赔偿》里冷冽的宿命，也能把变装闹剧写成《热情如火》里那句“人无完人”的宽容收尾。",
      ),
      p(
        "《日落大道》让一具浮尸开口讲述好莱坞如何吞噬自己的明星，犬儒到极致，却又饱含对失败者的怜悯。在他手里，玩世不恭从来只是深情的伪装。",
      ),
    ]),
    bioEn:
      "Austrian-American director, 1906–2002. A screenwriter's screenwriter, cynical and tender in equal measure, equally at home in film noir and in comedy.",
    careerEssayEn: doc([
      p(
        "Wilder had the sharpest pen in Hollywood. He could carve murder into the icy fatalism of Double Indemnity and then send up a cross-dressing farce that lands on the most forgiving line in the movies, the shrug of Some Like It Hot: nobody's perfect.",
      ),
      p(
        "Sunset Boulevard hands the narration to a corpse floating face-down in a swimming pool, letting the dead man tell you how Hollywood swallows its own stars — cynicism taken to the limit, and yet aching with pity for the has-beens and the also-rans. In Wilder's hands, contempt for the world was only ever a disguise worn over tenderness.",
      ),
    ]),
  },
  {
    slug: "fritz-lang",
    name: "Fritz Lang",
    nameZh: "弗里茨·朗",
    bio: "奥地利裔导演，1890–1976。德国表现主义巨匠，从未来都市到杀人凶手，勾勒出命运与体制的冰冷几何。",
    careerEssay: doc([
      p(
        "朗的世界由几何与阴影构成。《大都会》把阶级压迫铸成宏伟的未来城，《M就是凶手》则让一座城市的光影本身成为追捕的天罗地网。",
      ),
      p(
        "他毕生着迷于个体如何被命运与体制这台巨大机器碾过。逃离纳粹德国后，他在好莱坞继续用黑色电影追问同样的问题，冷峻的宿命感始终是他的签名。",
      ),
    ]),
    bioEn:
      "Austrian-born director, 1890–1976. A titan of German Expressionism who, from the towering city of the future to the hunted child-killer, traced the cold geometry of fate and the machinery of the state.",
    careerEssayEn: doc([
      p(
        "Lang built his worlds out of geometry and shadow. In Metropolis he casts class oppression as a magnificent city of the future; in M he turns the light and dark of an entire city into the dragnet that slowly closes around a killer.",
      ),
      p(
        "All his life he was gripped by a single question: how the individual is ground beneath the vast machine of fate and the system. Fleeing Nazi Germany, he carried that question to Hollywood and went on asking it in film noir, and that austere sense of doom stayed his signature to the end.",
      ),
    ]),
  },
  {
    slug: "satyajit-ray",
    name: "Satyajit Ray",
    nameZh: "萨蒂亚吉特·雷伊",
    bio: "印度导演，1921–1992。以《阿普三部曲》把印度乡村的贫困与诗意带向世界，是亚洲人文电影的奠基者之一。",
    careerEssay: doc([
      p(
        "雷伊深受雷诺阿与意大利新现实主义影响，却把这份写实酿成了独属于孟加拉乡村的抒情。《大地之歌》里孩子第一次看见火车穿过芦苇丛的镜头，是电影史上最纯净的惊奇之一。",
      ),
      p(
        "《阿普三部曲》跟随一个男孩从乡村走向城市，把成长、离别与贫穷写成了缓缓流动的史诗。他证明了第三世界的日常也能拥有最普世的诗意与尊严。",
      ),
    ]),
    bioEn:
      "Indian director, 1921–1992. With the Apu Trilogy he carried the poverty and poetry of rural India out into the world, and stands among the founders of Asia's humanist cinema.",
    careerEssayEn: doc([
      p(
        "Ray absorbed Renoir and Italian neorealism and then distilled that plainspoken realism into a lyricism that could belong only to the villages of Bengal. In Pather Panchali, the moment a child first sees a train tearing through the reeds is one of the purest jolts of wonder in all of cinema.",
      ),
      p(
        "The Apu Trilogy follows a single boy from village to city, turning growing up, parting, and poverty into a slow, unhurried epic. Ray proved that ordinary life in the Third World could carry the most universal poetry and dignity of all.",
      ),
    ]),
  },
  {
    slug: "friedrich-wilhelm-murnau",
    name: "F. W. Murnau",
    nameZh: "弗里德里希·威廉·茂瑙",
    bio: "德国导演，1888–1931。默片时代的诗人，用流动的摄影机与光影，把恐惧与柔情都推向了纯视觉的极致。",
    careerEssay: doc([
      p(
        "茂瑙相信电影可以完全靠画面说话。《诺斯费拉图》让吸血鬼的阴影爬上楼梯，把恐惧变成纯粹的光学事件；《最卑贱的人》几乎不用字幕，只凭移动的摄影机就讲完了一个人的尊严崩塌。",
      ),
      p(
        "赴美后拍的《日出》把这份视觉诗学推向顶峰：城市与乡村、堕落与救赎，全在流动的镜头里交融。他英年早逝，却为默片留下了最接近纯电影的遗产。",
      ),
    ]),
    bioEn:
      "German director, 1888–1931. A poet of the silent era who, with a roving camera and pure light and shadow, pushed both terror and tenderness to the far edge of the purely visual.",
    careerEssayEn: doc([
      p(
        "Murnau believed a film could speak entirely through its images. In Nosferatu he sends the vampire's shadow climbing a staircase and turns dread into a purely optical event; in The Last Laugh he does away with intertitles almost completely and lets a moving camera alone tell the whole story of a man's dignity coming apart.",
      ),
      p(
        "Sunrise, made once he had crossed to America, carries that visual poetry to its summit: city and country, temptation and redemption, all dissolving into one another within the drift of the frame. He died young, but he left silent cinema its closest approach to pure film.",
      ),
    ]),
  },
  {
    slug: "charlie-chaplin",
    name: "Charlie Chaplin",
    nameZh: "查理·卓别林",
    bio: "英国导演、演员，1889–1977。“流浪汉”夏尔洛的创造者，用喜剧承载最深的悲悯与最尖锐的社会批判。",
    careerEssay: doc([
      p(
        "卓别林的“流浪汉”是电影史上最著名的形象：礼帽、手杖、外八字，永远被世界踢来踢去，却永远保有尊严。笑与泪在他这里从来是一体两面。",
      ),
      p(
        "有声时代来临，他固执地为默片辩护，《城市之光》与《摩登时代》几乎不靠台词就道尽了机器时代里小人物的心碎与倔强。喜剧于他不是逃避现实，而是直面现实最温柔也最有力的方式。",
      ),
    ]),
    bioEn:
      "British director and actor (1889–1977). The creator of the Tramp, who made comedy carry the deepest tenderness and the sharpest social criticism the screen had yet known.",
    careerEssayEn: doc([
      p(
        "Chaplin's Tramp is the most famous figure in all of cinema: the bowler hat, the cane, the splayed-out walk, a little man forever kicked around by the world and yet forever holding on to his dignity. With Chaplin, laughter and tears were never opposites but the same gesture seen from two sides.",
      ),
      p(
        "When sound arrived, he dug in his heels and kept faith with the silent image; City Lights and Modern Times say almost everything there is to say about the heartbreak and stubborn pride of the small man in the age of the machine, and they say it with hardly a word of dialogue. Comedy, for him, was never a way of escaping reality — it was the tenderest and most powerful way of looking it straight in the eye.",
      ),
    ]),
  },
  {
    slug: "sergei-eisenstein",
    name: "Sergei Eisenstein",
    nameZh: "谢尔盖·爱森斯坦",
    bio: "苏联导演、理论家，1898–1948。蒙太奇理论的奠基人，把剪辑变成撞击观众思想与情感的武器。",
    careerEssay: doc([
      p(
        "爱森斯坦认为电影的力量不在单个镜头，而在镜头的碰撞。两个画面相接会迸出第三重意义——这就是他的“蒙太奇”。",
      ),
      p(
        "《战舰波将金号》的敖德萨阶梯至今仍是剪辑教科书的第一课：婴儿车滚落台阶的几秒钟，把革命的悲剧凝成了永恒的节奏。他的理论深刻影响了此后整个世纪的电影语言。",
      ),
    ]),
    bioEn:
      "Soviet director and theorist, 1898–1948. The founding mind of montage, he turned editing into a weapon aimed straight at the viewer's thoughts and feelings.",
    careerEssayEn: doc([
      p(
        "For Eisenstein, the power of cinema lay not in any single shot but in the collision between shots. Set two images against each other and a third meaning leaps out of the cut, belonging to neither one — this was his montage.",
      ),
      p(
        "The Odessa Steps in Battleship Potemkin remain the first lesson in every editing textbook: in the few seconds it takes a baby carriage to tumble down the stairs, the tragedy of revolution is compressed into a rhythm that never lets go. His theory went on to shape the language of film for the entire century that followed.",
      ),
    ]),
  },
  {
    slug: "marcel-carne",
    name: "Marcel Carné",
    nameZh: "马塞尔·卡尔内",
    bio: "法国导演，1906–1996。“诗意现实主义”的代表，与编剧普莱维合作，在布景的街灯下拍出宿命的爱情。",
    careerEssay: doc([
      p(
        "卡尔内与诗人普莱维的合作，把三十年代法国的忧郁凝成了“诗意现实主义”：雾气、街灯、码头，命中注定要失败的爱情在人工搭建的街景里上演。",
      ),
      p(
        "在纳粹占领下拍摄的《天堂的孩子》是这一风格的绝唱——一部关于剧场、表演与不可得之爱的鸿篇，被许多法国人视为民族电影的骄傲。",
      ),
    ]),
    bioEn:
      "A French director (1906–1996) and the defining figure of poetic realism, who, working with the screenwriter Jacques Prévert, staged love as destiny beneath the streetlamps of the studio backlot.",
    careerEssayEn: doc([
      p(
        "Carné's partnership with the poet Jacques Prévert distilled the melancholy of 1930s France into what came to be called poetic realism: fog, streetlamps, the quays of the harbor, and a love doomed to fail, all of it playing out on streets built by hand for the camera. Nothing here is found; everything is composed — fate itself conjured whole on the backlot.",
      ),
      p(
        "Children of Paradise, shot under the Nazi occupation, is the swan song of that style — a sprawling work about the theater, about performance, and about a love that can never be possessed, which many in France have long claimed as the pride of their national cinema.",
      ),
    ]),
  },
  {
    slug: "elia-kazan",
    name: "Elia Kazan",
    nameZh: "伊利亚·卡赞",
    bio: "希腊裔美国导演，1909–2003。方法派表演的推手，把社会现实与内心冲突逼进演员滚烫的身体里。",
    careerEssay: doc([
      p(
        "卡赞出身舞台，是“方法派”的重要推手，他调教出的白兰度与詹姆斯·迪恩，把一种全新的、赤裸的表演带进了好莱坞。",
      ),
      p(
        "《码头风云》里白兰度那句“我本可以是个人物”，是这种表演的巅峰，也隐约映照着卡赞自己在麦卡锡时代作证的争议。他的电影始终在社会良知与个人软弱之间灼烧。",
      ),
    ]),
    bioEn:
      "Greek-American director, 1909–2003. A prime mover of Method acting, he drove social reality and inner conflict into the actor's hot, living body.",
    careerEssayEn: doc([
      p(
        "Kazan came up through the theater and became one of the Method's indispensable champions; the Brando and the James Dean he shaped carried a wholly new, nakedly exposed kind of acting into Hollywood.",
      ),
      p(
        "Brando's \"I coulda been a contender\" in On the Waterfront is the summit of that acting, and it quietly mirrors Kazan's own controversy over the names he gave in his McCarthy-era testimony. His films are forever smoldering in the gap between social conscience and personal weakness.",
      ),
    ]),
  },
];
