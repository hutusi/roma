import type { Metadata } from "next";
import { TitleCard } from "@/components/site/title-card";
import { languageAlternates } from "@/i18n/alternates";

export const metadata: Metadata = {
  title: "关于",
  description: "八部半是什么，以及它为什么存在。",
  alternates: { languages: languageAlternates("/about", { en: true }) },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-[70ch] animate-fade-up px-6 pt-16">
      <TitleCard eyebrow="About" title="关于八部半" />
      <div className="mt-10 space-y-6 text-[17px] leading-[1.9] tracking-[0.02em]">
        <p>
          「八部半」得名于费里尼一九六三年的《8½》——一部关于如何拍电影、
          也关于如何诚实面对自己的电影。我们借用这个名字，是想提醒自己：
          谈论电影，最终是在谈论如何生活。
        </p>
        <p>
          这里不是数据库。你在别处可以查到一部影片的全部条目信息，
          但查不到它为什么值得在今天被观看。八部半只收录我们真正想推荐的电影——
          收录即立场。每部影片配一段两百到五百字的编辑札记， 告诉你它好在哪里、该在什么时候看。
        </p>
        <p>
          片单是这里的核心。一份片单有一个主题、一篇引言、
          每部影片的入选理由，以及经过斟酌的先后顺序——它应当像一篇文章那样被读完。
          我们偏爱黑白片，不是出于怀旧，而是因为在没有颜色的地方， 光、影和构图必须说出全部的话。
        </p>
        <p>
          八部半由几位编辑维护，更新不快，但每一次更新都经过讨论。
          如果一部电影出现在这里，那是因为有人愿意为它署名担保。
        </p>
        <p className="border-line border-t pt-6 text-ink-muted text-sm">
          影片的海报、剧照与部分元数据来自
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 text-brand hover:underline"
          >
            TMDB
          </a>
          ，并在图片下方标注来源。本站使用 TMDB 的 API，但未经 TMDB
          认可或认证。观看渠道由编辑手工维护。
        </p>
      </div>
    </article>
  );
}
