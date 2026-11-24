import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n, type TKey } from "@/lib/i18n";
import { hasBank, hasMomo, money, settingsQuery } from "@/lib/store";
import { btn, field, LoadError } from "@/components/site";
import { cn } from "@/lib/utils";

type OrderView = {
  order_no: number; status: string; customer_name: string; city: string; zone: string; payment_method: "momo" | "bank";
  subtotal: number; shipping: number; total: number; payment_reference: string; created_at: string;
  items: { name: string; size: string; qty: number; unit_price: number }[];
};

export const Route = createFileRoute("/order/$token")({
  validateSearch: (s: Record<string, unknown>): { new?: boolean } => (s['new'] === true || s['new'] === "true" ? { new: true } : {}),
  head: () => ({ meta: [
    { title: "Your order — Niché" }, { name: "description", content: "Order status and payment instructions." },
    { property: "og:title", content: "Your order — Niché" }, { property: "og:description", content: "Order status and payment instructions." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: OrderPage,
});

const STEPS = ["awaiting_payment", "payment_submitted", "paid", "shipped", "delivered"];

function OrderPage() {
  const { token } = Route.useParams();
  const { new: isNew } = Route.useSearch();
  const { t } = useI18n();
  const qc = useQueryClient();
  const sq = useQuery(settingsQuery);
  const oq = useQuery({
    queryKey: ["order", token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_order", { _token: token });
      if (error) throw error;
      return data as OrderView | null;
    },
    retry: false,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (oq.isPending) return <section className="wrap max-w-[800px] pt-14"><p className="text-muted-foreground">{t("loading")}</p></section>;
  if (oq.isError && !/uuid/i.test(String(oq.error?.message))) return <section className="wrap max-w-[800px] pt-14"><LoadError onRetry={() => oq.refetch()} /></section>;
  const o = oq.data;
  if (!o) return <section className="wrap max-w-[800px] pt-14"><h1 className="page-title">{t("order_title")}</h1><p className="my-8 text-muted-foreground">{t("track_none")}</p><Link to="/track" className={btn}>{t("nav_track")}</Link></section>;

  const s = sq.data;
  const payable = o.status === "awaiting_payment" || o.status === "payment_submitted";
  const ref = `NICHE-${o.order_no}`;
  const momoOk = s && hasMomo(s), bankOk = s && hasBank(s);
  const showMomo = o.payment_method === "momo" ? momoOk : !bankOk && momoOk;
  const showBank = o.payment_method === "bank" ? bankOk : !momoOk && bankOk;

  async function submitRef(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = String(new FormData(e.currentTarget).get("ref") ?? "").trim();
    if (v.length < 3) { setErr(t("tx_ref")); return; }
    setBusy(true); setErr(null);
    const { error } = await supabase.rpc("submit_payment_reference", { _token: token, _ref: v });
    setBusy(false);
    if (error) { setErr(t("err_generic")); return; }
    qc.invalidateQueries({ queryKey: ["order", token] });
  }

  const stepIdx = STEPS.indexOf(o.status);
  return (
    <section className="wrap max-w-[800px] pt-14 md:pt-20">
      <div className="mb-3 flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{t("order_title")} #{o.order_no} · {new Date(o.created_at).toLocaleDateString()}</p><button type="button" onClick={() => window.print()} className="print:hidden rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">{t("order_title")==="Order"?"Download receipt":"Beleg herunterladen"}</button></div>
      <h1 className="page-title">{isNew ? t("thanks") : t(`st_${o.status}` as TKey)}</h1>
      {isNew && <p className="mt-4 text-muted-foreground">{t("save_link")}</p>}

      {o.status !== "cancelled" ? (
        <ol className="mt-8 grid grid-cols-5 gap-2 text-xs">
          {STEPS.map((st, i) => (
            <li key={st} className="flex flex-col gap-2">
              <span className={cn("h-1 rounded-full", i <= stepIdx ? "bg-primary" : "bg-border")} />
              <span className={i <= stepIdx ? "text-foreground" : "text-muted-foreground"}>{t(`st_${st}` as TKey)}</span>
            </li>
          ))}
        </ol>
      ) : <p className="mt-6 rounded-xl bg-secondary p-4">{t("st_cancelled")}</p>}

      {payable && (
        <div className="mt-10 rounded-[22px] bg-secondary p-6 md:p-8">
          <h2 className="text-[26px]">{t("how_to_pay")}</h2>
          {o.status === "awaiting_payment" && <p className="mt-2 text-sm text-muted-foreground">{t("unpaid_hold")}</p>}
          <dl className="mt-5 space-y-2 text-[15px]">
            <Item k={t("send_exactly")} v={money(o.total)} strong />
            <Item k={t("reference")} v={ref} strong />
            {showMomo && s && <>
              <Item k={t("momo_to")} v={s.momo_number} />
              {s.momo_name && <Item k={t("momo_name")} v={s.momo_name} />}
              {s.momo_network && <Item k={t("network")} v={s.momo_network} />}
            </>}
            {showBank && s && <>
              <Item k={t("bank")} v={s.bank_name} />
              <Item k={t("acct_name")} v={s.bank_account_name} />
              <Item k={t("acct_no")} v={s.bank_account_number} />
            </>}
          </dl>
          {!showMomo && !showBank && s && <p className="mt-4 text-sm">{t("pay_details_missing")}</p>}
          {o.status === "awaiting_payment" ? (
            <form data-x=""  onSubmit={submitRef} className="mt-6 grid gap-3">
              <label className="text-sm font-medium" htmlFor="ref">{t("sent_payment")}</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input id="ref" name="ref" className={field} placeholder={t("tx_ref")} />
                <button disabled={busy} className={cn(btn, "shrink-0")}>{busy ? t("sending") : t("submit_ref")}</button>
              </div>
              {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
            </form>
          ) : <p className="mt-6 text-sm">{t("ref_saved")}</p>}
        </div>
      )}

      <div className="mt-10">
        {o.items.map((i, k) => (
          <p key={k} className="flex justify-between border-b border-border py-3 text-[15px]"><span>{i.name}{i.size && ` · ${i.size}`} × {i.qty}</span><span>{money(i.unit_price * i.qty)}</span></p>
        ))}
        <div className="mt-4 space-y-2 text-muted-foreground">
          <p className="flex justify-between"><span>{t("subtotal")}</span><span>{money(o.subtotal)}</span></p>
          <p className="flex justify-between"><span>{t("delivery")} · {o.zone === "kumasi" ? t("zone_kumasi") : t("zone_ghana")}</span><span>{money(o.shipping)}</span></p>
        </div>
        <p className="mt-3 flex justify-between border-t border-border pt-4 text-[19px] font-medium"><span>{t("total")}</span><span>{money(o.total)}</span></p>
      </div>
      <div className="print:hidden mt-8 flex flex-wrap gap-6 text-sm"><Link to="/contact" className="underline">{t("contact_us")}</Link><Link to="/shop" className="underline">{t("keep_shopping")}</Link></div>
    </section>
  );
}
function Item({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return <div className="flex justify-between gap-6"><dt className="text-muted-foreground">{k}</dt><dd className={cn("text-right", strong && "font-medium")}>{v}</dd></div>;
}
