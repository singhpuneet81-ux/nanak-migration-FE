import { useQuery } from "@tanstack/react-query";
import { getReports } from "@/lib/api";

export default function ReportsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["reports"], queryFn: getReports });

  if (isLoading) return <div className="card p-5 text-sm text-muted">Loading reports…</div>;
  if (!data) return <div className="card p-5 text-sm text-muted">No report data yet.</div>;

  return (
    <>
      <div className="mb-5">
        <h1 className="page-title">Reports</h1>
        <p className="mt-1 text-[13px] text-muted">Operational reporting across leads, bookings, clients, matters, documents and AML queue.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-5">
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Leads</div><div className="text-2xl font-bold">{data.kpis.leads}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Bookings</div><div className="text-2xl font-bold">{data.kpis.bookings}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Clients</div><div className="text-2xl font-bold">{data.kpis.clients}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Open matters</div><div className="text-2xl font-bold">{data.kpis.openMatters}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Pending AML</div><div className="text-2xl font-bold">{data.kpis.pendingCompliance}</div></div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="card p-4">
          <h2 className="text-sm font-bold text-navy">Funnel snapshot</h2>
          <div className="mt-3 space-y-2 text-[12.5px]">
            <div className="flex justify-between"><span>New leads</span><b>{data.funnel.newLeads}</b></div>
            <div className="flex justify-between"><span>Engaged</span><b>{data.funnel.engagedLeads}</b></div>
            <div className="flex justify-between"><span>Consult</span><b>{data.funnel.consultLeads}</b></div>
            <div className="flex justify-between"><span>Won</span><b>{data.funnel.wonLeads}</b></div>
            <div className="flex justify-between"><span>Active clients</span><b>{data.funnel.activeClients}</b></div>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-sm font-bold text-navy">Booking outcomes</h2>
          <div className="mt-3 space-y-2 text-[12.5px]">
            <div className="flex justify-between"><span>Confirmed</span><b>{data.bookings.confirmed}</b></div>
            <div className="flex justify-between"><span>Completed</span><b>{data.bookings.completed}</b></div>
            <div className="flex justify-between"><span>No-show</span><b>{data.bookings.noShow}</b></div>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-sm font-bold text-navy">Compliance mix</h2>
          <div className="mt-3 space-y-2 text-[12.5px]">
            <div className="flex justify-between"><span>Low risk</span><b>{data.compliance.low}</b></div>
            <div className="flex justify-between"><span>Medium risk</span><b>{data.compliance.medium}</b></div>
            <div className="flex justify-between"><span>High risk</span><b>{data.compliance.high}</b></div>
            <div className="mt-4 flex justify-between"><span>Docs outstanding</span><b>{data.documents.outstanding}</b></div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="card p-4">
          <h2 className="text-sm font-bold text-navy">Upcoming deadlines</h2>
          <div className="mt-3 space-y-2">
            {data.upcomingDeadlines.map((d) => (
              <div key={`${d.matterId}-${d.label}`} className="rounded-xl bg-surface px-3 py-2 text-[12px]">
                <div className="font-semibold">{d.title}</div>
                <div className="text-muted">{d.label} · {new Date(d.due).toLocaleDateString("en-AU")}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-sm font-bold text-navy">Team workload</h2>
          <div className="mt-3 space-y-2">
            {data.teamWorkload.map((row) => (
              <div key={row.assignee} className="rounded-xl bg-surface px-3 py-2 text-[12px]">
                <div className="flex justify-between font-semibold">
                  <span>{row.assignee}</span>
                  <span>{row.matters} matter(s)</span>
                </div>
                <div className="text-muted">{row.highRisk} high risk · {row.docsOutstanding} docs outstanding</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
