import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useI18n, type TKey } from "@/lib/i18n";
import { settingsQuery, type Policies, type PolicyKey } from "@/lib/store";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/policies/$key")({ head: () => seo("Policies — Niché", "Delivery, returns, privacy and terms of sale at Niché."), component: Policy });
function Policy() {
  const { key } = Route.useParams(); const { t, locale } = useI18n();
  const s = useQuery(settingsQuery).data;
  const p = ((s?.policies ?? {}) as Policies)[key as PolicyKey];
  const text = (locale === "de" && p?.de) || p?.en;
  return (
    <section className="wrap max-w-[800px] pt-14 md:pt-20">
      <h1 className="page-title">{t(`p_${key}` as TKey) ?? key}</h1>
      <p className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">{s ? text || t("policy_pending") : t("loading")}</p>
    </section>
  );
}
