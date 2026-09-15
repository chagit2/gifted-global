import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="relative border-t border-white/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-xs text-ivory/50">
        <span>
          © {new Date().getFullYear()} {t("brandName")} · {t("footerRights")}
        </span>
        <div className="flex gap-5">
          <span>{t("terms")}</span>
          <span>{t("shippingLink")}</span>
          <span>{t("contact")}</span>
        </div>
      </div>
    </footer>
  );
}
