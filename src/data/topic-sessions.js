import { getSupabase } from '@/lib/supabase.js';

const sessionFields = 'id,id_topico,data_inicio,data_fim,duracao,status';

export async function loadCurrentTopicSession(topicId) {
  const { data, error } = await getSupabase()
    .from('sessoes_estudos')
    .select(sessionFields)
    .eq('id_topico', topicId)
    .in('status', ['em_andamento', 'pausada'])
    .order('data_inicio', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  return data;
}

export async function startTopicSession(topicId) {
  const existingSession = await loadCurrentTopicSession(topicId);
  if (existingSession) {
    throw new Error('Já existe uma sessão ativa ou pausada para este tópico.');
  }

  const { data, error } = await getSupabase()
    .from('sessoes_estudos')
    .insert({
      id_topico: topicId,
      data_inicio: new Date().toISOString(),
      duracao: 0,
      status: 'em_andamento',
    })
    .select(sessionFields)
    .single();
  if (error) throw error;

  return data;
}

export async function pauseTopicSession(sessionId, totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const { data, error } = await getSupabase()
    .from('sessoes_estudos')
    .update({
      data_fim: new Date().toISOString(),
      duracao: Math.floor(seconds / 60),
      status: 'pausada',
    })
    .eq('id', sessionId)
    .select(sessionFields)
    .single();
  if (error) throw error;

  return data;
}

export async function resumeTopicSession(sessionId, resumedAt = new Date().toISOString()) {
  const { data, error } = await getSupabase()
    .from('sessoes_estudos')
    .update({
      data_inicio: resumedAt,
      data_fim: null,
      status: 'em_andamento',
    })
    .eq('id', sessionId)
    .select(sessionFields)
    .single();
  if (error) throw error;

  return data;
}

export async function finishTopicSession(sessionId, totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const { data, error } = await getSupabase()
    .from('sessoes_estudos')
    .update({
      data_fim: new Date().toISOString(),
      duracao: Math.floor(seconds / 60),
      status: 'finalizada',
    })
    .eq('id', sessionId)
    .select(sessionFields)
    .single();
  if (error) throw error;

  return data;
}
