import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { useI18n } from "@/lib/i18n";
import { PRIVACY_UPDATED, privacySections } from "@/lib/privacy";

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
  const { t } = useI18n();
  return <LegalPage title={t("privacyTitle")} updated={PRIVACY_UPDATED} sections={privacySections} />;
}
