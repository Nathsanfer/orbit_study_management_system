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
    evaluationId: evaluation?.id ?? null,
    title: row.titulo,
    theme: row.tema,
    text: row.texto ?? '',
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

export async function createEssay({ title = '', theme, text }) {
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

export async function saveEssayEvaluation({
  essayId,
  evaluationId,
  score,
  feedback,
  competencies,
}) {
  const supabase = getSupabase();
  let resolvedEvaluationId = evaluationId;

  if (resolvedEvaluationId) {
    const { error } = await supabase
      .from('avaliacao_redacao')
      .update({ nota: score, comentario: feedback })
      .eq('id', resolvedEvaluationId);
    if (error) throw error;
  } else {
    const essayForeignKeys = ['id_redacao', 'redacao_id', 'redacao'];
    let evaluationData = null;
    let evaluationError = null;

    for (const foreignKey of essayForeignKeys) {
      const result = await supabase
        .from('avaliacao_redacao')
        .insert({ [foreignKey]: essayId, nota: score, comentario: feedback })
        .select('id')
        .single();

      if (!result.error) {
        evaluationData = result.data;
        break;
      }
      evaluationError = result.error;
    }

    if (!evaluationData) throw evaluationError;
    resolvedEvaluationId = evaluationData.id;
  }

  const evaluationForeignKeys = ['id_avaliacao', 'avaliacao_id', 'avaliacao'];
  let existingCompetencies = null;
  let loadError = null;

  for (const foreignKey of evaluationForeignKeys) {
    const result = await supabase
      .from('competencias_redacao')
      .select('id,competencia')
      .eq(foreignKey, resolvedEvaluationId);

    if (!result.error) {
      existingCompetencies = result.data;
      break;
    }
    loadError = result.error;
  }

  if (!existingCompetencies) throw loadError;

  const existingByNumber = new Map(
    (existingCompetencies ?? []).map((competency) => [competency.competencia, competency.id]),
  );

  for (const competency of competencies) {
    const values = {
      nota: competency.score,
      comentario: competency.feedback,
    };
    const existingId = existingByNumber.get(competency.number);

    if (existingId) {
      const { error } = await supabase
        .from('competencias_redacao')
        .update(values)
        .eq('id', existingId);
      if (error) throw error;
    } else {
      let insertError = null;
      for (const foreignKey of evaluationForeignKeys) {
        const result = await supabase
          .from('competencias_redacao')
          .insert({
            [foreignKey]: resolvedEvaluationId,
            competencia: competency.number,
            ...values,
          });

        if (!result.error) {
          insertError = null;
          break;
        }
        insertError = result.error;
      }
      if (insertError) throw insertError;
    }
  }

  return resolvedEvaluationId;
}

export async function saveEssayText(essayId, text, title) {
  const { data, error } = await getSupabase()
    .from('redacoes')
    .update({
      texto: text,
      ...(title !== undefined ? { titulo: title } : {}),
    })
    .eq('id', essayId)
    .select(essaySelection)
    .single();
  if (error) throw error;

  return data ? mapEssay(data) : null;
}

export async function updateEssayDetails(essayId, theme, title) {
  const { data, error } = await getSupabase()
    .from('redacoes')
    .update({
      tema: theme,
      titulo: title,
    })
    .eq('id', essayId)
    .select(essaySelection)
    .single();
  if (error) throw error;

  return data ? mapEssay(data) : null;
}

export async function deleteEssay(essayId) {
  const { error } = await getSupabase()
    .from('redacoes')
    .delete()
    .eq('id', essayId);
  if (error) throw error;
}
