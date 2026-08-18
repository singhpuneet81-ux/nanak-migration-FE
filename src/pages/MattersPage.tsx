import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMatter, fdate, getClients, getMatters, updateMatter } from "@/lib/api";
import { PaginationBar, usePagination } from "@/components/runway/Pagination";
import ListLoader, { ListLoaderCard } from "@/components/runway/ListLoader";
import { toast } from "@/lib/utils";

const STAGE_COLS = ["intake", "advice", "engaged", "docs", "review", "lodgement", "post-lodgement"] as const;

export default function MattersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["matters"], queryFn: () => getMatters() });
  const pager = usePagination(data?.matters ?? []);
  const { data: clients } = useQuery({ queryKey: ["clients", "picker"], queryFn: () => getClients() });

  const add = useMutation({
    mutationFn: async () => {
      const first = clients?.clients[0];
      if (!first) throw new Error("No client available");
      return createMatter({
        title: "New migration matter",
        clientId: first._id,
        type: "Skilled Migration",
        stage: "intake",
        status: "open",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matters"] });
      toast("Matter created");
    },
  });

  const move = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => updateMatter(id, { stage }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matters"] });
    },
  });

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Matters</h1>
          <p className="mt-1 text-[13px] text-muted">Live migration case pipeline from intake through lodgement and post-lodgement follow-up.</p>
        </div>
        <button type="button" className="btn btn-pri" onClick={() => add.mutate()}>
          + Add matter
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Total matters</div><div className="text-2xl font-bold">{data?.summary.total ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Open</div><div className="text-2xl font-bold">{data?.summary.open ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Due this week</div><div className="text-2xl font-bold">{data?.summary.dueThisWeek ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Docs outstanding</div><div className="text-2xl font-bold">{data?.summary.documentsOutstanding ?? "—"}</div></div>
      </div>

      {isLoading ? (
        <ListLoaderCard label="Loading matters…" />
      ) : (
        <div className="grid gap-3 xl:grid-cols-4">
          {STAGE_COLS.map((stage) => (
            <div key={stage} className="card p-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold capitalize text-navy">{stage.replace("-", " ")}</h2>
                <span className="pill pill-window">{data?.matters.filter((m) => m.stage === stage).length ?? 0}</span>
              </div>
              <div className="space-y-2">
                {data?.matters.filter((m) => m.stage === stage).map((m) => {
                  const nextStage = STAGE_COLS[Math.min(STAGE_COLS.indexOf(stage) + 1, STAGE_COLS.length - 1)];
                  return (
                    <div key={m._id} className="rounded-xl border border-line p-3">
                      <div className="font-semibold text-navy">{m.title}</div>
                      <div className="mt-1 text-[11px] text-muted">{m.clientName} · {m.assignedTo || "Unassigned"}</div>
                      <div className="mt-1 text-[11px] text-muted">{m.type} · {m.visaCategory || "General"}</div>
                      <div className="mt-2 text-[11px]">{m.nextAction || "No next action set"}</div>
                      <div className="mt-1 text-[11px] text-muted">{m.nextActionAt ? `Due ${fdate(m.nextActionAt)}` : "No target date"}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className={`pill ${m.riskLevel === "high" ? "pill-crit" : m.riskLevel === "medium" ? "pill-urgent" : "pill-ok"}`}>{m.riskLevel} risk</span>
                        <span className="pill pill-window">{m.documentsOutstanding} docs</span>
                        <span className="pill pill-none">{m.feeStatus}</span>
                      </div>
                      {nextStage !== stage && (
                        <button type="button" className="btn mt-3 w-full text-[11px]" onClick={() => move.mutate({ id: m._id, stage: nextStage })}>
                          Move to {nextStage.replace("-", " ")}
                        </button>
                      )}
                    </div>
                  );
                })}
                {!data?.matters.some((m) => m.stage === stage) && <div className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-[11px] text-muted">No matters in this stage.</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card mt-4 overflow-hidden">
        <div className="px-4 pt-4">
          <h2 className="text-sm font-bold text-navy">All matters</h2>
        </div>
        {isLoading ? (
          <ListLoader label="Loading matters…" />
        ) : (
          <>
            <div className="table-scroll">
              <table className="min-w-full text-left text-[12.5px]">
                <thead className="bg-surface/70 text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Matter</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {pager.slice.map((m) => (
                    <tr key={m._id} className="border-t border-line/80">
                      <td className="px-4 py-3 font-semibold text-navy">{m.title}</td>
                      <td className="px-4 py-3">{m.clientName}</td>
                      <td className="px-4 py-3 capitalize">{m.stage.replace("-", " ")}</td>
                      <td className="px-4 py-3">{m.assignedTo || "Unassigned"}</td>
                      <td className="px-4 py-3 text-[11px] text-muted">{m.nextAction || "—"}{m.nextActionAt ? ` · ${fdate(m.nextActionAt)}` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar {...pager} noun="matters" />
          </>
        )}
      </div>
    </>
  );
}
