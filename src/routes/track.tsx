import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { btn, field } from "@/components/site";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  head: () => seo("Track your order — Niché", "Check the status of your Niché order with your order number and phone."),
  component: Track,
});

function Track() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const no = parseInt(String(f.get("no") ?? "").replace(/\D/g, ""), 10);
    const phone = String(f.get("phone") ?? "");
    if (!no || phone.replace(/\D/g, "").length < 7) { setErr(t("track_none")); return; }
    setBusy(true); setErr(null);
    const { data, error } = await supabase.rpc("find_order", { _order_no: no, _phone: phone });
    setBusy(false);
    if (error) { setErr(t("err_generic")); return; }
    if (!data) { setErr(t("track_none")); return; }
    nav({ to: "/order/$token", params: { token: data as string }, search: {} });
  }
  return (
    <section className="wrap max-w-[560px] pt-14 text-center md:pt-20">
      <h1 className="page-title">{t("track_title")}</h1>
      <p className="mt-5 text-lg text-muted-foreground">{t("track_lead")}</p>
      <form onSubmit={submit} className="mt-8 grid gap-3 rounded-[22px] bg-secondary p-6 text-left md:p-9">
        <input name="no" className={field} placeholder={`${t("order_no")} (e.g. 1001)`} aria-label={t("order_no")} inputMode="numeric" />
        <input name="phone" className={field} placeholder={t("phone")} aria-label={t("phone")} inputMode="tel" />
        {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
        <button disabled={busy} className={cn(btn, "w-full")}>{busy ? t("loading") : t("find")}</button>
      </form>
    </section>
  );
}
