import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { PRIVACY_CONTACT_EMAIL, PRIVACY_UPDATED, privacySections } from "@/lib/privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "מדיניות פרטיות · מתנות" },
      { name: "description", content: "איזה מידע אנחנו אוספים, למה, ומה הזכויות שלכם." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { t, tl, lang } = useI18n();
  const locale = lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-GB";
  const email = PRIVACY_CONTACT_EMAIL || t("privacyEmailPending");

  return (
    <main className="mx-auto max-w-3xl px-6 pt-14 pb-24">
      <h1 className="font-heb text-4xl font-bold text-ivory">{t("privacyTitle")}</h1>
      <p className="mt-2 text-xs text-ivory/50">
        {t("privacyUpdated")}: {new Date(`${PRIVACY_UPDATED}T12:00`).toLocaleDateString(locale)}
      </p>
      <div className="mt-10 space-y-8">
        {privacySections.map((s) => (
          <section key={s.title.en}>
            <h2 className="font-heb text-xl text-gold-2">{tl(s.title)}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-ivory/75">
              {s.body.map((p, i) => {
                const text = tl(p);
                if (!text.includes("{email}")) return <p key={i}>{text}</p>;
                const [before, after] = text.split("{email}");
                return (
                  <p key={i}>
                    {before}
                    {PRIVACY_CONTACT_EMAIL ? (
                      <a href={`mailto:${email}`} dir="ltr" className="text-gold-2 underline">
                        {email}
                      </a>
                    ) : (
                      <span className="text-ivory/50">{email}</span>
                    )}
                    {after}
                  </p>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
