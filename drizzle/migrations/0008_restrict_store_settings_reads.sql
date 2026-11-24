DROP POLICY IF EXISTS "public reads settings" ON public.store_settings;
CREATE POLICY "admin reads settings" ON public.store_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
REVOKE SELECT ON public.store_settings FROM anon;

CREATE OR REPLACE FUNCTION public.get_store_settings()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT to_jsonb(s) - 'updated_at' FROM public.store_settings s WHERE s.id = 1
$$;
REVOKE ALL ON FUNCTION public.get_store_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_store_settings() TO anon, authenticated;