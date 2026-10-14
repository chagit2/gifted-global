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
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";

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
    // overflow-x-clip keeps the soft glow from widening the page on phones.
    <main className="relative mx-auto max-w-5xl overflow-x-clip px-6 pt-14 pb-24">
      <div className="pointer-events-none absolute -top-24 inset-x-0 mx-auto size-[420px] max-w-full rounded-full bg-gold/15 blur-[120px]" />
      <p className="relative inline-flex items-center gap-2 text-sm text-gold-deep">
        <Sparkles className="size-4" />
        {t("finderTitle")}
      </p>

      {step < 3 ? (
        <div key={step} className="relative animate-page-in">
          <div className="mt-6 flex gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-gold" : "bg-white outline-1 -outline-offset-1 outline-navy/10"}`}
              />
            ))}
          </div>
          <p className="mt-6 text-xs text-navy/70">
            {t("finderStep").replace("{n}", String(step + 1))}
          </p>
          <h1 className="mt-1 font-heb text-3xl font-bold text-navy sm:text-4xl">
            {questions[step]!.title}
          </h1>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {questions[step]!.options.map((o, i) => (
              <button
                key={o.id}
                type="button"
                onClick={() => questions[step]!.pick(o.id)}
                style={{ animationDelay: `${i * 60}ms` }}
                className="rounded-2xl border border-navy/10 bg-white/70 px-4 py-6 font-heb text-lg text-navy backdrop-blur-xl transition duration-300 animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards hover:border-gold/60 hover:bg-gold/10 hover:text-gold-deep hover:shadow-lg hover:shadow-gold/15 active:scale-[0.97] motion-safe:hover:-translate-y-0.5 motion-reduce:animate-none"
              >
                {tl(o.label)}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="mt-8 inline-flex min-h-10 items-center gap-1.5 text-sm text-navy/70 hover:text-gold-deep"
            >
              <ArrowRight className="size-4 ltr:rotate-180" />
              {t("finderBack")}
            </button>
          )}
        </div>
      ) : (
        <div className="relative animate-page-in">
          <h1 className="mt-4 font-heb text-3xl font-bold text-navy sm:text-4xl">
            {t(result?.exact ? "finderResults" : "finderNear")}
          </h1>
          <p className="mt-2 text-sm text-navy/65">
            {tl(who!.label)} · {tl(occasion!.label)} · {tl(budget!.label)}
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-navy/15 px-4 py-2 text-sm text-navy transition hover:border-gold/50 hover:text-gold-deep"
          >
            <RotateCcw className="size-4" />
            {t("finderRestart")}
          </button>

          {isLoading ? (
            <ProductGridSkeleton count={3} />
          ) : result && result.gifts.length ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result.gifts.map((p, i) => (
                <ProductCard key={p.id} product={p} onPreview={setPreview} index={i} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-navy/65">
              {t("finderNone")}{" "}
              <Link to="/" className="text-gold-deep underline">
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
