import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const ownerData=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:admin,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
 if(error||!admin)throw new Error('Owner access required.');
 const db=context.supabase;
 const [products,orders,items,settings,messages,quotes,subscribers]=await Promise.all([
  db.from('products').select('*').order('sort'),db.from('orders').select('*').order('created_at',{ascending:false}),
  db.from('order_items').select('*'),db.from('store_settings').select('*').eq('id',1).single(),
  db.from('contact_messages').select('*').order('created_at',{ascending:false}),db.from('quote_requests').select('*').order('created_at',{ascending:false}),
  db.from('newsletter_subscriptions').select('*').order('created_at',{ascending:false}),
 ]);
 for(const result of [products,orders,items,settings,messages,quotes,subscribers])if(result.error)throw new Error('Could not load owner records.');
 return {products:products.data??[],orders:orders.data??[],items:items.data??[],settings:settings.data,messages:messages.data??[],quotes:quotes.data??[],subscribers:subscribers.data??[]};
});

const productSchema=z.object({id:z.string().min(1).max(80),name_en:z.string().trim().min(2).max(120),name_de:z.string().max(120),description_en:z.string().max(3000),description_de:z.string().max(3000),price_ghs:z.number().positive().max(100000),compare_at_ghs:z.number().positive().max(100000).nullable(),stock:z.number().int().min(0).max(100000),category:z.enum(['Tops','Bottoms','Shoes','Accessories']),kind:z.enum(['new','thrift']),sizes:z.array(z.string().max(20)).max(30),published:z.boolean(),needs_review:z.boolean(),preorder:z.boolean(),arrives:z.string().max(200),measurements:z.string().max(1000),condition_notes:z.string().max(1000),color:z.string().max(80),grade:z.string().max(80),story_en:z.string().max(5000),story_de:z.string().max(5000),style_tags:z.array(z.enum(['classic','streetwear','athletic','evening'])).max(4),image_url:z.string().max(2000).refine(v=>v.startsWith('/__l5e/assets-v1/')||v.startsWith('https://'),'Use a secure image URL')}).refine(p=>p.compare_at_ghs===null||p.compare_at_ghs>p.price_ghs,'Original price must exceed the current price.');
export const saveProduct=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>productSchema.parse(input)).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!admin)throw new Error('Owner access required.');
 if(data.kind==='thrift'&&data.stock>1)throw new Error('A Thrift piece is one of one.');
 const {error}=await context.supabase.from('products').upsert(data);if(error)throw new Error('Product could not be saved.');return {ok:true};
});

export const updateOrder=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({id:z.string().uuid(),status:z.enum(['awaiting_payment','payment_submitted','paid','shipped','delivered','cancelled'])}).parse(input)).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!admin)throw new Error('Owner access required.');
 const {error}=await context.supabase.from('orders').update({status:data.status}).eq('id',data.id);if(error)throw new Error('Order could not be updated. Cancelled orders cannot be reopened.');return {ok:true};
});

const text=z.string().trim().max(400);
const settingsSchema=z.object({momo_number:text,momo_name:text,momo_network:text,bank_name:text,bank_account_name:text,bank_account_number:text,contact_phone:text,contact_whatsapp:text,contact_email:z.union([z.literal(''),z.string().email().max(254)]),address:text,kumasi_fee:z.number().min(0).max(10000),ghana_fee:z.number().min(0).max(10000),kumasi_days:text,ghana_days:text,checkout_open:z.boolean(),delivery_options:z.array(z.enum(['personal','ride','courier'])).max(3),policies:z.record(z.enum(['about','delivery','returns','privacy','terms']),z.object({en:z.string().max(10000),de:z.string().max(10000)}))});
export const saveSettings=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>settingsSchema.parse(input)).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!admin)throw new Error('Owner access required.');
 if(data.checkout_open){
  const {count,error}=await context.supabase.from('products').select('id',{count:'exact',head:true}).eq('published',true).eq('needs_review',true);
  if(error||count)throw new Error('Review published sample products before opening checkout.');
  if(!(data.momo_number||data.bank_name&&data.bank_account_number)||!data.contact_phone&&!data.contact_whatsapp&&!data.contact_email)throw new Error('Add payment and contact details before opening checkout.');
  if((['about','delivery','returns','privacy','terms'] as const).some(k=>!data.policies[k]?.en?.trim()||!data.policies[k]?.de?.trim()))throw new Error('Complete the English and German policies before opening checkout.');
 }
 const {error}=await context.supabase.from('store_settings').update(data).eq('id',1);if(error)throw new Error('Settings could not be saved.');return {ok:true};
});

export const handleInbox=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({id:z.string().uuid(),kind:z.enum(['message','quote']),done:z.boolean()}).parse(input)).handler(async({data,context})=>{
 const {data:admin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(!admin)throw new Error('Owner access required.');
 const result=data.kind==='message'?await context.supabase.from('contact_messages').update({handled:data.done}).eq('id',data.id):await context.supabase.from('quote_requests').update({status:data.done?'handled':'new'}).eq('id',data.id);
 if(result.error)throw new Error('Could not update this request.');return {ok:true};
});