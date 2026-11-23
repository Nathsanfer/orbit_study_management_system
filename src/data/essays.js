import { getSupabase } from '@/lib/supabase.js';

const essaySelection = `
  id,titulo,tema,texto,data_criacao,
  avaliacao_redacao(
    id,nota,comentario,
    competencias_redacao(competencia,nota,comentario)
  )
`;

function mapEssay(row) {
  const evaluation = row.avaliacao_redacao?.[0] ?? null;
  const competencies = (evaluation?.competencias_redacao ?? [])
    .sort((first, second) => first.competencia - second.competencia)
    .map((competency) => ({
      name: `Competência ${competency.competencia}`,
      score: competency.nota,
      feedback: competency.comentario ?? '',
    }));

  return {
    id: row.id,
    title: row.titulo,
    theme: row.tema,
    date: new Date(row.data_criacao).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    score: evaluation?.nota ?? null,
    feedback: evaluation?.comentario ?? '',
    essay: row.texto ? row.texto.split(/\r?\n\s*\r?\n/).filter(Boolean) : [],
    excerpt: row.texto?.replace(/\s+/g, ' ').slice(0, 130) ?? '',
    competencies,
  };
}

export async function loadEssays() {
  const { data, error } = await getSupabase()
    .from('redacoes')
    .select(essaySelection)
    .order('data_criacao', { ascending: false });
  if (error) throw error;

  return (data ?? []).map(mapEssay);
}

export async function loadEssay(id) {
  const { data, error } = await getSupabase()
    .from('redacoes')
    .select(essaySelection)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;

  return data ? mapEssay(data) : null;
}

export async function createEssay({ title, theme, text }) {
  const { data, error } = await getSupabase()
    .from('redacoes')
    .insert({
      titulo: title,
      tema: theme,
      texto: text,
    })
    .select(essaySelection)
    .single();
  if (error) throw error;

  return mapEssay(data);
}
