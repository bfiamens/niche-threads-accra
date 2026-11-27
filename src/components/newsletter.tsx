import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function Newsletter() {
 const { locale }=useI18n(); const de=locale==='de';
 const [state,setState]=useState<'idle'|'busy'|'done'|'error'>('idle');
 async function submit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault(); const form=new FormData(e.currentTarget);
  const parsed=z.object({email:z.string().trim().email().max(254),consent:z.literal(true)}).safeParse({email:form.get('email'),consent:form.get('consent')==='on'});
  if(!parsed.success) { setState('error'); return; }
  setState('busy');
  try { const {error}=await supabase.rpc('subscribe_newsletter',{_email:parsed.data.email,_locale:locale,_consent:true}); setState(error?'error':'done'); }
  catch { setState('error'); }
 }
 return <section className="print:hidden py-24"><div className="wrap mx-auto max-w-xl text-center">
  <h2 className="text-4xl md:text-5xl">{de?'Auf die Liste':'Join the list'}</h2>
  <p className="mt-3 text-muted-foreground">{de?'Neue Stücke, Thrift-Funde und Vorbestellungen. Sonst nichts.':'New drops, thrift finds and pre-orders. Nothing else.'}</p>
  {state==='done'?<p role="status" className="mt-8 flex items-center justify-center gap-3"><Check className="size-5"/>{de?'Du stehst auf unserer Liste.':'You’re on our list.'}</p>:<form onSubmit={submit} className="mt-8 space-y-4">
   <div className="flex flex-col gap-3 sm:flex-row"><input name="email" type="email" maxLength={254} required aria-label={de?'Newsletter-E-Mail':'Newsletter email'} placeholder={de?'Deine E-Mail':'Your email'} className="h-12 min-w-0 flex-1 rounded-full border border-border bg-background px-5 text-[15px] outline-none focus:border-foreground"/><Button type="submit" disabled={state==='busy'} className="h-12 rounded-full px-7">{de?'Abonnieren':'Subscribe'}</Button></div>
   <label className="flex items-start justify-center gap-2 text-left text-xs text-muted-foreground"><input name="consent" type="checkbox" required className="mt-0.5"/>{de?'Ich möchte E-Mails von Niché erhalten. Ich kann mich jederzeit abmelden.':'I agree to receive Niché emails. I can unsubscribe at any time.'}</label>
   {state==='error'&&<p role="alert" className="text-sm text-destructive">{de?'Bitte prüfe deine Angaben und versuche es erneut.':'Please check your details and try again.'}</p>}
  </form>}
 </div></section>;
}
