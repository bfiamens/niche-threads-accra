import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n, type TKey } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { money, productName, type Product } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRound, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Price } from '@/components/price';

export function LangSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className={cn("flex items-center gap-1 text-sm", className)} role="group" aria-label={t("language")}>
      {(["en", "de"] as const).map((l) => (
        <Button key={l} variant="ghost" type="button" onClick={() => setLocale(l)} aria-pressed={locale === l}
          className={cn("rounded-full px-2.5 py-1 uppercase", locale === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
          {l}
        </Button>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const { t, locale } = useI18n();
  const { count } = useCart();
  const account = useQuery({ queryKey: ['session-identity'], queryFn: async () => (await supabase.auth.getUser()).data.user });
  const router = useRouter(); const path = useLocation({ select: (l) => l.pathname });
  const de = locale === 'de';
  const nav: [string, string][] = [["/shop", t("nav_shop")], ["/thrift", t("nav_thrift")], ["/outfits", "Outfits"], ["/stories", de ? "Journal" : "Journal"], ["/help", t("nav_help")]];
  return (
    <header className="print:hidden sticky top-0 z-20 bg-background/95 backdrop-blur">
      <div className="wrap grid grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-2 py-4 md:h-[76px] md:py-0">
        <div className="flex items-center gap-1">
          {path !== "/" && <Button variant="ghost" size="icon" type="button" className="-ml-2" onClick={() => (window.history.length > 1 ? router.history.back() : router.navigate({ to: "/" }))} aria-label={de?'Zurück':'Back'} title={de?'Zurück':'Back'}><ArrowLeft/></Button>}
          <Link to="/" className="font-serif text-[30px] leading-none">Niché</Link>
        </div>
        <nav className="order-3 col-span-3 flex gap-7 overflow-x-auto text-[14px] md:order-none md:col-span-1 md:justify-center">
          {nav.map(([to, label]) => (
            <Link key={to} to={to} className="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "!text-foreground" }}>{label}</Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-2 text-[14px]">
          <span className="hidden text-muted-foreground lg:inline">GH · GHS</span>
          <LangSwitch className="hidden sm:flex" />
          <Button asChild variant="ghost" size="icon"><Link to={account.data ? '/account' : '/auth'} aria-label={de?'Konto':'Account'} title={de?'Konto':'Account'}><UserRound/></Link></Button>
          <Link to="/bag" className="flex items-center gap-1.5 whitespace-nowrap font-medium"><ShoppingBag className="size-4 sm:hidden"/>{t("bag")} ({count})</Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useI18n();
  const col = "flex flex-col gap-2.5 text-sm text-muted-foreground [&_a:hover]:text-foreground";
  return (
    <footer className="print:hidden bg-secondary py-16">
      <div className="wrap grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <div className="font-serif text-[30px] leading-none">Niché</div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t("foot_tag")}</p>
          <p className="mt-6 text-sm text-muted-foreground">Ghana · GHS</p>
          <LangSwitch className="mt-2" />
        </div>
        <div className={col}><p className="font-medium text-foreground">{t("foot_shop")}</p>
          <Link to="/shop">{t("nav_shop")}</Link><Link to="/thrift">{t("nav_thrift")}</Link><Link to="/outfits">Outfits</Link><Link to="/stories">Journal</Link><Link to="/international">{t("abroad_link")}</Link></div>
        <div className={col}><p className="font-medium text-foreground">{t("foot_help")}</p>
          <Link to="/track">{t("nav_track")}</Link><Link to="/help">{t("nav_help")}</Link><Link to="/contact">{t("contact_us")}</Link>
          <Link to="/policies/$key" params={{ key: "delivery" }}>{t("p_delivery")}</Link><Link to="/policies/$key" params={{ key: "returns" }}>{t("p_returns")}</Link></div>
        <div className={col}><p className="font-medium text-foreground">{t("foot_company")}</p>
          {(["about", "privacy", "terms"] as const).map((k) => (
            <Link key={k} to="/policies/$key" params={{ key: k }}>{t(`p_${k}` as TKey)}</Link>
          ))}
          <Link to="/owner">{t('owner')}</Link>
        </div>
        <p className="border-t border-border pt-6 text-xs text-muted-foreground md:col-span-4">{t("foot_pay")}</p>
      </div>
    </footer>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const { t, locale } = useI18n();
  const [broken, setBroken] = useState(false);
  const tag = p.stock <= 0 ? t("tag_sold") : p.preorder ? t("tag_preorder") : p.kind !== "thrift" && p.stock <= 2 ? t("tag_low") : null;
  const sub = p.kind === "thrift" ? t("tag_thrift") : locale === "de" ? "Neu" : "New";
  return (
    <Link to="/product/$id" params={{ id: p.id }} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-secondary">
        {!broken && p.image_url ? (
          <img src={p.image_url} alt={productName(p, locale)} loading="lazy" onError={() => setBroken(true)}
            className={cn("h-full w-full object-contain p-[10%] drop-shadow-[0_6px_8px_rgb(0_0_0/0.18)] transition-transform group-hover:scale-[1.03]", p.stock <= 0 && "opacity-50")} />
        ) : <div className="flex h-full items-center justify-center font-serif text-2xl text-muted-foreground">Niché</div>}
        {tag && <span className="absolute left-3 top-3 rounded-full bg-background px-2.5 py-1 text-[11px] font-medium">{tag}</span>}
      </div>
      <div className="flex justify-between gap-3 pt-3 text-[14px]">
        <span className="font-medium">{productName(p, locale)}</span>
        <Price current={Number(p.price_ghs)} original={p.compare_at_ghs === null ? null : Number(p.compare_at_ghs)} />
      </div>
      <p className="text-[13px] text-muted-foreground">{sub}</p>
      {p.needs_review && <p className="mt-1 text-xs text-muted-foreground">{locale==='de'?'Musterstück · Details noch nicht bestätigt':'Preview piece · details not yet confirmed'}</p>}
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  const { t } = useI18n();
  if (!products.length) return <p className="my-8 text-[17px] text-muted-foreground">{t("no_products")}</p>;
  return (
    <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] md:gap-x-6 md:gap-y-10">
      {products.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}

export function GridSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-6" aria-busy="true">
      {Array.from({ length: n }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-[6px] bg-secondary" />)}
    </div>
  );
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="my-8">
      <p className="text-muted-foreground">{t("load_error")}</p>
      <Button variant="link" onClick={onRetry} className="mt-3 px-0 text-sm underline">{t("retry")}</Button>
    </div>
  );
}

export const btn = "inline-flex h-14 items-center justify-center rounded-full border border-primary bg-primary px-8 text-[15px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-45";
export const btnGhost = "inline-flex h-14 items-center justify-center rounded-full border border-primary px-8 text-[15px] font-medium hover:bg-secondary";
export const field = "h-14 w-full rounded-[14px] border border-border bg-background px-[18px] text-[15px] outline-none focus:border-foreground";
export const textLink = "border-b border-foreground pb-0.5 text-[15px]";
