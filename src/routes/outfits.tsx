import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { productsQuery } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { LookBuilder } from '@/components/look-builder';
import { GridSkeleton, LoadError } from '@/components/site';
import { seo } from '@/lib/seo';
export const Route=createFileRoute('/outfits')({head:()=>seo('Outfits & packages — Niché','Build a classic, streetwear, athletic or evening look from the Niché collection, with sizes and a clear package total.'),component:Outfits});
function Outfits(){const {locale}=useI18n();const q=useQuery(productsQuery);return <section className="wrap py-14 md:py-20"><p className="mb-4 text-xs uppercase">Niché / {locale==='de'?'Kombinationen':'The edit'}</p><h1 className="page-title">{locale==='de'?'Ein kompletter Look.':'The whole look.'}</h1><p className="mb-10 mt-5 text-lg text-muted-foreground">{locale==='de'?'Klassisch, sportlich oder für den Abend.':'Classic, off-duty, or an evening out.'}</p>{q.isPending?<GridSkeleton/>:q.isError?<LoadError onRetry={()=>q.refetch()}/>:<LookBuilder products={q.data}/>}</section>;}