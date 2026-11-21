ALTER TABLE public.products ADD COLUMN IF NOT EXISTS story_en text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS story_de text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS style_tags text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS delivery_options text[] NOT NULL DEFAULT '{}';
CREATE TABLE public.newsletter_subscriptions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, locale text NOT NULL DEFAULT 'en', consent boolean NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, DELETE ON public.newsletter_subscriptions TO authenticated;
GRANT ALL ON public.newsletter_subscriptions TO service_role;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads subscribers" ON public.newsletter_subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "owner deletes subscribers" ON public.newsletter_subscriptions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.subscribe_newsletter(_email text, _locale text, _consent boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT coalesce(_consent,false) OR length(_email)>254 OR _email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR _locale NOT IN ('en','de') THEN RAISE EXCEPTION 'invalid_subscription'; END IF;
 INSERT INTO public.newsletter_subscriptions(email,locale,consent) VALUES(lower(trim(_email)),_locale,true) ON CONFLICT(email) DO NOTHING;
END $$;
REVOKE ALL ON FUNCTION public.subscribe_newsletter(text,text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.subscribe_newsletter(text,text,boolean) TO anon,authenticated;