export default function ListLoader({
  label = "Loading list…",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[240px] flex-col items-center justify-center gap-3 px-4 py-12 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 rounded-full border-[3px] border-line" />
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-navy border-r-gold" />
      </div>
      <div className="text-[13px] font-semibold text-navy">{label}</div>
      <div className="text-[11px] text-muted">Fetching the latest records…</div>
    </div>
  );
}

export function ListLoaderCard({ label }: { label?: string }) {
  return (
    <div className="card overflow-hidden">
      <ListLoader label={label} />
    </div>
  );
}
