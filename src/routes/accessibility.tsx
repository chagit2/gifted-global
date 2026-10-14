import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { useI18n } from "@/lib/i18n";
import { LEGAL_UPDATED, a11ySections } from "@/lib/legal";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "הצהרת נגישות · מתנות" },
      { name: "description", content: "נגישות האתר ופרטי רכז/ת הנגישות." },
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  const { t } = useI18n();
  return <LegalPage title={t("a11yTitle")} updated={LEGAL_UPDATED} sections={a11ySections} />;
}
