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
    <div className="card mb-4 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 pt-4 pb-1 sm:px-5">
        <h2 className="text-sm font-bold tracking-tight">Every open lead, plotted on their visa runway</h2>
        <div className="flex flex-wrap gap-2 text-[10px] text-muted sm:gap-3 sm:text-[11px]">
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-crit" />Critical &lt;90d</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-gold" />Urgent 90–180d</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-navy-soft" />Window 180–365d</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-gray-400" />12m+ runway</span>
        </div>
      </div>
      <div className="radar-plot relative mx-3 mb-4 mt-2 h-[150px] overflow-hidden border-l-2 border-navy sm:mx-5 sm:h-[160px]">
        <div className="absolute inset-x-0 bottom-6 top-0">
          <div className="absolute bottom-6 top-0 bg-gradient-to-r from-red-500/10 to-red-500/5" style={{ left: 0, width: `${px(90)}%` }} />
          <div className="absolute bottom-6 top-0 bg-gold/10" style={{ left: `${px(90)}%`, width: `${px(180) - px(90)}%` }} />
          <div className="absolute bottom-6 top-0 bg-lavender" style={{ left: `${px(180)}%`, width: `${px(365) - px(180)}%` }} />
        </div>
        <span className="absolute -top-1 left-0 font-mono text-[10px] font-semibold text-navy">TODAY</span>
        {chips.map((l, i) => {
          const d = l.daysToExpiry ?? 0;
          const left = Math.max(px(d), 1.5);
          const top = 12 + (i % 4) * 28;
          const band = l.band || "runway";
          return (
            <button
              key={l._id}
              type="button"
              className={cn(
                "radar-chip absolute flex max-w-[42%] -translate-x-1/2 items-center gap-1 truncate rounded-full border bg-white px-1.5 py-0.5 text-[10px] font-semibold shadow-sm hover:z-10 hover:shadow-md sm:max-w-none sm:px-2 sm:text-[11px]",
                band === "crit" && "border-crit",
                band === "urgent" && "border-gold",
                band === "window" && "border-navy-soft"
              )}
              style={{ left: `${left}%`, top }}
              onClick={() => onChipClick(l._id)}
              title={`${l.name} · ${d} days`}
            >
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  band === "crit" && "bg-crit",
                  band === "urgent" && "bg-gold",
                  band === "window" && "bg-navy-soft",
                  !["crit", "urgent", "window"].includes(band) && "bg-muted"
                )}
              />
              <span className="truncate">{l.name.split(" ")[0]}</span>
              <span className="hidden font-mono text-[9.5px] text-muted sm:inline">
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
              className="absolute top-1 -translate-x-1/2 font-mono text-[9px] text-muted sm:text-[10px]"
              style={{ left: `${px(d as number)}%` }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      {noExpiry.length > 0 && (
        <div className="px-3 pb-4 text-xs text-muted sm:px-5">
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
