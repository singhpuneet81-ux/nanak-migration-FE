import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRadar, getBookings } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const MODULES = [
  { id: "leads", label: "Leads", live: true, base: "/leads" },
  { id: "bookings", label: "Bookings", live: true, base: "/bookings" },
  { id: "matters", label: "Matters", live: false },
  { id: "clients", label: "Clients", live: false },
  { id: "docs", label: "Documents & forms", live: false },
  { id: "aml", label: "AML/CTF", live: false },
  { id: "reports", label: "Reports", live: false },
];

const LEAD_TABS = [
  ["radar", "Expiry Radar"],
  ["net", "Capture net"],
  ["all", "All leads"],
  ["path", "Pathways"],
  ["src", "Sources"],
  ["team", "Allocation"],
  ["exp", "Export centre"],
] as const;

const BOOKING_TABS = [
  ["sched", "Schedule"],
  ["comms", "Comms queue"],
  ["widget", "Booking page"],
  ["oaf", "Assessment form"],
] as const;

export default function RunwayLayout() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const isBookings = loc.pathname.startsWith("/bookings");

  const { data: radar } = useQuery({ queryKey: ["radar"], queryFn: getRadar, refetchInterval: 60000 });
  const { data: bk } = useQuery({ queryKey: ["bookings"], queryFn: getBookings, refetchInterval: 60000 });

  const crit = radar?.counts.crit ?? 0;
  const todayBk = bk?.today ?? 0;

  return (
    <div className="runway-shell flex min-h-screen">
      <aside className="runway-side fixed bottom-0 left-0 top-0 z-20 flex w-56 flex-col bg-navy text-white">
        <div className="border-b border-white/10 px-5 pb-4 pt-6">
          <div className="text-base font-bold tracking-tight">Nanak Migration</div>
          <div className="font-mono text-[10.5px] uppercase tracking-widest text-gold">Runway · Lead Desk</div>
        </div>
        <div className="px-5 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Modules</div>
        <nav className="runway-nav flex-1">
          {MODULES.map((m) =>
            m.live ? (
              <button
                key={m.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 border-l-[3px] border-transparent px-5 py-2 text-left text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white",
                  ((m.id === "leads" && !isBookings) || (m.id === "bookings" && isBookings)) && "runway-nav-on border-gold bg-white/10 font-semibold text-white"
                )}
                onClick={() => nav(m.base!)}
              >
                {m.label}
                {m.id === "leads" && crit > 0 && (
                  <span className="ml-auto rounded-full bg-gold px-1.5 font-mono text-[10px] font-bold text-navy">{crit}</span>
                )}
                {m.id === "bookings" && todayBk > 0 && (
                  <span className="ml-auto rounded-full bg-gold px-1.5 font-mono text-[10px] font-bold text-navy">{todayBk}</span>
                )}
              </button>
            ) : (
              <button
                key={m.id}
                type="button"
                className="flex w-full cursor-default items-center px-5 py-2 text-left text-[13px] text-white/40"
                onClick={() => alert(`${m.label} — next module on the build list`)}
              >
                {m.label}
                <span className="ml-auto rounded border border-white/20 px-1 font-mono text-[9px] uppercase">soon</span>
              </button>
            )
          )}
        </nav>
        <div className="border-t border-white/10 px-5 py-3 text-[10.5px] leading-relaxed text-white/55">
          <b className="text-white/80">{user?.name}</b>
          <br />
          {user?.email}
        </div>
        <button type="button" className="mx-5 mb-4 text-left text-[11px] text-white/50 hover:text-white" onClick={logout}>
          Sign out
        </button>
      </aside>

      <main className="runway-main ml-56 flex-1 max-w-[1220px] px-8 pb-16 pt-7">
        <div className="subtabs">
          {(isBookings ? BOOKING_TABS : LEAD_TABS).map(([id, label]) => (
            <NavLink
              key={id}
              to={isBookings ? `/bookings/${id}` : `/leads/${id}`}
              className={({ isActive }) => cn("subtab", isActive && "subtab-on")}
            >
              {label}
              {id === "radar" && crit > 0 && (
                <span className="ml-1 rounded-full bg-gold px-1.5 font-mono text-[10px] font-bold text-navy">{crit}</span>
              )}
              {id === "team" && (radar?.counts.unalloc ?? 0) > 0 && (
                <span className="ml-1 rounded-full bg-gray-200 px-1.5 font-mono text-[10px] text-muted">{radar?.counts.unalloc}</span>
              )}
            </NavLink>
          ))}
        </div>
        <Outlet />
      </main>
      <div
        id="runway-toast"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 translate-y-20 rounded-lg bg-navy px-4 py-2.5 text-[13px] font-semibold text-white opacity-0 transition-all duration-200 [&.show]:translate-y-0 [&.show]:opacity-100"
      />
    </div>
  );
}
