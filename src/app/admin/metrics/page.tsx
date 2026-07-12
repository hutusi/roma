import { getRumSummary } from "@/db/queries/rum";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata = { title: "性能监测" };

// Editorial pages are static, so real numbers only exist at request time.
export const dynamic = "force-dynamic";

const METRIC_ORDER: readonly string[] = ["TTFB", "FCP", "LCP", "INP", "CLS"];
const WINDOW_DAYS = 7;

// CLS is unitless (0–1ish); the rest are millisecond timings.
function formatValue(metric: string, value: number) {
  if (metric === "CLS") return value.toFixed(3);
  return `${Math.round(value)} ms`;
}

export default async function AdminMetricsPage() {
  await requireAdmin();
  const summary = await getRumSummary(WINDOW_DAYS);

  // China segment first within each metric, ordered by Web Vital.
  const rows = summary.slice().sort((a, b) => {
    const byMetric = METRIC_ORDER.indexOf(a.metric) - METRIC_ORDER.indexOf(b.metric);
    if (byMetric !== 0) return byMetric;
    return Number(b.isChina) - Number(a.isChina);
  });

  return (
    <div>
      <h1 className="font-bold text-xl">性能监测（真实用户）</h1>
      <p className="mt-2 max-w-2xl text-ink-muted text-sm">
        过去 {WINDOW_DAYS} 天来自真实访客的 Web Vitals，按中国大陆与其他地区分组。这是 ADR 0008
        “迁移触发条件”的度量依据：当中国大陆的 p75 长期偏高时，才考虑迁往支持中国的边缘网络。
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 text-ink-muted text-sm">暂无数据（信标采样上报，需累积一段时间）。</p>
      ) : (
        <div className="mt-6 max-w-3xl overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-line border-b text-left text-ink-muted">
                <th className="py-2 pr-4 font-medium">指标</th>
                <th className="py-2 pr-4 font-medium">地区</th>
                <th className="py-2 pr-4 text-right font-medium">样本</th>
                <th className="py-2 pr-4 text-right font-medium">p50</th>
                <th className="py-2 pr-4 text-right font-medium">p75</th>
                <th className="py-2 text-right font-medium">p95</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.metric}-${r.isChina}`} className="border-line/60 border-b">
                  <td className="py-2 pr-4 font-medium">{r.metric}</td>
                  <td className="py-2 pr-4">{r.isChina ? "中国大陆" : "其他地区"}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.samples}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {formatValue(r.metric, r.p50)}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {formatValue(r.metric, r.p75)}
                  </td>
                  <td className="py-2 text-right tabular-nums">{formatValue(r.metric, r.p95)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
