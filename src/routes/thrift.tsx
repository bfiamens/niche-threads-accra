import { createFileRoute, Link } from "@tanstack/react-router";
import { Catalog } from "@/components/catalog";
import { useI18n } from "@/lib/i18n";
import { seo } from "@/lib/seo";

type S = { category?: string; show?: string };
export const Route = createFileRoute("/thrift")({
  validateSearch: (s: Record<string, unknown>): S => ({ ...(typeof s['category'] === "string" ? { category: s['category'] } : {}) }),
  head: () => seo("The Thrift corner — Niché", "One-of-one pre-loved pieces, each measured, graded and photographed. A small corner of the Niché fashion shop."),
  component: Thrift,
});

function Thrift() {
  const { t } = useI18n();
  const { category } = Route.useSearch();
  return (
    <Catalog to="/thrift" kind="thrift" category={category} title={t("thrift_title")} lead={t("thrift_lead")}
      extra={<Link to="/help" hash="grading" className="mt-4 inline-block text-sm underline">{t("thrift_guide")}</Link>} />
  );
}
