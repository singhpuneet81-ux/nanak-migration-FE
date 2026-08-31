import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createFaq, deleteFaq, getFaqs, updateFaq } from "@/lib/api";
import { toast } from "@/lib/utils";

type FaqItem = { q: string; a: string; order?: number };
type FaqCollection = {
  id: string;
  pageKey: string;
  title: string;
  items: FaqItem[];
  published: boolean;
};

const EMPTY: Partial<FaqCollection> = {
  pageKey: "",
  title: "Frequently asked questions",
  items: [{ q: "", a: "", order: 0 }],
  published: true,
};

export default function FaqCMSPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<FaqCollection> | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["faqs"], queryFn: getFaqs });

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
      toast("FAQ collection saved");
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

  const collections = data?.collections ?? [];

  function patchItem(index: number, patch: Partial<FaqItem>) {
    if (!editing) return;
    const items = [...(editing.items || [])];
    items[index] = { ...items[index], ...patch };
    setEditing({ ...editing, items });
  }

  function addItem() {
    if (!editing) return;
    setEditing({ ...editing, items: [...(editing.items || []), { q: "", a: "", order: editing.items?.length || 0 }] });
  }

  function removeItem(index: number) {
    if (!editing) return;
    setEditing({ ...editing, items: (editing.items || []).filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title">FAQ collections</h1>
          <p className="mt-1 text-sm text-muted">Manage FAQs shown on homepage, resources and other pages.</p>
        </div>
        <button type="button" className="btn btn-pri" onClick={() => setEditing({ ...EMPTY })}>
          New collection
        </button>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : collections.length === 0 ? (
          <p className="text-sm text-muted">No FAQ collections yet.</p>
        ) : (
          collections.map((c) => (
            <div key={c.id} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-navy">{c.title}</div>
                  <div className="text-xs text-muted">
                    pageKey: <code>{c.pageKey}</code> · {c.items?.length || 0} items
                  </div>
                </div>
                <button type="button" className="text-sm font-semibold text-navy underline" onClick={() => setEditing(c)}>
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/40 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-line bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy">{editing.id ? "Edit FAQ collection" : "New FAQ collection"}</h2>
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
                  placeholder="homepage, resources, blog"
                  className="h-10 w-full rounded-lg border border-line px-3 text-sm"
                />
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
              <button type="button" className="btn btn-pri" disabled={saveMut.isPending} onClick={() => saveMut.mutate(editing)}>
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
