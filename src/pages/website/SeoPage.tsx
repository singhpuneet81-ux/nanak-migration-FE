import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getSeoPages, upsertSeo, type SeoPage as SeoPageType } from "@/lib/api";
import { toast } from "@/lib/utils";

const EMPTY: SeoPageType = {
  id: "",
  routeKey: "",
  title: "",
  metaDescription: "",
  primaryKeyword: "",
  keywords: "",
  h1: "",
  body: "",
  heroImage: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  robotsIndex: true,
};

export default function SeoPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<SeoPageType | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["seo-pages"], queryFn: getSeoPages });

  const saveMut = useMutation({
    mutationFn: (page: SeoPageType) => {
      const { id: _id, routeKey, ...rest } = page;
      return upsertSeo(routeKey, rest);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seo-pages"] });
      setEditing(null);
      toast("Website content saved — live site will pick this up shortly");
    },
    onError: (e: Error) => toast(e.message),
  });

  const pages = useMemo(() => {
    const list = data?.pages ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.routeKey.includes(q) ||
        (p.title || "").toLowerCase().includes(q) ||
        (p.primaryKeyword || "").toLowerCase().includes(q) ||
        (p.h1 || "").toLowerCase().includes(q)
    );
  }, [data?.pages, filter]);

  const field = (label: string, key: keyof SeoPageType, opts?: { rows?: number; hint?: string }) => {
    if (!editing) return null;
    const value = String(editing[key] ?? "");
    return (
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
        {opts?.hint ? <span className="mb-1 block text-[11px] text-muted/80">{opts.hint}</span> : null}
        {opts?.rows ? (
          <textarea
            value={value}
            onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
            rows={opts.rows}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
            className="h-10 w-full rounded-lg border border-line px-3 text-sm"
          />
        )}
      </label>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Website content</h1>
        <p className="mt-1 text-sm text-muted">
          Edit page titles, intro body, images and SEO fields. Changes sync to the public website via API — no developer needed.
        </p>
      </div>

      <input
        placeholder="Filter by route, title, H1 or keyword…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="h-10 w-full max-w-md rounded-lg border border-line px-3 text-sm"
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">H1 / body</th>
              <th className="px-4 py-3">Keyword</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-muted">
                  Loading…
                </td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-muted">
                  No pages match your filter.
                </td>
              </tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id || p.routeKey} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{p.routeKey}</td>
                  <td className="px-4 py-3 max-w-[220px] truncate">{p.title}</td>
                  <td className="px-4 py-3 text-muted">
                    {p.h1 || p.body ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        CMS copy set
                      </span>
                    ) : (
                      <span className="text-xs">Default layout</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted max-w-[160px] truncate">{p.primaryKeyword}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-sm font-semibold text-navy underline"
                      onClick={() => setEditing({ ...EMPTY, ...p })}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/40 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-line bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-navy">Edit content — {editing.routeKey}</h2>
                <p className="text-xs text-muted">Public path: /{editing.routeKey === "home" ? "" : editing.routeKey}</p>
              </div>
              <button type="button" className="text-2xl text-muted" onClick={() => setEditing(null)}>
                ×
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gold">On-page content</p>
              {field("Page H1 (optional override)", "h1", {
                hint: "If set, replaces the main heading visitors see on this page.",
              })}
              {field("Intro / body copy", "body", {
                rows: 5,
                hint: "Shown as the page intro under the H1 when set. Plain text is fine.",
              })}
              {field("Hero / feature image URL", "heroImage", {
                hint: "Full URL to an image (HTTPS). Used on-page when supported and for social sharing fallback.",
              })}

              <p className="pt-2 text-xs font-bold uppercase tracking-wide text-gold">SEO & meta</p>
              {field("Browser / search title", "title")}
              {field("Meta description", "metaDescription", { rows: 3 })}
              {field("Primary keyword", "primaryKeyword")}
              {field("Extra keywords (comma-separated)", "keywords")}
              {field("Canonical URL", "canonicalUrl")}
              {field("Open Graph title", "ogTitle")}
              {field("Open Graph description", "ogDescription", { rows: 3 })}
              {field("Open Graph image URL", "ogImage")}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.robotsIndex !== false}
                  onChange={(e) => setEditing({ ...editing, robotsIndex: e.target.checked })}
                />
                Allow search engines to index this page
              </label>
            </div>

            <div className="mt-5 flex gap-2">
              <button type="button" className="btn btn-pri" disabled={saveMut.isPending} onClick={() => saveMut.mutate(editing)}>
                {saveMut.isPending ? "Saving…" : "Save & publish"}
              </button>
              <button type="button" className="btn" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
