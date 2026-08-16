import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookings, submitOaf } from "@/lib/api";
import { toast } from "@/lib/utils";

export default function AssessmentFormPreview() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["bookings"], queryFn: getBookings });
  const pending = (data?.bookings ?? []).filter(
    (b) => b.status === "confirmed" && b.oaf?.status !== "completed" && (b.consultType?.fee ?? 0) > 0
  );
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState({
    subclass: "",
    expiry: "",
    goal: "",
    occ: "",
    eng: "",
    score: "",
    family: "Just me",
    refusal: "No",
    refdet: "",
    history: "",
    docs: false,
  });

  const mut = useMutation({
    mutationFn: () => submitOaf(selected, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast("Assessment merged into the lead record");
    },
    onError: (e: Error) => toast(e.message),
  });

  return (
    <>
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-navy">Assessment form (client view)</h1>
        <p className="mt-1 text-[13px] text-muted">Pre-consult assessment — 2 minutes for the client, a fully briefed agent for us.</p>
      </div>

      <div className="mb-4">
        <label className="text-xs font-semibold">
          Select booking
          <select className="mt-1 block w-full max-w-md rounded border border-line px-3 py-2 text-sm" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">Choose a pending assessment…</option>
            {pending.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name} · {b.consultType?.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selected && (
        <div className="card mx-auto max-w-lg p-6">
          <h2 className="font-bold text-navy">Pre-consult assessment</h2>
          <p className="mt-1 text-xs text-muted">Required before paid consults. No advice is given here.</p>
          <div className="mt-4 space-y-3">
            <label className="block text-xs font-semibold">
              Current visa subclass
              <select className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.subclass} onChange={(e) => setForm({ ...form, subclass: e.target.value })}>
                <option value="">Select…</option>
                {["500", "485", "482", "820", "600", "none"].map((v) => (
                  <option key={v} value={v}>
                    {v === "none" ? "No current visa" : v}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold">
              Visa expiry
              <input type="date" className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold">
              Goal visa
              <input className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} placeholder="e.g. 190" />
            </label>
            <label className="block text-xs font-semibold">
              Occupation
              <input className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.occ} onChange={(e) => setForm({ ...form, occ: e.target.value })} />
            </label>
            <label className="block text-xs font-semibold">
              Prior refusal or cancellation?
              <select className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" value={form.refusal} onChange={(e) => setForm({ ...form, refusal: e.target.value })}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
            {form.refusal === "Yes" && (
              <label className="block text-xs font-semibold">
                Refusal details
                <textarea className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" rows={2} value={form.refdet} onChange={(e) => setForm({ ...form, refdet: e.target.value })} />
              </label>
            )}
            <label className="block text-xs font-semibold">
              Brief history
              <textarea className="mt-1 w-full rounded border border-line px-3 py-2 text-sm" rows={3} value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={form.docs} onChange={(e) => setForm({ ...form, docs: e.target.checked })} />I will bring passport, visa grant and CV
            </label>
            <button
              type="button"
              className="btn btn-pri w-full py-2.5"
              disabled={!form.subclass || !form.refusal || !form.docs || mut.isPending}
              onClick={() => mut.mutate()}
            >
              Submit assessment
            </button>
          </div>
        </div>
      )}
    </>
  );
}
