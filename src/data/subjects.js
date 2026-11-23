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

const subjectSelection = `
  id,nome,descricao,icone,cor,
  topicos(
    id,titulo,descricao,conteudo,data_criacao,data_atualizacao,
    materiais_topicos(id,nome_arquivo,tipo_arquivo,caminho_arquivo)
  ),
  itens_lista(status)
`;

function mapSubject(row, index = 0) {
  const checklist = row.itens_lista ?? [];
  const completed = checklist.filter((item) => item.status === 'concluido').length;
  return {
    id: row.id,
    name: row.nome,
    description: row.descricao ?? '',
    icon: normalizeSubjectIconName(row.icone),
    color: row.cor || subjectColors[index % subjectColors.length],
    topics: (row.topicos ?? []).map((topic) => ({
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
    })),
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
    .select(subjectSelection)
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
