import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSiteContent, resetSiteContent, updateSiteContent } from "@/lib/api";

type SiteContent = Record<string, unknown>;

const TABS = [
  ["hero", "Hero"],
  ["startingPoints", "Starting points"],
  ["visaCategories", "Visa categories"],
  ["stats", "Stats bar"],
  ["process", "How we work"],
  ["difference", "Difference banner"],
  ["news", "News"],
  ["founderCta", "Journey CTA"],
  ["offices", "Offices"],
  ["faq", "FAQ"],
  ["newsletter", "Newsletter"],
  ["trustBar", "Trust bar"],
] as const;

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-line px-3 text-sm"
        />
      )}
    </label>
  );
}

export default function HomepageCMSPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["site-content"], queryFn: getSiteContent });
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("hero");
  const [draft, setDraft] = useState<SiteContent | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (data) setDraft(JSON.parse(JSON.stringify(data)));
  }, [data]);

  const saveMut = useMutation({
    mutationFn: (body: SiteContent) => updateSiteContent(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-content"] });
      setMsg("Saved — changes appear on the public site within a minute.");
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const resetMut = useMutation({
    mutationFn: resetSiteContent,
    onSuccess: (fresh) => {
      setDraft(JSON.parse(JSON.stringify(fresh)));
      qc.invalidateQueries({ queryKey: ["site-content"] });
      setMsg("Reset to defaults.");
    },
  });

  if (isLoading || !draft) {
    return <div className="p-8 text-sm text-muted">Loading homepage content…</div>;
  }

  const hero = (draft.hero || {}) as Record<string, string>;
  const newsletter = (draft.newsletter || {}) as Record<string, string>;
  const difference = (draft.difference || {}) as Record<string, string>;
  const founderCta = (draft.founderCta || {}) as Record<string, string>;
  const faq = (draft.faq || {}) as { title?: string; items?: { q: string; a: string }[] };
  const news = (draft.news || {}) as {
    eyebrow?: string;
    title?: string;
    featured?: Record<string, string>;
    items?: Record<string, string>[];
  };

  function patch(section: string, value: unknown) {
    setDraft((d) => ({ ...d!, [section]: value }));
  }

  function patchHero(key: string, value: string) {
    patch("hero", { ...hero, [key]: value });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Website</p>
          <h1 className="text-2xl font-bold text-navy">Homepage content</h1>
          <p className="mt-1 text-sm text-muted">
            Edit public homepage copy, FAQ, offices, news highlights and newsletter banner.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => resetMut.mutate()}
            disabled={resetMut.isPending}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-navy"
          >
            Reset defaults
          </button>
          <button
            type="button"
            onClick={() => saveMut.mutate(draft)}
            disabled={saveMut.isPending}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white"
          >
            {saveMut.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {msg && <p className="mb-4 rounded-lg bg-surface px-4 py-3 text-sm text-navy">{msg}</p>}

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              tab === id ? "bg-navy text-white" : "bg-surface text-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-line bg-white p-6">
        {tab === "hero" && (
          <>
            <Field label="Badge" value={hero.badge || ""} onChange={(v) => patchHero("badge", v)} />
            <Field label="Headline" value={hero.headline || ""} onChange={(v) => patchHero("headline", v)} />
            <Field
              label="Headline accent"
              value={hero.headlineAccent || ""}
              onChange={(v) => patchHero("headlineAccent", v)}
            />
            <Field label="Subtext" value={hero.subtext || ""} onChange={(v) => patchHero("subtext", v)} multiline />
            <Field label="Primary CTA" value={hero.primaryCta || ""} onChange={(v) => patchHero("primaryCta", v)} />
            <Field
              label="Primary CTA link"
              value={hero.primaryCtaHref || ""}
              onChange={(v) => patchHero("primaryCtaHref", v)}
            />
            <Field
              label="Secondary CTA"
              value={hero.secondaryCta || ""}
              onChange={(v) => patchHero("secondaryCta", v)}
            />
            <Field
              label="Secondary CTA link"
              value={hero.secondaryCtaHref || ""}
              onChange={(v) => patchHero("secondaryCtaHref", v)}
            />
          </>
        )}

        {tab === "newsletter" && (
          <>
            <Field label="Eyebrow" value={newsletter.eyebrow || ""} onChange={(v) => patch("newsletter", { ...newsletter, eyebrow: v })} />
            <Field label="Title" value={newsletter.title || ""} onChange={(v) => patch("newsletter", { ...newsletter, title: v })} />
            <Field
              label="Subtext"
              value={newsletter.subtext || ""}
              onChange={(v) => patch("newsletter", { ...newsletter, subtext: v })}
              multiline
            />
            <Field
              label="Button label"
              value={newsletter.buttonLabel || ""}
              onChange={(v) => patch("newsletter", { ...newsletter, buttonLabel: v })}
            />
          </>
        )}

        {tab === "difference" && (
          <>
            <Field label="Title" value={difference.title || ""} onChange={(v) => patch("difference", { ...difference, title: v })} />
            <Field
              label="Subtext"
              value={difference.subtext || ""}
              onChange={(v) => patch("difference", { ...difference, subtext: v })}
              multiline
            />
            <Field label="CTA" value={difference.cta || ""} onChange={(v) => patch("difference", { ...difference, cta: v })} />
            <Field label="CTA link" value={difference.ctaHref || ""} onChange={(v) => patch("difference", { ...difference, ctaHref: v })} />
          </>
        )}

        {tab === "founderCta" && (
          <>
            <Field label="Title" value={founderCta.title || ""} onChange={(v) => patch("founderCta", { ...founderCta, title: v })} />
            <Field
              label="Subtext"
              value={founderCta.subtext || ""}
              onChange={(v) => patch("founderCta", { ...founderCta, subtext: v })}
              multiline
            />
            <Field label="CTA" value={founderCta.cta || ""} onChange={(v) => patch("founderCta", { ...founderCta, cta: v })} />
            <Field label="CTA link" value={founderCta.ctaHref || ""} onChange={(v) => patch("founderCta", { ...founderCta, ctaHref: v })} />
          </>
        )}

        {tab === "faq" && (
          <>
            <Field label="Section title" value={faq.title || ""} onChange={(v) => patch("faq", { ...faq, title: v })} />
            {(faq.items || []).map((item, i) => (
              <div key={i} className="rounded-xl border border-line p-4">
                <Field
                  label={`Question ${i + 1}`}
                  value={item.q}
                  onChange={(v) => {
                    const items = [...(faq.items || [])];
                    items[i] = { ...items[i], q: v };
                    patch("faq", { ...faq, items });
                  }}
                />
                <div className="mt-2">
                  <Field
                    label="Answer"
                    value={item.a}
                    onChange={(v) => {
                      const items = [...(faq.items || [])];
                      items[i] = { ...items[i], a: v };
                      patch("faq", { ...faq, items });
                    }}
                    multiline
                  />
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "news" && (
          <>
            <Field label="Eyebrow" value={news.eyebrow || ""} onChange={(v) => patch("news", { ...news, eyebrow: v })} />
            <Field label="Title" value={news.title || ""} onChange={(v) => patch("news", { ...news, title: v })} />
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Featured article</p>
            {(["title", "excerpt", "date", "category", "slug"] as const).map((k) => (
              <Field
                key={k}
                label={k}
                value={(news.featured || {})[k] || ""}
                onChange={(v) =>
                  patch("news", { ...news, featured: { ...(news.featured || {}), [k]: v } })
                }
                multiline={k === "excerpt"}
              />
            ))}
          </>
        )}

        {["startingPoints", "visaCategories", "stats", "process", "offices", "trustBar"].includes(tab) && (
          <div>
            <p className="mb-2 text-sm text-muted">
              Edit this section as JSON. Save to publish to the public site.
            </p>
            <textarea
              value={JSON.stringify(draft[tab], null, 2)}
              onChange={(e) => {
                try {
                  patch(tab, JSON.parse(e.target.value));
                } catch {
                  /* ignore while typing invalid JSON */
                }
              }}
              rows={18}
              className="w-full rounded-lg border border-line bg-surface p-3 font-mono text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}
