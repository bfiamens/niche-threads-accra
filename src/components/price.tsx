import { money } from '@/lib/store';
import { salePrice } from '@/lib/pricing';
export function Price({current,original}:{current:number;original:number|null}){
 const sale=salePrice(current,original);
 return <span className="inline-flex flex-wrap items-baseline gap-2"><span>{money(current)}</span>{sale&&<del className="text-xs text-muted-foreground">{money(sale.original)}</del>}</span>;
}