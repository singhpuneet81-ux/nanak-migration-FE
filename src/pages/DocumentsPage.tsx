import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDocument, fdate, getClients, getDocuments, getMatters, updateDocument } from "@/lib/api";
import { toast } from "@/lib/utils";

export default function DocumentsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["documents"], queryFn: () => getDocuments() });
  const { data: clients } = useQuery({ queryKey: ["clients", "docs"], queryFn: () => getClients() });
  const { data: matters } = useQuery({ queryKey: ["matters", "docs"], queryFn: () => getMatters() });

  const add = useMutation({
    mutationFn: async () => {
      const client = clients?.clients[0];
      if (!client) throw new Error("No client available");
      const matter = matters?.matters.find((m) => m.clientId === client._id) || matters?.matters[0];
      return createDocument({
        clientId: client._id,
        matterId: matter?._id || null,
        category: "Identity",
        name: "New requested document",
        status: "required",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast("Document request added");
    },
  });

  const markReceived = useMutation({
    mutationFn: (id: string) => updateDocument(id, { status: "received", receivedAt: new Date().toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast("Document updated");
    },
  });

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Documents & forms</h1>
          <p className="mt-1 text-[13px] text-muted">Checklist-driven document collection for every live migration matter.</p>
        </div>
        <button type="button" className="btn btn-pri" onClick={() => add.mutate()}>
          + Add document
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Total docs</div><div className="text-2xl font-bold">{data?.summary.total ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Required</div><div className="text-2xl font-bold">{data?.summary.required ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Requested</div><div className="text-2xl font-bold">{data?.summary.requested ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Expired</div><div className="text-2xl font-bold">{data?.summary.expired ?? "—"}</div></div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-5 text-sm text-muted">Loading document board…</div>
        ) : (
          <div className="table-scroll">
            <table className="min-w-full text-left text-[12.5px]">
              <thead className="bg-surface/70 text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Document</th>
                  <th className="px-4 py-3">Client / matter</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.documents.map((d) => (
                  <tr key={d._id} className="border-t border-line/80">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{d.name}</div>
                      <div className="text-[11px] text-muted">{d.category} · v{d.version} · {d.source}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{d.clientName}</div>
                      <div className="text-[11px] text-muted">{d.matterTitle || "No linked matter"}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`pill ${d.status === "verified" ? "pill-ok" : d.status === "expired" ? "pill-crit" : d.status === "received" ? "pill-window" : "pill-none"}`}>{d.status}</span></td>
                    <td className="px-4 py-3 text-[11px] text-muted">
                      <div>{d.requestedAt ? `Requested ${fdate(d.requestedAt)}` : "Not requested yet"}</div>
                      <div>{d.receivedAt ? `Received ${fdate(d.receivedAt)}` : "Not received yet"}</div>
                      <div>{d.expiryAt ? `Expiry ${fdate(d.expiryAt)}` : ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      {["required", "requested", "expired"].includes(d.status) ? (
                        <button type="button" className="btn text-[11px]" onClick={() => markReceived.mutate(d._id)}>
                          Mark received
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted">Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
