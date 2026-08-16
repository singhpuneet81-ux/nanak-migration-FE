import { useQuery } from "@tanstack/react-query";
import { getComms, fday, ftime } from "@/lib/api";

export default function CommsQueuePage() {
  const { data } = useQuery({ queryKey: ["comms"], queryFn: getComms });
  if (!data) return <div className="text-muted">Loading comms queue…</div>;

  return (
    <>
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-navy">Comms queue</h1>
        <p className="mt-1 text-[13px] text-muted">Automated message chain per booking: confirmation, reminders, follow-up.</p>
      </div>

      <div className="space-y-3">
        {data.queue.map(({ booking, message }, i) => {
          const sent = !!message.sent;
          const cancelled = ["cancelled", "no-show"].includes(booking.status);
          return (
            <div key={i} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold">{booking.name}</span>
                  <span className="mx-2 text-muted">·</span>
                  <span className="text-xs">{data.msgLabels[message.kind] || message.kind}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    sent ? "bg-green-50 text-ok" : cancelled ? "bg-gray-100 text-muted" : "bg-amber-50 text-urgent"
                  }`}
                >
                  {sent ? "✓ Sent" : cancelled ? "Skipped" : `Due ${fday(message.due)} ${ftime(message.due)}`}
                </span>
              </div>
              {message.body && <pre className="mt-2 whitespace-pre-wrap rounded bg-surface p-2 text-[11px]">{message.body}</pre>}
            </div>
          );
        })}
        {!data.queue.length && <div className="text-muted">No messages in queue.</div>}
      </div>
    </>
  );
}
