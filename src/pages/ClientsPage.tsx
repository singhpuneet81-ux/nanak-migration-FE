import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient, getClients, updateClient, fdate } from "@/lib/api";
import { PaginationBar, usePagination } from "@/components/runway/Pagination";
import ListLoader from "@/components/runway/ListLoader";
import { toast } from "@/lib/utils";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const { data, isLoading, isFetching } = useQuery({ queryKey: ["clients", search], queryFn: () => getClients(search ? { search } : {}) });
  const listLoading = isLoading || (isFetching && !data);
  const pager = usePagination(data?.clients ?? []);
  useEffect(() => {
    pager.reset();
  }, [search, pager.reset]);

  const add = useMutation({
    mutationFn: () =>
      createClient({
        name: "New migration client",
        kind: "person",
        status: "active",
        preferredChannel: "email",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast("Client created");
    },
  });

  const activate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateClient(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast("Client updated");
    },
  });

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="mt-1 text-[13px] text-muted">Master records for people and sponsor businesses across active migration work.</p>
        </div>
        <button type="button" className="btn btn-pri" onClick={() => add.mutate()}>
          + Add client
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Total clients</div><div className="text-2xl font-bold">{data?.summary.total ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Active</div><div className="text-2xl font-bold">{data?.summary.active ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Businesses</div><div className="text-2xl font-bold">{data?.summary.businesses ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">With open matters</div><div className="text-2xl font-bold">{data?.summary.withOpenMatters ?? "—"}</div></div>
      </div>

      <div className="filters-bar">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients, email, suburb…" />
      </div>

      <div className="card overflow-hidden">
        {listLoading ? (
          <ListLoader label="Loading clients…" />
        ) : (
          <div className="table-scroll">
            <table className="min-w-full text-left text-[12.5px]">
              <thead className="bg-surface/70 text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Current / goal</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Open matters</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {pager.slice.map((c) => (
                  <tr key={c._id} className="border-t border-line/80">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{c.name}</div>
                      <div className="text-[11px] text-muted">{c.email || c.mobile || "No contact yet"}</div>
                      <div className="text-[11px] text-muted">{c.location || c.occupation || "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{c.visaCurrent || "—"} → {c.visaGoal || "—"}</div>
                      <div className="text-[11px] text-muted">{c.visaExpiry ? `Expiry ${fdate(c.visaExpiry)}` : "No expiry captured"}</div>
                    </td>
                    <td className="px-4 py-3">{c.assignedTo || "Unassigned"}</td>
                    <td className="px-4 py-3">{c.openMatterCount ?? 0} / {c.matterCount ?? 0}</td>
                    <td className="px-4 py-3 capitalize">{c.preferredChannel}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className={`pill ${c.status === "active" ? "pill-ok" : c.status === "inactive" ? "pill-none" : "pill-window"}`}
                        onClick={() => activate.mutate({ id: c._id, status: c.status === "active" ? "inactive" : "active" })}
                      >
                        {c.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!listLoading && <PaginationBar {...pager} noun="clients" />}
      </div>
    </>
  );
}
