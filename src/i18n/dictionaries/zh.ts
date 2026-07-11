/**
 * Message catalog for SHARED components only (site chrome, cards). The
 * zh and en trees are separate route subtrees, so locale-specific pages
 * keep their prose inline; only components rendered by both locales
 * need keys here. `en.ts` must mirror this shape — key parity is
 * enforced by the type checker, not a runtime test.
 */
export const zh = {
  nav: {
    lists: "片单",
    films: "影片",
    about: "关于",
  },
  footer: {
    tagline: "八部半 —— 献给黑白电影的策展手册",
    aboutLink: "关于本站",
  },
  authMenu: {
    signIn: "登录",
    myPage: "我的主页",
    follows: "关注的片单",
    account: "账号设置",
    editorial: "编辑部",
    signOut: "退出登录",
  },
  markButtons: {
    signInPrompt: "登录后可标记「看过 / 想看」",
    watched: "看过",
    want: "想看",
  },
  followButton: {
    signInPrompt: "登录后可关注片单",
    follow: "关注片单",
    following: "已关注",
  },
  film: {
    directedBy: "导演：",
    nameSeparator: "、",
    runtime: (minutes: number) => `${minutes} 分钟`,
    blackAndWhite: "黑白",
    color: "彩色",
    castAs: (character: string) => `饰 ${character}`,
    editorialNote: "编辑札记",
    titles: "译名",
    cast: "主演",
    watch: "哪里能看",
    relatedLists: "相关片单",
    titleLabels: {
      mainland: "大陆",
      hongkong: "香港",
      taiwan: "台湾",
      english: "英文",
      original: "原名",
    },
    regions: {
      CN: "大陆",
      HK: "香港",
      TW: "台湾",
      INTL: "海外",
    },
    watchDisclaimer: "观看渠道由编辑手工维护，可能随平台下架而失效。",
  },
  director: {
    career: "创作历程",
    suggestedOrder: "建议观看顺序",
    films: "收录影片",
  },
};

export type Dictionary = typeof zh;
