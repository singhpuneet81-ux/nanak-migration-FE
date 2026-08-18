import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBooking, fday, ftime, getBookings } from "@/lib/api";
import { cn, toast } from "@/lib/utils";
import type { Booking } from "@/types/runway";

type ConsultType = { id: string; name: string; dur: number; fee: number; who: string; desc: string };

const FALLBACK_TYPES: ConsultType[] = [
  { id: "free", name: "Quick eligibility call", dur: 15, fee: 0, who: "Intake desk", desc: "Free 15 minutes to confirm whether a paid consult is worth your money. No advice given." },
  { id: "pr", name: "PR Pathway Consultation", dur: 45, fee: 75, who: "Navpreet Aulakh (RMA)", desc: "189 / 190 / 491 and your realistic route to permanent residence." },
  { id: "family", name: "Family Visa – Parent / Partner", dur: 30, fee: 75, who: "Navpreet Aulakh (RMA)", desc: "Partner (820/801/309/100) and parent visa options and evidence." },
  { id: "temp", name: "Temporary Residency Visas", dur: 30, fee: 75, who: "Navpreet Aulakh (RMA)", desc: "485, 482, 407 and other temporary visas — conditions, timing, next steps." },
  { id: "student", name: "Student Visa", dur: 30, fee: 55, who: "Navpreet Aulakh (RMA)", desc: "New applications, extensions, course changes and condition questions." },
  { id: "visitor", name: "Visitor Visa – Australia", dur: 30, fee: 75, who: "Navpreet Aulakh (RMA)", desc: "Visitor and sponsored family visitor applications." },
  { id: "employer", name: "Employer Sponsored Visa", dur: 30, fee: 0, who: "Puneet Singh", desc: "For businesses: sponsorship costs, obligations and timelines. Free discovery call." },
  { id: "art", name: "ART / Tribunal Appeal", dur: 45, fee: 75, who: "Navpreet Aulakh (RMA)", desc: "Refusals and cancellations — review options and strict deadlines." },
  { id: "other", name: "Other Migration Services", dur: 30, fee: 75, who: "Navpreet Aulakh (RMA)", desc: "Anything not listed — tell us the situation in the notes." },
];

const FALLBACK_OFFICES = ["Mickleham", "Truganina", "Cranbourne", "Geelong", "Canning Vale (WA)"];
const FALLBACK_HEARD = ["Google", "TikTok", "Instagram", "Facebook", "YouTube", "Friend / family", "Existing client", "Other"];

