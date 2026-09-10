import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncWebsiteContent } from "@/lib/api";
import { toast } from "@/lib/utils";

export default function WebsiteSyncBar() {
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["site-content"] });
    qc.invalidateQueries({ queryKey: ["blogs"] });
    qc.invalidateQueries({ queryKey: ["faqs"] });
    qc.invalidateQueries({ queryKey: ["seo-pages"] });
  };

  const syncMut = useMutation({
    mutationFn: () => syncWebsiteContent({ restoreSeo: false }),
    onSuccess: () => {
      invalidate();
      toast("Missing defaults seeded only — existing SEO left untouched.");
    },
    onError: (e: Error) => toast(e.message),
  });

  const restoreMut = useMutation({
    mutationFn: () => syncWebsiteContent({ restoreSeo: true }),
    onSuccess: () => {
      invalidate();
      toast("SEO titles restored from code defaults (body/H1 preserved).");
    },
    onError: (e: Error) => toast(e.message),
  });

  const busy = syncMut.isPending || restoreMut.isPending;

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-white to-lavender/40 px-4 py-3 shadow-soft">
      <div>
        <div className="text-sm font-bold text-navy">Website content</div>
        <p className="text-xs text-muted">
          Seed missing blogs/FAQs/SEO only. Use Restore SEO after a bad sync — it never wipes H1/body/hero.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-ghost shrink-0"
          disabled={busy}
          onClick={() => {
            if (
              !window.confirm(
                "Restore all SEO titles and descriptions from code defaults? CMS H1, body and hero images are kept."
              )
            ) {
              return;
            }
            restoreMut.mutate();
          }}
        >
          {restoreMut.isPending ? "Restoring…" : "Restore SEO"}
        </button>
        <button
          type="button"
          className="btn btn-gold shrink-0"
          disabled={busy}
          onClick={() => syncMut.mutate()}
        >
          {syncMut.isPending ? "Syncing…" : "Sync missing only"}
        </button>
      </div>
    </div>
  );
}
