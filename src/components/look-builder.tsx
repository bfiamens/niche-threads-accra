import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart';
import { useI18n } from '@/lib/i18n';
import { money, productName, type Product } from '@/lib/store';
import { buildLook, lookTotal, STYLE_KEYS, type StyleKey } from '@/lib/styling';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';
import { Price } from '@/components/price';

export function LookBuilder({products,anchor,initial='classic'}:{products:Product[];anchor?:Product;initial?:StyleKey}) {
 const {locale,t}=useI18n(); const de=locale==='de'; const cart=useCart();
 const [style,setStyle]=useState<StyleKey>(initial); const [sizes,setSizes]=useState<Record<string,string>>({});
 const look=buildLook(products,style,anchor);
 const labels=de?{classic:'Klassisch',streetwear:'Streetwear',athletic:'Sportlich',evening:'Abend'}:{classic:'Classic',streetwear:'Streetwear',athletic:'Athletic',evening:'Evening'};
 const chosen=(p:Product)=>sizes[p.id]??(p.sizes.length<=1?p.sizes[0]??'':undefined);
 const canAdd=look.length>0&&look.every(p=>chosen(p)!==undefined&&cart.lines.filter(l=>l.productId===p.id).reduce((n,l)=>n+l.qty,0)<p.stock);
 function addLook() { if(!canAdd)return; for(const p of look) { const size=chosen(p); if(size!==undefined)cart.add({productId:p.id,size,qty:1}); } toast.success(t('added')); }
 return <div>
  <div className="mb-7 flex flex-wrap gap-2" role="group" aria-label={de?'Stil':'Style'}>{STYLE_KEYS.map(key=><Button key={key} variant={style===key?'default':'outline'} onClick={()=>setStyle(key)} aria-pressed={style===key}>{labels[key]}</Button>)}</div>
  {!look.length?<p className="py-8 text-muted-foreground">{t('no_products')}</p>:<>
   <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-4 md:gap-6">{look.map(p=><div key={p.id}>
    <Link to="/product/$id" params={{id:p.id}} className="group block"><div className="aspect-[4/5] bg-secondary"><img src={p.image_url} alt={productName(p,locale)} className="h-full w-full object-contain p-[10%] transition-transform group-hover:scale-[1.03]"/></div><p className="mt-3 flex justify-between gap-2 text-sm"><span>{productName(p,locale)}</span><ArrowUpRight className="size-4 shrink-0"/></p></Link>
    <p className="mt-1 text-sm text-muted-foreground"><Price current={Number(p.price_ghs)} original={p.compare_at_ghs===null?null:Number(p.compare_at_ghs)}/>{p.needs_review&&` · ${de?'Muster':'Preview'}`}</p>
    {p.sizes.length>1?<select aria-label={`${t('size')} · ${productName(p,locale)}`} value={chosen(p)??''} onChange={e=>setSizes({...sizes,[p.id]:e.target.value})} className="mt-3 h-10 w-full rounded-md border border-border bg-background px-2 text-sm"><option value="" disabled>{t('choose_size')}</option>{p.sizes.map(s=><option key={s}>{s}</option>)}</select>:<p className="mt-3 h-10 text-sm">{t('size')}: {p.sizes[0]||'—'}</p>}
   </div>)}</div>
   <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6"><p>{de?'Paket gesamt':'Package total'} <span className="ml-3 font-medium">{money(lookTotal(look))}</span></p><Button size="lg" disabled={!canAdd} onClick={addLook}><ShoppingBag/>{de?'Look in die Tasche':'Add look to bag'}</Button></div>
  </>}
 </div>;
}