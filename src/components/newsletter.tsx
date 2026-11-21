import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

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
 return <section className="border-t border-border py-14"><div className="wrap grid gap-6 md:grid-cols-2 md:gap-16">
  <div><p className="mb-3 text-xs uppercase">Niché / {de?'Post':'Notes'}</p><h2 className="font-serif text-4xl">{de?'Ein guter Fund. Ab und zu.':'A good find. Every so often.'}</h2><p className="mt-3 text-sm text-muted-foreground">{de?'Neue Stücke, kleine Kollektionen und Geschichten von Niché.':'New pieces, small collections and stories from Niché.'}</p></div>
  {state==='done'?<p role="status" className="flex items-center gap-3"><Check className="size-5"/>{de?'Du stehst auf unserer Liste.':'You’re on our list.'}</p>:<form onSubmit={submit} className="space-y-4">
   <div className="flex border-b border-foreground"><input name="email" type="email" maxLength={254} required aria-label={de?'Newsletter-E-Mail':'Newsletter email'} placeholder={de?'Deine E-Mail-Adresse':'Your email address'} className="h-12 min-w-0 flex-1 bg-transparent outline-none"/><Button type="submit" variant="ghost" size="icon" disabled={state==='busy'} aria-label={de?'Abonnieren':'Subscribe'} title={de?'Abonnieren':'Subscribe'}><ArrowRight/></Button></div>
   <label className="flex items-start gap-3 text-xs text-muted-foreground"><input name="consent" type="checkbox" required className="mt-0.5"/>{de?'Ich möchte E-Mails von Niché erhalten. Ich kann mich jederzeit abmelden.':'I agree to receive Niché emails. I can unsubscribe at any time.'}</label>
   {state==='error'&&<p role="alert" className="text-sm text-destructive">{de?'Bitte prüfe deine Angaben und versuche es erneut.':'Please check your details and try again.'}</p>}
  </form>}
 </div></section>;
}