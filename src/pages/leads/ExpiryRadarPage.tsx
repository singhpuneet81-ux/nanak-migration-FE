import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRadar, getLead } from "@/lib/api";
import KpiStrip from "@/components/runway/KpiStrip";
import ExpiryRadar from "@/components/runway/ExpiryRadar";
import LeadTable from "@/components/runway/LeadTable";
import LeadDrawer from "@/components/runway/LeadDrawer";

export default function ExpiryRadarPage() {
  const { data, refetch } = useQuery({ queryKey: ["radar"], queryFn: getRadar });
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const { data: drawerLead } = useQuery({
    queryKey: ["lead", drawerId],
    queryFn: () => getLead(drawerId!),
    enabled: !!drawerId,
  });

  if (!data) return <div className="text-muted">Loading radar…</div>;

  return (
    <>
      <div className="mb-5">
        <h1 className="page-title">Expiry Radar</h1>
        <p className="mt-1 max-w-xl text-[13px] text-muted">
          Leads sorted by how much runway their visa has left — not by when they enquired.
        </p>
      </div>
      <KpiStrip kpis={data.kpis} />
      <ExpiryRadar chips={data.chips} noExpiry={data.noExpiry} onChipClick={setDrawerId} />

      <div className="card mb-4">
        <div className="px-5 pb-1 pt-4">
          <h2 className="text-sm font-bold">First-contact queue</h2>
          <p className="text-xs text-muted">Uncontacted leads against the SLA clock.</p>
        </div>
        {data.firstContactQueue.length ? (
          <LeadTable leads={data.firstContactQueue} onRowClick={setDrawerId} />
        ) : (
          <div className="p-5 font-semibold text-ok">Every lead has been contacted. Clean board.</div>
        )}
      </div>

      <div className="card mb-4">
        <div className="px-5 pb-1 pt-4">
          <h2 className="text-sm font-bold">Short-runway matters (under 6 months)</h2>
          <p className="text-xs text-muted">These outrank everything else this week.</p>
        </div>
        {data.shortRunway.length ? (
          <LeadTable leads={data.shortRunway} onRowClick={setDrawerId} />
        ) : (
          <div className="p-5 text-muted">Nothing under six months right now.</div>
        )}
      </div>

      <p className="text-xs text-muted">
        The Radar replaces “sort by date enquired”. Position = days until the current visa expires.
      </p>

      <LeadDrawer lead={drawerLead ?? null} open={!!drawerId} onClose={() => setDrawerId(null)} onUpdated={() => refetch()} />
    </>
  );
}
