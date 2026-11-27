import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useI18n, type TKey } from "@/lib/i18n";
import { CATEGORIES, productsQuery } from "@/lib/store";
import { GridSkeleton, LoadError, ProductGrid } from "@/components/site";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Catalog({ to, kind, category, show, title, lead, extra }: {
  to: "/shop" | "/thrift"; kind: "new" | "thrift" | "all"; category?: string | undefined; show?: string | undefined;
  title: string; lead: string; extra?: ReactNode;
}) {
  const { t } = useI18n();
  const q = useQuery(productsQuery);
  const list = (q.data ?? []).filter((p) =>
    (kind === "all" || p.kind === kind) && (!category || p.category === category));
  const tab = (active: boolean) => cn("whitespace-nowrap border-b pb-1.5", active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground");
  return (
    <section className="wrap pt-14 md:pt-20">
      <h1 className="page-title">{title}</h1>
      <p className="mt-4 max-w-[560px] text-base leading-relaxed text-muted-foreground">{lead}</p>
      {extra}
      <div className="mt-10 flex gap-7 overflow-x-auto text-[15px]">
        {to === "/shop" && ([["all", "all"], ["new", "filter_new"], ["thrift", "filter_thrift"]] as const).map(([v, k]) => (
          <Link key={v} to="/shop" search={{ ...(category ? { category } : {}), ...(v === "all" ? {} : { show: v }) }} className={tab((show ?? "all") === v && (v !== "all" || !category))}>{v === "all" ? t("all") : t(k)}</Link>
        ))}
        {to !== "/shop" && <Link to={to} className={tab(!category)}>{t("all")}</Link>}
        {CATEGORIES.map((c) => (
          <Link key={c} to={to} search={{ category: c, ...(show ? { show } : {}) }} className={tab(category === c)}>{t(c as TKey)}</Link>
        ))}
      </div>
      {q.isPending ? <GridSkeleton n={8} /> : q.isError ? <LoadError onRetry={() => q.refetch()} /> : <ProductGrid products={list} />}
    </section>
  );
}
