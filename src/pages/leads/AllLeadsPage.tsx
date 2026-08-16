import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLeads, getLead, getMeta, createLead, exportLeads, downloadCsv } from "@/lib/api";
import LeadTable from "@/components/runway/LeadTable";
import LeadDrawer from "@/components/runway/LeadDrawer";
import { toast } from "@/lib/utils";

export default function AllLeadsPage() {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [band, setBand] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("");
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const qc = useQueryClient();

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (source) params.source = source;
  if (band) params.band = band;
  if (owner) params.owner = owner;
  if (status) params.status = status;

  const { data, refetch } = useQuery({
    queryKey: ["leads", params],
    queryFn: () => getLeads(params),
  });
  const { data: meta } = useQuery({ queryKey: ["meta"], queryFn: getMeta });
  const { data: drawerLead } = useQuery({
    queryKey: ["lead", drawerId],
    queryFn: () => getLead(drawerId!),
    enabled: !!drawerId,
  });

  async function handleExport() {
    const { rows } = await exportLeads(params);
    downloadCsv("nanak-migration-leads", rows);
    toast("Lead list exported");
  }

  async function handleAdd() {
    const lead = await createLead({ name: "New enquiry", source: "Contact us", goal: "190" });
    qc.invalidateQueries({ queryKey: ["leads"] });
    setDrawerId(lead._id);
    toast("Lead added — fill in the details");
  }

  return (
    <>
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-navy">All leads</h1>
        <p className="mt-1 text-[13px] text-muted">Every enquiry from every form on the website.</p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search name, occupation, suburb…"
          className="w-48 rounded border border-line px-2 py-1.5 text-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border border-line px-2 py-1.5 text-xs" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          {meta?.sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="rounded border border-line px-2 py-1.5 text-xs" value={band} onChange={(e) => setBand(e.target.value)}>
          <option value="">All runway bands</option>
          {meta &&
            Object.entries(meta.bandLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
        </select>
        <select className="rounded border border-line px-2 py-1.5 text-xs" value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">All owners</option>
          {["Navpreet Aulakh", "Puneet Singh", "Intake Desk (Chandigarh)"].map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <select className="rounded border border-line px-2 py-1.5 text-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {meta?.statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="button" className="btn" onClick={handleExport}>
          Export view CSV
        </button>
        <button type="button" className="btn btn-ghost" onClick={handleAdd}>
          + Add lead
        </button>
      </div>

      <div className="card">
        <LeadTable leads={data?.leads ?? []} onRowClick={setDrawerId} />
      </div>

      <LeadDrawer lead={drawerLead ?? null} open={!!drawerId} onClose={() => setDrawerId(null)} onUpdated={() => refetch()} />
    </>
  );
}
