import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getSeoPages, upsertSeo } from "@/lib/api";
import { toast } from "@/lib/utils";

type SeoPage = {
  id: string;
  routeKey: string;
  title: string;
  metaDescription: string;
  primaryKeyword: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsIndex?: boolean;
};

export default function SeoPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<SeoPage | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["seo-pages"], queryFn: getSeoPages });

  const saveMut = useMutation({
    mutationFn: (page: SeoPage) => upsertSeo(page.routeKey, page),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seo-pages"] });
      setEditing(null);
      toast("SEO saved");
    },
    onError: (e: Error) => toast(e.message),
  });

  const pages = (data?.pages ?? []).filter(
    (p) =>
      !filter ||
      p.routeKey.includes(filter.toLowerCase()) ||
      p.title.toLowerCase().includes(filter.toLowerCase()) ||
      p.primaryKeyword.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">SEO & page meta</h1>
        <p className="mt-1 text-sm text-muted">Manage titles, descriptions and keywords for public website pages.</p>
      </div>

      <input
        placeholder="Filter by route, title or keyword…"
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
              <th className="px-4 py-3">Primary keyword</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-muted">
                  Loading…
                </td>
              </tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id || p.routeKey} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{p.routeKey}</td>
                  <td className="px-4 py-3">{p.title}</td>
                  <td className="px-4 py-3 text-muted">{p.primaryKeyword}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="text-sm font-semibold text-navy underline" onClick={() => setEditing(p)}>
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
          <div className="my-8 w-full max-w-xl rounded-2xl border border-line bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy">Edit SEO — {editing.routeKey}</h2>
              <button type="button" className="text-2xl text-muted" onClick={() => setEditing(null)}>
                ×
              </button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Page title</span>
                <input
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="h-10 w-full rounded-lg border border-line px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Meta description</span>
                <textarea
                  value={editing.metaDescription || ""}
                  onChange={(e) => setEditing({ ...editing, metaDescription: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Primary keyword</span>
                <input
                  value={editing.primaryKeyword || ""}
                  onChange={(e) => setEditing({ ...editing, primaryKeyword: e.target.value })}
                  className="h-10 w-full rounded-lg border border-line px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Canonical URL</span>
                <input
                  value={editing.canonicalUrl || ""}
                  onChange={(e) => setEditing({ ...editing, canonicalUrl: e.target.value })}
                  className="h-10 w-full rounded-lg border border-line px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Open Graph title</span>
                <input
                  value={editing.ogTitle || ""}
                  onChange={(e) => setEditing({ ...editing, ogTitle: e.target.value })}
                  className="h-10 w-full rounded-lg border border-line px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Open Graph description</span>
                <textarea
                  value={editing.ogDescription || ""}
                  onChange={(e) => setEditing({ ...editing, ogDescription: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Open Graph image URL</span>
                <input
                  value={editing.ogImage || ""}
                  onChange={(e) => setEditing({ ...editing, ogImage: e.target.value })}
                  className="h-10 w-full rounded-lg border border-line px-3 text-sm"
                />
              </label>
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
                {saveMut.isPending ? "Saving…" : "Save"}
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
