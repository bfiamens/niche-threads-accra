create or replace function public.find_order(_order_no integer, _phone text)
returns uuid language sql stable security definer set search_path = public as $$
  select token from public.orders
  where order_no = _order_no
    and regexp_replace(phone, '\D', '', 'g') <> ''
    and right(regexp_replace(phone, '\D', '', 'g'), 9) = right(regexp_replace(coalesce(_phone,''), '\D', '', 'g'), 9)
  limit 1
$$;
grant execute on function public.find_order(integer, text) to anon, authenticated;