import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSettings, whatsappNumber } from "@/lib/settings";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "צור קשר · מתנות" },
      { name: "description", content: "שאלה על מתנה, הזמנה או משלוח? כתבו לנו במייל או בוואטסאפ." },
    ],
  }),
  component: ContactPage,
});

const card =
  "flex items-center gap-4 rounded-2xl border border-navy/10 bg-white/70 p-5 transition hover:border-gold/60 hover:shadow-lg hover:shadow-navy/5";
const icon = "grid size-12 shrink-0 place-items-center rounded-full bg-navy text-gold-2";

function ContactPage() {
  const { t } = useI18n();
  const { contact, isLoading } = useSettings();
  const has = contact.email || contact.phone;

  return (
    <main className="mx-auto max-w-2xl px-6 pt-14 pb-24">
      <h1 className="font-heb text-4xl font-bold text-navy">{t("contactTitle")}</h1>
      <span aria-hidden className="mt-2 block h-0.5 w-16 rounded-full bg-gold" />
      <p className="mt-6 text-navy/75">{t("contactIntro")}</p>

      <div className="mt-8 space-y-4">
        {contact.phone && (
          <a
            href={`https://wa.me/${whatsappNumber(contact.phone)}`}
            target="_blank"
            rel="noopener"
            className={card}
          >
            <span className={icon}>
              <MessageCircle className="size-5" />
            </span>
            <span>
              <span className="block font-heb text-lg text-navy">{t("contactWhatsapp")}</span>
              <span className="block text-sm text-navy/65" dir="ltr">
                {contact.phone}
              </span>
            </span>
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className={card}>
            <span className={icon}>
              <Phone className="size-5" />
            </span>
            <span>
              <span className="block font-heb text-lg text-navy">{t("contactCall")}</span>
              <span className="block text-sm text-navy/65" dir="ltr">
                {contact.phone}
              </span>
            </span>
          </a>
        )}
        {contact.email && (
          <a href={`mailto:${contact.email}`} className={card}>
            <span className={icon}>
              <Mail className="size-5" />
            </span>
            <span>
              <span className="block font-heb text-lg text-navy">{t("contactEmailUs")}</span>
              <span className="block text-sm text-navy/65" dir="ltr">
                {contact.email}
              </span>
            </span>
          </a>
        )}
        {!isLoading && !has && (
          <p className="rounded-2xl border border-gold/30 bg-gold/10 p-5 text-sm text-navy/80">
            {t("contactNotYet")}
          </p>
        )}
      </div>

      {has && <p className="mt-6 text-xs text-navy/70">{t("contactOrderTip")}</p>}
    </main>
  );
}
