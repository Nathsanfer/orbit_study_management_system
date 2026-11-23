import { ref } from 'vue';
import { getSupabase } from '@/lib/supabase.js';
import { defaultSubjectIconName, normalizeSubjectIconName } from '@/lib/icons.js';

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
  id,titulo,descricao,conteudo,data_criacao,data_atualizacao,
  materiais_topicos(id,nome_arquivo,tipo_arquivo,caminho_arquivo)
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

  return {
    id: topic.id,
    name: topic.titulo,
    description: topic.descricao ?? '',
    content: topic.conteudo ?? {},
    materials: (topic.materiais_topicos ?? []).map((material) => ({
      id: material.id,
      title: material.nome_arquivo,
      type: material.tipo_arquivo,
      description: material.caminho_arquivo,
    })),
    studyMinutes: sessions.reduce((total, session) => {
      const duration = Number(session.duracao);
      return total + (Number.isFinite(duration) ? duration : 0);
    }, 0),
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
    totalStudyMinutes: topics.reduce((total, topic) => total + topic.studyMinutes, 0),
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

export async function createTopic({ subjectId, name, description }) {
  const { data, error } = await getSupabase()
    .from('topicos')
    .insert({
      id_materia: subjectId,
      titulo: name,
      descricao: description || null,
      conteudo: {},
    })
    .select('id,titulo,descricao,conteudo,data_criacao,data_atualizacao')
    .single();
  if (error) throw error;

  return mapTopic(data);
}
