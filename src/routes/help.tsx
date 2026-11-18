import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/help")({ head: () => seo("Help — Niché", "Delivery, payment, thrift grading and tracking at Niché."), component: Help });
function Help() {
  const { t } = useI18n();
  return (
    <section className="wrap max-w-[800px] pt-14 md:pt-20">
      <h1 className="page-title">{t("nav_help")}</h1>
      <p className="mt-6 text-muted-foreground">{t("why_2")}</p><p className="mt-3 text-muted-foreground">{t("why_3")}</p>
      <h2 id="grading" className="mt-12 text-[30px]">{t("guide_title")}</h2>
      <ul className="mt-4 space-y-2 text-muted-foreground"><li>{t("g_new")}</li><li>{t("g_exc")}</li><li>{t("g_vg")}</li><li>{t("g_good")}</li></ul>
      <div className="mt-10 flex flex-wrap gap-6 text-sm"><Link to="/track" className="underline">{t("nav_track")}</Link><Link to="/international" className="underline">{t("abroad_link")}</Link><Link to="/contact" className="underline">{t("contact_us")}</Link></div>
    </section>
  );
}
