import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, Puzzle, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { useProducts, type Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { GiftBanner } from "@/components/GiftBanner";
import { HomeHero, PerksTicker } from "@/components/HomeHero";
import { ProductGridSkeleton } from "@/components/ProductGridSkeleton";
import { Ornament, Reveal } from "@/components/Reveal";

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
  const { t } = useI18n();
  const [preview, setPreview] = useState<Product | null>(null);
  const { live: gifts, items, isLoading, isError } = useProducts();

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-48 -end-40 size-[560px] rounded-full bg-gold/20 blur-[150px] animate-glow" />

      <HomeHero />
      <GiftBanner />
      <PerksTicker />

      <section className="relative mx-auto max-w-7xl px-6 pt-12 pb-20">
        {/* Two ways to send a gift: a ready-made box, or one designed item by item. */}
        {items.length > 0 && (
          <Reveal className="mb-10 grid gap-5 sm:grid-cols-2">
            <EntryCard
              to="/gifts"
              icon={<Gift className="size-7" />}
              title={t("entryReadyTitle")}
              text={t("entryReadyText")}
              cta={t("entryReadyCta")}
              images={gifts.slice(0, 3).map((p) => p.images[0]!)}
            />
            <EntryCard
              to="/build"
              icon={<Puzzle className="size-7" />}
              title={t("entryBuildTitle")}
              text={t("entryBuildText")}
              cta={t("entryBuildCta")}
              images={items.slice(0, 3).map((p) => p.images[0]!)}
              accent
            />
          </Reveal>
        )}
        <Reveal className="mb-14">
          <Link
            to="/find"
            className="group relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-gold/40 bg-navy p-6 shadow-xl shadow-navy/15 transition duration-300 hover:border-gold/80 hover:shadow-2xl hover:shadow-navy/25 sm:p-8"
          >
            {/* A soft gold light drifts across the band on hover. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -start-1/3 w-1/3 bg-gradient-to-r from-transparent via-gold-2/15 to-transparent opacity-0 transition-all duration-1000 group-hover:opacity-100 motion-safe:group-hover:start-full"
            />
            <div className="relative">
              <p className="font-heb text-2xl text-pearl sm:text-3xl">{t("finderCtaTitle")}</p>
              <p className="mt-1 text-sm text-gold-2/90">{t("finderCtaText")}</p>
            </div>
            <span className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-black/20 transition group-hover:bg-gold-2 group-active:scale-95">
              <Sparkles className="size-4 transition-transform duration-500 motion-safe:group-hover:rotate-12 motion-safe:group-hover:scale-110" />
              {t("finderTitle")}
            </span>
          </Link>
        </Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heb text-3xl font-bold text-navy sm:text-4xl">{t("allGifts")}</h2>
            <Ornament className="mt-3" />
          </div>
          <Link to="/gifts" className="text-sm font-semibold text-gold-deep underline-offset-4 hover:underline">
            {t("searchAndFilter")}
          </Link>
        </div>
        {isError ? (
          <p className="mt-8 text-sm text-red-600">{t("loadError")}</p>
        ) : isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gifts.map((p, i) => (
              <ProductCard key={p.id} product={p} onPreview={setPreview} index={i} />
            ))}
          </div>
        )}
      </section>

      <ProductModal product={preview} onClose={() => setPreview(null)} onSelect={setPreview} />
    </main>
  );
}

function EntryCard({
  to,
  icon,
  title,
  text,
  cta,
  images,
  accent,
}: {
  to: "/gifts" | "/build";
  icon: ReactNode;
  title: string;
  text: string;
  cta: string;
  images: string[];
  accent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group flex h-full flex-col rounded-2xl border p-6 shadow-lg transition duration-300 hover:shadow-2xl motion-safe:hover:-translate-y-1 ${
        accent
          ? "border-gold/60 bg-navy text-pearl shadow-navy/20 hover:border-gold"
          : "border-navy/10 bg-white/85 text-navy shadow-navy/5 hover:border-gold/60"
      }`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`grid size-14 shrink-0 place-items-center rounded-full ${
            accent ? "bg-gold text-navy" : "bg-navy text-gold-2"
          }`}
        >
          {icon}
        </span>
        <h2 className="font-heb text-2xl font-bold">{title}</h2>
      </div>
      <p className={`mt-3 text-sm leading-relaxed ${accent ? "text-pearl/85" : "text-navy/75"}`}>{text}</p>
      {images.length > 0 && (
        <div aria-hidden className="mt-4 flex -space-x-3 rtl:space-x-reverse">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className={`size-14 rounded-full object-cover ring-2 ${accent ? "ring-navy" : "ring-white"}`}
            />
          ))}
        </div>
      )}
      <span
        className={`mt-auto inline-flex min-h-11 w-fit items-center rounded-full px-5 text-sm font-semibold transition group-active:scale-95 ${
          accent ? "mt-5 bg-gold text-navy group-hover:bg-gold-2" : "mt-5 bg-navy text-pearl group-hover:bg-navy-3"
        }`}
      >
        {cta}
      </span>
    </Link>
  );
}
