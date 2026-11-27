import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import hero from "@/assets/niche-hero.webp.asset.json";
import { useI18n } from "@/lib/i18n";
import { productName, productsQuery } from "@/lib/store";
import { btn, GridSkeleton, LoadError, ProductGrid, textLink } from "@/components/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("Niché — Fashion, chosen with care", "New fashion picked with care, plus a Thrift corner of one-of-one finds. Delivered across Ghana; pay with Mobile Money or bank transfer."),
  component: Home,
});

function Home() {
  const { t, locale } = useI18n();
  const de = locale === "de";
  const q = useQuery(productsQuery);
  const all = q.data ?? [];
  const fresh = all.filter((p) => p.kind === "new").slice(0, 4);
  const thrift = all.filter((p) => p.kind === "thrift" && p.stock > 0).slice(0, 4);
  const pick = (c: string) => all.find((p) => p.category === c && p.stock > 0 && !p.preorder);
  const look = [pick("Tops"), pick("Bottoms"), pick("Shoes")].filter((p): p is NonNullable<typeof p> => !!p);
  const stories = all.filter((p) => p.story_en || p.story_de).slice(0, 3);
  const [lead, ...rest] = stories;
  return (
    <>
      <section className="wrap grid items-center gap-10 pt-8 md:grid-cols-2 md:gap-16 md:pt-12">
        <div className="order-2 md:order-1">
          <p className="eyebrow mb-5">{t("hero_eyebrow")}</p>
          <h1 className="whitespace-pre-line text-5xl md:text-7xl">{t("hero_title")}</h1>
          <p className="mt-6 max-w-[420px] text-muted-foreground">{t("hero_lead")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-7">
            <Link to="/shop" className={btn}>{t("shop_now")}</Link>
            <Link to="/thrift" className={textLink}>{t("visit_thrift")}</Link>
          </div>
        </div>
        <div className="order-1 aspect-[4/5] overflow-hidden rounded-[8px] bg-secondary md:order-2 md:aspect-[5/5]">
          <img src={hero.url} alt="Niché collection" className="h-full w-full object-cover object-[center_20%]" />
        </div>
      </section>

      <section className="wrap pt-20 md:pt-28">
        <div className="flex items-baseline justify-between gap-4"><h2 className="text-3xl md:text-4xl">{t("new_in")}</h2><Link to="/shop" search={{ show: "new" }} className={textLink}>{t("view_all")}</Link></div>
        {q.isPending ? <GridSkeleton /> : q.isError ? <LoadError onRetry={() => q.refetch()} /> : <ProductGrid products={fresh} />}
      </section>

      <section className="mt-24 bg-secondary py-20">
        <div className="wrap grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-4">{de ? "Outfit-Baukasten" : "Outfit builder"}</p>
            <h2 className="text-4xl md:text-5xl">{de ? "Für jeden Anlass angezogen." : "Dressed for any occasion."}</h2>
            <p className="mt-5 max-w-md text-muted-foreground">{de ? "Wähle Anlass und Stil. Wir stellen den Look aus dem zusammen, was vorrätig ist." : "Pick the occasion and the style. We put the look together from what is in stock."}</p>
            <Link to="/outfits" className={btn + " mt-8"}>{de ? "Outfits zeigen" : "Show me outfits"}</Link>
          </div>
          {look.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {look.map((p) => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="group">
                  <div className="aspect-[3/4] overflow-hidden rounded-[6px] bg-background"><img src={p.image_url} alt="" className="h-full w-full object-contain p-[12%] transition-transform group-hover:scale-[1.03]" /></div>
                  <p className="mt-2 text-[13px]">{productName(p, locale)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {lead && (
        <section className="wrap pt-24">
          <p className="eyebrow">{de ? "Das Niché-Journal" : "The Niché journal"}</p>
          <div className="mt-2 flex items-end justify-between border-b border-foreground pb-3"><h2 className="font-serif text-5xl font-normal tracking-normal">Journal</h2><Link to="/stories" className={textLink}>{de ? "Alle Geschichten" : "All stories"}</Link></div>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <Link to="/product/$id" params={{ id: lead.id }} className="relative block aspect-[4/3] overflow-hidden rounded-[6px] bg-secondary">
              <img src={lead.image_url} alt="" className="h-full w-full object-contain p-[12%]" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/80 to-transparent p-6 pt-16 font-serif text-3xl text-primary-foreground">{productName(lead, locale)}</span>
            </Link>
            <div className="divide-y divide-border">
              {rest.map((p) => (
                <Link key={p.id} to="/product/$id" params={{ id: p.id }} className="flex items-center gap-5 py-4 first:pt-0">
                  <div className="aspect-[4/3] w-36 shrink-0 overflow-hidden rounded-[6px] bg-secondary"><img src={p.image_url} alt="" className="h-full w-full object-contain p-[10%]" /></div>
                  <div><p className="eyebrow">{de ? "Geschichte" : "Story"}</p><p className="mt-1 font-serif text-2xl">{productName(p, locale)}</p></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {thrift.length > 0 && (
        <section className="wrap pt-24">
          <div className="flex items-baseline justify-between gap-4">
            <div><h2 className="text-3xl md:text-4xl">{t("thrift_band_title")}</h2><p className="mt-3 max-w-xl text-muted-foreground">{t("thrift_band_text")}</p></div>
            <Link to="/thrift" className={textLink}>{t("view_all")}</Link>
          </div>
          <ProductGrid products={thrift} />
        </section>
      )}
    </>
  );
}
