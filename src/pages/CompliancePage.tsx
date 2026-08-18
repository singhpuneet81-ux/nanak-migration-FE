import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCompliance, fdate, getClients, getCompliance, getMatters, updateCompliance } from "@/lib/api";
import { PaginationBar, usePagination } from "@/components/runway/Pagination";
import { ListLoaderCard } from "@/components/runway/ListLoader";
import { toast } from "@/lib/utils";

export default function CompliancePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["compliance"], queryFn: () => getCompliance() });
  const pager = usePagination(data?.checks ?? [], 8);
  const { data: clients } = useQuery({ queryKey: ["clients", "compliance"], queryFn: () => getClients() });
  const { data: matters } = useQuery({ queryKey: ["matters", "compliance"], queryFn: () => getMatters() });

  const add = useMutation({
    mutationFn: async () => {
      const client = clients?.clients[0];
      if (!client) throw new Error("No client available");
      const matter = matters?.matters.find((m) => m.clientId === client._id) || matters?.matters[0];
      return createCompliance({
        clientId: client._id,
        matterId: matter?._id || null,
        riskRating: "medium",
        overallStatus: "pending",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compliance"] });
      toast("Compliance check created");
    },
  });

  const approve = useMutation({
    mutationFn: (id: string) => updateCompliance(id, { overallStatus: "approved", kycStatus: "verified", reviewedAt: new Date().toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compliance"] });
      toast("Compliance approved");
    },
  });

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">AML/CTF</h1>
          <p className="mt-1 text-[13px] text-muted">KYC, source-of-funds, sanctions and risk review queue for migration engagements.</p>
        </div>
        <button type="button" className="btn btn-pri" onClick={() => add.mutate()}>
          + Add compliance check
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Total checks</div><div className="text-2xl font-bold">{data?.summary.total ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Pending</div><div className="text-2xl font-bold">{data?.summary.pending ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">Escalated</div><div className="text-2xl font-bold">{data?.summary.escalated ?? "—"}</div></div>
        <div className="card p-3.5"><div className="text-[11px] font-semibold uppercase text-muted">High risk</div><div className="text-2xl font-bold">{data?.summary.highRisk ?? "—"}</div></div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {isLoading ? (
          <div className="lg:col-span-2">
            <ListLoaderCard label="Loading AML checks…" />
          </div>
        ) : (
          pager.slice.map((c) => (
            <div key={c._id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-navy">{c.clientName}</div>
                  <div className="text-[11px] text-muted">{c.matterTitle || "No linked matter"} · Reviewer {c.reviewer || "Unassigned"}</div>
                </div>
                <span className={`pill ${c.riskRating === "high" ? "pill-crit" : c.riskRating === "medium" ? "pill-urgent" : "pill-ok"}`}>{c.riskRating} risk</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                <div className="rounded-xl bg-surface px-3 py-2">KYC: <b>{c.kycStatus}</b></div>
                <div className="rounded-xl bg-surface px-3 py-2">Funds: <b>{c.sourceOfFundsStatus}</b></div>
                <div className="rounded-xl bg-surface px-3 py-2">Sanctions: <b>{c.sanctionsStatus}</b></div>
                <div className="rounded-xl bg-surface px-3 py-2">Overall: <b>{c.overallStatus}</b></div>
              </div>
              <div className="mt-3 text-[11px] text-muted">{c.reviewedAt ? `Reviewed ${fdate(c.reviewedAt)}` : "Awaiting review date"}</div>
              {c.notes?.[0] && <div className="mt-2 text-[12px]">{c.notes[0].text}</div>}
              {c.overallStatus !== "approved" && (
                <button type="button" className="btn mt-3" onClick={() => approve.mutate(c._id)}>
                  Approve KYC
                </button>
              )}
            </div>
          ))
        )}
      </div>
      {!isLoading && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white">
          <PaginationBar {...pager} noun="checks" />
        </div>
      )}
    </>
  );
}
