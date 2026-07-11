import type { Dictionary } from "./zh";

export const en = {
  nav: {
    lists: "Lists",
    films: "Films",
    about: "About",
  },
  footer: {
    tagline: "Babuban — a curatorial handbook for black-and-white cinema",
    aboutLink: "About",
  },
  authMenu: {
    signIn: "Sign in",
    myPage: "My page",
    follows: "Followed lists",
    account: "Account",
    editorial: "Editorial desk",
    signOut: "Sign out",
  },
  markButtons: {
    signInPrompt: "Sign in to mark films as watched or want-to-watch",
    watched: "Watched",
    want: "Want to see",
  },
  film: {
    directedBy: "Directed by ",
    nameSeparator: ", ",
    runtime: (minutes: number) => `${minutes} min`,
    blackAndWhite: "B&W",
    color: "Color",
    castAs: (character: string) => `as ${character}`,
    editorialNote: "Editorial Note",
    titles: "Titles",
    cast: "Cast",
    watch: "Where to Watch",
    relatedLists: "Curated Lists",
    titleLabels: {
      mainland: "Mainland China",
      hongkong: "Hong Kong",
      taiwan: "Taiwan",
      english: "English",
      original: "Original",
    },
    regions: {
      CN: "Mainland China",
      HK: "Hong Kong",
      TW: "Taiwan",
      INTL: "International",
    },
    watchDisclaimer:
      "Where-to-watch links are maintained by hand and may lapse as platforms change.",
  },
} satisfies Dictionary;
