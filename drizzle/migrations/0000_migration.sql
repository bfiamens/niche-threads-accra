
create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

-- First account created becomes the shop owner (admin). Later accounts get no role.
create or replace function public.handle_new_user_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_owner after insert on auth.users
for each row execute function public.handle_new_user_owner();

create table public.products (
  id text primary key,
  name_en text not null,
  name_de text not null default '',
  description_en text not null default '',
  description_de text not null default '',
  section text not null default 'Men',
  category text not null default 'Tops',
  kind text not null default 'new' check (kind in ('new','thrift')),
  grade text not null default 'New',
  condition_notes text not null default '',
  color text not null default '',
  price_ghs numeric(10,2) not null check (price_ghs >= 0),
  sizes text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  measurements text not null default '',
  image_url text not null default '',
  preorder boolean not null default false,
  arrives text not null default '',
  published boolean not null default true,
  needs_review boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public reads published" on public.products for select to anon, authenticated using (published or public.has_role(auth.uid(),'admin'));
create policy "admin writes products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.store_settings (
  id integer primary key default 1 check (id = 1),
  momo_number text not null default '',
  momo_name text not null default '',
  momo_network text not null default '',
  bank_name text not null default '',
  bank_account_name text not null default '',
  bank_account_number text not null default '',
  contact_phone text not null default '',
  contact_whatsapp text not null default '',
  contact_email text not null default '',
  address text not null default '',
  kumasi_fee numeric(10,2) not null default 0,
  ghana_fee numeric(10,2) not null default 0,
  kumasi_days text not null default '',
  ghana_days text not null default '',
  policies jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "public reads settings" on public.store_settings for select to anon, authenticated using (true);
create policy "admin updates settings" on public.store_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.store_settings(id) values (1);

create sequence public.order_no_seq start 1001;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no integer not null default nextval('public.order_no_seq') unique,
  token uuid not null default gen_random_uuid() unique,
  customer_name text not null,
  phone text not null,
  email text not null default '',
  region text not null,
  city text not null,
  address text not null,
  zone text not null check (zone in ('kumasi','ghana')),
  payment_method text not null check (payment_method in ('momo','bank')),
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null,
  total numeric(10,2) not null,
  status text not null default 'awaiting_payment' check (status in ('awaiting_payment','payment_submitted','paid','shipped','delivered','cancelled')),
  payment_reference text not null default '',
  note text not null default '',
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  name text not null,
  size text not null default '',
  qty integer not null check (qty > 0),
  unit_price numeric(10,2) not null
);
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant all on public.orders, public.order_items to service_role;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create policy "admin reads orders" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin updates orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin reads items" on public.order_items for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- Return stock when an order is cancelled; take it again if un-cancelled.
create or replace function public.orders_stock_on_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = now();
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products p set stock = p.stock + i.qty from public.order_items i where i.order_id = new.id and p.id = i.product_id;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'A cancelled order cannot be reopened';
  end if;
  return new;
end $$;
create trigger orders_status_stock before update on public.orders for each row execute function public.orders_stock_on_status();

