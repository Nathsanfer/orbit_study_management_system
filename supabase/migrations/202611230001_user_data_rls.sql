insert into public.perfis (id, nome_completo)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'nome_completo', ''),
    split_part(coalesce(u.email, ''), '@', 1)
  )
from auth.users u
on conflict (id) do nothing;

do $$
declare
  table_name text;
  existing_policy record;
  shared_tables text[] := array[
    'materias',
    'topicos',
    'materiais_topicos',
    'itens_lista',
    'sessoes_estudos',
    'redacoes',
    'avaliacao_redacao',
    'competencias_redacao'
  ];
begin
  for existing_policy in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'perfis',
        'materias',
        'topicos',
        'materiais_topicos',
        'itens_lista',
        'sessoes_estudos',
        'redacoes',
        'avaliacao_redacao',
        'competencias_redacao'
      ])
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      existing_policy.policyname,
      existing_policy.tablename
    );
  end loop;

  alter table public.perfis enable row level security;
  for table_name in select unnest(shared_tables)
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy "dados compartilhados autenticados" on public.%I for all to authenticated using (true) with check (true)',
      table_name
    );
  end loop;
end;
$$;

create policy "perfil proprio" on public.perfis
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create or replace function public.criar_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome_completo)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nome_completo', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists criar_perfil_apos_cadastro on auth.users;
create trigger criar_perfil_apos_cadastro
  after insert on auth.users
  for each row execute function public.criar_perfil_usuario();

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.perfis,
  public.materias,
  public.topicos,
  public.materiais_topicos,
  public.itens_lista,
  public.sessoes_estudos,
  public.redacoes,
  public.avaliacao_redacao,
  public.competencias_redacao
to authenticated;

notify pgrst, 'reload schema';
