import type { SeedTag } from "./types";

/**
 * The starter vocabulary — movements, genres and themes that already
 * have members in the seeded canon. A starting point for editors, not a
 * taxonomy commitment: /admin/tags can rename or retire any of it.
 * Black-and-white is deliberately absent — it is a film attribute
 * (`isBlackAndWhite`), never a tag (ADR 0014).
 *
 * Keep this current even though `seed-content.ts` seeds tags on the FIRST
 * RUN ONLY: `assertPublishable` hard-exits on a film `tagSlugs` entry with
 * no row here, so a tag that exists only in /admin breaks db:seed:content
 * on every fresh checkout. `tags.test.ts` guards that in CI.
 *
 * On a database whose vocabulary already exists, adding rows here changes
 * nothing by itself — the gate skips the whole block. Use
 * `bun run apply:tags` to reconcile additively (ADR 0014 amendment).
 */
export const seedTags: SeedTag[] = [
  { slug: "silent-cinema", nameZh: "默片", nameEn: "Silent Cinema" },
  { slug: "german-expressionism", nameZh: "德国表现主义", nameEn: "German Expressionism" },
  { slug: "neorealism", nameZh: "新现实主义", nameEn: "Neorealism" },
  { slug: "french-new-wave", nameZh: "法国新浪潮", nameEn: "French New Wave" },
  { slug: "film-noir", nameZh: "黑色电影", nameEn: "Film Noir" },
  { slug: "modernism", nameZh: "现代主义", nameEn: "Modernism" },
  { slug: "jidaigeki", nameZh: "时代剧", nameEn: "Jidaigeki" },
  { slug: "comedy", nameZh: "喜剧", nameEn: "Comedy" },
  { slug: "family-drama", nameZh: "家庭剧", nameEn: "Family Drama" },
  { slug: "faith-and-redemption", nameZh: "信仰与救赎", nameEn: "Faith and Redemption" },
  { slug: "surrealism", nameZh: "超现实主义", nameEn: "Surrealism" },
  { slug: "suspense", nameZh: "悬疑", nameEn: "Suspense" },
  { slug: "war", nameZh: "战争", nameEn: "War" },
  { slug: "romance", nameZh: "爱情", nameEn: "Romance" },
  { slug: "wuxia", nameZh: "武侠", nameEn: "Wuxia" },
  { slug: "taiwan-new-cinema", nameZh: "台湾新电影", nameEn: "Taiwan New Cinema" },
  { slug: "science-fiction", nameZh: "科幻", nameEn: "Science Fiction" },
  { slug: "epic", nameZh: "史诗", nameEn: "Epic" },
  { slug: "musical", nameZh: "歌舞", nameEn: "Musical" },
];
