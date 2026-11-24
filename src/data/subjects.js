import { ref } from 'vue';
import { getSupabase } from '@/lib/supabase.js';
import { defaultSubjectIconName, normalizeSubjectIconName } from '@/lib/icons.js';
import { deleteTopicAssets } from '@/data/topic-assets.js';

export const subjectColors = [
  '#a66f7d',
  '#BC7C8C',
  '#66866b',
  '#5D8E89',
  '#5d8490',
  '#7186A6',
  '#8E7AAE',
  '#89647A',
  '#b66b59',
  '#b47856',
  '#C1A16B',
  '#a2883f',
  '#8D6F5E',
];

export const subjects = ref([]);

const subjectFields = 'id,nome,descricao,icone,cor';
const topicFields = `
  id,titulo,descricao,conteudo,nivel_dominio,data_criacao,data_atualizacao
`;
const subjectSelection = `
  ${subjectFields},
  topicos(${topicFields}),
  itens_lista(status)
`;
const subjectDetailSelection = `
  ${subjectFields},
  topicos(${topicFields},sessoes_estudos(data_inicio,duracao,status)),
  itens_lista(status)
`;

function mapTopic(topic) {
  const sessions = topic.sessoes_estudos ?? [];
  const latestSession = sessions.reduce((latest, session) => {
    if (!latest || Date.parse(session.data_inicio) > Date.parse(latest.data_inicio)) {
      return session;
    }
    return latest;
  }, null);
  const studySeconds = sessions.reduce((total, session) => {
    const recordedSeconds = Math.max(0, Number(session.duracao) || 0) * 60;
    const segmentStart = Date.parse(session.data_inicio);
    const activeSeconds = session.status === 'em_andamento'
      && Number.isFinite(segmentStart)
      ? Math.max(0, Math.floor((Date.now() - segmentStart) / 1000))
      : 0;
    return total + recordedSeconds + activeSeconds;
  }, 0);

  return {
    id: topic.id,
    name: topic.titulo,
    description: topic.descricao ?? '',
    content: topic.conteudo ?? {},
    masteryLevel: topic.nivel_dominio,
    studySeconds,
    studyStatus: latestSession?.status ?? null,
  };
}

function mapSubject(row, index = 0) {
  const checklist = row.itens_lista ?? [];
  const completed = checklist.filter((item) => item.status === 'concluido').length;
  const topics = (row.topicos ?? []).map(mapTopic);
  return {
    id: row.id,
    name: row.nome,
    description: row.descricao ?? '',
    icon: normalizeSubjectIconName(row.icone),
    color: row.cor || subjectColors[index % subjectColors.length],
    topics,
    totalStudySeconds: topics.reduce((total, topic) => total + topic.studySeconds, 0),
    progress: checklist.length ? Math.round((completed / checklist.length) * 100) : 0,
  };
}

export async function loadSubjects() {
  const { data, error } = await getSupabase()
    .from('materias')
    .select(subjectSelection)
    .order('nome');
  if (error) throw error;

  subjects.value = (data ?? []).map(mapSubject);
  return subjects.value;
}

export async function loadSubject(id) {
  const { data, error } = await getSupabase()
    .from('materias')
    .select(subjectDetailSelection)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;

  return data ? mapSubject(data) : null;
}

export async function createSubject({
  name,
  description,
  color,
  iconName = defaultSubjectIconName,
}) {
  const { data, error } = await getSupabase()
    .from('materias')
    .insert({
      nome: name,
      descricao: description,
      icone: normalizeSubjectIconName(iconName),
      cor: color,
    })
    .select(subjectSelection)
    .single();
  if (error) throw error;

  return mapSubject(data, subjects.value.length);
}

export async function updateSubject({
  id,
  name,
  description,
  color,
  iconName = defaultSubjectIconName,
}) {
  const { data, error } = await getSupabase()
    .from('materias')
    .update({
      nome: name,
      descricao: description,
      icone: normalizeSubjectIconName(iconName),
      cor: color,
    })
    .eq('id', id)
    .select(subjectSelection)
    .single();
  if (error) throw error;

  const subjectIndex = subjects.value.findIndex((subject) => subject.id === id);
  return mapSubject(data, subjectIndex < 0 ? 0 : subjectIndex);
}

export async function createTopic({ subjectId, name, description }) {
  const { data, error } = await getSupabase()
    .from('topicos')
    .insert({
      id_materia: subjectId,
      titulo: name,
      descricao: description || null,
      conteudo: {},
    })
    .select('id,titulo,descricao,conteudo,nivel_dominio,data_criacao,data_atualizacao')
    .single();
  if (error) throw error;

  return mapTopic(data);
}

export async function updateTopic({ topicId, name, description }) {
  const { error } = await getSupabase()
    .from('topicos')
    .update({
      titulo: name,
      descricao: description || null,
    })
    .eq('id', topicId);
  if (error) throw error;
}

async function removeTopicAssets(topicIds) {
  const cleanupErrors = [];
  for (const topicId of topicIds) {
    try {
      await deleteTopicAssets(topicId);
    } catch (error) {
      cleanupErrors.push({
        topicId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return cleanupErrors;
}

export async function deleteTopic(topicId) {
  const { error } = await getSupabase().rpc('excluir_topico', {
    p_id_topico: topicId,
  });
  if (error) throw error;

  return {
    assetCleanupErrors: await removeTopicAssets([topicId]),
  };
}

export async function deleteSubject(subjectId) {
  const { data, error } = await getSupabase().rpc('excluir_materia', {
    p_id_materia: subjectId,
  });
  if (error) throw error;
  if (!Array.isArray(data)) {
    throw new Error('A exclusão da matéria não retornou os tópicos removidos.');
  }

  return {
    assetCleanupErrors: await removeTopicAssets(data),
  };
}
