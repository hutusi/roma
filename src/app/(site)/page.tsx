import Link from "next/link";
import { Grain } from "@/components/site/grain";
import { TitleCard } from "@/components/site/title-card";
import { AcademyFrame } from "@/components/site/academy-frame";

export default function HomePage() {
  return (
    <div className="animate-fade-up">
      {/* Hero — the only surface that carries grain */}
      <section className="relative overflow-hidden border-b border-line bg-paper">
        <Grain />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <p className="font-display text-sm uppercase tracking-[0.4em] text-ink-muted">
            Babuban · 8½
          </p>
          <h1 className="text-5xl font-bold tracking-[0.25em] sm:text-6xl">
            八部半
          </h1>
          <p className="max-w-[36ch] text-lg leading-[1.9] text-ink-muted">
            一份关于经典电影的策展手册。黑白影像、导演谱系，与值得按顺序看完的片单。
          </p>
          <Link
            href="/lists"
            className="mt-4 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
          >
            浏览片单
          </Link>
        </div>
      </section>

      {/* Featured lists — placeholder until editorial content lands */}
      <section className="mx-auto max-w-5xl px-6 pt-20">
        <TitleCard eyebrow="Curated Lists" title="精选片单" />
        <div className="mx-auto mt-10 max-w-2xl text-center text-ink-muted">
          <p className="leading-[1.9]">
            片单是八部半的核心：一个主题、一篇引言、每部影片的入选理由，
            以及经过斟酌的排列顺序。首批片单正在撰写中。
          </p>
        </div>
      </section>

      {/* Recent films — placeholder until editorial content lands */}
      <section className="mx-auto max-w-5xl px-6 pt-20">
        <TitleCard eyebrow="Recently Curated" title="近期收录" />
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-2">
          <AcademyFrame alt="虚位以待" caption="虚位以待" />
          <AcademyFrame alt="虚位以待" caption="虚位以待" />
        </div>
      </section>
    </div>
  );
}
