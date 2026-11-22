import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { checkoutReady, hasBank, hasMomo, money, productName, productsQuery, settingsQuery } from "@/lib/store";
import { btn, field, LoadError } from "@/components/site";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

export const GH_REGIONS = ["Ashanti", "Greater Accra", "Ahafo", "Bono", "Bono East", "Central", "Eastern", "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West", "Volta", "Western", "Western North"];

export const Route = createFileRoute("/checkout")({
  head: () => seo("Checkout — Niché", "Place your order for delivery in Ghana and pay with Mobile Money or bank transfer."),
  component: Checkout,
});

function Checkout() {
  const { t, locale } = useI18n();
  const cart = useCart();
  const nav = useNavigate();
  const qc = useQueryClient();
  const pq = useQuery(productsQuery);
  const sq = useQuery(settingsQuery);
  const [zone, setZone] = useState<"kumasi" | "ghana">("kumasi");
  const [pay, setPay] = useState<"momo" | "bank" | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (pq.isError || sq.isError) return <section className="wrap max-w-[800px] pt-14"><LoadError onRetry={() => { pq.refetch(); sq.refetch(); }} /></section>;
  if (pq.isPending || sq.isPending) return <section className="wrap max-w-[800px] pt-14"><p className="text-muted-foreground">{t("loading")}</p></section>;
  const s = sq.data;
  if (!checkoutReady(s)) return (
    <section className="wrap max-w-[800px] pt-14"><h1 className="page-title">{t("checkout_title")}</h1><p className="my-8 text-muted-foreground">{t("checkout_closed")}</p><Link to="/contact" className={btn}>{t("contact_us")}</Link></section>
  );
  const byId = new Map(pq.data.map((p) => [p.id, p]));
  const rows = cart.lines.map((l) => ({ l, p: byId.get(l.productId) })).filter((r) => r.p);
  if (!rows.length) return (
    <section className="wrap max-w-[800px] pt-14"><h1 className="page-title">{t("checkout_title")}</h1><p className="my-8 text-muted-foreground">{t("bag_empty")}</p><Link to="/shop" className={btn}>{t("keep_shopping")}</Link></section>
  );
  const subtotal = rows.reduce((n, r) => n + Number(r.p!.price_ghs) * r.l.qty, 0);
  const fee = Number(zone === "kumasi" ? s.kumasi_fee : s.ghana_fee);
  const methods = ([["momo", t("pay_momo"), hasMomo(s)], ["bank", t("pay_bank"), hasBank(s)]] as const).filter((m) => m[2]);
  const method = pay ?? methods[0]?.[0] ?? "momo";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    if (v("customer_name").length < 2 || v("phone").replace(/\D/g, "").length < 9 || v("city").length < 2 || v("address").length < 3) {
      setErr(t("err_details")); return;
    }
    setBusy(true); setErr(null);
    const { data, error } = await supabase.rpc("place_order", {
      payload: {
        customer_name: v("customer_name"), phone: v("phone"), email: v("email"), region: v("region"), city: v("city"),
        address: v("address"), note: [v("note"),v('delivery_preference')&&`Delivery preference: ${v('delivery_preference')}`].filter(Boolean).join('\n'), zone, payment_method: method, locale,
        items: cart.lines.map((l) => ({ product_id: l.productId, size: l.size, qty: l.qty })),
      },
    });
    setBusy(false);
    if (error) {
      const stock = /out_of_stock|unavailable/.test(error.message);
      setErr(stock ? t("err_stock") : error.message.includes("invalid_details") ? t("err_details") : t("err_generic"));
      if (stock) qc.invalidateQueries({ queryKey: ["products"] });
      return;
    }
    const res = data as { token: string };
    cart.clear();
    qc.invalidateQueries({ queryKey: ["products"] });
    nav({ to: "/order/$token", params: { token: res.token }, search: { new: true } });
  }

  const opt = (on: boolean) => cn("flex cursor-pointer items-center gap-4 rounded-[14px] border p-4", on ? "border-foreground" : "border-border");
  return (
    <section className="wrap pt-14 md:pt-20">
      <h1 className="page-title">{t("checkout_title")}</h1>
      <form onSubmit={submit} className="mt-8 grid gap-12 md:grid-cols-[1.2fr_1fr]" noValidate>
        <div>
          <h2 className="text-[22px]">{t("your_details")}</h2>
          <div className="mt-4 grid gap-3">
            <input name="customer_name" className={field} placeholder={t("full_name")} aria-label={t("full_name")} autoComplete="name" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="phone" className={field} placeholder={t("phone")} aria-label={t("phone")} inputMode="tel" autoComplete="tel" required />
              <input name="email" type="email" className={field} placeholder={t("email")} aria-label={t("email")} autoComplete="email" />
            </div>
          </div>
          <h2 className="mt-10 text-[22px]">{t("delivery_where")}</h2>
          <div className="mt-4 grid gap-3">
            {([["kumasi", t("zone_kumasi"), s.kumasi_fee, s.kumasi_days], ["ghana", t("zone_ghana"), s.ghana_fee, s.ghana_days]] as const).map(([z, label, f, d]) => (
              <label key={z} className={opt(zone === z)}>
                <input type="radio" name="zone" checked={zone === z} onChange={() => setZone(z)} className="accent-current" />
                <span className="flex-1">{label}{d && <span className="block text-sm text-muted-foreground">{t("days")} {d}</span>}</span>
                <span>{money(f)}</span>
              </label>
            ))}
            <div className="grid gap-3 sm:grid-cols-2">
              <select name="region" className={field} aria-label={t("region")} defaultValue="Ashanti">
                {GH_REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
              <input name="city" className={field} placeholder={t("city")} aria-label={t("city")} required />
            </div>
            <input name="address" className={field} placeholder={t("address")} aria-label={t("address")} required />
            <textarea name="note" rows={2} className={cn(field, "h-auto py-3")} placeholder={t("order_note")} aria-label={t("order_note")} />
            {s.delivery_options.length>0&&<label className="text-sm">{locale==='de'?'Gewünschte Lieferung':'Preferred delivery'}<select name="delivery_preference" className={`${field} mt-2`}><option value="">{locale==='de'?'Bitte vereinbaren':'Arrange with me'}</option>{s.delivery_options.filter(d=>zone==='kumasi'||d==='courier').map(d=><option key={d} value={d}>{d==='personal'?(locale==='de'?'Persönliche Lieferung · Kumasi / KNUST':'Personal delivery · Kumasi / KNUST'):d==='ride'?(locale==='de'?'Fahrt vereinbaren':'Arrange a ride'):(locale==='de'?'Kurier':'Courier')}</option>)}</select></label>}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("abroad_q")} <Link to="/international" className="underline">{t("abroad_link")}</Link></p>
          <h2 className="mt-10 text-[22px]">{t("payment")}</h2>
          <div className="mt-4 grid gap-3">
            {methods.map(([m, label]) => (
              <label key={m} className={opt(method === m)}>
                <input type="radio" name="pay" checked={method === m} onChange={() => setPay(m)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t("pay_after")}</p>
        </div>
        <aside className="h-fit rounded-[22px] bg-secondary p-6 md:sticky md:top-24">
          {rows.map(({ l, p }) => (
            <div key={l.productId + l.size} className="flex justify-between gap-4 py-2 text-sm">
              <span>{productName(p!, locale)}{l.size && ` · ${l.size}`} × {l.qty}</span><span>{money(Number(p!.price_ghs) * l.qty)}</span>
            </div>
          ))}
          <div className="mt-3 space-y-2 border-t border-border pt-3 text-muted-foreground">
            <p className="flex justify-between"><span>{t("subtotal")}</span><span>{money(subtotal)}</span></p>
            <p className="flex justify-between"><span>{t("delivery")}</span><span>{money(fee)}</span></p>
          </div>
          <p className="mt-3 flex justify-between border-t border-border pt-4 text-[19px] font-medium"><span>{t("total")}</span><span>{money(subtotal + fee)}</span></p>
          {err && <p role="alert" className="mt-4 text-sm text-destructive">{err} {err === t("err_stock") && <Link to="/bag" className="underline">{t("bag")}</Link>}</p>}
          <Button type="submit" disabled={busy} className={cn(btn, "mt-6 w-full")}>{busy ? t("placing") : t("place_order")}</Button>
        </aside>
      </form>
    </section>
  );
}
