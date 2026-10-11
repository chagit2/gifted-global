import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import {
  budgetOptions,
  findGifts,
  occasionOptions,
  whoOptions,
  type Budget,
  type Option,
} from "@/lib/finder";
import { upcomingHoliday } from "@/lib/holidays";
import { useI18n, type L } from "@/lib/i18n";
import { useProducts, type Product } from "@/lib/products";

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "עזרו לי לבחור · מתנות" },
      { name: "description", content: "שלוש שאלות קצרות, ונמצא לכם את המתנה המתאימה." },
    ],
  }),
  component: FinderPage,
});

function FinderPage() {
  const { t, tl } = useI18n();
  const { live, isLoading } = useProducts();
  const [who, setWho] = useState<Option | null>(null);
  const [occasion, setOccasion] = useState<Option | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [preview, setPreview] = useState<Product | null>(null);
  const [boost, setBoost] = useState<string | undefined>();

  // The nearest holiday ranks first when the gift is for a holiday.
  useEffect(() => {
    setBoost(upcomingHoliday(new Date(), 120)?.slug);
  }, []);

  const step = !who ? 0 : !occasion ? 1 : !budget ? 2 : 3;
  const back = () => (step === 2 ? setOccasion(null) : step === 1 ? setWho(null) : undefined);
  const restart = () => {
    setWho(null);
    setOccasion(null);
    setBudget(null);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const questions: { title: string; options: { id: string; label: L }[]; pick: (id: string) => void }[] = [
    { title: t("finderWho"), options: whoOptions, pick: (id) => setWho(whoOptions.find((o) => o.id === id)!) },
    {
      title: t("finderOccasion"),
      options: occasionOptions,
      pick: (id) => setOccasion(occasionOptions.find((o) => o.id === id)!),
    },
    { title: t("finderBudget"), options: budgetOptions, pick: (id) => setBudget(budgetOptions.find((o) => o.id === id)!) },
  ];

  const result = who && occasion && budget ? findGifts(live, { who, occasion, budget }, boost) : null;

  return (
    <main className="relative mx-auto max-w-5xl px-6 pt-14 pb-24">
      <div className="pointer-events-none absolute -top-24 start-1/2 size-[420px] -translate-x-1/2 rounded-full bg-gold/15 blur-[120px]" />
      <p className="relative inline-flex items-center gap-2 text-sm text-gold-2">
        <Sparkles className="size-4" />
        {t("finderTitle")}
      </p>

      {step < 3 ? (
        <div key={step} className="relative animate-page-in">
          <div className="mt-6 flex gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-gold" : "bg-white/10"}`}
              />
            ))}
          </div>
          <p className="mt-6 text-xs text-ivory/50">
            {t("finderStep").replace("{n}", String(step + 1))}
          </p>
          <h1 className="mt-1 font-heb text-3xl font-bold text-ivory sm:text-4xl">
            {questions[step]!.title}
          </h1>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {questions[step]!.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => questions[step]!.pick(o.id)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 font-heb text-lg text-ivory backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/10 hover:text-gold-2"
              >
                {tl(o.label)}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="mt-8 inline-flex items-center gap-1.5 text-sm text-ivory/60 hover:text-gold-2"
            >
              <ArrowRight className="size-4 ltr:rotate-180" />
              {t("finderBack")}
            </button>
          )}
        </div>
      ) : (
        <div className="relative animate-page-in">
          <h1 className="mt-4 font-heb text-3xl font-bold text-ivory sm:text-4xl">
            {t(result?.exact ? "finderResults" : "finderNear")}
          </h1>
          <p className="mt-2 text-sm text-ivory/60">
            {tl(who!.label)} · {tl(occasion!.label)} · {tl(budget!.label)}
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-ivory transition hover:border-gold/50 hover:text-gold-2"
          >
            <RotateCcw className="size-4" />
            {t("finderRestart")}
          </button>

          {isLoading ? (
            <p className="mt-8 text-sm text-ivory/50">{t("loading")}</p>
          ) : result && result.gifts.length ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.gifts.map((p) => (
                <ProductCard key={p.id} product={p} onPreview={setPreview} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-ivory/60">
              {t("finderNone")}{" "}
              <Link to="/" className="text-gold-2 underline">
                {t("allGifts")}
              </Link>
            </p>
          )}
        </div>
      )}

      <ProductModal product={preview} onClose={() => setPreview(null)} onSelect={setPreview} />
    </main>
  );
}
