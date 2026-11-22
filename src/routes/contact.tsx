import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { settingsQuery } from "@/lib/store";
import { field } from "@/components/site";
import { SimpleForm } from "@/components/simple-form";
import { seo } from "@/lib/seo";
import { z } from 'zod';
import { useCart } from '@/lib/cart';
import { productsQuery, productName, money } from '@/lib/store';
export const Route = createFileRoute("/contact")({ head: () => seo("Contact — Niché", "Send Niché a message about sizing, orders or a piece."), component: Contact });
function Contact() {
  const { t,locale } = useI18n(); const s = useQuery(settingsQuery).data;
  const cart=useCart();const products=useQuery(productsQuery).data??[];
  const bag=cart.lines.flatMap(l=>{const p=products.find(p=>p.id===l.productId);return p?[`${productName(p,locale)} · ${l.size} × ${l.qty} · ${money(p.price_ghs)}`]:[];}).join('\n');
  return (
    <section className="wrap max-w-[640px] pt-14 md:pt-20">
      <h1 className="page-title">{t("contact_title")}</h1><p className="mt-5 text-lg text-muted-foreground">{t("contact_lead")}</p>
      <SimpleForm done={t("contact_done")} onSend={async (f) => {
        const parsed=z.object({name:z.string().trim().min(2).max(120),contact:z.string().trim().min(5).max(254),message:z.string().trim().min(3).max(5000)}).safeParse(Object.fromEntries(f));
        if(!parsed.success)return false;
        const delivery=String(f.get('delivery')??'');
        const message=delivery&&s?.delivery_options.includes(delivery)?`${parsed.data.message}\nDelivery preference: ${delivery}`:parsed.data.message;
        if(message.length>5000)return false;
        const { error } = await supabase.from("contact_messages").insert({...parsed.data,message});
        return !error;
      }}>
        <input name="name" required maxLength={120} className={field} placeholder={t("full_name")} aria-label={t("full_name")} />
        <input name="contact" required maxLength={254} className={field} placeholder={t("your_contact")} aria-label={t("your_contact")} />
        <textarea key={bag} name="message" required maxLength={5000} defaultValue={bag?`${locale==='de'?'Meine Tasche':'My bag'}:\n${bag}\n\n`:''} rows={5} className={`${field} h-auto py-3`} placeholder={t("message")} aria-label={t("message")} />
        {s&&s.delivery_options.length>0&&<label className="text-sm">{locale==='de'?'Gewünschte Lieferung':'Preferred delivery'}<select name="delivery" className={`${field} mt-2`}><option value="">{locale==='de'?'Bitte mit mir vereinbaren':'Arrange with me'}</option>{s.delivery_options.map(d=><option key={d} value={d}>{d==='personal'?(locale==='de'?'Persönliche Lieferung · Kumasi / KNUST':'Personal delivery · Kumasi / KNUST'):d==='ride'?(locale==='de'?'Fahrt vereinbaren · Kumasi / KNUST':'Arrange a ride · Kumasi / KNUST'):(locale==='de'?'Kurier':'Courier')}</option>)}</select></label>}
      </SimpleForm>
      {s && (s.contact_phone || s.contact_whatsapp || s.contact_email) && (
        <div className="mt-8 text-sm text-muted-foreground"><p className="font-medium text-foreground">{t("reach_us")}</p>
          {s.contact_phone && <p>{s.contact_phone}</p>}{s.contact_whatsapp && <p>WhatsApp: {s.contact_whatsapp}</p>}{s.contact_email && <p>{s.contact_email}</p>}</div>
      )}
    </section>
  );
}
