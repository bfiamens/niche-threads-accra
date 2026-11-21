import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { lovable } from '@/integrations/lovable';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { seo } from '@/lib/seo';
export const Route=createFileRoute('/auth')({head:()=>seo('Sign in — Niché','Sign in to your Niché account. Owner access is restricted to the verified store owner.'),component:Auth});
function Auth(){const {locale}=useI18n();const nav=useNavigate();const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 async function signIn(provider:'google'|'lovable'){setBusy(true);setError('');try{const result=await lovable.auth.signInWithOAuth(provider,{redirect_uri:window.location.origin+'/account'});if(result.error){setError(result.error.message);return;}const {data}=await supabase.auth.getUser();if(data.user)await nav({to:'/account'});}catch{setError(locale==='de'?'Anmeldung fehlgeschlagen.':'Sign-in could not be completed.');}finally{setBusy(false);}}
 return <section className="wrap max-w-[520px] py-20"><p className="mb-4 font-serif text-3xl">Niché</p><h1 className="page-title">{locale==='de'?'Willkommen.':'Welcome back.'}</h1><div className="mt-10 grid gap-3"><Button size="lg" disabled={busy} onClick={()=>signIn('google')}>{locale==='de'?'Mit Google fortfahren':'Continue with Google'}</Button><Button size="lg" variant="outline" disabled={busy} onClick={()=>signIn('lovable')}>{locale==='de'?'Mit Lovable fortfahren':'Continue with Lovable'}</Button></div>{error&&<p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}</section>;
}