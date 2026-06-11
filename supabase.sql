-- 1) TROQUE ESTE EMAIL PELO MESMO EMAIL DO USUÁRIO ADMIN QUE VOCÊ VAI CRIAR NO SUPABASE AUTH
-- Exemplo: 'danielfinotti2@gmail.com'

create table if not exists public.projects (
  id text primary key,
  badge text not null default 'PROJETO',
  title text not null,
  description text not null,
  link text default '',
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  package_id text not null,
  package_name text not null,
  project_price numeric default 0,
  name text not null,
  contact text not null,
  domain_note text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.package_views (
  id uuid primary key default gen_random_uuid(),
  package_id text not null,
  package_name text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.leads enable row level security;
alter table public.package_views enable row level security;

drop policy if exists "Projetos públicos podem ser lidos" on public.projects;
drop policy if exists "Admin insere projetos" on public.projects;
drop policy if exists "Admin atualiza projetos" on public.projects;
drop policy if exists "Admin apaga projetos" on public.projects;

drop policy if exists "Visitantes podem criar leads" on public.leads;
drop policy if exists "Admin lê leads" on public.leads;
drop policy if exists "Admin apaga leads" on public.leads;

drop policy if exists "Visitantes podem registrar cliques" on public.package_views;
drop policy if exists "Admin lê cliques" on public.package_views;
drop policy if exists "Admin apaga cliques" on public.package_views;

create policy "Projetos públicos podem ser lidos"
on public.projects for select
using (true);

create policy "Admin insere projetos"
on public.projects for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'COLE_AQUI_SEU_EMAIL_DO_SUPABASE');

create policy "Admin atualiza projetos"
on public.projects for update
to authenticated
using ((auth.jwt() ->> 'email') = 'COLE_AQUI_SEU_EMAIL_DO_SUPABASE')
with check ((auth.jwt() ->> 'email') = 'COLE_AQUI_SEU_EMAIL_DO_SUPABASE');

create policy "Admin apaga projetos"
on public.projects for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'COLE_AQUI_SEU_EMAIL_DO_SUPABASE');

create policy "Visitantes podem criar leads"
on public.leads for insert
with check (true);

create policy "Admin lê leads"
on public.leads for select
to authenticated
using ((auth.jwt() ->> 'email') = 'COLE_AQUI_SEU_EMAIL_DO_SUPABASE');

create policy "Admin apaga leads"
on public.leads for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'COLE_AQUI_SEU_EMAIL_DO_SUPABASE');

create policy "Visitantes podem registrar cliques"
on public.package_views for insert
with check (true);

create policy "Admin lê cliques"
on public.package_views for select
to authenticated
using ((auth.jwt() ->> 'email') = 'COLE_AQUI_SEU_EMAIL_DO_SUPABASE');

create policy "Admin apaga cliques"
on public.package_views for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'COLE_AQUI_SEU_EMAIL_DO_SUPABASE');

insert into public.projects (id, badge, title, description, link, sort_order)
values
  ('proj-loja-01', 'LOJA 01', 'Vitrine minimalista', 'Modelo para produtos, combos e chamada rápida para WhatsApp.', '', 1),
  ('proj-site-02', 'SITE 02', 'Empresa local', 'Modelo institucional para apresentar serviço, confiança e contato.', '', 2),
  ('proj-lp-03', 'LP 03', 'Oferta direta', 'Landing page para promoção, lançamento ou campanha com foco em venda.', '', 3)
on conflict (id) do nothing;
