import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import hero from "@/assets/niche-hero.webp.asset.json";
import { useI18n, type TKey } from "@/lib/i18n";
import { productsQuery } from "@/lib/store";
import { btn, GridSkeleton, LoadError, ProductGrid, textLink } from "@/components/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("Niché — Fashion, chosen with care", "New fashion picked with care, plus a Thrift corner of one-of-one finds. Delivered across Ghana; pay with Mobile Money or bank transfer."),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const q = useQuery(productsQuery);
  const all = q.data ?? [];
  const fresh = all.filter((p) => p.kind === "new").slice(0, 4);
  const thrift = all.filter((p) => p.kind === "thrift" && p.stock > 0).slice(0, 4);
  const cats = (["Tops", "Bottoms", "Shoes", "Accessories"] as const)
    .map((c) => [c, all.find((p) => p.category === c && p.kind === "new") ?? all.find((p) => p.category === c)] as const)
    .filter(([, p]) => p);
  return (
    <>
      <section className="relative min-h-[530px] overflow-hidden bg-primary md:min-h-[580px]">
        <img src={hero.url} alt="Niché collection" className="absolute inset-0 h-full w-full object-cover object-[center_16%]" />
        <div className="absolute inset-0 bg-primary/40" />
        <div className="wrap relative flex min-h-[530px] flex-col justify-end py-12 text-primary-foreground md:min-h-[580px] md:py-16">
          <p className="mb-3.5 text-sm">{t("hero_eyebrow")}</p>
          <h1 className="font-serif text-7xl md:text-8xl">Niché</h1>
          <p className="mt-5 max-w-[480px] text-lg leading-relaxed">{t("hero_lead")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-7">
            <Link to="/shop" className="inline-flex h-12 items-center rounded-md bg-background px-6 text-sm text-foreground">{t("shop_now")}</Link>
            <Link to="/outfits" className="border-b border-primary-foreground pb-1 text-sm">{t('owner')==='Owner area'?'Find your look':'Deinen Look finden'}</Link>
          </div>
        </div>
      </section>

      <section className="wrap pt-14 md:pt-20">
        <div className="flex items-baseline justify-between gap-4"><h2 className="text-3xl md:text-4xl">{t("new_in")}</h2><Link to="/shop" className={textLink}>{t("view_all")}</Link></div>
        {q.isPending ? <GridSkeleton /> : q.isError ? <LoadError onRetry={() => q.refetch()} /> : <ProductGrid products={fresh} />}
      </section>

      {cats.length > 0 && (
        <section className="wrap pt-14 md:pt-20">
          <h2 className="text-[clamp(30px,4vw,40px)]">{t("by_category")}</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {cats.map(([c, p]) => (
              <Link key={c} to="/shop" search={{ category: c }} className="relative block aspect-[4/5] overflow-hidden rounded-[10px] bg-secondary">
                <img src={p?.image_url} alt="" className="h-full w-full object-contain p-[12%]" />
                <span className="absolute bottom-3 left-3 rounded-full bg-background px-3 py-1 text-sm font-medium">{t(c as TKey)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-24 bg-secondary py-16">
        <div className="wrap">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-xl">
              <p className="mb-3 text-sm text-muted-foreground">Niché</p>
              <h2 className="text-[clamp(30px,4vw,40px)]">{t("thrift_band_title")}</h2>
              <p className="mt-4 text-muted-foreground">{t("thrift_band_text")}</p>
            </div>
            <Link to="/thrift" className={textLink}>{t("visit_thrift")}</Link>
          </div>
          {thrift.length > 0 && <ProductGrid products={thrift} />}
        </div>
      </section>

      <section className="wrap grid gap-8 pt-20 md:grid-cols-3">
        {([1, 2, 3] as const).map((i) => (
          <div key={i}>
            <p className="font-medium">{t(`why_${i}_t` as TKey)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t(`why_${i}` as TKey)}</p>
            {i === 3 && <Link to="/international" className="mt-2 inline-block text-sm underline">{t("abroad_link")}</Link>}
          </div>
        ))}
      </section>
    </>
  );
}