function sameDay(a: Date | number, b: Date | number) {
  const x = new Date(a);
  const y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

function slotsForDay(day: Date, bookings: Booking[]) {
  const slots: { ts: number; label: string; taken: boolean }[] = [];
  for (let h = 9; h < 17; h++) {
    for (const m of [0, 30]) {
      if (h === 9 && m === 0) continue;
      const x = new Date(day);
      x.setHours(h, m, 0, 0);
      if (x.getTime() < Date.now() + 60 * 60 * 1000) continue;
      const taken = bookings.some(
        (b) => b.status === "confirmed" && Math.abs(new Date(b.at).getTime() - x.getTime()) < 30 * 60 * 1000
      );
      slots.push({ ts: x.getTime(), label: ftime(x.toISOString()), taken });
    }
  }
  return slots;
}

function confirmPreview(name: string, typeName: string, at: number, mode: string, office: string) {
  const fn = name.split(" ")[0] || name;
  return `Hi ${fn}, your ${typeName.toLowerCase()} with Nanak Migration is confirmed for ${fday(new Date(at).toISOString())} at ${ftime(new Date(at).toISOString())} (${mode}, looked after by our ${office} office).`;
}

export default function BookingWidgetPreview() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["bookings"], queryFn: getBookings });
  const types = data?.consultTypes?.length ? data.consultTypes : FALLBACK_TYPES;
  const offices = data?.offices?.length ? data.offices : FALLBACK_OFFICES;
  const heardOpts = data?.heard?.length ? data.heard : FALLBACK_HEARD;
  const bookings = data?.bookings ?? [];

  const [step, setStep] = useState(1);
  const [typeId, setTypeId] = useState<string | null>(null);
  const [monthOff, setMonthOff] = useState(0);
  const [day, setDay] = useState<Date | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [mode, setMode] = useState<"Video" | "Phone">("Video");
  const [office, setOffice] = useState("Truganina");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [topic, setTopic] = useState("");
  const [heard, setHeard] = useState("");
  const [vevo, setVevo] = useState(false);
  const [lastAt, setLastAt] = useState<number | null>(null);
  const [lastType, setLastType] = useState<ConsultType | null>(null);

  const t = types.find((x) => x.id === typeId) || null;
  const slots = day ? slotsForDay(day, bookings) : [];

  const cal = useMemo(() => {
    const ref = new Date();
    ref.setDate(1);
    ref.setMonth(ref.getMonth() + monthOff);
    ref.setHours(0, 0, 0, 0);
    const firstDow = (ref.getDay() + 6) % 7;
    const dim = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
    const cells: { d: number | null; date?: Date; past?: boolean; sun?: boolean; sel?: boolean }[] = [];
    for (let i = 0; i < firstDow; i++) cells.push({ d: null });
    for (let d2 = 1; d2 <= dim; d2++) {
      const x = new Date(ref.getFullYear(), ref.getMonth(), d2, 12, 0, 0, 0);
      cells.push({
        d: d2,
        date: x,
        past: x.getTime() < Date.now() - 12 * 60 * 60 * 1000,
        sun: x.getDay() === 0,
        sel: !!day && sameDay(day, x),
      });
    }
    return {
      label: ref.toLocaleDateString("en-AU", { month: "long", year: "numeric" }),
      cells,
    };
  }, [monthOff, day]);

  function reset() {
    setStep(1);
    setTypeId(null);
    setMonthOff(0);
    setDay(null);
    setSlot(null);
    setMode("Video");
    setOffice("Truganina");
    setName("");
    setEmail("");
    setMobile("");
    setTopic("");
    setHeard("");
    setVevo(false);
    setLastAt(null);
    setLastType(null);
  }

  const mut = useMutation({
    mutationFn: () => {
      if (!typeId || !slot) throw new Error("Pick a time first");
      return createBooking({
        name,
        email,
        mobile,
        type: typeId,
        office,
        mode,
        at: new Date(slot).toISOString(),
        topic,
        heard,
        vevo,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      setLastAt(slot);
      setLastType(t);
      setStep(4);
      toast("Booking landed in the CRM — check Schedule");
    },
    onError: (e: Error) => toast(e.message),
  });

  function book() {
    if (!slot || !name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !vevo) {
      toast("Add your details and tick the consent box");
      return;
    }
    mut.mutate();
  }

  const stepCls = (n: number) => (step === n ? "on" : step > n ? "done" : "");

  return (
    <>
      <div className="mb-5">
        <h1 className="page-title">Booking page (client view)</h1>
        <p className="mt-1 text-[13px] text-muted">
          Exactly what the client sees on nanakmigration.com.au/book — book one and watch it land.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="cw">
          <div className="cw-left">
            <div className="relative z-[1] border-b border-white/16 pb-3">
              <div className="text-[15px] font-bold tracking-tight">Nanak Migration Group</div>
              <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.09em] text-gold">nanakmigration.com.au/book</div>
            </div>
            {t ? (
              <>
                <div className="relative z-[1] text-lg font-bold leading-snug">{t.name}</div>
                <div className="relative z-[1] text-xs text-white/85">⏱ {t.dur} min</div>
                <div className="relative z-[1] text-xs text-white/85">{t.fee ? `💳 $${t.fee} AUD · credited if you engage us` : "🆓 Free"}</div>
                <div className="relative z-[1] text-xs text-white/85">📞 {mode} consultation</div>
                {slot && (
                  <div className="relative z-[1] rounded-[10px] border border-gold/55 bg-gold/15 px-3 py-2.5 text-[13px] font-semibold leading-relaxed">
                    📅 {fday(new Date(slot).toISOString())}
                    <br />
                    {ftime(new Date(slot).toISOString())} AEST
                  </div>
                )}
                <div className="relative z-[1] text-[11px] text-white/65">with {t.who}</div>
              </>
            ) : (
              <div className="relative z-[1] text-lg font-bold opacity-75">Choose a consultation to begin</div>
            )}
            <div className="relative z-[1] mt-auto space-y-1.5 border-t border-white/16 pt-3 text-[10.5px] text-white/82">
              <div>
                <span className="tracking-widest text-gold">★★★★★</span> Google-rated migration practice
              </div>
              <div>✓ Registered Migration Agent</div>
              <div>✓ 5 offices · Punjabi · Hindi · English</div>
              <div>✓ Confirmation in seconds, reminders built in</div>
              <div className="pt-2 text-[9.5px] leading-relaxed text-white/55">
                Navpreet Aulakh · Registered Migration Agent · <span className="font-mono">MARN 2619467</span>
              </div>
            </div>
          </div>

          <div className="cw-right">
            {step < 4 && (
              <div className="mb-4 flex items-center gap-0">
                {[
                  [1, "Service"],
                  [2, "Time"],
                  [3, "Details"],
                ].map(([n, label], i) => (
                  <div key={String(n)} className="flex flex-1 items-center">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-muted",
                        stepCls(Number(n)) === "on" && "text-navy",
                        stepCls(Number(n)) === "done" && "text-ok"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full bg-surface font-mono text-[10px] text-muted",
                          stepCls(Number(n)) === "on" && "bg-gold text-navy shadow-[0_0_0_4px_#fdf3df]",
                          stepCls(Number(n)) === "done" && "bg-green-50 text-ok"
                        )}
                      >
                        {step > Number(n) ? "✓" : n}
                      </span>
                      {label}
                    </span>
                    {i < 2 && <span className="mx-2 h-px flex-1 bg-line" />}
                  </div>
                ))}
              </div>
            )}

            {step === 1 && (
              <>
                <div className="mb-3.5 text-[16.5px] font-bold tracking-tight">Select a consultation</div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {types.map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      className="group relative overflow-hidden rounded-xl border-[1.5px] border-line bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-navy hover:shadow-soft"
                      onClick={() => {
                        setTypeId(x.id);
                        setStep(2);
                      }}
                    >
                      <span className="absolute bottom-0 left-0 top-0 w-[3.5px] origin-center scale-y-0 bg-gold transition group-hover:scale-y-100" />
                      <div className="flex flex-wrap items-start gap-1.5 text-[13px] font-bold leading-snug">
                        {x.name}
                        {x.id === "pr" && (
                          <span className="rounded-full bg-gold px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-navy">
                            Most booked
                          </span>
                        )}
                      </div>
                      <div className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-muted">{x.desc}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={cn("rounded-md px-2 py-1 font-mono text-[13px] font-semibold", x.fee ? "bg-surface text-navy" : "bg-green-50 text-ok")}>
                          {x.fee ? `$${x.fee}` : "Free"}
                        </span>
                        <span className="text-lg text-muted group-hover:translate-x-0.5 group-hover:text-navy">›</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <button type="button" className="mb-2.5 rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-navy hover:text-navy" onClick={() => { setStep(1); setSlot(null); }}>
                  ‹ Back
                </button>
                <div className="mb-3.5 text-[16.5px] font-bold tracking-tight">Pick a date & time</div>
                <div className="grid gap-5 lg:grid-cols-[1fr_156px]">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm font-bold">
                      <button type="button" className="h-7 w-7 rounded-full border border-line disabled:opacity-30" disabled={monthOff <= 0} onClick={() => { setMonthOff((v) => v - 1); setDay(null); setSlot(null); }}>
                        ‹
                      </button>
                      <span>{cal.label}</span>
                      <button type="button" className="h-7 w-7 rounded-full border border-line disabled:opacity-30" disabled={monthOff >= 2} onClick={() => { setMonthOff((v) => v + 1); setDay(null); setSlot(null); }}>
                        ›
                      </button>
                    </div>
                    <div className="mb-1.5 grid grid-cols-7 text-center text-[9px] font-bold tracking-wide text-muted">
                      {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {cal.cells.map((c, i) => {
                        const disabled = !c.date || c.past || c.sun;
                        return (
                          <button
                            key={i}
                            type="button"
                            disabled={disabled}
                            className={cn(
                              "flex h-8 items-center justify-center rounded-full font-mono text-[12.5px]",
                              disabled && "text-[#e4e6f0]",
                              !disabled && "bg-[#eaeefb] font-semibold text-navy hover:bg-navy hover:text-white",
                              c.sel && "bg-gold font-bold text-navy shadow-[0_0_0_3.5px_#fdf3df]"
                            )}
                            onClick={() => {
                              if (!c.date) return;
                              setDay(c.date);
                              setSlot(null);
                            }}
                          >
                            {c.d ?? ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex max-h-[310px] flex-col gap-1.5 overflow-y-auto">
                    {day ? (
                      <>
                        <div className="text-[11px] font-bold uppercase tracking-wide text-muted">{fday(day.toISOString())}</div>
                        {slots.length ? (
                          slots.map((sl) => (
                            <button
                              key={sl.ts}
                              type="button"
                              disabled={sl.taken}
                              className={cn(
                                "rounded-lg border-[1.5px] border-navy py-2 font-mono text-[13px] font-semibold",
                                sl.taken && "cursor-not-allowed border-line text-muted line-through",
                                !sl.taken && slot === sl.ts && "border-gold bg-gold text-navy shadow-[0_0_0_3px_#fdf3df]",
                                !sl.taken && slot !== sl.ts && "bg-white text-navy hover:bg-navy hover:text-white"
                              )}
                              onClick={() => setSlot(sl.ts)}
                            >
                              {sl.label}
                            </button>
                          ))
                        ) : (
                          <div className="text-[11px] font-bold uppercase text-muted">No times left this day</div>
                        )}
                      </>
                    ) : (
                      <div className="text-[11px] font-bold uppercase text-muted">Select a date</div>
                    )}
                  </div>
                </div>
                {slot && (
                  <button type="button" className="cw-go" onClick={() => setStep(3)}>
                    Confirm {ftime(new Date(slot).toISOString())} →
                  </button>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <button type="button" className="mb-2.5 rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-navy hover:text-navy" onClick={() => setStep(2)}>
                  ‹ Back
                </button>
                <div className="mb-3.5 text-[16.5px] font-bold tracking-tight">Your details</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <label className="block text-xs font-semibold text-muted">
                    Full name *
                    <input className="mt-1.5 w-full rounded-[9px] border-[1.5px] border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-navy focus:ring-4 focus:ring-navy/10" value={name} onChange={(e) => setName(e.target.value)} />
                  </label>
                  <label className="block text-xs font-semibold text-muted">
                    Mobile *
                    <input className="mt-1.5 w-full rounded-[9px] border-[1.5px] border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-navy focus:ring-4 focus:ring-navy/10" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                  </label>
                </div>
                <label className="mt-2.5 block text-xs font-semibold text-muted">
                  Email *
                  <input type="email" className="mt-1.5 w-full rounded-[9px] border-[1.5px] border-line px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-navy focus:ring-4 focus:ring-navy/10" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                  <label className="block text-xs font-semibold text-muted">
                    Phone or video?
                    <select className="mt-1.5 w-full rounded-[9px] border-[1.5px] border-line px-3 py-2.5 text-[13.5px] text-ink" value={mode} onChange={(e) => setMode(e.target.value as "Video" | "Phone")}>
                      <option>Video</option>
                      <option>Phone</option>
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-muted">
                    Office to look after you
                    <select className="mt-1.5 w-full rounded-[9px] border-[1.5px] border-line px-3 py-2.5 text-[13.5px] text-ink" value={office} onChange={(e) => setOffice(e.target.value)}>
                      {offices.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="mt-2.5 block text-xs font-semibold text-muted">
                  What is it about?
                  <input className="mt-1.5 w-full rounded-[9px] border-[1.5px] border-line px-3 py-2.5 text-[13.5px] text-ink" placeholder="e.g. 485 ending in 3 months" value={topic} onChange={(e) => setTopic(e.target.value)} />
                </label>
                <label className="mt-2.5 block text-xs font-semibold text-muted">
                  How did you hear about us?
                  <select className="mt-1.5 w-full rounded-[9px] border-[1.5px] border-line px-3 py-2.5 text-[13.5px] text-ink" value={heard} onChange={(e) => setHeard(e.target.value)}>
                    <option value="">Select…</option>
                    {heardOpts.map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </label>
                <label className="mt-3.5 flex items-start gap-2 text-xs font-normal leading-relaxed text-ink">
                  <input type="checkbox" className="mt-0.5" checked={vevo} onChange={(e) => setVevo(e.target.checked)} />
                  I consent to a VEVO check of my visa status before the consultation, and I’ll have my passport, visa grant letter and CV ready.
                </label>
                <button type="button" className="cw-go" disabled={mut.isPending} onClick={book}>
                  {mut.isPending ? "Booking…" : t?.fee ? `Book · pay $${t.fee} →` : "Book my spot →"}
                </button>
                <div className="mt-2 text-[10.5px] leading-relaxed text-muted">
                  Confirmation lands instantly by WhatsApp and email, with reminders 24 hours and 1 hour before.
                </div>
              </>
            )}

            {step === 4 && lastAt && lastType && (
              <>
                <div className="mb-3.5 text-[16.5px] font-bold tracking-tight text-ok">✓ You’re booked</div>
                <div className="rounded-[10px] bg-green-50 px-3.5 py-3 font-mono text-sm font-semibold text-ok">
                  {fday(new Date(lastAt).toISOString())} at {ftime(new Date(lastAt).toISOString())} · {mode} · {lastType.name}
                </div>
                <label className="mt-3.5 block text-xs font-semibold text-muted">The confirmation just sent</label>
                <div className="mt-2 whitespace-pre-wrap rounded-[9px] border border-line bg-surface px-3.5 py-3 text-[12.5px] leading-relaxed">
                  {confirmPreview(name, lastType.name, lastAt, mode, office)}
                </div>
                <button type="button" className="cw-go mt-4 !bg-[#eeeeef] !shadow-none" onClick={reset}>
                  Book another (demo)
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="card p-5">
            <h2 className="text-sm font-bold text-navy">What happens the second they book</h2>
            <div className="mt-2 text-[13px] leading-7 text-ink">
              1. A lead is created or merged by email — the booking <b>is</b> the lead.
              <br />
              2. Status → consult, owner → the right person (RMA rule enforced).
              <br />
              3. Confirmation fires instantly with the day and time spelt out.
              <br />
              4. Reminders queue for 24 hours and 1 hour before — see the Comms queue tab.
              <br />
              5. The slot disappears from the calendar.
              <br />
              6. “How did you hear about us?” lands as marketing attribution on the lead.
              <br />
              7. Paid consults collect the fee at booking — paid people show up.
            </div>
          </div>
          <p className="mt-3.5 text-xs leading-relaxed text-muted">
            <b>vs AUM Global:</b> theirs is an iframe on a separate subdomain with no lead intelligence behind it. Ours lands in the same CRM that already knows their calculator score and visa expiry — the agent walks into every consult already briefed.
          </p>
        </div>
      </div>
    </>
  );
}
