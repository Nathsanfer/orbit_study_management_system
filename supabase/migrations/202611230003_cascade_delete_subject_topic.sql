create or replace function public.excluir_topico(p_id_topico uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.topicos
    where id = p_id_topico
  ) then
    raise exception 'Tópico não encontrado';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'materiais_topicos'
      and column_name = 'id_topico'
  ) then
    execute 'delete from public.materiais_topicos where id_topico = $1'
      using p_id_topico;
  end if;

  delete from public.sessoes_estudos
  where id_topico = p_id_topico;

  delete from public.topicos
  where id = p_id_topico;
end;
$$;

create or replace function public.excluir_materia(p_id_materia uuid)
returns uuid[]
language plpgsql
security invoker
set search_path = ''
as $$
declare
  topic_ids uuid[];
begin
  if not exists (
    select 1
    from public.materias
    where id = p_id_materia
  ) then
    raise exception 'Matéria não encontrada';
  end if;

  select coalesce(array_agg(id), '{}'::uuid[])
  into topic_ids
  from public.topicos
  where id_materia = p_id_materia;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'materiais_topicos'
      and column_name = 'id_topico'
  ) then
    execute 'delete from public.materiais_topicos where id_topico = any($1)'
      using topic_ids;
  end if;

  delete from public.sessoes_estudos
  where id_topico = any(topic_ids);

  delete from public.itens_lista
  where id_materia = p_id_materia;

  delete from public.topicos
  where id_materia = p_id_materia;

  delete from public.materias
  where id = p_id_materia;

  return topic_ids;
end;
$$;

revoke all on function public.excluir_topico(uuid) from public;
revoke all on function public.excluir_materia(uuid) from public;
grant execute on function public.excluir_topico(uuid) to authenticated;
grant execute on function public.excluir_materia(uuid) to authenticated;

notify pgrst, 'reload schema';
