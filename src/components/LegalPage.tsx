import type { ReactNode } from "react";
import { useI18n, type L } from "@/lib/i18n";
import { useSettings, whatsappNumber } from "@/lib/settings";
import { useCurrency } from "@/lib/currency";

export type LegalSection = { title: L; body: L[] };

// Shared layout for the policy pages. Paragraphs may contain {email},
// {phone}, {shipping} and {coordinator}, filled from the admin settings.
export function LegalPage({
  title,
  updated,
  sections,
  intro,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
  intro?: ReactNode;
}) {
  const { t, tl, lang } = useI18n();
  const { contact, shippingFee } = useSettings();
  const { money } = useCurrency();
  const locale = lang === "he" ? "he-IL" : lang === "fr" ? "fr-FR" : "en-GB";
  const pending = <span className="text-navy/70">{t("contactPending")}</span>;

  const fill = (text: string) =>
    text.split(/(\{email\}|\{phone\}|\{shipping\}|\{coordinator\})/).map((part, i) => {
      if (part === "{email}")
        return contact.email ? (
          <a key={i} href={`mailto:${contact.email}`} dir="ltr" className="text-gold-deep underline">
            {contact.email}
          </a>
        ) : (
          <span key={i}>{pending}</span>
        );
      if (part === "{phone}")
        return contact.phone ? (
          <a
            key={i}
            href={`https://wa.me/${whatsappNumber(contact.phone)}`}
            target="_blank"
            rel="noopener"
            dir="ltr"
            className="text-gold-deep underline"
          >
            {contact.phone}
          </a>
        ) : (
          <span key={i}>{pending}</span>
        );
      if (part === "{shipping}") return <span key={i}>{money(shippingFee)}</span>;
      if (part === "{coordinator}")
        return <span key={i}>{contact.accessibilityCoordinator || pending}</span>;
      return part;
    });

  return (
    <main className="mx-auto max-w-3xl px-6 pt-14 pb-24">
      <h1 className="font-heb text-4xl font-bold text-navy">{title}</h1>
      <p className="mt-2 text-xs text-navy/70">
        {t("privacyUpdated")}: {new Date(`${updated}T12:00`).toLocaleDateString(locale)}
      </p>
      {intro}
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title.en}>
            <h2 className="font-heb text-xl text-gold-deep">{tl(s.title)}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-navy/80">
              {s.body.map((p, i) => (
                <p key={i}>{fill(tl(p))}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
