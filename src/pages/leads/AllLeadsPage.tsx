import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLeads, getLead, getMeta, createLead, exportLeads, downloadCsv } from "@/lib/api";
import LeadTable from "@/components/runway/LeadTable";
import LeadDrawer from "@/components/runway/LeadDrawer";
import { PaginationBar, usePagination } from "@/components/runway/Pagination";
import ListLoader from "@/components/runway/ListLoader";
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

  const { data, refetch, isLoading, isFetching } = useQuery({
    queryKey: ["leads", params],
    queryFn: () => getLeads(params),
  });
  const listLoading = isLoading || (isFetching && !data);
  const pager = usePagination(data?.leads ?? []);
  useEffect(() => {
    pager.reset();
  }, [search, source, band, owner, status, pager.reset]);
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
        <h1 className="page-title">All leads</h1>
        <p className="mt-1 text-[13px] text-muted">Every enquiry from every form on the website.</p>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search name, occupation, suburb…"
          className="min-w-[140px] basis-full rounded-full border border-line px-3 py-2 text-xs sm:basis-auto sm:w-52"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="min-w-[120px] flex-1 rounded-full border border-line px-3 py-2 text-xs sm:flex-none" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          {meta?.sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="min-w-[120px] flex-1 rounded-full border border-line px-3 py-2 text-xs sm:flex-none" value={band} onChange={(e) => setBand(e.target.value)}>
          <option value="">All runway bands</option>
          {meta &&
            Object.entries(meta.bandLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
        </select>
        <select className="min-w-[120px] flex-1 rounded-full border border-line px-3 py-2 text-xs sm:flex-none" value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">All owners</option>
          {["Navpreet Aulakh", "Puneet Singh", "Intake Desk (Chandigarh)"].map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <select className="min-w-[120px] flex-1 rounded-full border border-line px-3 py-2 text-xs sm:flex-none" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {meta?.statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="button" className="btn shrink-0" onClick={handleExport}>
          Export CSV
        </button>
        <button type="button" className="btn btn-pri shrink-0" onClick={handleAdd}>
          + Add lead
        </button>
      </div>

      <div className="card overflow-hidden">
        {listLoading ? (
          <ListLoader label="Loading leads…" />
        ) : (
          <>
            <LeadTable leads={pager.slice} onRowClick={setDrawerId} />
            <PaginationBar {...pager} noun="leads" />
          </>
        )}
      </div>

      <LeadDrawer lead={drawerLead ?? null} open={!!drawerId} onClose={() => setDrawerId(null)} onUpdated={() => refetch()} />
    </>
  );
}
