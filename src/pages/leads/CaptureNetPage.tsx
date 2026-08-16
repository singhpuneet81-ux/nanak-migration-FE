import { WIDGETS } from "@/types/runway";

export default function CaptureNetPage() {
  return (
    <>
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-navy">Capture net</h1>
        <p className="mt-1 max-w-xl text-[13px] text-muted">
          Seven traps across the website. Every micro-CTA lands here scored, with a ready-to-send reply.
        </p>
      </div>

      <div className="card mb-4 p-5">
        <h2 className="text-sm font-bold">The micro-conversion ladder</h2>
        <p className="mt-1 text-xs text-muted">Nobody fills out “Contact us”. Everybody checks their own score.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Rung 1", "Anonymous value", "Calculator answers on screen, no gate. Trust first."],
            ["Rung 2", "Email-gated result", "Email me my full breakdown — the capture."],
            ["Rung 3", "WhatsApp nudge", "One tap: Ask about my result."],
            ["Rung 4", "Consult booked", "With the RMA. The only rung that asks for money."],
          ].map(([step, name, desc], i) => (
            <div key={step} className={`rounded-lg border p-3 ${i === 3 ? "border-gold bg-amber-50/50" : "border-line"}`}>
              <div className={`text-[10px] font-bold uppercase ${i === 3 ? "text-gold-deep" : "text-muted"}`}>{step}</div>
              <div className="font-bold">{name}</div>
              <div className="mt-1 text-xs text-muted">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-4 overflow-x-auto">
        <div className="px-5 pb-1 pt-4">
          <h2 className="text-sm font-bold">The widget net — what each trap captures</h2>
        </div>
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-[#D9DCE4] bg-[#FAFBFC]">
              {["Widget", "Lives on", "Visitor gives", "Visitor gets", "We capture", "Gated magnet"].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-[10.5px] font-semibold uppercase text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WIDGETS.map((x) => (
              <tr key={x.w} className="border-b border-line">
                <td className="px-3 py-2 font-semibold">{x.w}</td>
                <td className="px-3 py-2 text-xs">{x.where}</td>
                <td className="px-3 py-2 text-xs">{x.asks}</td>
                <td className="px-3 py-2 text-xs">{x.gives}</td>
                <td className="px-3 py-2 text-xs font-semibold">{x.data}</td>
                <td className="px-3 py-2 text-xs">{x.magnet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-bold">Intake API (for future iframe / WordPress wiring)</h2>
        <pre className="mt-3 overflow-x-auto rounded bg-surface p-3 text-[11px]">
{`POST /api/intake
Header: x-nanak-intake-key: <your-key>
Body: { widget, page, utm, fields, result, lead: { name, email, mobile, ... } }`}
        </pre>
      </div>
    </>
  );
}
