import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, PenLine, ShieldCheck, Sparkles } from "lucide-react";
import heroGift from "@/assets/hero-gift.jpg";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "אודות · מתנות — חנות המתנות בין צרפת לישראל" },
      {
        name: "description",
        content: "רחוקים מהעין, קרובים ללב. מתנות יוקרה מעוצבות עם ברכה אישית, לכל פינה בישראל.",
      },
      { property: "og:title", content: "אודות · מתנות" },
      {
        property: "og:description",
        content: "רחוקים מהעין, קרובים ללב.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: Sparkles, title: "aboutV1t", body: "aboutV1" },
  { icon: Gift, title: "aboutV2t", body: "aboutV2" },
  { icon: PenLine, title: "aboutV3t", body: "aboutV3" },
  { icon: ShieldCheck, title: "aboutV4t", body: "aboutV4" },
] as const;

function AboutPage() {
  const { t } = useI18n();
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute top-20 -end-40 size-[460px] rounded-full bg-gold-2/15 blur-[140px]" />

      <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-16 pb-16 lg:grid-cols-2">
        <div>
          <p className="text-xs tracking-widest text-ivory/50">{t("aboutTitle")}</p>
          <h1 className="mt-3 font-heb text-4xl font-bold leading-tight text-gold-2 sm:text-5xl">{t("aboutLead")}</h1>
          <p className="mt-8 text-base leading-relaxed text-ivory/75">{t("aboutP1")}</p>
          <p className="mt-4 text-base leading-relaxed text-ivory/75">{t("aboutP2")}</p>
          <p className="mt-8 border-s-2 border-gold ps-4 font-heb text-2xl text-ivory">{t("aboutP3")}</p>
          <p className="mt-6 text-base leading-relaxed text-ivory/75">{t("aboutP4")}</p>
        </div>
        <img
          src={heroGift}
          alt={t("aboutLead")}
          loading="lazy"
          width={1024}
          height={1280}
          className="aspect-[4/5] w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-white/10"
        />
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-16">
        <h2 className="font-heb text-3xl font-bold text-ivory">{t("aboutValuesTitle")}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <span className="grid size-11 place-items-center rounded-full bg-gold/15 text-gold-2">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-heb text-xl text-ivory">{t(title)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/65">{t(body)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-[2rem] border border-gold/25 bg-gold/10 px-6 py-12 text-center">
          <p className="mx-auto max-w-2xl font-heb text-2xl leading-snug text-ivory sm:text-3xl">{t("aboutClosing")}</p>
          <Link
            to="/"
            className="mt-8 inline-block rounded-full bg-gold px-7 py-3 text-sm font-semibold text-navy transition hover:bg-gold-2"
          >
            {t("ctaBrowse")}
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-24">
        <h2 className="font-heb text-2xl font-bold text-ivory">{t("howTitle")}</h2>
        <ol className="mt-5 grid grid-cols-3 gap-3 sm:gap-5">
          {[
            [t("how1"), t("how1t")],
            [t("how2"), t("how2t")],
            [t("how3"), t("how3t")],
          ].map(([title, sub], i) => (
            <li
              key={title}
              className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:gap-4 sm:p-4"
            >
              <span className="font-display text-2xl leading-none text-gold/70 sm:text-3xl">{i + 1}</span>
              <span>
                <span className="block font-heb text-sm text-ivory sm:text-base">{title}</span>
                <span className="block text-xs text-ivory/55">{sub}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
