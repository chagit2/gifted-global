import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="relative border-t border-white/5 print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs text-ivory/50">
        <span className="inline-flex items-center gap-1.5 text-gold-2/80">
          <MapPin className="size-3.5" />
          {t("shipsIsraelOnly")}
        </span>
        <span>
          © {new Date().getFullYear()} {t("brandName")} · {t("footerRights")}
        </span>
        <div className="flex gap-5">
          <Link to="/privacy" className="hover:text-gold-2">
            {t("privacyTitle")}
          </Link>
          <span>{t("terms")}</span>
          <span>{t("shippingLink")}</span>
          <span>{t("contact")}</span>
        </div>
      </div>
    </footer>
  );
}
