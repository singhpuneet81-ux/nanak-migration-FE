import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  createFaq,
  deleteFaq,
  getFaqs,
  getSeoPages,
  seedMissingFaqs,
  updateFaq,
  upsertFaqByPageKey,
  type FaqCollection,
} from "@/lib/api";
import { toast } from "@/lib/utils";

type FaqItem = { q: string; a: string; order?: number };

const EMPTY: Partial<FaqCollection> = {
  pageKey: "",
  title: "Frequently asked questions",
  items: [{ q: "", a: "", order: 0 }],
  published: true,
};

export default function FaqCMSPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Partial<FaqCollection> | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["faqs"], queryFn: getFaqs });
  const { data: seoData } = useQuery({ queryKey: ["seo-pages"], queryFn: getSeoPages });

  const saveMut = useMutation({
    mutationFn: async (col: Partial<FaqCollection>) => {
      const body = {
        ...col,
        items: (col.items || []).map((item, i) => ({ ...item, order: item.order ?? i })),
      };
      if (col.id) return updateFaq(col.id, body);
      return createFaq(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faqs"] });
      setEditing(null);
      toast("FAQ saved — the public site refreshes within seconds");
    },
    onError: (e: Error) => toast(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFaq(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faqs"] });
      setEditing(null);
      toast("FAQ collection deleted");
    },
    onError: (e: Error) => toast(e.message),
  });

  const seedMut = useMutation({
    mutationFn: seedMissingFaqs,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["faqs"] });
      toast(`Seeded ${res.inserted} missing page FAQ collections`);
    },
    onError: (e: Error) => toast(e.message),
  });

  const ensureMut = useMutation({
    mutationFn: (pageKey: string) =>
      upsertFaqByPageKey(pageKey, {
        title: `${pageKey
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")} FAQ`,
        published: true,
      }),
    onSuccess: (col) => {
      qc.invalidateQueries({ queryKey: ["faqs"] });
      setEditing(col);
      toast("FAQ collection ready — edit questions below");
    },
    onError: (e: Error) => toast(e.message),
  });

  const collections = data?.collections ?? [];
  const byKey = useMemo(() => {
    const map = new Map<string, FaqCollection>();
    for (const c of collections) map.set(c.pageKey, c);
    if (map.has("homepage") && !map.has("home")) map.set("home", map.get("homepage")!);
    return map;
  }, [collections]);

  const seoPages = seoData?.pages ?? [];

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    type FaqRow = {
      pageKey: string;
      label: string;
      items: number;
      published?: boolean;
      collection?: FaqCollection;
      source: "seo" | "faq";
    };
    const fromSeo: FaqRow[] = seoPages.map((p) => {
      const col = byKey.get(p.routeKey) || (p.routeKey === "home" ? byKey.get("homepage") : undefined);
      return {
        pageKey: p.routeKey === "home" ? "homepage" : p.routeKey,
        label: p.h1 || p.title || p.routeKey,
        items: col?.items?.length || 0,
        published: col?.published,
        collection: col,
        source: "seo",
      };
    });

    // Include FAQ-only keys not in SEO list
    const seoKeys = new Set(fromSeo.map((r) => r.pageKey));
    for (const c of collections) {
      if (seoKeys.has(c.pageKey)) continue;
      if (c.pageKey === "home" && seoKeys.has("homepage")) continue;
      fromSeo.push({
        pageKey: c.pageKey,
        label: c.title,
        items: c.items?.length || 0,
        published: c.published,
        collection: c,
        source: "faq",
      });
    }

    fromSeo.sort((a, b) => a.pageKey.localeCompare(b.pageKey));
    if (!q) return fromSeo;
    return fromSeo.filter(
      (r) =>
        r.pageKey.includes(q) ||
        r.label.toLowerCase().includes(q) ||
        (r.collection?.title || "").toLowerCase().includes(q)
    );
  }, [seoPages, collections, byKey, filter]);

  function patchItem(index: number, patch: Partial<FaqItem>) {
    if (!editing) return;
    const items = [...(editing.items || [])];
    items[index] = { ...items[index], ...patch };
    setEditing({ ...editing, items });
  }

  function addItem() {
    if (!editing) return;
    setEditing({
      ...editing,
      items: [...(editing.items || []), { q: "", a: "", order: editing.items?.length || 0 }],
    });
  }

  function removeItem(index: number) {
    if (!editing) return;
    setEditing({ ...editing, items: (editing.items || []).filter((_, i) => i !== index) });
  }

  function openEdit(pageKey: string, existing?: FaqCollection) {
    if (existing) {
      setEditing(existing);
      return;
    }
    ensureMut.mutate(pageKey);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Page FAQs</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Edit FAQ questions and answers for every public page — same flow as the homepage FAQ. Changes go live on
            the website after save. Use “Seed missing pages” once to load defaults from the site.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn"
            disabled={seedMut.isPending}
            onClick={() => seedMut.mutate()}
          >
            {seedMut.isPending ? "Seeding…" : "Seed missing pages"}
          </button>
          <button type="button" className="btn btn-pri" onClick={() => setEditing({ ...EMPTY })}>
            New collection
          </button>
        </div>
      </div>

      <input
        placeholder="Filter by page key or title…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="h-10 w-full max-w-md rounded-lg border border-line px-3 text-sm"
      />

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Questions</th>
              <th className="px-4 py-3">Status</th>
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
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-muted">
                  No pages match your filter.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.pageKey} className="border-t border-line">
                  <td className="px-4 py-3">
                    <code className="text-xs text-navy">{row.pageKey}</code>
                  </td>
                  <td className="px-4 py-3 text-muted">{row.label}</td>
                  <td className="px-4 py-3">{row.items}</td>
                  <td className="px-4 py-3">
                    {!row.collection ? (
                      <span className="text-xs text-amber-700">Not in CMS yet</span>
                    ) : row.published === false ? (
                      <span className="text-xs text-muted">Draft</span>
                    ) : (
                      <span className="text-xs text-emerald-700">Published</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-sm font-semibold text-navy underline"
                      disabled={ensureMut.isPending}
                      onClick={() => openEdit(row.pageKey, row.collection)}
                    >
                      {row.collection ? "Edit" : "Add FAQs"}
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy">
                {editing.id ? "Edit page FAQs" : "New FAQ collection"}
              </h2>
              <button type="button" className="text-2xl text-muted" onClick={() => setEditing(null)}>
                ×
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Page key</span>
                <input
                  value={editing.pageKey || ""}
                  onChange={(e) => setEditing({ ...editing, pageKey: e.target.value })}
                  placeholder="skills-in-demand-visa, homepage, about…"
                  className="h-10 w-full rounded-lg border border-line px-3 text-sm"
                  disabled={!!editing.id}
                />
                <span className="mt-1 block text-[11px] text-muted">
                  Must match the page URL slug (same as Website content route key). Homepage uses{" "}
                  <code>homepage</code>.
                </span>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Section title</span>
                <input
                  value={editing.title || ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="h-10 w-full rounded-lg border border-line px-3 text-sm"
                />
              </label>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.published !== false}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
              />
              Published on public site
            </label>
            <div className="mt-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">Questions</div>
              {(editing.items || []).map((item, i) => (
                <div key={i} className="rounded-xl border border-line p-3">
                  <input
                    value={item.q}
                    onChange={(e) => patchItem(i, { q: e.target.value })}
                    placeholder="Question"
                    className="mb-2 h-10 w-full rounded-lg border border-line px-3 text-sm"
                  />
                  <textarea
                    value={item.a}
                    onChange={(e) => patchItem(i, { a: e.target.value })}
                    placeholder="Answer"
                    rows={3}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm"
                  />
                  <button type="button" className="mt-2 text-xs text-red-600 underline" onClick={() => removeItem(i)}>
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" className="text-sm font-semibold text-navy underline" onClick={addItem}>
                + Add question
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-pri"
                disabled={saveMut.isPending}
                onClick={() => saveMut.mutate(editing)}
              >
                {saveMut.isPending ? "Saving…" : "Save"}
              </button>
              {editing.id && (
                <button
                  type="button"
                  className="btn border border-red-200 text-red-700"
                  disabled={deleteMut.isPending}
                  onClick={() => {
                    if (window.confirm("Delete this FAQ collection?")) deleteMut.mutate(editing.id!);
                  }}
                >
                  Delete
                </button>
              )}
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
