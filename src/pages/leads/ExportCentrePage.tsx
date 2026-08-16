import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSegments, exportSegment, downloadCsv } from "@/lib/api";
import { toast } from "@/lib/utils";

export default function ExportCentrePage() {
  const [channel, setChannel] = useState("email");
  const { data, refetch } = useQuery({
    queryKey: ["segments", channel],
    queryFn: () => getSegments(channel),
  });

  async function handleExport(segId: string, name: string) {
    const { rows, count } = await exportSegment(segId, channel);
    downloadCsv(`nanak-migration-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, rows);
    toast(`${count} contacts exported · ${channel} consent verified`);
  }

  return (
    <>
      <div className="mb-5">
        <h1 className="page-title">Export centre</h1>
        <p className="mt-1 text-[13px] text-muted">Consent-gated marketing segments from visa data.</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Channel consent gate:</span>
        <select className="rounded border border-line px-2 py-1.5 text-xs" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="email">Email</option>
          <option value="wa">WhatsApp</option>
          <option value="sms">SMS</option>
        </select>
        <span className="text-[11px] text-muted">Unticked consent = silently excluded. No exceptions.</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.segments.map((sg) => (
          <div key={sg.id} className="card flex flex-col p-4">
            <div className="font-bold">{sg.name}</div>
            <p className="mt-1 flex-1 text-xs text-muted">{sg.desc}</p>
            <div className="mt-3 text-2xl font-bold">{sg.count}</div>
            <div className="mt-2 flex gap-2">
              <button type="button" className="btn btn-pri text-[11px]" onClick={() => handleExport(sg.id, sg.name)}>
                Export CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-r-2xl border-l-[3px] border-navy bg-lavender/60 px-4 py-3 text-xs leading-relaxed">
        <b>Compliance is welded on.</b> Every outbound template must carry: Navpreet Aulakh, Registered Migration Agent,
        MARN 2619467 · no outcome guarantees · unsubscribe in one click · Australian English.
      </div>
    </>
  );
}
