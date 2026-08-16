import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookings, createBooking } from "@/lib/api";
import { toast } from "@/lib/utils";

export default function BookingWidgetPreview() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["bookings"], queryFn: getBookings });
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    type: "pr",
    office: "Truganina",
    mode: "Video" as "Video" | "Phone",
    at: "",
    topic: "",
    heard: "",
  });

  const mut = useMutation({
    mutationFn: () =>
      createBooking({
        ...form,
        at: form.at ? new Date(form.at).toISOString() : new Date(Date.now() + 86400000).toISOString(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast("Booking created — check Schedule tab");
      setForm({ ...form, name: "", email: "", mobile: "", topic: "" });
    },
    onError: (e: Error) => toast(e.message),
  });

  return (
    <>
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-navy">Booking page (client view)</h1>
        <p className="mt-1 text-[13px] text-muted">What clients see on nanakmigration.com.au/book — book one and watch it land.</p>
      </div>

      <div className="mx-auto max-w-lg">
        <div className="card p-6">
          <div className="mb-4 text-center">
            <div className="font-serif text-2xl font-semibold text-navy">Book a consultation</div>
            <p className="mt-1 text-sm text-muted">Nanak Migration Group · Registered Migration Agent</p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold">
              Consultation type
              <select
                className="mt-1 w-full rounded border border-line px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {data?.consultTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.fee ? `· $${t.fee}` : "· Free"}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold">
              Full name
              <input className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold">
              Email
              <input type="email" className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold">
              Mobile
              <input className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold">
                Office
                <select className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.office} onChange={(e) => setForm({ ...form, office: e.target.value })}>
                  {data?.offices.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold">
                Mode
                <select className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as "Video" | "Phone" })}>
                  <option value="Video">Video</option>
                  <option value="Phone">Phone</option>
                </select>
              </label>
            </div>
            <label className="block text-xs font-semibold">
              Preferred date & time
              <input type="datetime-local" className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.at} onChange={(e) => setForm({ ...form, at: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold">
              Brief topic
              <input className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold">
              How did you hear about us?
              <select className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.heard} onChange={(e) => setForm({ ...form, heard: e.target.value })}>
                <option value="">Select…</option>
                {data?.heard.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="w-full rounded-full bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-mid disabled:opacity-60"
              disabled={!form.name || !form.email || mut.isPending}
              onClick={() => mut.mutate()}
            >
              {mut.isPending ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
