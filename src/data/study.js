import { getSupabase } from '@/lib/supabase.js';
import { subjectColors } from '@/data/subjects.js';
import { normalizeSubjectIconName } from '@/lib/icons.js';

export async function loadStudySessions(start, end) {
  const { data, error } = await getSupabase()
    .from('sessoes_estudos')
    .select('id,data_inicio,data_fim,duracao,status,topicos!inner(titulo,materias!inner(nome,icone,cor))')
    .gte('data_inicio', start.toISOString())
    .lt('data_inicio', end.toISOString())
    .order('data_inicio');
  if (error) throw error;

  return (data ?? []).map((session, index) => ({
    id: session.id,
    startedAt: new Date(session.data_inicio),
    endedAt: session.data_fim ? new Date(session.data_fim) : null,
    minutes: session.duracao,
    status: session.status,
    topic: session.topicos.titulo,
    subject: {
      name: session.topicos.materias.nome,
      icon: normalizeSubjectIconName(session.topicos.materias.icone),
      color: session.topicos.materias.cor || subjectColors[index % subjectColors.length],
    },
  }));
}
