import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { useI18n } from "@/lib/i18n";
import { LEGAL_UPDATED, termsSections } from "@/lib/legal";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "תקנון · מתנות" },
      { name: "description", content: "תנאי ההזמנה, הביטולים והאחריות באתר." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { t } = useI18n();
  return <LegalPage title={t("termsTitle")} updated={LEGAL_UPDATED} sections={termsSections} />;
}
