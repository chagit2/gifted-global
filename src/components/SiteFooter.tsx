import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="relative border-t-2 border-gold/60 bg-navy print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-ivory/75">
        <span className="inline-flex items-center gap-1.5 text-gold-2/80">
          <MapPin className="size-3.5" />
          {t("shipsIsraelOnly")}
        </span>
        <span>
          © {new Date().getFullYear()} {t("brandName")} · {t("footerRights")}
        </span>
        <nav aria-label={t("footerNav")} className="flex flex-wrap gap-x-5 gap-y-2">
            {(
              [
                ["/terms", t("termsTitle")],
                ["/shipping", t("shippingLink")],
                ["/privacy", t("privacyTitle")],
                ["/accessibility", t("a11yTitle")],
                ["/contact", t("contact")],
              ] as const
            ).map(([to, label]) => (
              <Link key={to} to={to} className="transition hover:text-gold-2">
                {label}
              </Link>
            ))}
          </nav>
      </div>
    </footer>
  );
}
