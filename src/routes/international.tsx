import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { field } from "@/components/site";
import { SimpleForm } from "@/components/simple-form";
import { seo } from "@/lib/seo";
import { z } from 'zod';
export const Route = createFileRoute("/international")({ head: () => seo("International orders — Niché", "Outside Ghana? Request a shipping quote before you pay."), component: Intl });
function Intl() {
  const { t } = useI18n();
  return (
    <section className="wrap max-w-[640px] pt-14 md:pt-20">
      <h1 className="page-title">{t("intl_title")}</h1><p className="mt-5 text-lg text-muted-foreground">{t("intl_lead")}</p>
      <SimpleForm done={t("intl_done")} onSend={async (f) => {
        const g = (k: string) => String(f.get(k) ?? "").trim();
        const parsed=z.object({name:z.string().min(2).max(120),email:z.string().email().max(254),phone:z.string().max(40),country:z.string().min(2).max(100),city:z.string().max(100),items:z.string().min(3).max(5000)}).safeParse({name:g('name'),email:g('email'),phone:g('phone'),country:g('country'),city:g('city'),items:g('items')});
        if(!parsed.success)return false;
        const { error } = await supabase.from("quote_requests").insert(parsed.data);
        return !error;
      }}>
        <input name="name" className={field} placeholder={t("full_name")} aria-label={t("full_name")} />
        <input name="email" type="email" className={field} placeholder="Email" aria-label="Email" />
        <input name="phone" className={field} placeholder={t("phone")} aria-label={t("phone")} />
        <div className="grid gap-3 sm:grid-cols-2"><input name="country" className={field} placeholder={t("country")} aria-label={t("country")} /><input name="city" className={field} placeholder={t("city")} aria-label={t("city")} /></div>
        <textarea name="items" rows={4} className={`${field} h-auto py-3`} placeholder={t("items_wanted")} aria-label={t("items_wanted")} />
      </SimpleForm>
    </section>
  );
}
