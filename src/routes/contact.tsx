import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { settingsQuery } from "@/lib/store";
import { field } from "@/components/site";
import { SimpleForm } from "@/components/simple-form";
import { seo } from "@/lib/seo";
export const Route = createFileRoute("/contact")({ head: () => seo("Contact — Niché", "Send Niché a message about sizing, orders or a piece."), component: Contact });
function Contact() {
  const { t } = useI18n(); const s = useQuery(settingsQuery).data;
  return (
    <section className="wrap max-w-[640px] pt-14 md:pt-20">
      <h1 className="page-title">{t("contact_title")}</h1><p className="mt-5 text-lg text-muted-foreground">{t("contact_lead")}</p>
      <SimpleForm done={t("contact_done")} onSend={async (f) => {
        const { error } = await supabase.from("contact_messages").insert({ name: String(f.get("name")).trim(), contact: String(f.get("contact")).trim(), message: String(f.get("message")).trim() });
        return !error;
      }}>
        <input name="name" className={field} placeholder={t("full_name")} aria-label={t("full_name")} />
        <input name="contact" className={field} placeholder={t("your_contact")} aria-label={t("your_contact")} />
        <textarea name="message" rows={5} className={`${field} h-auto py-3`} placeholder={t("message")} aria-label={t("message")} />
      </SimpleForm>
      {s && (s.contact_phone || s.contact_whatsapp || s.contact_email) && (
        <div className="mt-8 text-sm text-muted-foreground"><p className="font-medium text-foreground">{t("reach_us")}</p>
          {s.contact_phone && <p>{s.contact_phone}</p>}{s.contact_whatsapp && <p>WhatsApp: {s.contact_whatsapp}</p>}{s.contact_email && <p>{s.contact_email}</p>}</div>
      )}
    </section>
  );
}