create or replace function public.place_order(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  s public.store_settings;
  o public.orders;
  it jsonb;
  p public.products;
  q int;
  sub numeric := 0;
  ship numeric;
  zone text := payload->>'zone';
begin
  select * into s from public.store_settings where id = 1;
  if zone not in ('kumasi','ghana') then raise exception 'invalid_zone'; end if;
  if coalesce(payload->>'payment_method','') not in ('momo','bank') then raise exception 'invalid_payment'; end if;
  if length(trim(coalesce(payload->>'customer_name',''))) < 2 or length(trim(coalesce(payload->>'phone',''))) < 7
     or length(trim(coalesce(payload->>'address',''))) < 3 or length(trim(coalesce(payload->>'city',''))) < 2 then
    raise exception 'invalid_details';
  end if;
  if jsonb_array_length(coalesce(payload->'items','[]'::jsonb)) = 0 then raise exception 'empty_bag'; end if;
  ship := case when zone = 'kumasi' then s.kumasi_fee else s.ghana_fee end;

  insert into public.orders(customer_name, phone, email, region, city, address, zone, payment_method, subtotal, shipping, total, note, locale)
  values (left(trim(payload->>'customer_name'),120), left(trim(payload->>'phone'),40), left(trim(coalesce(payload->>'email','')),200),
          left(trim(coalesce(payload->>'region','')),80), left(trim(payload->>'city'),80), left(trim(payload->>'address'),400),
          zone, payload->>'payment_method', 0, ship, 0, left(coalesce(payload->>'note',''),500), coalesce(payload->>'locale','en'))
  returning * into o;

  for it in select * from jsonb_array_elements(payload->'items') loop
    q := (it->>'qty')::int;
    if q is null or q < 1 or q > 20 then raise exception 'invalid_qty'; end if;
    select * into p from public.products where id = it->>'product_id' and published for update;
    if not found then raise exception 'unavailable:%', it->>'product_id'; end if;
    if p.stock < q then raise exception 'out_of_stock:%', p.id; end if;
    update public.products set stock = stock - q where id = p.id;
    insert into public.order_items(order_id, product_id, name, size, qty, unit_price)
    values (o.id, p.id, p.name_en, left(coalesce(it->>'size',''),20), q, p.price_ghs);
    sub := sub + p.price_ghs * q;
  end loop;

  update public.orders set subtotal = sub, total = sub + ship where id = o.id;
  return jsonb_build_object('token', o.token, 'order_no', o.order_no);
end $$;
grant execute on function public.place_order(jsonb) to anon, authenticated;

create or replace function public.get_order(_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'order_no', o.order_no, 'status', o.status, 'customer_name', o.customer_name, 'city', o.city, 'zone', o.zone,
    'payment_method', o.payment_method, 'subtotal', o.subtotal, 'shipping', o.shipping, 'total', o.total,
    'payment_reference', o.payment_reference, 'created_at', o.created_at,
    'items', coalesce((select jsonb_agg(jsonb_build_object('name', i.name, 'size', i.size, 'qty', i.qty, 'unit_price', i.unit_price)) from public.order_items i where i.order_id = o.id), '[]'::jsonb))
  from public.orders o where o.token = _token
$$;
grant execute on function public.get_order(uuid) to anon, authenticated;

create or replace function public.submit_payment_reference(_token uuid, _ref text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if length(trim(coalesce(_ref,''))) < 3 then raise exception 'invalid_reference'; end if;
  update public.orders set payment_reference = left(trim(_ref),120), status = 'payment_submitted'
  where token = _token and status in ('awaiting_payment','payment_submitted');
  if not found then raise exception 'order_not_payable'; end if;
end $$;
grant execute on function public.submit_payment_reference(uuid, text) to anon, authenticated;

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 120),
  email text not null check (length(email) between 5 and 200),
  phone text not null default '' check (length(phone) <= 40),
  country text not null check (length(country) between 2 and 80),
  city text not null default '' check (length(city) <= 80),
  items text not null check (length(items) between 2 and 2000),
  status text not null default 'new' check (status in ('new','quoted','closed')),
  created_at timestamptz not null default now()
);
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 120),
  contact text not null check (length(contact) between 5 and 200),
  message text not null check (length(message) between 2 and 3000),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.quote_requests, public.contact_messages to anon, authenticated;
grant select, update, delete on public.quote_requests, public.contact_messages to authenticated;
grant all on public.quote_requests, public.contact_messages to service_role;
alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;
create policy "anyone submits quote" on public.quote_requests for insert to anon, authenticated with check (status = 'new');
create policy "admin manages quotes" on public.quote_requests for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "anyone sends message" on public.contact_messages for insert to anon, authenticated with check (handled = false);
create policy "admin manages messages" on public.contact_messages for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
