import { useEffect, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: radar } = useQuery({ queryKey: ["radar"], queryFn: getRadar, refetchInterval: 60000 });
  const { data: bk } = useQuery({ queryKey: ["bookings"], queryFn: getBookings, refetchInterval: 60000 });

  const crit = radar?.counts.crit ?? 0;
  const todayBk = bk?.today ?? 0;

  useEffect(() => {
    setMenuOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function goModule(base: string) {
    nav(base);
    setMenuOpen(false);
  }

  const moduleButtons = (
    <>
      {MODULES.map((m) =>
        m.live ? (
          <button
            key={m.id}
            type="button"
            className={cn(
              "flex w-full items-center gap-2 border-l-[3px] border-transparent px-5 py-2.5 text-left text-[13px] font-medium text-muted transition hover:bg-lavender/60 hover:text-navy",
              ((m.id === "leads" && !isBookings) || (m.id === "bookings" && isBookings)) &&
                "runway-nav-on border-navy bg-lavender font-semibold text-navy"
            )}
            onClick={() => goModule(m.base!)}
          >
            {m.label}
            {m.id === "leads" && crit > 0 && (
              <span className="ml-auto rounded-full bg-navy px-1.5 font-mono text-[10px] font-bold text-white">{crit}</span>
            )}
            {m.id === "bookings" && todayBk > 0 && (
              <span className="ml-auto rounded-full bg-navy px-1.5 font-mono text-[10px] font-bold text-white">{todayBk}</span>
            )}
          </button>
        ) : (
          <button
            key={m.id}
            type="button"
            className="hidden w-full cursor-default items-center px-5 py-2.5 text-left text-[13px] text-muted/50 lg:flex"
            onClick={() => alert(`${m.label} — next module on the build list`)}
          >
            {m.label}
            <span className="ml-auto rounded border border-line px-1 font-mono text-[9px] uppercase text-muted">soon</span>
          </button>
        )
      )}
    </>
  );

  return (
    <div className="runway-shell flex min-h-screen bg-white">
      {/* Desktop sidebar */}
      <aside className="runway-side fixed bottom-0 left-0 top-0 z-20 hidden w-60 flex-col border-r border-line bg-white lg:flex">
        <div className="border-b border-line px-4 pb-4 pt-5">
          <img
            src="/nanak-migration-logo.png"
            alt="Nanak Migration Group"
            className="h-12 w-auto max-w-full object-contain object-left"
          />
          <div className="eyebrow mt-2.5">Runway · Lead Desk</div>
        </div>
        <div className="px-5 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-muted">Modules</div>
        <nav className="runway-nav flex-1 overflow-y-auto">{moduleButtons}</nav>
        <div className="border-t border-line px-5 py-3 text-[10.5px] leading-relaxed text-muted">
          <b className="text-navy">{user?.name}</b>
          <br />
          <span className="break-all">{user?.email}</span>
        </div>
        <button type="button" className="mx-5 mb-4 text-left text-[11px] font-semibold text-muted hover:text-navy" onClick={logout}>
          Sign out
        </button>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-white/95 px-3 py-2.5 backdrop-blur-md lg:hidden">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-navy"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <img src="/nanak-migration-logo.png" alt="Nanak Migration Group" className="h-9 w-auto max-w-[160px] object-contain" />
        <div className="ml-auto flex items-center gap-2">
          {crit > 0 && (
            <span className="rounded-full bg-navy px-2 py-0.5 font-mono text-[10px] font-bold text-white">{crit} crit</span>
          )}
          <button type="button" className="rounded-full px-2.5 py-1.5 text-[11px] font-semibold text-muted" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn("fixed inset-0 z-40 bg-navy/40 transition-opacity lg:hidden", menuOpen ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-0 z-50 flex w-[min(300px,88vw)] flex-col bg-white shadow-card transition-transform duration-200 lg:hidden",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-start justify-between border-b border-line px-4 pb-3 pt-4">
          <div>
            <img src="/nanak-migration-logo.png" alt="" className="h-10 w-auto max-w-[180px] object-contain" />
            <div className="eyebrow mt-2">Runway · Lead Desk</div>
          </div>
          <button type="button" className="text-2xl leading-none text-muted" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            ×
          </button>
        </div>
        <div className="px-5 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-muted">Modules</div>
        <nav className="flex-1 overflow-y-auto">{moduleButtons}</nav>
        <div className="border-t border-line px-5 py-3 text-[10.5px] leading-relaxed text-muted">
          <b className="text-navy">{user?.name}</b>
          <br />
          <span className="break-all">{user?.email}</span>
        </div>
        <button
          type="button"
          className="mx-5 mb-5 rounded-full border border-line py-2.5 text-center text-[12px] font-semibold text-navy"
          onClick={logout}
        >
          Sign out
        </button>
      </aside>

      {/* Mobile quick module chips */}
      <div className="flex gap-2 overflow-x-auto border-b border-line bg-surface/60 px-3 py-2 lg:hidden">
        {MODULES.filter((m) => m.live).map((m) => (
          <button
            key={m.id}
            type="button"
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold",
              ((m.id === "leads" && !isBookings) || (m.id === "bookings" && isBookings))
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-navy"
            )}
            onClick={() => goModule(m.base!)}
          >
            {m.label}
            {m.id === "leads" && crit > 0 ? ` · ${crit}` : ""}
            {m.id === "bookings" && todayBk > 0 ? ` · ${todayBk}` : ""}
          </button>
        ))}
      </div>

      <main className="runway-main w-full flex-1 bg-surface/40 px-3 pb-20 pt-4 sm:px-5 lg:ml-60 lg:max-w-[1220px] lg:px-8 lg:pb-16 lg:pt-7">
        <div className="subtabs -mx-1 px-1">
          {(isBookings ? BOOKING_TABS : LEAD_TABS).map(([id, label]) => (
            <NavLink
              key={id}
              to={isBookings ? `/bookings/${id}` : `/leads/${id}`}
              className={({ isActive }) => cn("subtab", isActive && "subtab-on")}
            >
              {label}
              {id === "radar" && crit > 0 && (
                <span className="ml-1 rounded-full bg-navy px-1.5 font-mono text-[10px] font-bold text-white">{crit}</span>
              )}
              {id === "team" && (radar?.counts.unalloc ?? 0) > 0 && (
                <span className="ml-1 rounded-full bg-lavender px-1.5 font-mono text-[10px] text-navy">{radar?.counts.unalloc}</span>
              )}
            </NavLink>
          ))}
        </div>
        <Outlet />
      </main>

      <div
        id="runway-toast"
        className="pointer-events-none fixed bottom-5 left-1/2 z-[90] max-w-[90vw] -translate-x-1/2 translate-y-20 rounded-full bg-navy px-4 py-2.5 text-center text-[12px] font-semibold text-white opacity-0 shadow-card transition-all duration-200 sm:text-[13px] [&.show]:translate-y-0 [&.show]:opacity-100"
      />
    </div>
  );
}
