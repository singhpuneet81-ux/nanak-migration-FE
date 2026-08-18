import { useEffect, useState } from "react";
import { WIDGETS } from "@/types/runway";
import { PaginationBar, usePagination } from "@/components/runway/Pagination";
import { toast } from "@/lib/utils";

export default function CaptureNetPage() {
  const pager = usePagination(WIDGETS);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const snippet = `<script src="${origin}/embed-parent.js" defer></script>
<iframe
  src="${origin}/herosection_chatbot"
  title="Pathway Assessment"
  loading="lazy"
  scrolling="no"
  style="width:100%;border:0;overflow:hidden;display:block;background:transparent"
></iframe>`;

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      const data = e.data;
      if (!data || data.type !== "nanak-embed-resize" || data.source !== "herosection_chatbot") return;
      const frame = document.getElementById("hero-chat-preview") as HTMLIFrameElement | null;
      const h = Number(data.height);
      if (!frame || !h) return;
      frame.style.height = `${Math.min(h, 640)}px`;
      frame.style.minHeight = "0";
      frame.style.overflow = "hidden";
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast("WordPress snippet copied");
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <div className="mb-5">
        <h1 className="page-title">Capture net</h1>
        <p className="mt-1 max-w-xl text-[13px] text-muted">
          Traps across the website. Every micro-CTA lands here scored, with a ready-to-send reply.
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
            <div key={step} className={`rounded-2xl border p-3 ${i === 3 ? "border-navy bg-lavender/70" : "border-line bg-white"}`}>
              <div className={`text-[10px] font-bold uppercase ${i === 3 ? "text-navy" : "text-muted"}`}>{step}</div>
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
            {pager.slice.map((x) => (
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
        <PaginationBar {...pager} noun="widgets" />
      </div>

      <div className="card mb-4 p-5">
        <h2 className="text-sm font-bold">WordPress hero iframe</h2>
        <p className="mt-1 text-xs text-muted">
          Paste into the hero banner. Height follows the chatbot (no extra blank space). Submissions land in All leads as source “Pathway assessment”.
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-surface p-3 text-[11px]">{snippet}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="btn btn-pri" onClick={copySnippet}>
            {copied ? "Copied" : "Copy snippet"}
          </button>
          <a className="btn" href="/herosection_chatbot" target="_blank" rel="noreferrer">
            Open live widget
          </a>
        </div>
        <div className="mt-4 max-w-[420px]">
          <iframe
            id="hero-chat-preview"
            title="Pathway Assessment preview"
            src="/herosection_chatbot"
            scrolling="no"
            style={{ width: "100%", height: 0, border: 0, display: "block", overflow: "hidden", background: "transparent" }}
          />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-bold">Intake API</h2>
        <pre className="mt-3 overflow-x-auto rounded bg-surface p-3 text-[11px]">
{`POST /api/intake
Body: { widget: "herosection_chatbot", result, lead: { name, email, mobile, ... } }`}
        </pre>
      </div>
    </>
  );
}
