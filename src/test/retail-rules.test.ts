import { describe, expect, it } from 'vitest';
import { buildLook, lookTotal, salesSummary } from '@/lib/styling';
import { checkoutReady, type Product, type Settings } from '@/lib/store';

const product = (id: string, category: string, overrides: Partial<Product> = {}): Product => ({
 id, category, name_en: id, name_de:'', description_en:'', description_de:'', section:'Men', kind:'new', grade:'New', condition_notes:'', color:'', price_ghs:100, compare_at_ghs:null, sizes:['M'], stock:1, measurements:'', image_url:'', preorder:false, arrives:'', published:true, needs_review:true, sort:0, created_at:'', story_en:'', story_de:'', style_tags:[], ...overrides,
});
describe('Niché retail rules', () => {
 it('never suggests sold-out pieces', () => expect(buildLook([product('sold','Tops',{stock:0})], 'classic')).toEqual([]));
 it('never presents a preorder as a ready-to-wear look', () => expect(buildLook([product('future','Tops',{preorder:true})], 'classic')).toEqual([]));
 it('never suggests unpublished inventory', () => expect(buildLook([product('hidden','Shoes',{published:false})], 'classic')).toEqual([]));
 it('keeps the chosen shirt and pairs different categories', () => {
  const anchor=product('shirt','Tops'); const look=buildLook([anchor,product('polo','Tops'),product('pants','Bottoms')],'classic',anchor);
  expect(look.map(p=>p.id)).toEqual(['shirt','pants']);
 });
 it('packages cost the sum of their pieces without an invented discount', () => expect(lookTotal([product('a','Tops',{price_ghs:120}),product('b','Shoes',{price_ghs:240})])).toBe(360));
 it('counts paid merchandise sales, not pending, cancelled or shipping', () => expect(salesSummary([{status:'paid',subtotal:100,total:120},{status:'delivered',subtotal:50,total:70},{status:'awaiting_payment',subtotal:500,total:520},{status:'cancelled',subtotal:800,total:820}])).toEqual({revenue:150,paidOrders:2,pending:1}));
 it('keeps contact-first checkout closed even with payment details', () => expect(checkoutReady({checkout_open:false,momo_number:'0241234567',bank_name:'',bank_account_number:''} as Settings)).toBe(false));
});