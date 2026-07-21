import { requireEditor } from "@/lib/auth-guards";

export const metadata = { title: "编辑手册" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-line border-t pt-6">
      <h2 className="mb-3 font-bold text-lg">{title}</h2>
      <div className="max-w-[70ch] space-y-3 font-body text-[15px] leading-[1.9]">{children}</div>
    </section>
  );
}

/**
 * The editor handbook lives inside /admin because guest editors work
 * here, not in the repository. Update it in the same PR as any rule it
 * describes.
 */
export default async function HandbookPage() {
  await requireEditor();

  return (
    <div className="max-w-3xl">
      <h1 className="font-bold text-xl">编辑手册</h1>
      <p className="mt-2 text-ink-muted text-sm">
        八部半的编辑规范。新加入的客座编辑请先通读一遍——不长，但每一条都有原因。
      </p>

      <div className="mt-8 space-y-8">
        <Section title="定位与口吻">
          <p>
            八部半不是数据库，是策展。收录即推荐：一部影片出现在站上，意味着有编辑愿意为它署名担保。
            我们不追热点、不求全，只对「为什么值得在今天看这部电影」负责。
          </p>
          <p>
            口吻像一本印刷杂志：克制、具体、有立场。避免营销腔（"必看神作"）与百科腔（罗列奖项）。
            写你真正看见的东西。
          </p>
        </Section>

        <Section title="编辑札记（200–500 字）">
          <p>
            每部影片的核心是一段 200–500 字的编辑札记。字数按<strong>字符</strong>
            计（表单里有实时计数）， 不足 200 字或超过 500 字都无法发布。
          </p>
          <p>
            好的札记回答三件事：它好在哪里（具体到镜头、表演或结构）；它在电影史或导演谱系中的位置；
            读者应该在什么状态下看它。长篇分析请放进「长文」区，札记保持密度。
          </p>
        </Section>

        <Section title="图片与版权">
          <p>
            上传任何图片都<strong>必须填写来源（credit）</strong>
            ——这不是形式，是版权风险的第一道防线。 优先使用公有领域素材与 Wikimedia
            Commons；老电影（尤其 1950 年代以前）常有公版剧照。
          </p>
          <p>
            海报与剧照可以来自 <strong>TMDB</strong>——内容播种脚本本来就是这么做的，credit 一律填
            <code>TMDB</code>。但要清楚这个 credit 的含义：TMDB 是聚合站，不是版权方，它记录的是
            文件的来源，而不是画面的归属。上面那条「优先公版」因此不是客套话：能找到公版素材时，
            它在版权上是更干净的选择。
          </p>
          <p>
            <strong>绝不使用流媒体截图。</strong>
            没有合适图片时就不放图——页面会优雅降级，黑色画框比侵权剧照体面。
          </p>
        </Section>

        <Section title="标签">
          <p>
            标签是一套<strong>受控的双语词表</strong>：只能在
            <code>/admin/tags</code> 里创建，影片表单只能从已有标签中挑选，没有随手新建的入口。
            创建时中英文名都必填——这是「/en 页面不出现中文」这条规矩的结构性保障，而不是填表负担。
          </p>
          <p>
            黑白<strong>不是标签</strong>，它是影片自身的属性（每部片子都必须明确标注）。
            标签描述的是影片「是什么」——流派、运动、主题，而不是它的技术参数。
          </p>
          <p>
            改名会一次性重写全站所有该标签的显示；删除一个仍被已发布影片使用的标签会被拒绝，
            需要先逐部取消关联——这是编辑决定，不是清理操作。 新增标签时请同时更新
            <code>src/db/seed-data/tags.ts</code>，否则全新数据库的播种会失败。
          </p>
        </Section>

        <Section title="外部标识">
          <p>
            影片可关联四个外部 ID：TMDB、IMDb、豆瓣、Wikidata。<strong>只填 ID 本身</strong>
            （如 <code>tt0056801</code>、豆瓣 <code>subject/</code> 后的数字、<code>Q550027</code>
            ），不要粘贴链接——链接由代码统一生成。
          </p>
          <p>
            豆瓣与 IMDb 会以一行小字出现在影片页「哪里能看」附近（中文版豆瓣在前，英文版 IMDb
            在前）；TMDB 固定影片身份（防止重复收录，也供播种与校对脚本使用），Wikidata
            只提供给搜索引擎，都不会显示。 新建影片时「从 TMDB 导入元数据」会自动带出 TMDB 与 IMDb
            ID；豆瓣 ID 需要手工核对填写。
            这只是给读者的指路牌——评分、榜单等一概不引入，收录即推荐不变。
          </p>
        </Section>

        <Section title="译名规范">
          <p>
            大陆译名为主标题，必填；港译、台译在有通行版本时补充（例：《八部半》台译《八又二分之一》）。
            不确定时查证后再填，不要自创译名。原名（原语言）必填，英文名选填。
          </p>
        </Section>

        <Section title="片单：顺序即立场">
          <p>
            片单是八部半的核心产品，应当像一篇文章那样被读完：一个主题、一篇引言、每部影片的入选理由，
            以及<strong>经过斟酌的先后顺序</strong>
            ——顺序传达观看路径，是编辑立场的一部分，可拖动调整。
          </p>
          <p>
            每部影片都该有入选理由（点击条目展开填写）。没有理由的条目在编辑器里会标注「缺入选理由」。
          </p>
        </Section>

        <Section title="发布流程">
          <p>
            所有内容先存草稿，草稿对读者不可见（公开页直接
            404）。用「预览」按读者视角检查——预览与公开页
            使用同一套渲染组件，所见即所得。点「发布」后内容立即上线，无需等待部署；「撤回」随时可以把内容
            退回草稿。
          </p>
          <p>发布前自查：札记字数达标、至少关联一位导演、图片有来源、译名已核对。</p>
          <p>
            演员表按署名顺序手工维护；只有当某位演员在「人物」中已有条目时才做关联——
            关联后影片页的演员名会链接到其页面（收录即推荐，对人也一样）。
          </p>
        </Section>

        <Section title="英文版：翻译与发布">
          <p>
            每个条目在同一张表单里补写英文字段（标题、札记、长文、入选理由）。 英文札记按
            <strong>词数</strong>计，120–350 词方可发布——中文的字数规则对英文没有意义。
            英文版有独立的发布状态：「发布英文版」上线、「撤回英文版」退回草稿，均不影响中文版。
          </p>
          <p>
            可见性规则：/en 的首页、索引、sitemap 与 RSS 只收录<strong>中英双发布</strong>
            的条目（英文可见 ⇔ 中文已发布且英文已发布）。片单在 /en
            保留全部成员与既定顺序——顺序即立场；未翻译的成员照常占位。
          </p>
          <p>
            未发布英文版的条目，其 /en 详情页不是 404，而是一张「Translation
            Pending」占位页：只显示原文名、说明翻译尚未就绪，并链接回中文页；占位页对搜索引擎
            noindex。所以「/en 页面打不开」不再意味着未翻译——看到占位页才是常态。
          </p>
        </Section>

        <Section title="角色">
          <p>
            编辑可以创建、修改、发布所有编辑内容与图片；用户管理与邀请仅管理员可见。
            需要邀请新编辑时联系管理员生成邀请链接（7 天有效）。
          </p>
        </Section>
      </div>
    </div>
  );
}
