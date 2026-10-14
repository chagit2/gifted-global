import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { useI18n } from "@/lib/i18n";
import { LEGAL_UPDATED, shippingSections } from "@/lib/legal";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "מדיניות משלוחים · מתנות" },
      { name: "description", content: "לאן שולחים, תוך כמה זמן ובכמה." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  const { t } = useI18n();
  return <LegalPage title={t("shippingPolicyTitle")} updated={LEGAL_UPDATED} sections={shippingSections} />;
}
