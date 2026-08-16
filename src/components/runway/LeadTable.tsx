import type { Lead } from "@/types/runway";
import { fm, fmins } from "@/lib/api";
import { cn } from "@/lib/utils";

function SlaPill({ lead }: { lead: Lead }) {
  const ss = lead.sla;
  if (!ss) return null;
  if (ss.s === "done") return <span className="pill pill-ok">answered {fmins(ss.mins)}</span>;
  if (ss.s === "breach") return <span className="pill pill-breach">SLA breach +{fmins(ss.mins)}</span>;
  return <span className="pill pill-urgent">due in {fmins(ss.mins)}</span>;
}

function ExpPill({ lead }: { lead: Lead }) {
  const d = lead.daysToExpiry;
  if (d === null || d === undefined) return <span className="pill pill-none">no expiry</span>;
  const band = lead.band || "runway";
  return (
    <span className={cn("pill", `pill-${band === "crit" ? "crit" : band === "urgent" ? "urgent" : band === "window" ? "window" : "runway"}`)}>
      {d}d
    </span>
  );
}

export default function LeadTable({ leads, onRowClick }: { leads: Lead[]; onRowClick: (id: string) => void }) {
  if (!leads.length) {
    return <div className="p-5 text-muted">No leads to show.</div>;
  }
  return (
    <div className="table-scroll">
      <table className="w-full min-w-[720px] border-collapse sm:min-w-[800px]">
        <thead>
          <tr className="border-b border-[#D9DCE4] bg-[#FAFBFC]">
            {["Lead", "Visa → goal", "Expiry", "First contact", "Source", "Owner", "Pathway value", "Status"].map((h, i) => (
              <th key={h} className={cn("px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-wide text-muted", i === 6 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr
              key={l._id}
              className="cursor-pointer border-b border-line hover:bg-[#FAFAFE]"
              onClick={() => onRowClick(l._id)}
            >
              <td className="px-3 py-2">
                <div className="font-semibold">
                  {l.name}
                  {(l.score ?? 0) >= 70 && (
                    <span className="ml-1 rounded-full bg-lavender px-1.5 py-px text-[10px] font-bold text-navy">{l.score}</span>
                  )}
                </div>
                <div className="text-[11px] text-muted">
                  {l.occupation} · {l.location}
                </div>
              </td>
              <td className="px-3 py-2">
                <span className="code">{l.subclass || "—"}</span> <span className="text-muted">→</span>{" "}
                <span className="code">{l.goal || "?"}</span>
              </td>
              <td className="px-3 py-2">
                <ExpPill lead={l} />
              </td>
              <td className="px-3 py-2">
                <SlaPill lead={l} />
              </td>
              <td className="px-3 py-2">{l.source}</td>
              <td className="px-3 py-2">
                {l.owner ? (
                  l.owner.startsWith("Intake") ? "Intake desk" : l.owner.split(" ")[0]
                ) : (
                  <span className="font-semibold text-crit">unallocated</span>
                )}
              </td>
              <td className="px-3 py-2 text-right font-mono font-semibold text-ok">{fm(l.ltv ?? 0)}</td>
              <td className="px-3 py-2">{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
