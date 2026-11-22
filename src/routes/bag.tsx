import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { checkoutReady, money, productName, productsQuery, settingsQuery } from "@/lib/store";
import { btn, LoadError } from "@/components/site";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

export const Route = createFileRoute("/bag")({
  head: () => seo("Your bag — Niché", "Review the pieces in your bag before checkout."),
  component: Bag,
});

function Bag() {
  const { t, locale } = useI18n();
  const cart = useCart();
  const pq = useQuery(productsQuery);
  const sq = useQuery(settingsQuery);
  const [notice, setNotice] = useState(false);

  // Drop or clamp lines that no longer match live stock.
  useEffect(() => {
    if (!pq.data || !cart.lines.length) return;
    const byId = new Map(pq.data.map((p) => [p.id, p]));
    const used = new Map<string, number>();
    let changed = false;
    const next = cart.lines.flatMap((l) => {
      const p = byId.get(l.productId);
      const left = (p?.stock ?? 0) - (used.get(l.productId) ?? 0);
      if (!p || left <= 0) { changed = true; return []; }
      const qty = Math.min(l.qty, left);
      if (qty !== l.qty) changed = true;
      used.set(l.productId, (used.get(l.productId) ?? 0) + qty);
      return [{ ...l, qty }];
    });
    if (changed) { cart.replace(next); setNotice(true); }
  }, [pq.data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (pq.isError) return <section className="wrap max-w-[800px] pt-14"><LoadError onRetry={() => pq.refetch()} /></section>;
  const byId = new Map((pq.data ?? []).map((p) => [p.id, p]));
  const rows = cart.lines.flatMap((l) => {const p=byId.get(l.productId);return p?[{l,p}]:[];});
  const subtotal = rows.reduce((n, r) => n + Number(r.p.price_ghs) * r.l.qty, 0);
  const needsContact=rows.some(({p})=>p.preorder||p.needs_review);

  return (
    <section className="wrap max-w-[800px] pt-14 md:pt-20">
      <h1 className="page-title">{t("bag_title")}</h1>
      {notice && <p className="mt-3 text-sm text-muted-foreground">{t("bag_stock_changed")}</p>}
      {!cart.lines.length ? (
        <><p className="my-8 text-[17px] text-muted-foreground">{t("bag_empty")}</p><Link to="/shop" className={btn}>{t("keep_shopping")}</Link></>
      ) : pq.isPending ? <p className="my-8 text-muted-foreground">{t("loading")}</p> : (
        <>
          <div className="mt-6">
            {rows.map(({ l, p }) => (
              <div key={l.productId + l.size} className="flex items-center gap-5 border-b border-border py-5">
                <Link to="/product/$id" params={{ id: p.id }} className="w-[64px] flex-none rounded-lg bg-secondary sm:w-[84px]"><img src={p.image_url} alt="" className="aspect-[4/5] object-contain p-2" /></Link>
                <div className="flex-1">
                  <p className="font-medium">{productName(p, locale)}</p>
                  <p className="text-sm text-muted-foreground">{l.size && `${t("size")} ${l.size} · `}{money(p.price_ghs)}</p>
                  {p.preorder&&<p className="mt-1 text-xs text-muted-foreground">{t('tag_preorder')}</p>}
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    {p.kind !== "thrift" && (
                      <label className="flex items-center gap-2">{t("qty")}
                        <select value={l.qty} onChange={(e) => cart.setQty(l.productId, l.size, Number(e.target.value))} className="rounded-md border border-border bg-background px-2 py-1">
                          {Array.from({ length: Math.min(10, p.stock) }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
                        </select>
                      </label>
                    )}
                    <Button variant="link" className="h-auto px-0 text-muted-foreground underline" onClick={() => cart.remove(l.productId, l.size)}>{t("remove")}</Button>
                  </div>
                </div>
                <p className="shrink-0">{money(Number(p.price_ghs) * l.qty)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between text-[19px] font-medium"><span>{t("subtotal")}</span><span>{money(subtotal)}</span></div>
          {sq.data && checkoutReady(sq.data) && !needsContact ? (
            <Link to="/checkout" className={cn(btn, "mt-6 w-full")}>{t("checkout")}</Link>
          ) : sq.data ? (
            <div className="mt-6 rounded-2xl bg-secondary p-5 text-sm">
              <p>{sq.data.checkout_open&&needsContact?(locale==='de'?'Für Musterstücke und Vorbestellungen kontaktiere uns bitte zuerst.':'For preview pieces and pre-orders, contact us to confirm details first.'):t("checkout_closed")}</p>
              <Link to="/contact" className="mt-2 inline-block underline">{t("contact_us")}</Link>
            </div>
          ) : null}
          <p className="mt-4 text-sm text-muted-foreground">{t("abroad_q")} <Link to="/international" className="underline">{t("abroad_link")}</Link></p>
        </>
      )}
    </section>
  );
}
