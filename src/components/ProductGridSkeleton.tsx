import { useI18n } from "@/lib/i18n";

// Gift-card shaped placeholders while the gifts load.
export function ProductGridSkeleton({ count = 6, className = "mt-8" }: { count?: number; className?: string }) {
  const { t } = useI18n();
  return (
    <div role="status" className={className}>
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="rounded-2xl border border-navy/10 bg-white/70 p-4">
            <div className="aspect-square w-full rounded-xl animate-shimmer" />
            <div className="mt-4 h-5 w-2/3 rounded-full animate-shimmer" />
            <div className="mt-2 h-3 w-1/2 rounded-full animate-shimmer" />
            <div className="mt-4 h-4 w-16 rounded-full animate-shimmer" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="h-10 rounded-full animate-shimmer" />
              <div className="h-10 rounded-full animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
