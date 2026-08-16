import { useQuery } from "@tanstack/react-query";
import { getSources, fm } from "@/lib/api";

export default function SourcesPage() {
  const { data } = useQuery({ queryKey: ["sources"], queryFn: getSources });
  if (!data) return <div className="text-muted">Loading sources…</div>;

  return (
    <>
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-navy">Content sources</h1>
        <p className="mt-1 text-[13px] text-muted">What the blog, sidebar, newsletter and CTAs actually produce.</p>
      </div>

      <div className="card mb-4 overflow-x-auto">
        <div className="px-5 pt-4">
          <h2 className="text-sm font-bold">Which content actually produces clients</h2>
        </div>
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="border-b border-[#D9DCE4] bg-[#FAFBFC]">
              {["Source", "Leads", "Reached consult", "Consult rate", "Pathway value"].map((h, i) => (
                <th key={h} className={`px-3 py-2 text-[10.5px] font-semibold uppercase text-muted ${i > 0 ? "text-right" : "text-left"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.sources.map((s) => (
              <tr key={s.source} className="border-b border-line">
                <td className="px-3 py-2 font-semibold">{s.source}</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{s.leads}</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">{s.consult}</td>
                <td
                  className={`px-3 py-2 text-right font-mono font-semibold ${s.consultRate >= 40 ? "text-ok" : s.consultRate >= 20 ? "text-urgent" : ""}`}
                >
                  {s.leads ? `${s.consultRate}%` : "—"}
                </td>
                <td className="px-3 py-2 text-right font-mono font-semibold text-ok">{fm(s.ltv)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card overflow-x-auto">
        <div className="px-5 pt-4">
          <h2 className="text-sm font-bold">Top articles by lead capture</h2>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#D9DCE4] bg-[#FAFBFC]">
              <th className="px-3 py-2 text-left text-[10.5px] font-semibold uppercase text-muted">Article</th>
              <th className="px-3 py-2 text-right text-[10.5px] font-semibold uppercase text-muted">Leads</th>
              <th className="px-3 py-2 text-right text-[10.5px] font-semibold uppercase text-muted">Reached consult</th>
            </tr>
          </thead>
          <tbody>
            {data.articles.length ? (
              data.articles.map((a) => (
                <tr key={a.article} className="border-b border-line">
                  <td className="px-3 py-2">{a.article}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">{a.leads}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">{a.consult}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-5 text-muted">
                  No article-tagged leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
