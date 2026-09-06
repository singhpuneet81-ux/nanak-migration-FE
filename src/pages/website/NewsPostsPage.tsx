import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createNews, deleteNews, fdate, getNews, updateNews } from "@/lib/api";
import { toast } from "@/lib/utils";

type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  standfirst: string;
  body: string;
  category: string;
  tags: string[];
  relatedRoute: string;
  status: "draft" | "published";
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  featured?: boolean;
  readTime?: string;
};

const CATEGORIES = [
  "Policy changes",
  "Occupation lists",
  "Fees & thresholds",
  "Case outcomes",
  "Firm news",
  "General",
];

const EMPTY: Partial<NewsArticle> = {
  slug: "",
  title: "",
  standfirst: "",
  body: "",
  category: "Policy changes",
  tags: [],
  relatedRoute: "",
  status: "draft",
  author: "Nanak Migration Group",
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
  featured: false,
  readTime: "3 min read",
};

function Field({
  label,
  value,
  onChange,
  multiline,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {hint ? <span className="mb-1 block text-[11px] text-muted/80">{hint}</span> : null}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-line px-3 text-sm"
        />
      )}
    </label>
  );
}

export default function NewsPostsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<Partial<NewsArticle> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["news", filter, statusFilter],
    queryFn: () =>
      getNews({
        ...(filter ? { search: filter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  });

  const saveMut = useMutation({
    mutationFn: async (post: Partial<NewsArticle>) => {
      const body = {
        ...post,
        featured: Boolean(post.featured),
        tags:
          typeof post.tags === "string"
            ? String(post.tags)
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : post.tags,
      };
      if (post.id) return updateNews(post.id, body);
      return createNews(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news"] });
      setEditing(null);
      toast("News article saved — live on /news when published");
    },
    onError: (e: Error) => toast(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteNews(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news"] });
      setEditing(null);
      toast("News article deleted");
    },
    onError: (e: Error) => toast(e.message),
  });

  const articles = data?.news ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">Immigration news</h1>
          <p className="mt-1 text-sm text-muted">
            Publish policy updates for the public /news hub. Only published articles appear on the website.
          </p>
        </div>
        <button type="button" className="btn btn-pri" onClick={() => setEditing({ ...EMPTY })}>
          New article
        </button>
      </div>

      <div className="filters-bar flex flex-wrap gap-2">
        <input
          placeholder="Search title or slug…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 min-w-[200px] flex-1 rounded-lg border border-line px-3 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-line px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
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
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-muted">
                  No news articles yet. Create one to populate the public Immigration News page.
                </td>
              </tr>
            ) : (
              articles.map((n) => (
                <tr key={n.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy">
                      {n.title}
                      {n.featured ? (
                        <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-navy">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted">/news/{n.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{n.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        n.status === "published" ? "bg-mint/30 text-navy" : "bg-lavender/40 text-navy"
                      }`}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{fdate(n.updatedAt ?? n.publishedAt ?? null)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="text-sm font-semibold text-navy underline" onClick={() => setEditing(n)}>
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy">{editing.id ? "Edit article" : "New article"}</h2>
              <button type="button" className="text-2xl text-muted" onClick={() => setEditing(null)}>
                ×
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title" value={editing.title || ""} onChange={(v) => setEditing({ ...editing, title: v })} />
              <Field label="Slug" value={editing.slug || ""} onChange={(v) => setEditing({ ...editing, slug: v })} />
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Category</span>
                <select
                  value={editing.category || "Policy changes"}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="h-10 w-full rounded-lg border border-line px-3 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">Status</span>
                <select
                  value={editing.status || "draft"}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as "draft" | "published" })}
                  className="h-10 w-full rounded-lg border border-line px-3 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <Field
                label="Tags (comma-separated)"
                value={Array.isArray(editing.tags) ? editing.tags.join(", ") : ""}
                onChange={(v) => setEditing({ ...editing, tags: v.split(",").map((t) => t.trim()) })}
              />
              <Field
                label="Read time"
                value={editing.readTime || ""}
                onChange={(v) => setEditing({ ...editing, readTime: v })}
              />
              <Field
                label="Related guide route"
                value={editing.relatedRoute || ""}
                onChange={(v) => setEditing({ ...editing, relatedRoute: v })}
                hint="Optional path key, e.g. skills-in-demand-visa"
              />
              <label className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={Boolean(editing.featured)}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                />
                <span className="text-sm font-semibold text-navy">Featured on /news</span>
              </label>
            </div>
            <div className="mt-3 space-y-3">
              <Field
                label="Standfirst / summary"
                value={editing.standfirst || ""}
                onChange={(v) => setEditing({ ...editing, standfirst: v })}
                multiline
              />
              <Field
                label="Body (HTML)"
                value={editing.body || ""}
                onChange={(v) => setEditing({ ...editing, body: v })}
                multiline
                hint="Paste HTML. Shows on /news/{slug}."
              />
              <Field label="Cover / OG image URL" value={editing.ogImage || ""} onChange={(v) => setEditing({ ...editing, ogImage: v })} />
              <Field label="SEO title" value={editing.seoTitle || ""} onChange={(v) => setEditing({ ...editing, seoTitle: v })} />
              <Field
                label="SEO description"
                value={editing.seoDescription || ""}
                onChange={(v) => setEditing({ ...editing, seoDescription: v })}
                multiline
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn btn-pri" disabled={saveMut.isPending} onClick={() => saveMut.mutate(editing)}>
                {saveMut.isPending ? "Saving…" : "Save"}
              </button>
              {editing.id && (
                <button
                  type="button"
                  className="btn border border-red-200 text-red-700"
                  disabled={deleteMut.isPending}
                  onClick={() => {
                    if (window.confirm("Delete this news article?")) deleteMut.mutate(editing.id!);
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
