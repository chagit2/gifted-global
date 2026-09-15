import { createFileRoute } from "@tanstack/react-router";
import heroGift from "@/assets/hero-gift.jpg";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "אודות · מתנות — חנות המתנות בין צרפת לישראל" },
      {
        name: "description",
        content: "הסיפור והחזון שלנו: מקרבים לבבות בין יבשות, מתנה אחת בכל פעם.",
      },
      { property: "og:title", content: "אודות · מתנות" },
      {
        property: "og:description",
        content: "מקרבים לבבות בין יבשות — מתנות יוקרה עם מכתב אישי.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute top-20 -end-40 size-[460px] rounded-full bg-gold-2/15 blur-[140px]" />
      <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-16 pb-24 lg:grid-cols-2">
        <div>
          <h1 className="font-heb text-5xl font-bold leading-tight text-ivory">{t("aboutTitle")}</h1>
          <p className="mt-6 font-heb text-2xl text-gold-2">{t("aboutLead")}</p>
          <p className="mt-6 text-base leading-relaxed text-ivory/70">{t("aboutBody")}</p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              [t("how1"), t("how1t")],
              [t("how2"), t("how2t")],
              [t("how3"), t("how3t")],
            ].map(([title, sub]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <p className="font-heb text-lg text-ivory">{title}</p>
                <p className="mt-1 text-xs text-ivory/50">{sub}</p>
              </div>
            ))}
          </div>
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
    </main>
  );
}
