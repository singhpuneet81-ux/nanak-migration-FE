import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncWebsiteContent } from "@/lib/api";
import { toast } from "@/lib/utils";

export default function WebsiteSyncBar() {
  const qc = useQueryClient();
  const syncMut = useMutation({
    mutationFn: syncWebsiteContent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-content"] });
      qc.invalidateQueries({ queryKey: ["blogs"] });
      qc.invalidateQueries({ queryKey: ["faqs"] });
      qc.invalidateQueries({ queryKey: ["seo-pages"] });
      toast("Website content synced — public site will reflect changes.");
    },
    onError: (e: Error) => toast(e.message),
  });

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-white to-lavender/40 px-4 py-3 shadow-soft">
      <div>
        <div className="text-sm font-bold text-navy">Website content</div>
        <p className="text-xs text-muted">
          Load exact blogs, FAQs and SEO from the live migration website. Edits here sync to the public site via API.
        </p>
      </div>
      <button
        type="button"
        className="btn btn-gold shrink-0"
        disabled={syncMut.isPending}
        onClick={() => syncMut.mutate()}
      >
        {syncMut.isPending ? "Syncing…" : "Sync from website"}
      </button>
    </div>
  );
}
