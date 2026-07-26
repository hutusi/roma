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
        "费里尼的前半生属于新现实主义。《大路》里还残留着战后意大利的尘土与饥饿，但那头流浪艺人赞巴诺的眼泪已经不只是社会问题，而是灵魂的问题。",
      ),
      p(
        "《八部半》是分水岭。从这里开始，他不再假装摄影机是客观的：回忆、欲望、白日梦挤进同一个画面，谁也不必让路。晚期的《阿玛柯德》与《船续前行》干脆把整个世界搭成布景，因为对费里尼来说，真实从来都是被记忆重新导演过的。",
      ),
    ]),
    bioEn:
      "Italian director, 1920–1993. His early films belong to neorealism; from the 1960s he built them instead around memory and dream. La strada, Nights of Cabiria and 8½ are among the best known, and he received the Academy Award for Best Foreign Language Film four times.",
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
    bio: "瑞典导演，1918–2007。牧师之子，作品多围绕信仰、死亡与婚姻，大量使用面部特写。长期与摄影师斯文·尼克维斯特合作，另有大量舞台剧导演工作。",
    careerEssay: doc([
      p(
        "伯格曼的电影几乎都发生在两三个人之间，却承载着最大的问题：上帝是否存在，若不存在，人如何活下去。《第七封印》让骑士与死神下棋，把这问题摆成了寓言。",
      ),
      p(
        "到了《假面》，寓言被剥掉，只剩下两张女人的脸互相渗透、吞噬。此后他越来越不需要中世纪或象征，一间夏屋、一段婚姻就足以让沉默变得震耳欲聋。摄影师尼克维斯特的光，是他探照人脸的手术灯。",
      ),
    ]),
    bioEn:
      "Swedish director, 1918–2007. The son of a pastor, he made films largely concerned with faith, death and marriage, relying heavily on the close-up. He worked with the cinematographer Sven Nykvist over many years and directed extensively for the stage.",
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
    bio: "日本导演，1910–1998。作品兼及时代剧与现代题材，惯用多机位同时拍摄与长焦镜头。《罗生门》1951 年获威尼斯电影节金狮奖，为日本电影首次在国际影展获此奖项。",
    careerEssay: doc([
      p(
        "黑泽明是最懂得让电影“动”起来的导演之一。《七武士》的雨中决战、《罗生门》穿过树林的移动镜头，都把摄影机变成了参与者而非旁观者。",
      ),
      p(
        "但他真正的主题是人如何在混乱与谎言中确认意义。《生之欲》里一个将死的公务员在雪夜的秋千上找到了答案；《罗生门》却告诉我们真相可能永远无法抵达。晚年他转向色彩与史诗，底色仍是同一份人道主义的焦虑。",
      ),
    ]),
    bioEn:
      "Japanese director, 1910–1998. He worked in both period and contemporary settings and habitually shot with several cameras at once and with long lenses. Rashomon received the Golden Lion at Venice in 1951, the first such award to a Japanese film.",
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
    bio: "日本导演，1903–1963。长期在松竹拍摄家庭题材，摄影机固定于接近榻榻米坐姿的低机位，极少移动，段落之间插入没有人物的空镜。生卒同为十二月十二日。",
    careerEssay: doc([
      p(
        "小津几乎一辈子只拍一个故事：孩子长大，父母老去，家庭在婚嫁与死亡中悄悄解体。他把摄影机放在榻榻米的高度，几乎从不移动，让人物端坐着，向时间本身让步。",
      ),
      p(
        "这种极简是一种纪律。空镜头里的走廊、晾着的衣服、驶过的火车，承担了所有没有说出口的情绪。看懂小津，往往是在自己也开始送别至亲的年纪。",
      ),
    ]),
    bioEn:
      "Japanese director, 1903–1963. He worked at Shochiku on domestic subjects, keeping the camera fixed low at about the height of a person seated on a tatami mat, moving it almost never, and placing shots of empty rooms between scenes. He was born and died on 12 December.",
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
    bio: "苏联导演，1932–1986。共完成七部长片，多以长镜头、水与火的影像及不作标示的时序为特征。1980 年代初离开苏联，此后在意大利与瑞典工作，著有《雕刻时光》。",
    careerEssay: doc([
      p(
        "塔可夫斯基把电影称作“雕刻时光”。他的长镜头不是炫技，而是要求观众放弃日常的时间感，进入一种近乎祈祷的凝视——雨水浸透废墟，火焰缓缓吞噬木屋。",
      ),
      p(
        "从《伊万的童年》到《安德烈·卢布廖夫》，他反复追问艺术家在暴力与怀疑中如何保持创造的信念。西方时期的《乡愁》与《牺牲》，把这份追问推向了殉道般的顶点。",
      ),
    ]),
    bioEn:
      "Soviet director, 1932–1986. He completed seven features, marked by long takes, imagery of water and fire, and chronology left unmarked. He left the Soviet Union in the early 1980s and worked afterwards in Italy and Sweden. His book on filmmaking is Sculpting in Time.",
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
    bio: "法国导演，1901–1999。主张不用职业演员，要求出演者平读台词、不作表演，称之为「模特」；多用手部与物件的近景，配乐极少。代表作《死囚越狱》《扒手》《驴子巴特萨》。",
    careerEssay: doc([
      p(
        "布列松厌恶戏剧腔。他让非职业演员反复重复动作直到掏空一切表情，只留下手、脚、目光与物件的运动。他称他们为“模特”而非演员。",
      ),
      p(
        "这种“去戏剧化”反而释放出惊人的精神强度。《扒手》里手指的芭蕾、《驴子巴特萨》里一头驴承受的人间罪恶，都指向他毕生的主题：恩典如何在最卑微处降临。他的极简主义影响了此后所有相信“少即是多”的导演。",
      ),
    ]),
    bioEn:
      "French director, 1901–1999. He declined to use professional actors, directing those he cast to speak flatly and without performing and calling them models; he relied on close shots of hands and objects and used little music. A Man Escaped, Pickpocket and Au Hasard Balthazar are among the best known.",
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
    bio: "意大利导演，1912–2007。作品多以现代城市与工业景观为背景，情节淡化，人物常置于构图边缘。1960 年代初的《奇遇》《夜》《蚀》通常合称一组。",
    careerEssay: doc([
      p(
        "安东尼奥尼拍的是“情感的建筑学”。在《奇遇》中一个女人失踪了，电影却拒绝寻找答案，转而凝视留下的人如何在空旷的岛屿与城市里彼此失联。",
      ),
      p(
        "他把人物压缩到画面边缘，让墙壁、街道与工业风景占据中心，因为在他看来，现代人的孤独正是被这些空间塑造的。“爱情三部曲”之后的《红色沙漠》让色彩也染上了神经质，疏离由此有了颜色。",
      ),
    ]),
    bioEn:
      "Italian director, 1912–2007. His films are set largely in modern cities and industrial landscapes, with plot reduced and figures often placed at the edge of the frame. L'Avventura, La Notte and L'Eclisse, made in the early 1960s, are usually grouped together.",
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
    bio: "法国导演，1930–2022。原为《电影手册》影评人，1960 年以《精疲力尽》转入导演，此后长期试验剪辑、声画关系与叙事形式，晚年多拍论文式影片。",
    careerEssay: doc([
      p(
        "戈达尔的《精疲力尽》用跳接砸碎了古典剪辑的连贯性，宣告电影可以像思想一样任性地跳跃。此后他把引文、字幕、直视镜头统统请进画面，让虚构随时提醒你它是虚构。",
      ),
      p(
        "六十年代末他愈发政治化，几乎放弃了叙事。但即便在最艰涩的时期，他也始终在追问同一件事：图像与声音能否承载真理？他不是在拍电影，而是在用电影思考电影。",
      ),
    ]),
    bioEn:
      "French director, 1930–2022. He wrote criticism for Cahiers du Cinéma before directing Breathless in 1960, and spent the decades that followed experimenting with editing, with the relation of sound to image, and with narrative form, turning later to essay films.",
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
    bio: "法国导演，1932–1984。原为《电影手册》影评人，1959 年以《四百击》获戛纳电影节最佳导演奖。此后围绕安托万·杜瓦内尔一角拍摄五部作品，均由让-皮埃尔·利奥主演。",
    careerEssay: doc([
      p(
        "特吕弗曾是《电影手册》最尖刻的笔，提出“作者论”，把导演推上了作品署名者的位置。转身拍片，他却是新浪潮里最抒情、最念旧的一个。",
      ),
      p(
        "《四百击》里那个奔向大海的少年安托万，几乎是他自己的化身，并在此后的系列里陪他一起长大。无论是《祖与占》还是《日以继夜》，他镜头里始终有一种对生活与虚构双重的、几近感激的爱。",
      ),
    ]),
    bioEn:
      "French director, 1932–1984. He wrote for Cahiers du Cinéma before directing The 400 Blows, which brought him the director's prize at Cannes in 1959. He went on to make five films following the character Antoine Doinel, played throughout by Jean-Pierre Léaud.",
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
    bio: "英裔美国导演，1899–1980。自英国默片时期从业，1939 年赴好莱坞，共导演长片逾五十部。作品多为惊悚题材，惯以观众已知而角色未知的信息差构造悬念。",
    careerEssay: doc([
      p(
        "希区柯克区分“惊吓”与“悬念”：让观众比角色先知道桌下有炸弹，等待才成了折磨。他毕生都在操纵这份等待，把观众变成共谋。",
      ),
      p(
        "从英国时期到好莱坞，他把类型片提升为对窥视、罪疚与欲望的深层研究。《惊魂记》用一场淋浴谋杀改写了观众能被如何对待的底线，也证明了商业类型可以是最锋利的作者电影。",
      ),
    ]),
    bioEn:
      "British-American director, 1899–1980. He began in British silent films, moved to Hollywood in 1939, and directed more than fifty features. He worked chiefly in the thriller, and built suspense by giving the audience information the characters do not have.",
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
    bio: "美国导演、演员，1915–1985。二十五岁完成第一部影片《公民凯恩》。此后多部作品遭制片方重剪或未能完成，晚年主要在欧洲自行筹资拍片。",
    careerEssay: doc([
      p(
        "威尔斯带着舞台与广播的胆识闯入电影，《公民凯恩》的深焦摄影、天花板入镜与时间碎片，几乎一次性刷新了何为“电影感”。",
      ),
      p(
        "此后他的作品屡屡被制片厂剪坏、抽资，却仍在《历劫佳人》的长镜头开场、《审判》的迷宫布景里迸发天才。他是好莱坞供养又背叛的巨人，残缺的作品比许多人完整的一生更有分量。",
      ),
    ]),
    bioEn:
      "American director and actor, 1915–1985. He completed his first film, Citizen Kane, at twenty-five. Several of those that followed were recut by their studios or left unfinished, and he spent his later years raising money independently in Europe.",
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
    bio: "丹麦导演，1889–1968。一生完成长片十四部，题材多涉信仰与审判，惯用缓慢横移的长镜头与素净布景。代表作《圣女贞德蒙难记》《词语》。",
    careerEssay: doc([
      p(
        "德莱叶产量极少，却每一部都逼近电影的精神极限。《圣女贞德蒙难记》几乎全用特写，让一张受难的脸成为整部默片的战场。",
      ),
      p(
        "他相信影像可以承载超验之物。《词语》以一场平静得令人战栗的复活收尾，逼迫最理性的观众直面神迹的可能。他的白墙、缓移与静默，是对灵魂的一种耐心测量。",
      ),
    ]),
    bioEn:
      "Danish director, 1889–1968. He completed fourteen features, most of them concerned with faith and judgment, and worked in slow lateral takes and spare settings. The Passion of Joan of Arc and Ordet are among the best known.",
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
    bio: "日本导演，1898–1956。作品多以女性的处境为中心，惯用长镜头与远景，避免以近景拍摄苦难场面。1950 年代连续三年在威尼斯电影节获奖。",
    careerEssay: doc([
      p(
        "沟口偏爱“一场一镜”，让摄影机像卷轴般缓缓横移，把人物置于命运的全景之中而不轻易切近。这份距离里藏着最深的悲悯。",
      ),
      p(
        "他一生反复拍摄被出卖、被牺牲的女性——《雨月物语》的幽灵妻子、《山椒大夫》里投水守护手足的安寿。美与残酷在他镜头里从不分离，苦难被拍得越是优雅，越是叫人心碎。",
      ),
    ]),
    bioEn:
      "Japanese director, 1898–1956. His films centre largely on the circumstances of women, and he worked in long takes and distant framings, keeping scenes of suffering out of close-up. He took prizes at Venice in three consecutive years during the 1950s.",
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
    bio: "西班牙导演，1900–1983。1929 年与萨尔瓦多·达利合作《一条安达鲁狗》，此后长期流亡，在墨西哥拍片近二十年，晚年回到法国工作。作品常涉宗教与资产阶级题材。",
    careerEssay: doc([
      p(
        "布努埃尔从《一条安达鲁狗》割裂眼球的一刀起，就把梦、欲望与亵渎请上了银幕。他从不解释符号，只让它们像梦一样自明又不可解。",
      ),
      p(
        "流亡墨西哥时期，他用《被遗忘的人们》把超现实的锋利对准了贫民窟的残酷现实。晚年回到欧洲，《资产阶级的审慎魅力》则以微笑戳破体面世界的荒诞。反叛之下，是一颗始终清醒的道德之心。",
      ),
    ]),
    bioEn:
      "Spanish director, 1900–1983. He made Un Chien Andalou with Salvador Dalí in 1929, then spent years in exile, working for close to two decades in Mexico before returning to France late in his career. Religion and the bourgeoisie recur throughout his work.",
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
    bio: "法国导演，1894–1979。画家奥古斯特·雷诺阿之子，作品多用景深调度与连续的摄影机运动。1930 年代拍摄《大幻影》与《游戏规则》，二战期间赴美工作。",
    careerEssay: doc([
      p(
        "雷诺阿的镜头总在呼吸、游走，让人物在纵深的空间里自由进出。他厌恶把人简单地分成好坏，《游戏规则》里每个人都可笑又可怜，包括他自己扮演的那一个。",
      ),
      p(
        "《大幻影》在战俘营里谈的却是阶级如何跨越国界，友谊如何跨越敌意。“每个人都有他的理由”，这句台词几乎是他全部电影的信条：理解先于审判。",
      ),
    ]),
    bioEn:
      "French director, 1894–1979. The son of the painter Auguste Renoir, he worked in depth staging and continuous camera movement. He made Grand Illusion and The Rules of the Game in the 1930s and moved to the United States during the war.",
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
    bio: "意大利导演、演员，1901–1974。先以演员成名，1940 年代起转向导演，与编剧柴伐蒂尼长期合作，多用非职业演员实景拍摄。四部作品获奥斯卡外语片相关奖项。",
    careerEssay: doc([
      p(
        "德西卡与编剧柴伐蒂尼一起，把摄影机搬到罗马的街头，用真实的失业者演出真实的绝望。《偷自行车的人》里一对父子在城市里徒劳寻找，几乎不需要情节就令人落泪。",
      ),
      p(
        "他的伟大在于从最朴素的事件里看见人的尊严如何被贫穷一点点碾碎。《温别尔托·D》对一位孤独老人的凝视，至今仍是电影同情心的标尺。",
      ),
    ]),
    bioEn:
      "Italian director and actor, 1901–1974. He was known first as an actor and turned to directing in the 1940s, working over many years with the screenwriter Cesare Zavattini and casting non-professionals on location. Four of his films were honoured by the Academy in its foreign-language categories.",
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
    bio: "奥地利裔美国导演、编剧，1906–2002。1930 年代因纳粹上台离开欧洲赴美，先以编剧起家，后自编自导。作品兼及黑色电影与喜剧，多与查尔斯·布拉克特、I·A·L·戴蒙德合作编剧。",
    careerEssay: doc([
      p(
        "怀尔德是好莱坞最锋利的笔。他能把谋杀写成《双重赔偿》里冷冽的宿命，也能把变装闹剧写成《热情如火》里那句“人无完人”的宽容收尾。",
      ),
      p(
        "《日落大道》让一具浮尸开口讲述好莱坞如何吞噬自己的明星，犬儒到极致，却又饱含对失败者的怜悯。在他手里，玩世不恭从来只是深情的伪装。",
      ),
    ]),
    bioEn:
      "Austrian-American director and screenwriter, 1906–2002. He left Europe for the United States in the 1930s after the Nazis came to power, worked first as a screenwriter, and later directed his own scripts. He made both films noir and comedies, writing chiefly with Charles Brackett and later I. A. L. Diamond.",
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
    bio: "奥地利裔导演，1890–1976。先在德国拍摄《大都会》《M就是凶手》等片，1933 年离开德国，此后在法国短暂停留并转赴好莱坞，在美国工作逾二十年，多拍犯罪与黑色电影。",
    careerEssay: doc([
      p(
        "朗的世界由几何与阴影构成。《大都会》把阶级压迫铸成宏伟的未来城，《M就是凶手》则让一座城市的光影本身成为追捕的天罗地网。",
      ),
      p(
        "他毕生着迷于个体如何被命运与体制这台巨大机器碾过。逃离纳粹德国后，他在好莱坞继续用黑色电影追问同样的问题，冷峻的宿命感始终是他的签名。",
      ),
    ]),
    bioEn:
      "Austrian-born director, 1890–1976. He made Metropolis and M in Germany, left the country in 1933, and after a brief period in France worked in Hollywood for more than twenty years, largely on crime pictures and films noir.",
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
    bio: "印度导演，1921–1992。原从事广告设计，1955 年以《大地之歌》转入电影，此后完成《阿普三部曲》。共导演约三十部影片，多以孟加拉语拍摄，并自任编剧与作曲。",
    careerEssay: doc([
      p(
        "雷伊深受雷诺阿与意大利新现实主义影响，却把这份写实酿成了独属于孟加拉乡村的抒情。《大地之歌》里孩子第一次看见火车穿过芦苇丛的镜头，是电影史上最纯净的惊奇之一。",
      ),
      p(
        "《阿普三部曲》跟随一个男孩从乡村走向城市，把成长、离别与贫穷写成了缓缓流动的史诗。他证明了第三世界的日常也能拥有最普世的诗意与尊严。",
      ),
    ]),
    bioEn:
      "Indian director, 1921–1992. He worked in advertising design before making Pather Panchali in 1955, which he followed with the rest of the Apu Trilogy. He directed some thirty films, most of them in Bengali, and wrote and scored much of his own work.",
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
    bio: "德国导演，1888–1931。默片时期作品包括《诺斯费拉图》《最卑贱的人》，1926 年赴美，为福斯拍摄《日出》。1931 年在加州死于车祸，时年四十二岁。",
    careerEssay: doc([
      p(
        "茂瑙相信电影可以完全靠画面说话。《诺斯费拉图》让吸血鬼的阴影爬上楼梯，把恐惧变成纯粹的光学事件；《最卑贱的人》几乎不用字幕，只凭移动的摄影机就讲完了一个人的尊严崩塌。",
      ),
      p(
        "赴美后拍的《日出》把这份视觉诗学推向顶峰：城市与乡村、堕落与救赎，全在流动的镜头里交融。他英年早逝，却为默片留下了最接近纯电影的遗产。",
      ),
    ]),
    bioEn:
      "German director, 1888–1931. His silent work includes Nosferatu and The Last Laugh. He moved to the United States in 1926 and made Sunrise for Fox. He died in a car accident in California in 1931, aged forty-two.",
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
    bio: "英国导演、演员，1889–1977。以流浪汉一角成名，自编自导自演并为多部影片配乐，1919 年参与创办联美公司。1952 年赴英期间被美国吊销再入境许可，此后长居瑞士。",
    careerEssay: doc([
      p(
        "卓别林的“流浪汉”是电影史上最著名的形象：礼帽、手杖、外八字，永远被世界踢来踢去，却永远保有尊严。笑与泪在他这里从来是一体两面。",
      ),
      p(
        "有声时代来临，他固执地为默片辩护，《城市之光》与《摩登时代》几乎不靠台词就道尽了机器时代里小人物的心碎与倔强。喜剧于他不是逃避现实，而是直面现实最温柔也最有力的方式。",
      ),
    ]),
    bioEn:
      "British director and actor, 1889–1977. He became known for the character of the Tramp, and wrote, directed, starred in and scored much of his own work. He was among the founders of United Artists in 1919. His re-entry permit to the United States was revoked while he was travelling to Britain in 1952, and he settled in Switzerland.",
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
    bio: "苏联导演、电影理论家，1898–1948。以《战舰波将金号》等片实践其关于镜头对列的剪辑主张，另著有多种理论文字。1930 年代在墨西哥的拍摄计划未能完成，后期作品受官方审查影响。",
    careerEssay: doc([
      p(
        "爱森斯坦认为电影的力量不在单个镜头，而在镜头的碰撞。两个画面相接会迸出第三重意义——这就是他的“蒙太奇”。",
      ),
      p(
        "《战舰波将金号》的敖德萨阶梯至今仍是剪辑教科书的第一课：婴儿车滚落台阶的几秒钟，把革命的悲剧凝成了永恒的节奏。他的理论深刻影响了此后整个世纪的电影语言。",
      ),
    ]),
    bioEn:
      "Soviet director and film theorist, 1898–1948. He put his arguments about the collision of shots into practice in Battleship Potemkin and other films, and wrote extensively on theory. A project shot in Mexico in the 1930s was never completed, and his later work was subject to official interference.",
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
    bio: "法国导演，1906–1996。1930 至 40 年代与编剧雅克·普莱维长期合作，作品多在摄影棚内搭景拍摄。《天堂的孩子》摄于德占期间，1945 年公映。",
    careerEssay: doc([
      p(
        "卡尔内与诗人普莱维的合作，把三十年代法国的忧郁凝成了“诗意现实主义”：雾气、街灯、码头，命中注定要失败的爱情在人工搭建的街景里上演。",
      ),
      p(
        "在纳粹占领下拍摄的《天堂的孩子》是这一风格的绝唱——一部关于剧场、表演与不可得之爱的鸿篇，被许多法国人视为民族电影的骄傲。",
      ),
    ]),
    bioEn:
      "French director, 1906–1996. He worked closely with the screenwriter Jacques Prévert through the 1930s and 1940s, shooting largely on constructed studio sets. Children of Paradise was made under the German occupation and released in 1945.",
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
    bio: "希腊裔美国导演，1909–2003。为演员工作室的创办人之一，在舞台与电影两方面工作。1952 年在众议院非美活动调查委员会作证并供出他人姓名，此事此后长期引发争议。",
    careerEssay: doc([
      p(
        "卡赞出身舞台，是“方法派”的重要推手，他调教出的白兰度与詹姆斯·迪恩，把一种全新的、赤裸的表演带进了好莱坞。",
      ),
      p(
        "《码头风云》里白兰度那句“我本可以是个人物”，是这种表演的巅峰，也隐约映照着卡赞自己在麦卡锡时代作证的争议。他的电影始终在社会良知与个人软弱之间灼烧。",
      ),
    ]),
    bioEn:
      "Greek-American director, 1909–2003. He was among the founders of the Actors Studio and worked in both theatre and film. In 1952 he testified before the House Un-American Activities Committee and named others, which remained a matter of controversy for the rest of his life.",
    careerEssayEn: doc([
      p(
        "Kazan came up through the theater and became one of the Method's indispensable champions; the Brando and the James Dean he shaped carried a wholly new, nakedly exposed kind of acting into Hollywood.",
      ),
      p(
        "Brando's \"I coulda been a contender\" in On the Waterfront is the summit of that acting, and it quietly mirrors Kazan's own controversy over the names he gave in his McCarthy-era testimony. His films are forever smoldering in the gap between social conscience and personal weakness.",
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
        "费穆是三十年代上海影坛最不像同代人的那一个。同行忙着把电影当武器，他却在《城市之夜》《香雪海》里琢磨光线与静默；沦陷期间拍《孔夫子》，用一个不合时宜的圣人说不能明说的话。1948 年他与梅兰芳合作《生死恨》，拍出了中国第一部彩色影片。",
      ),
      p(
        "《小城之春》是他唯一一次把全部本领用在一件小事上：五个人，一座破园子，一段没有发生的私奔。上映时正值天翻地覆，批评者嫌它耽于个人情绪，影片随即被封存数十年。八十年代重新出土后，它几乎在每一次华语影史评选中位居榜首。费穆 1951 年病逝于香港，四十五岁，只留下这一部完成度极高的杰作。",
      ),
    ]),
    bioEn:
      "Chinese director, 1906–1951. He worked in Shanghai through the 1930s, on films including Night in the City and Confucius. In 1948 he made Remorse at Death with Mei Lanfang, the first Chinese colour film, and completed Spring in a Small Town the same year. He died in Hong Kong in 1951, aged forty-five.",
    careerEssayEn: doc([
      p(
        "Fei Mu was the least typical figure in 1930s Shanghai cinema. While his contemporaries were busy treating film as a weapon, he was studying light and silence in Night in the City and Sea of Fragrant Snow; under the occupation he made Confucius, using an unfashionable sage to say what could not be said outright. In 1948, working with the opera master Mei Lanfang, he shot Remorse at Death — the first Chinese film in color.",
      ),
      p(
        "Spring in a Small Town is the one time he spent everything he knew on something small: five people, a ruined garden, an elopement that never happens. It opened as the country was turning upside down, critics found it self-absorbed, and it was shelved for decades. Unearthed in the 1980s, it has since topped nearly every poll of Chinese-language cinema ever conducted. Fei Mu died in Hong Kong in 1951 at forty-five, leaving this one fully realized masterpiece behind.",
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
        "吴永刚做过美工，对画面的洁癖贯穿一生。《神女》是他的第一部片子，也是默片时代中国电影的最高点之一——他拒绝把主人公拍成道德案例，镜头始终与她平视，连那个流氓也只是环境的一部分，而不是可供唾骂的反派。",
      ),
      p(
        "此后的《浪淘沙》走得更远，两个人困在荒岛上互相铐着，几乎是中国电影里少见的存在主义寓言。战后与新中国的数十年里他历经批判与沉默，直到 1980 年与吴贻弓合导《巴山夜雨》，才重新被看见。",
      ),
    ]),
    bioEn:
      "Chinese director, 1907–1982. He worked first in art departments, and at twenty-seven wrote and directed his first film, The Goddess, with Ruan Lingyu. He went on to work in Shanghai and Beijing over several decades, directing more than twenty films.",
    careerEssayEn: doc([
      p(
        "Wu Yonggang trained as a set designer, and a fastidiousness about the image never left him. The Goddess was his debut and remains one of the summits of Chinese silent cinema — he refused to turn his heroine into a moral case study, kept the camera level with her throughout, and let even the thug who exploits her register as part of the environment rather than a villain to be hissed at.",
      ),
      p(
        "Waves Wash the Sand, two years later, went further still: two men shackled to each other on a desert island, an existential parable of a kind Chinese cinema rarely attempted. The decades that followed brought criticism and long silences, and it was not until 1980, co-directing Evening Rain with Wu Yigong, that he was properly seen again.",
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
    bio: "香港导演，1958 年生。没有剧本，只有钟表：他的电影反复丈量错过的几分钟，把都市里的擦肩而过拍成了唯一的史诗。",
    careerEssay: doc([
      p(
        "王家卫从编剧起家，成名后却几乎不写完整剧本，靠现场与演员一起长出电影。《阿飞正传》里“一分钟的朋友”和无脚鸟，已经定下他一生的主题：时间、错过、无法着陆。",
      ),
      p(
        "与摄影师杜可风、美术张叔平的合作，把这份情绪变成了可见的东西——《重庆森林》的抽帧与霓虹，《春光乍泄》的布宜诺斯艾利斯，《花样年华》里张曼玉每一件不重样的旗袍。到《2046》，他索性把记忆本身写成了一列开不回去的火车。",
      ),
    ]),
    bioEn:
      "Hong Kong director, born 1958. No screenplay, only clocks: his films keep measuring the few minutes by which people miss each other, turning a brush past a stranger into the only epic worth having.",
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
    bio: "华语导演，1932–1997。把京剧的锣鼓点变成剪辑的节奏，让武侠从打斗升格为一种关于气韵与空的电影。",
    careerEssay: doc([
      p(
        "胡金铨生于北平，做过演员与美术，对明代掌故、京剧与佛理都下过功夫。《大醉侠》《龙门客栈》先后确立了他的招牌：客栈里的对峙、一触即发的静默，以及从戏曲借来的锣鼓节奏。",
      ),
      p(
        "《侠女》则把他推到了另一个层面。竹林一战至今是所有武侠动作的源头之一，而影片后半段忽然转入禅意，血战让位给了顿悟。1975 年它在戛纳拿下技术大奖，是华语电影首次在那里获得肯定。",
      ),
    ]),
    bioEn:
      "Chinese-language director, 1932–1997. He turned the drum-and-gong beat of Peking opera into a rhythm of cutting, lifting wuxia out of fighting and into a cinema of breath and emptiness.",
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
    bio: "意大利导演，1906–1977。新现实主义的开山者：战争还没结束就扛着摄影机上街，用剩胶片拍下了一座城市的真实体温。",
    careerEssay: doc([
      p(
        "《罗马，不设防的城市》几乎是在废墟里抢拍出来的——胶片是零星凑来的，街道是真的街道，群众演员刚刚经历过片中的事。它一举确立了新现实主义：不要摄影棚，不要明星，不要圆满。",
      ),
      p(
        "但罗西里尼很快离开了自己开创的运动。与英格丽·褒曼合作的《意大利之旅》几乎没有情节，只有一对夫妻在异乡的沉默里逐渐看清彼此——这部片子后来被新浪潮奉为现代电影的起点。",
      ),
    ]),
    bioEn:
      "Italian director, 1906–1977. The founder of neorealism, who took a camera into the street before the war had even finished and shot a city's real body temperature on scavenged stock.",
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
    bio: "日本导演，1916–1996。战时拒绝晋升、被派往满洲的士兵，一生的电影都在做同一件事：让个人站出来，指着制度说不。",
    careerEssay: doc([
      p(
        "小林正树本人当过兵，且刻意拒绝升迁以示抗议，这份经历烧进了他所有作品。长达九小时的《人间的条件》几乎是他的自传，一个善良的人如何被战争一层层剥掉，直到只剩下不肯低头这一件事。",
      ),
      p(
        "《切腹》把同样的怒火装进了时代剧的外壳：一个浪人走进大名的庭院，用一个故事把整套武士道的体面拆得粉碎。到了《怪谈》他转向色彩与鬼故事，画面华丽如屏风，底下依旧是那份对权力的不信任。",
      ),
    ]),
    bioEn:
      "Japanese director, 1916–1996. A conscript who refused promotion in protest and was sent to Manchuria, he spent his career doing one thing: putting an individual on his feet to say no to a system.",
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
    bio: "日本导演，1905–1969。小津与沟口之外的第三条路：拍女人如何在没有出口的日常里继续走下去，不给救赎，也不给控诉。",
    careerEssay: doc([
      p(
        "成濑一生拍了八十多部片子，主角几乎都是女人——酒吧女招待、寡妇、被丈夫拖累的妻子。他不像沟口那样把她们写成受难者，也不像小津那样让她们体面地退场，而是让她们在账本、房租和一次次算计里熬下去。",
      ),
      p(
        "《浮云》是这条路的终点。一对在战时殖民地相爱的男女回到破败的东京，感情早已耗尽，却谁也走不开。有人说成濑的电影像水，看起来平静，底下的流速会把人卷走。",
      ),
    ]),
    bioEn:
      "Japanese director, 1905–1969. The third path beside Ozu and Mizoguchi: films about how women keep walking through a daily life with no exit, offered neither redemption nor indictment.",
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
    bio: "法国导演、演员，1907–1982。用身体、声音与建筑做喜剧，几乎不用台词；他镜头里的现代世界光洁、便利，而且完全不适合人类居住。",
    careerEssay: doc([
      p(
        "塔蒂出身默剧，于洛先生这个角色——高个子、雨衣、烟斗、永远迈错一步——是他对现代生活的固定测量仪。《于洛先生的假期》里，他让海滨旅馆的每一个声音都成为笑点，而不是靠一句台词。",
      ),
      p(
        "《游戏时间》则近乎疯狂：他花光身家搭出一座钢铁玻璃的“塔蒂城”，用 70mm 宽银幕拍摄，画面里同时发生七八件事，观众得自己去找笑点。影片票房惨败，令他破产，却在今天被视作电影史上最精密的喜剧建筑。",
      ),
    ]),
    bioEn:
      "French director and actor, 1907–1982. He built comedy out of bodies, sound, and architecture with almost no dialogue; the modern world in his films is sleek, convenient, and entirely unfit for humans to live in.",
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
    bio: "美国导演，1928–1999。摄影记者出身，把每一种类型都拍了一遍，又把每一种都拍成了别的东西：冷、对称、精确到偏执，却始终在问人究竟是不是野兽。",
    careerEssay: doc([
      p(
        "库布里克的每部片子几乎都换一个类型——战争、黑色喜剧、科幻、恐怖、古装——但方法从不变：对称构图、缓慢推进的镜头、把人放在巨大结构的正中央，然后看着他缩小。",
      ),
      p(
        "《2001 太空漫游》是他最极端的一次实验，用近乎无声的十分钟开场与一段没有解释的结尾，逼观众自己完成意义。此后的《发条橙》《闪灵》都在同一个问题上打转：文明这层壳到底有多薄。",
      ),
    ]),
    bioEn:
      "American director, 1928–1999. A former photojournalist who worked through every genre and turned each one into something else: cold, symmetrical, precise to the point of obsession, and always asking whether the human animal is an animal.",
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
    bio: "英国导演，1905–1990。与普雷斯伯格合组“射箭者”，在一个崇尚写实的国度里坚持拍浓烈的色彩、歌剧式的激情与近乎危险的美。",
    careerEssay: doc([
      p(
        "鲍威尔与普雷斯伯格以“射箭者”的名义联合署名，编剧与导演共享一个头衔，这在电影史上几乎绝无仅有。在崇尚纪录式冷静的英国影坛，他们偏要拍浓得化不开的特艺七彩情节剧——《黑水仙》《平步青云》《红菱艳》。",
      ),
      p(
        "鲍威尔的事业毁于《偷窥狂》：一个用摄影机杀人的故事，1960 年被批为下流，今天却成了关于「观看即暴力」的奠基文本。多年后是斯科塞斯等人把他从遗忘里请了回来。",
      ),
    ]),
    bioEn:
      "British director, 1905–1990. With Pressburger he formed The Archers and, in a country that prized realism, insisted on saturated color, operatic passion, and a beauty verging on dangerous.",
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
    bio: "匈牙利裔英国编剧、导演，1902–1988。从纳粹德国逃出的流亡者，为英国电影写出了最不英国的故事：狂热、异色、执着于牺牲。",
    bioEn:
      "Hungarian-born British writer and director, 1902–1988. An exile who fled Nazi Germany and then wrote the least English stories in English cinema: feverish, exotic, and fixated on sacrifice.",
  },
  {
    slug: "david-lean",
    name: "David Lean",
    nameZh: "大卫·里恩",
    tmdbPersonId: 12238,
    bio: "英国导演，1908–1991。剪辑师出身，先拍出英国最细腻的室内片，再转身把沙漠、铁路与雪原拍成了后世衡量史诗的尺子。",
    careerEssay: doc([
      p(
        "很多人只记得后期的里恩，但他真正的功底在早年：《相见恨晚》全片发生在一个车站茶室，两个中年人克制的告别，是英国电影最精确的一次情感手术。",
      ),
      p(
        "《桂河大桥》之后他转向大银幕。《阿拉伯的劳伦斯》几乎重新定义了「史诗」——沙漠不是背景而是角色，而那位英雄越走越大，人却越来越碎。剪辑师的出身让他知道：真正的宏大来自节奏，而不是尺寸。",
      ),
    ]),
    bioEn:
      "British director, 1908–1991. An editor by training who first made the most delicate interiors in British cinema, then turned around and made deserts, railways, and snowfields into the standard by which epics are measured.",
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
    bio: "美国导演，1939 年生。新好莱坞最敢赌的人：把黑帮片拍成家族悲剧，又把战争片拍成一场几乎毁掉自己的溯河之旅。",
    careerEssay: doc([
      p(
        "七十年代属于科波拉。《教父》两部把类型片提升为美国资本与家族的史诗，《对话》则安静得像一部欧洲电影——同一个人在同一个十年里做到了这两件事。",
      ),
      p(
        "《现代启示录》几乎摧毁了他：菲律宾拍摄失控，台风毁掉布景，主演心脏病发，预算靠他抵押家产撑着。成片却因此带上了一种别的电影没有的疯狂——它不是关于越战的电影，它本身就是一次战争。",
      ),
    ]),
    bioEn:
      "American director, born 1939. The biggest gambler of the New Hollywood: he made a gangster picture into a family tragedy, then made a war picture into a journey upriver that nearly destroyed him.",
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
