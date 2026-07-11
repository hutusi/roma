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
};

export type Dictionary = typeof zh;
