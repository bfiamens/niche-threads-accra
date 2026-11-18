import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { money, productDesc, productName, productQuery } from "@/lib/store";
import { btn, LoadError } from "@/components/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Product — Niché" },
      { name: "description", content: "A piece from Niché, delivered across Ghana." },
      { property: "og:title", content: "Niché" },
      { property: "og:description", content: "A piece from Niché, delivered across Ghana." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { t, locale } = useI18n();
  const cart = useCart();
  const q = useQuery(productQuery(id));
  const [size, setSize] = useState<string | null>(null);

  if (q.isPending) return <section className="wrap grid gap-10 pt-14 md:grid-cols-[1.1fr_1fr]"><div className="aspect-[4/5] animate-pulse rounded-[14px] bg-secondary" /><div className="h-40 animate-pulse rounded bg-secondary" /></section>;
  if (q.isError) return <section className="wrap pt-14"><LoadError onRetry={() => q.refetch()} /></section>;
  const p = q.data;
  if (!p) return (
    <section className="wrap max-w-[800px] pt-14"><h1 className="page-title">Niché</h1><p className="my-8 text-muted-foreground">{t("not_found")}</p><Link to="/shop" className={btn}>{t("back_shop")}</Link></section>
  );

  const name = productName(p, locale);
  const singleSize = p.sizes.length <= 1;
  const chosen = singleSize ? (p.sizes[0] ?? "") : size;
  const inBag = cart.lines.filter((l) => l.productId === p.id).reduce((n, l) => n + l.qty, 0);
  const soldOut = p.stock <= 0 || inBag >= p.stock;

  function add() {
    if (chosen === null || soldOut) return;
    cart.add({ productId: p!.id, size: chosen, qty: 1 });
    toast.success(t("added"), { action: { label: t("bag"), onClick: () => (window.location.href = "/bag") } });
  }

  return (
    <section className="wrap grid items-start gap-8 pt-10 md:grid-cols-[1.1fr_1fr] md:gap-20 md:pt-16">
      <div className="aspect-[4/5] overflow-hidden rounded-[14px] bg-secondary">
        <img src={p.image_url} alt={name} className="h-full w-full object-contain p-[10%] drop-shadow-[0_6px_8px_rgb(0_0_0/0.18)]" />
      </div>
      <div>
        <Link to={p.kind === "thrift" ? "/thrift" : "/shop"} className="text-sm text-muted-foreground hover:text-foreground">← {p.kind === "thrift" ? t("nav_thrift") : t("nav_shop")}</Link>
        {p.kind === "thrift" && <p className="mt-4 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium">{t("tag_thrift")}</p>}
        {p.preorder && <p className="mt-4 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium">{t("tag_preorder")}</p>}
        <h1 className="mt-3 text-[clamp(34px,4vw,48px)]">{name}</h1>
        <p className="mt-4 text-2xl">{money(p.price_ghs)}</p>
        {productDesc(p, locale) && <p className="mt-6 leading-relaxed text-muted-foreground">{productDesc(p, locale)}</p>}

        {!singleSize && (
          <>
            <p className="mb-3 mt-8 font-medium">{t("choose_size")}</p>
            <div className="flex flex-wrap gap-2.5">
              {p.sizes.map((s) => (
                <button key={s} type="button" onClick={() => setSize(s)} aria-pressed={size === s}
                  className={cn("h-12 min-w-14 rounded-xl border px-3", size === s ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{s}</button>
              ))}
            </div>
          </>
        )}
        {singleSize && p.sizes[0] && <p className="mt-8 text-sm"><span className="font-medium">{t("size")}:</span> {p.sizes[0]}</p>}

        <button type="button" className={cn(btn, "mt-8 w-full")} disabled={soldOut || chosen === null} onClick={add}>
          {soldOut ? t("sold_out") : chosen === null ? t("choose_size") : t("add_to_bag")}
        </button>
        <p className="mt-3 text-sm text-muted-foreground">
          {p.kind === "thrift" ? t("thrift_note") : p.preorder ? t("preorder_note") : t("delivery_note")}
        </p>

        <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
          {p.color && <Row k={t("colour")} v={p.color} />}
          {p.kind === "thrift" && <Row k={t("grade")} v={p.grade} />}
          {p.condition_notes && <Row k={t("notes")} v={p.condition_notes} />}
          {p.measurements && <Row k={t("measurements")} v={p.measurements} />}
          {p.preorder && p.arrives && <Row k={t("tag_preorder")} v={p.arrives} />}
        </dl>
        <p className="mt-4 text-sm"><Link to="/international" className="underline">{t("abroad_link")}</Link></p>
      </div>
    </section>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-6 py-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>;
}
