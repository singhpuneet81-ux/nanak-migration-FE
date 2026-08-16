import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeam, getLead, updateLead } from "@/lib/api";
import LeadDrawer from "@/components/runway/LeadDrawer";
import { toast } from "@/lib/utils";

export default function AllocationPage() {
  const qc = useQueryClient();
  const { data, refetch } = useQuery({ queryKey: ["team"], queryFn: getTeam });
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const { data: drawerLead } = useQuery({
    queryKey: ["lead", drawerId],
    queryFn: () => getLead(drawerId!),
    enabled: !!drawerId,
  });

  const assignMut = useMutation({
    mutationFn: ({ id, owner }: { id: string; owner: string }) => updateLead(id, { owner }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] });
      toast("Lead allocated");
    },
  });

  if (!data) return <div className="text-muted">Loading team…</div>;

  return (
    <>
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-navy">Allocation</h1>
        <p className="mt-1 text-[13px] text-muted">Who holds what, against capacity. The RMA rule is enforced by the desk.</p>
      </div>

      <div className="mb-4 rounded-r-lg border-l-[3px] border-gold bg-amber-50/60 px-4 py-3 text-xs leading-relaxed">
        <b>The one rule that cannot bend:</b> only the Registered Migration Agent gives immigration assistance. Intake books
        consults — the moment a matter needs advice, it moves to Navpreet.
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.members.map((m) => (
          <div key={m.name} className="card p-4">
            <div className="font-bold">{m.name}</div>
            <div className="text-xs text-muted">{m.role}</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded bg-gray-100">
              <div
                className={`h-full rounded ${m.full ? "bg-crit" : "bg-navy"}`}
                style={{ width: `${Math.min(100, (m.load / m.capacity) * 100)}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-muted">
              <span>{m.load} open</span>
              <span>cap {m.capacity}</span>
            </div>
            <p className="mt-2 text-[11px] text-muted">{m.scope}</p>
          </div>
        ))}
      </div>

      {data.unallocated.length > 0 && (
        <div className="card mb-4">
          <div className="px-5 pt-4">
            <h2 className="text-sm font-bold text-crit">Unallocated queue ({data.unallocated.length})</h2>
          </div>
          <div className="divide-y divide-line">
            {data.unallocated.map((l) => (
              <div key={l._id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <button type="button" className="text-left font-semibold hover:text-navy" onClick={() => setDrawerId(l._id)}>
                  {l.name} · {l.source}
                </button>
                <div className="flex gap-1">
                  {data.members.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      className="btn text-[10px]"
                      disabled={m.full}
                      onClick={() => assignMut.mutate({ id: l._id, owner: m.name })}
                    >
                      {m.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <LeadDrawer lead={drawerLead ?? null} open={!!drawerId} onClose={() => setDrawerId(null)} onUpdated={() => refetch()} />
    </>
  );
}
