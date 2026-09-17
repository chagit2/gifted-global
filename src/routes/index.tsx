import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { categories, featured, type Product } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import heroGift from "@/assets/hero-gift.jpg";

export const Route = createFileRoute("/")({
  head: () => {
    const title = "מתנות · מתנות יוקרה עם מכתב אישי, משלוח עד הבית";
    const description =
      "בוחרים מתנה לחג, ליומולדת, לבר ובת מצווה או לתינוק, כותבים מכתב אישי, ואנחנו שולחים באריזת יוקרה עד הבית.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Index,
});

function Index() {
  const { t, tl } = useI18n();
  const [preview, setPreview] = useState<Product | null>(null);
  const topCats = categories.filter((c) =>
    ["bat-mitzvah", "bar-mitzvah", "hanukkah", "shabbat", "baby", "birthday-child"].includes(c.slug),
  );

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-48 -end-40 size-[560px] rounded-full bg-gold/20 blur-[150px] animate-glow" />

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pt-16 pb-24 lg:grid-cols-2">
        <div>
          <span className="inline-block rounded-full border border-gold/30 px-4 py-1 text-xs tracking-widest text-gold-2">
            {t("heroBadge")}
          </span>
          <h1 className="mt-6 font-heb text-5xl leading-tight font-bold text-ivory sm:text-6xl">
            {t("heroLine1")}
            <br />
            <span className="text-gold-2">{t("heroLine2")}</span>
            <br />
            {t("heroLine3")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/70">{t("heroText")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/c/$slug"
              params={{ slug: "bat-mitzvah" }}
              className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-navy transition hover:bg-gold-2"
            >
              {t("ctaBrowse")}
            </Link>
            <a
              href="#how"
              className="rounded-full border border-white/15 px-7 py-3 text-sm text-ivory transition hover:border-gold/50"
            >
              {t("ctaHow")}
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-xs text-ivory/60">
            <span>{t("statRating")}</span>
            <span>{t("statShipping")}</span>
            <span>{t("statLangs")}</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gold/10 blur-3xl" />
          <img
            src={heroGift}
            alt={t("heroLine1")}
            width={1024}
            height={1024}
            className="w-full rounded-[2rem] border border-white/10 object-cover shadow-2xl animate-floaty"
          />
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-20">
        <p className="text-xs tracking-widest text-ivory/50">{t("recommendedCats")}</p>
        <p className="mt-2 text-sm text-ivory/40">{t("catsNote")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {topCats.map((c) => (
            <Link
              key={c.slug}
              to="/c/$slug"
              params={{ slug: c.slug }}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-ivory backdrop-blur-xl transition hover:border-gold/50 hover:text-gold-2"
            >
              {tl(c.label)}
            </Link>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-20">
        <h2 className="font-heb text-3xl font-bold text-ivory">{t("suggested")}</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} onPreview={setPreview} />
          ))}
        </div>
      </section>

      <section id="how" className="relative mx-auto max-w-7xl px-6 pb-28">
        <h2 className="font-heb text-3xl font-bold text-ivory">{t("howTitle")}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            [t("how1"), t("how1t")],
            [t("how2"), t("how2t")],
            [t("how3"), t("how3t")],
          ].map(([title, sub], i) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
              <span className="font-display text-4xl text-gold/60">{i + 1}</span>
              <h3 className="mt-3 font-heb text-lg text-ivory">{title}</h3>
              <p className="mt-1 text-sm text-ivory/60">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <ProductModal product={preview} onClose={() => setPreview(null)} />
    </main>
  );
}
