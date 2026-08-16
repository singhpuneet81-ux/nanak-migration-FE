import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPathways, getLead, fm, fdate } from "@/lib/api";
import LeadDrawer from "@/components/runway/LeadDrawer";

export default function PathwaysPage() {
  const { data, refetch } = useQuery({ queryKey: ["pathways"], queryFn: getPathways });
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const { data: drawerLead } = useQuery({
    queryKey: ["lead", drawerId],
    queryFn: () => getLead(drawerId!),
    enabled: !!drawerId,
  });

  if (!data) return <div className="text-muted">Loading pathways…</div>;

  return (
    <>
      <div className="mb-5">
        <h1 className="page-title">Lifetime pathways</h1>
        <p className="mt-1 text-[13px] text-muted">Each lead priced across their whole migration journey.</p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">Open leads</div>
          <div className="text-2xl font-bold">{data.openCount}</div>
        </div>
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">Pipeline lifetime value</div>
          <div className="text-2xl font-bold text-ok">{fm(data.pipelineLtv)}</div>
        </div>
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">Scheduled nurture triggers</div>
          <div className="text-2xl font-bold">{data.triggerCount}</div>
        </div>
      </div>

      <div className="card mb-4 p-5">
        <h2 className="text-sm font-bold">Upcoming re-engagement triggers</h2>
        <div className="mt-3 space-y-2">
          {data.upcomingTriggers.slice(0, 10).map((x, i) => (
            <button
              key={i}
              type="button"
              className="flex w-full items-center justify-between rounded border border-line px-3 py-2 text-left text-xs hover:bg-surface"
              onClick={() => setDrawerId(x.lead._id)}
            >
              <span>
                <b>{x.lead.name}</b> · {x.trigger.what}
              </span>
              <span className="font-mono text-muted">{fdate(x.trigger.at)}</span>
            </button>
          ))}
          {!data.upcomingTriggers.length && <div className="text-muted">No triggers scheduled.</div>}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <div className="px-5 pt-4">
          <h2 className="text-sm font-bold">Pathway value per lead</h2>
        </div>
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="border-b border-[#D9DCE4] bg-[#FAFBFC]">
              <th className="px-3 py-2 text-left text-[10.5px] font-semibold uppercase text-muted">Lead</th>
              <th className="px-3 py-2 text-left text-[10.5px] font-semibold uppercase text-muted">Journey</th>
              <th className="px-3 py-2 text-right text-[10.5px] font-semibold uppercase text-muted">Lifetime value</th>
            </tr>
          </thead>
          <tbody>
            {data.leads.map((l) => (
              <tr key={l._id} className="cursor-pointer border-b border-line hover:bg-[#FAFAFE]" onClick={() => setDrawerId(l._id)}>
                <td className="px-3 py-2">
                  <div className="font-semibold">{l.name}</div>
                  <div className="text-[11px] text-muted">{l.occupation}</div>
                </td>
                <td className="px-3 py-2">
                  <span className="code">{l.subclass || "—"}</span>
                  {(l.pathway || []).map((st) => (
                    <span key={st.c}>
                      {" "}
                      <span className="text-muted">→</span> <span className="code">{st.c}</span>
                    </span>
                  ))}
                </td>
                <td className="px-3 py-2 text-right font-mono font-semibold text-ok">{fm(l.ltv ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LeadDrawer lead={drawerLead ?? null} open={!!drawerId} onClose={() => setDrawerId(null)} onUpdated={() => refetch()} />
    </>
  );
}
