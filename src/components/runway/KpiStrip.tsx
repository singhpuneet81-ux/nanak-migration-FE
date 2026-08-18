import type { Kpis } from "@/types/runway";
import { fm } from "@/lib/api";

export default function KpiStrip({ kpis }: { kpis: Kpis }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      <div className="card p-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Leads · 30 days</div>
        <div className="mt-1 text-2xl font-bold tracking-tight">{kpis.monthNew}</div>
        <div className="text-[11px] text-muted">all website forms</div>
      </div>
      <div className="card p-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Awaiting first contact</div>
        <div className={`mt-1 text-2xl font-bold tracking-tight ${kpis.awaitingContact ? "text-urgent" : ""}`}>
          {kpis.awaitingContact}
        </div>
        <div className="text-[11px] text-muted">clock running</div>
      </div>
      <div className="card p-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">SLA breaches</div>
        <div className={`mt-1 text-2xl font-bold tracking-tight ${kpis.slaBreaches ? "text-crit" : "text-ok"}`}>
          {kpis.slaBreaches}
        </div>
        <div className="text-[11px] text-muted">read out Monday</div>
      </div>
      <div className="card p-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Critical runway</div>
        <div className={`mt-1 text-2xl font-bold tracking-tight ${kpis.criticalRunway ? "text-crit" : ""}`}>
          {kpis.criticalRunway}
        </div>
        <div className="text-[11px] text-muted">visa expires &lt;90 days</div>
      </div>
      <div className="card col-span-2 p-3.5 md:col-span-1 lg:col-span-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Pipeline lifetime value</div>
        <div className="mt-1 text-2xl font-bold tracking-tight text-ok">{fm(kpis.pipelineLtv)}</div>
        <div className="text-[11px] text-muted">est. professional fees</div>
      </div>
    </div>
  );
}
