import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGovernanceTickets,
  updateGovernanceTicket,
  fday,
  ftime,
  type GovernanceTicket,
} from "@/lib/api";
import { toast, cn } from "@/lib/utils";
import { ListLoaderCard } from "@/components/runway/ListLoader";
import { PaginationBar, usePagination } from "@/components/runway/Pagination";

const STATUSES = ["", "new", "in_progress", "resolved", "closed"] as const;

function statusClass(status: string) {
  return cn(
    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
    status === "new" && "bg-amber-50 text-amber-800",
    status === "in_progress" && "bg-blue-50 text-blue-700",
    status === "resolved" && "bg-green-50 text-ok",
    status === "closed" && "bg-gray-100 text-muted"
  );
}

export default function GovernanceTicketsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<GovernanceTicket | null>(null);
  const [note, setNote] = useState("");

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (search.trim()) p.search = search.trim();
    if (status) p.status = status;
    return p;
  }, [search, status]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["governance-tickets", params],
    queryFn: () => getGovernanceTickets(params),
  });

  const pager = usePagination(data?.tickets ?? []);

  const mut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateGovernanceTicket(id, body),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["governance-tickets"] });
      setSelected(row);
      setNote("");
      toast("Ticket updated");
    },
  });

  if (isLoading || !data) {
    return (
      <>
        <div className="mb-5">
          <h1 className="page-title">Governance tickets</h1>
          <p className="mt-1 text-[13px] text-muted">Complaints and feedback submitted on the public website.</p>
        </div>
        <ListLoaderCard label="Loading tickets…" />
      </>
    );
  }

  return (
    <>
      <div className="mb-5">
        <h1 className="page-title">Governance tickets</h1>
        <p className="mt-1 text-[13px] text-muted">Complaints and feedback submitted via /governance on the website.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">Total</div>
          <div className="text-2xl font-bold">{data.kpis.total}</div>
        </div>
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">New</div>
          <div className="text-2xl font-bold text-urgent">{data.kpis.new}</div>
        </div>
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">In progress</div>
          <div className="text-2xl font-bold">{data.kpis.inProgress}</div>
        </div>
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">Resolved</div>
          <div className="text-2xl font-bold text-ok">{data.kpis.resolved}</div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <input
          className="min-w-[140px] rounded-full border border-line px-3 py-2 text-xs sm:w-52"
          placeholder="Search name, email, ref…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-full border border-line px-3 py-2 text-xs"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s || "all"} value={s}>
              {s ? s.replace("_", " ") : "All statuses"}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-ghost text-[12px]" onClick={() => refetch()}>
          Refresh
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {pager.slice.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-muted">
                    No governance tickets yet.
                  </td>
                </tr>
              ) : (
                pager.slice.map((t) => (
                  <tr
                    key={t.id || t._id}
                    className={cn(
                      "cursor-pointer border-t border-line hover:bg-surface/80",
                      selected?.id === t.id && "bg-blue-50/50"
                    )}
                    onClick={() => setSelected(t)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{t.subject}</div>
                      <div className="text-xs text-muted">
                        {t.name} · {t.email}
                      </div>
                      <div className="font-mono text-[11px] text-muted">{t.ref}</div>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-muted">{t.category?.replace("-", " ")}</td>
                    <td className="px-4 py-3">
                      <span className={statusClass(t.status)}>{t.status.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {fday(t.createdAt)} {ftime(t.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <PaginationBar {...pager} noun="tickets" />
        </div>

        <div className="card p-4">
          {!selected ? (
            <p className="text-sm text-muted">Select a ticket to view details and update status.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-mono text-xs text-muted">{selected.ref}</div>
                <div className="text-lg font-bold text-navy">{selected.subject}</div>
                <div className="text-xs text-muted">
                  {selected.name} · {selected.email}
                  {selected.mobile ? ` · ${selected.mobile}` : ""}
                </div>
              </div>
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-navy/90">{selected.details}</p>
              {selected.relatedRef ? (
                <div className="text-xs text-muted">Related ref: {selected.relatedRef}</div>
              ) : null}

              <label className="block text-xs font-semibold uppercase text-muted">Status</label>
              <select
                className="w-full rounded-lg border border-line px-3 py-2 text-sm"
                value={selected.status}
                onChange={(e) =>
                  mut.mutate({ id: selected.id || selected._id!, body: { status: e.target.value } })
                }
              >
                {STATUSES.filter(Boolean).map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>

              <label className="block text-xs font-semibold uppercase text-muted">Add note</label>
              <textarea
                className="min-h-[80px] w-full rounded-lg border border-line px-3 py-2 text-sm"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Internal note…"
              />
              <button
                type="button"
                className="btn text-[12px]"
                disabled={!note.trim() || mut.isPending}
                onClick={() =>
                  mut.mutate({ id: selected.id || selected._id!, body: { note: note.trim() } })
                }
              >
                Save note
              </button>

              {(selected.notes?.length ?? 0) > 0 && (
                <div className="border-t border-line pt-3">
                  <div className="mb-2 text-xs font-semibold uppercase text-muted">Notes</div>
                  <ul className="space-y-2">
                    {selected.notes.map((n, i) => (
                      <li key={i} className="rounded-md bg-surface/80 px-3 py-2 text-xs">
                        <div className="text-muted">
                          {n.by} · {n.at ? new Date(n.at).toLocaleString("en-AU") : ""}
                        </div>
                        <div>{n.text}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
