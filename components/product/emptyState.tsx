import { Link2, ShoppingBag } from "lucide-react";
import { t } from "@/lib/i18n";

type EmptyStateProps = {
  hasFilter: boolean;
  onAddClick: () => void;
};

const EmptyState = ({ hasFilter, onAddClick }: EmptyStateProps) => (
  <div
    className="flex flex-col items-center justify-center gap-5 px-8 py-24 text-center"
    role="status"
    aria-live="polite"
  >
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
      <ShoppingBag size={34} className="text-foreground-subtle" />
    </div>

    <div className="flex flex-col gap-1.5">
      <p className="text-base font-semibold text-foreground">
        {hasFilter ? t("empty.no_products_filtered") : t("empty.no_products")}
      </p>
      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground-muted">
        {hasFilter ? t("empty.no_products_filtered_desc") : t("empty.no_products_desc")}
      </p>
    </div>

    {!hasFilter && (
      <button
        type="button"
        onClick={onAddClick}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Link2 size={14} />
        {t("empty.go_to_input")}
      </button>
    )}
  </div>
);

export default EmptyState;
