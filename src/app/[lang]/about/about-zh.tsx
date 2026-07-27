/** The zh about prose. Long-form copy lives in per-locale components so
 * neither language's prose can leak into the other's page. */
export function AboutZh() {
  return (
    <div className="mt-10 space-y-6 text-[17px] leading-[1.9] tracking-[0.02em]">
      <p>
        「八部半」得名于费里尼一九六三年的《8½》——一部关于如何拍电影、
        也关于如何诚实面对自己的电影。我们借用这个名字，是想提醒自己：
        谈论电影，最终是在谈论如何生活。
      </p>
      <p>
        这里不是数据库。在别处可以查到一部影片的全部条目信息，
        但查不到它为什么值得在今天被观看。八部半只收录我们真正想推荐的电影—— 收录即立场。
      </p>
      <p>
        片单是这里的核心。一份片单有一个主题、一篇引言、
        每部影片的入选理由，以及经过斟酌的先后顺序——它应当像一篇文章那样被读完。
        我们爱经典电影，不仅是出于怀旧，也是对大师的致敬。
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
  );
}
