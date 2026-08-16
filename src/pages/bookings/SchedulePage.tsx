import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookings, updateBooking, fday, ftime } from "@/lib/api";
import { toast } from "@/lib/utils";
import { cn } from "@/lib/utils";

function BookingCard({
  b,
  past,
  onDone,
  onNoShow,
}: {
  b: import("@/types/runway").Booking;
  past?: boolean;
  onDone?: () => void;
  onNoShow?: () => void;
}) {
  const t = b.consultType;
  return (
    <div className={cn("mb-2 rounded-lg border border-line p-4", past && "opacity-80")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-bold">{b.name}</div>
          <div className="text-xs text-muted">
            {t?.name} · {b.mode} · {b.office}
          </div>
          <div className="mt-1 font-mono text-xs">
            {fday(b.at)} {ftime(b.at)}
          </div>
          {b.topic && <div className="mt-1 text-xs">{b.topic}</div>}
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
            b.status === "confirmed" && "bg-blue-50 text-blue-700",
            b.status === "completed" && "bg-green-50 text-ok",
            b.status === "no-show" && "bg-red-50 text-crit",
            b.status === "cancelled" && "bg-gray-100 text-muted"
          )}
        >
          {b.status}
        </span>
      </div>
      {b.oaf && (
        <div className="mt-2 text-[11px] text-muted">
          Assessment:{" "}
          <span className={b.oaf.status === "completed" ? "font-semibold text-ok" : "font-semibold text-urgent"}>
            {b.oaf.status}
          </span>
        </div>
      )}
      {!past && b.status === "confirmed" && (
        <div className="mt-3 flex gap-2">
          <button type="button" className="btn text-[11px]" onClick={onDone}>
            Mark completed
          </button>
          <button type="button" className="btn btn-ghost text-[11px]" onClick={onNoShow}>
            No-show
          </button>
        </div>
      )}
    </div>
  );
}

export default function SchedulePage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["bookings"], queryFn: getBookings });

  const mut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateBooking(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      toast("Booking updated");
    },
  });

  if (!data) return <div className="text-muted">Loading schedule…</div>;

  const groups: Record<string, typeof data.upcoming> = {};
  data.upcoming.forEach((b) => {
    const k = new Date(b.at).toDateString();
    (groups[k] = groups[k] || []).push(b);
  });

  return (
    <>
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-navy">Bookings</h1>
        <p className="mt-1 text-[13px] text-muted">Every website booking lands here confirmed, reminded and linked to its lead.</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">Today</div>
          <div className={`text-2xl font-bold ${data.today ? "text-urgent" : ""}`}>{data.today}</div>
        </div>
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">Upcoming</div>
          <div className="text-2xl font-bold">{data.upcoming.length}</div>
        </div>
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">Reminders queued</div>
          <div className="text-2xl font-bold">{data.remindersQueued}</div>
        </div>
        <div className="card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted">No-show rate</div>
          <div className={`text-2xl font-bold ${data.noShowRate && data.noShowRate > 20 ? "text-crit" : "text-ok"}`}>
            {data.noShowRate != null ? `${data.noShowRate}%` : "—"}
          </div>
        </div>
      </div>

      {Object.entries(groups).map(([k, arr]) => (
        <div key={k} className="mb-4">
          <div className="mb-2 text-sm font-bold">
            {fday(arr[0].at)} <span className="font-normal text-muted">· {arr.length} consult(s)</span>
          </div>
          {arr.map((b) => (
            <BookingCard
              key={b._id}
              b={b}
              onDone={() => mut.mutate({ id: b._id, status: "completed" })}
              onNoShow={() => mut.mutate({ id: b._id, status: "no-show" })}
            />
          ))}
        </div>
      ))}

      {!data.upcoming.length && (
        <div className="card mb-4 p-5 text-muted">No upcoming consults. Use the Booking page tab to create one.</div>
      )}

      <div className="card p-4">
        <h2 className="text-sm font-bold">Recent · completed, no-shows</h2>
        <div className="mt-3">
          {data.past.map((b) => (
            <BookingCard key={b._id} b={b} past />
          ))}
        </div>
      </div>
    </>
  );
}
