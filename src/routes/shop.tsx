import { createFileRoute } from "@tanstack/react-router";
import { Catalog } from "@/components/catalog";
import { useI18n } from "@/lib/i18n";
import { seo } from "@/lib/seo";

type S = { category?: string; show?: string };
export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): S => ({
    ...(typeof s['category'] === "string" ? { category: s['category'] } : {}),
    ...(s['show'] === "new" || s['show'] === "thrift" ? { show: s['show'] } : {}),
  }),
  head: () => seo("Shop the collection — Niché", "Tops, bottoms, shoes and accessories, priced in Ghana cedis and delivered across Ghana."),
  component: Shop,
});

function Shop() {
  const { t } = useI18n();
  const { category, show } = Route.useSearch();
  return <Catalog to="/shop" kind={(show as "new" | "thrift") ?? "all"} category={category} show={show} title={t("shop_title")} lead={t("shop_lead")} />;
}
