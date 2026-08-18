import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Lead } from "@/types/runway";
import { updateLead, fm, fdate } from "@/lib/api";
import { toast } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TEAM = [
  "Navpreet Aulakh",
  "Puneet Singh",
  "Intake Desk (Chandigarh)",
];

type Props = {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export default function LeadDrawer({ lead, open, onClose, onUpdated }: Props) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: (body: Record<string, unknown>) => updateLead(lead!._id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["radar"] });
      qc.invalidateQueries({ queryKey: ["team"] });
      onUpdated();
      toast("Lead updated");
    },
  });

  if (!lead) return null;

  const d = lead.daysToExpiry;
  const b = lead.band;
  const nba = lead.nba;

  return (
    <>
      <div className={cn("fixed inset-0 z-40 bg-navy/35 transition", open ? "block" : "hidden")} onClick={onClose} />
      <aside
        className={cn(
          "fixed bottom-0 right-0 top-0 z-50 w-full max-w-none overflow-y-auto bg-white shadow-[-8px_0_30px_rgba(16,28,85,0.18)] transition-transform duration-200 sm:max-w-[440px]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="sticky top-0 z-10 border-b border-line bg-white px-4 pb-3 pt-4 sm:px-5">
          <button type="button" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-muted hover:bg-surface sm:right-4 sm:top-4" onClick={onClose}>
            ×
          </button>
          <h3 className="pr-8 text-lg font-bold">{lead.name}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="code">{lead.subclass || "no visa"}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", (lead.score ?? 0) >= 70 ? "bg-lavender text-navy" : "bg-surface text-muted")}>
              score {lead.score}
            </span>
            {d != null ? (
              <span className={cn("pill", b === "crit" ? "pill-crit" : b === "urgent" ? "pill-urgent" : "pill-window")}>
                {lead.bandLabel} · {d}d
              </span>
            ) : (
              <span className="pill pill-none">no expiry on file</span>
            )}
          </div>
        </div>

        <div className="space-y-0 px-5 py-4">
          {nba && (
            <section className="mb-4 rounded-2xl border border-navy/15 bg-lavender/50 p-3">
              <div className="text-sm font-bold text-navy">
                ⚡ {nba.title} <span className="text-[11px] font-normal text-muted">· {nba.ch}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{nba.why}</p>
              <div className="mt-2 rounded-xl bg-white p-2 text-xs">{nba.wa}</div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="btn btn-pri text-[11px]"
                  onClick={() => {
                    navigator.clipboard?.writeText(nba.wa);
                    toast("Message copied");
                  }}
                >
                  Copy message
                </button>
                <button
                  type="button"
                  className="btn btn-ghost text-[11px]"
                  onClick={() => mut.mutate({ nbaSent: true, nbaTitle: nba.title })}
                >
                  Mark sent + contacted
                </button>
              </div>
            </section>
          )}

          <section className="border-b border-line py-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted">Visa runway</h4>
            {d != null ? (
              <>
                <div className={cn("text-3xl font-bold", b === "crit" ? "text-crit" : b === "urgent" ? "text-urgent" : "text-ok")}>
                  {d} days
                </div>
                <div className="text-xs text-muted">
                  {lead.visaLabel} expires {fdate(lead.expiry)}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">No current Australian visa recorded.</p>
            )}
          </section>

          <section className="border-b border-line py-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted">
              Lifetime pathway · est. value <span className="font-mono text-ok">{fm(lead.ltv ?? 0)}</span>
            </h4>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <div className="rounded-lg border-2 border-navy bg-navy px-2 py-1 text-white">
                <div className="code border-0 bg-transparent text-white">{lead.subclass || "—"}</div>
                <div className="text-[11px] font-semibold">{lead.visaLabel}</div>
              </div>
              {(lead.pathway || []).map((st) => (
                <span key={st.c} className="flex items-center gap-1">
                  <span className="text-muted">→</span>
                  <div className="rounded-lg border border-line px-2 py-1">
                    <div className="code">{st.c}</div>
                    <div className="font-mono text-[10px] text-muted">{fm(st.f)}</div>
                  </div>
                </span>
              ))}
            </div>
          </section>

          {(lead.signals?.length ?? 0) > 0 && (
            <section className="border-b border-line py-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted">Signal timeline</h4>
              <div className="mt-2 space-y-1">
                {lead.signals.map((g, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="rounded bg-gray-100 px-1.5 font-mono text-[10px] uppercase">{g.type}</span>
                    <span>{g.detail}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="border-b border-line py-3 text-xs">
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">Details</h4>
            {[["Goal", `${lead.goal} ${lead.goalLabel || ""}`], ["Occupation", lead.occupation], ["Location", lead.location], ["Email", lead.email], ["Mobile", lead.mobile], ["Source", `${lead.source}${lead.article ? " · " + lead.article : ""}`]].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[90px_1fr] gap-2 py-0.5">
                <span className="text-muted">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </section>

          <section className="border-b border-line py-3">
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">Owner & status</h4>
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded border border-line px-2 py-1 text-xs"
                value={lead.owner}
                onChange={(e) => mut.mutate({ owner: e.target.value })}
              >
                <option value="">Unallocated</option>
                {TEAM.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                className="rounded border border-line px-2 py-1 text-xs"
                value={lead.status}
                onChange={(e) => mut.mutate({ status: e.target.value })}
              >
                {["new", "engaged", "consult", "won", "lost"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {!lead.contactedAt && (
                <button type="button" className="btn btn-pri text-[11px]" onClick={() => mut.mutate({ markContacted: true })}>
                  Mark first contact made
                </button>
              )}
              <button type="button" className="btn text-[11px]" onClick={() => mut.mutate({ consultBooked: true })}>
                Book consult
              </button>
            </div>
          </section>

          <section className="border-b border-line py-3">
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">Marketing consent</h4>
            <div className="flex gap-4 text-xs">
              {(["email", "sms", "wa"] as const).map((c) => (
                <label key={c} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={lead.consent[c]}
                    onChange={(e) => mut.mutate({ consent: { ...lead.consent, [c]: e.target.checked } })}
                  />
                  {c === "wa" ? "WhatsApp" : c.toUpperCase()}
                </label>
              ))}
            </div>
          </section>

          <section className="py-3">
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">Notes</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const note = String(fd.get("note") || "").trim();
                if (!note) return;
                mut.mutate({ note });
                e.currentTarget.reset();
              }}
            >
              <textarea name="note" className="w-full rounded border border-line p-2 text-xs" rows={3} placeholder="Add a file note…" />
              <button type="submit" className="btn mt-2 text-[11px]">
                Add note
              </button>
            </form>
            <div className="mt-3 space-y-2">
              {lead.notes?.map((n, i) => (
                <div key={n._id || i} className="rounded bg-surface p-2 text-xs">
                  <div className="text-[10px] text-muted">{new Date(n.at).toLocaleString("en-AU")}</div>
                  {n.text}
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
