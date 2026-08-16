import type { Lead } from "@/types/runway";
import { cn } from "@/lib/utils";

const MAXD = 730;

export default function ExpiryRadar({
  chips,
  noExpiry,
  onChipClick,
}: {
  chips: Lead[];
  noExpiry: Lead[];
  onChipClick: (id: string) => void;
}) {
  const px = (d: number) => Math.min(d / MAXD, 1) * 100;

  return (
    <div className="card mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-1">
        <h2 className="text-sm font-bold tracking-tight">Every open lead, plotted on their visa runway</h2>
        <div className="flex flex-wrap gap-3 text-[11px] text-muted">
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-crit" />Critical &lt;90d</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-gold" />Urgent 90–180d</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-600" />Window 180–365d</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-gray-400" />12m+ runway</span>
        </div>
      </div>
      <div className="relative mx-5 mb-4 mt-2 h-[150px] border-l-2 border-navy">
        <div className="absolute inset-x-0 bottom-6 top-0">
          <div className="absolute bottom-6 top-0 bg-gradient-to-r from-red-500/10 to-red-500/5" style={{ left: 0, width: `${px(90)}%` }} />
          <div className="absolute bottom-6 top-0 bg-gold/10" style={{ left: `${px(90)}%`, width: `${px(180) - px(90)}%` }} />
          <div className="absolute bottom-6 top-0 bg-blue-500/5" style={{ left: `${px(180)}%`, width: `${px(365) - px(180)}%` }} />
        </div>
        <span className="absolute -top-1 left-0 font-mono text-[10px] font-semibold text-navy">TODAY</span>
        {chips.map((l, i) => {
          const d = l.daysToExpiry ?? 0;
          const left = Math.max(px(d), 1.5);
          const top = 14 + (i % 4) * 30;
          const band = l.band || "runway";
          return (
            <button
              key={l._id}
              type="button"
              className={cn(
                "absolute flex -translate-x-1/2 items-center gap-1 rounded-full border bg-white px-2 py-0.5 text-[11px] font-semibold shadow-sm hover:shadow-md",
                band === "crit" && "border-crit",
                band === "urgent" && "border-gold",
                band === "window" && "border-blue-500"
              )}
              style={{ left: `${left}%`, top }}
              onClick={() => onChipClick(l._id)}
              title={`${l.name} · ${d} days`}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  band === "crit" && "bg-crit",
                  band === "urgent" && "bg-gold",
                  band === "window" && "bg-blue-600",
                  !["crit", "urgent", "window"].includes(band) && "bg-gray-400"
                )}
              />
              {l.name.split(" ")[0]}{" "}
              <span className="font-mono text-[9.5px] text-muted">
                {l.subclass}·{d}d
              </span>
            </button>
          );
        })}
        <div className="absolute bottom-0 left-0 right-0 h-6 border-t border-[#D9DCE4]">
          {[
            [90, "3m"],
            [180, "6m"],
            [365, "12m"],
            [547, "18m"],
            [730, "24m+"],
          ].map(([d, t]) => (
            <span
              key={d}
              className="absolute top-1 -translate-x-1/2 font-mono text-[10px] text-muted"
              style={{ left: `${px(d as number)}%` }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      {noExpiry.length > 0 && (
        <div className="px-5 pb-4 text-xs text-muted">
          <b className="text-ink">No expiry date on file:</b>{" "}
          {noExpiry.map((l) => (
            <button
              key={l._id}
              type="button"
              className="mr-1 mt-1 inline-flex items-center gap-1 rounded-full border border-line bg-white px-2 py-0.5 text-[11px] font-semibold"
              onClick={() => onChipClick(l._id)}
            >
              {l.name.split(" ")[0]}{" "}
              <span className="font-mono text-[9.5px] text-muted">{l.subclass === "EMP" ? "sponsor" : "offshore"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
