import { ref } from 'vue';

export const subjects = ref([
  {
    id: 'matematica',
    name: 'Matemática',
    icon: '∑',
    color: '#b66b59',
    topics: [
      { name: 'Equações', status: 'Em andamento' },
      { name: 'Porcentagem', status: 'Concluído' },
      { name: 'Frações', status: 'Em andamento' },
      { name: 'Geometria', status: 'Não iniciado' },
    ],
    progress: 45,
  },
  {
    id: 'lingua-portuguesa',
    name: 'Língua Portuguesa',
    icon: 'Aa',
    color: '#a66f7d',
    topics: [
      { name: 'Interpretação de texto', status: 'Concluído' },
      { name: 'Classes gramaticais', status: 'Em andamento' },
      { name: 'Figuras de linguagem', status: 'Não iniciado' },
    ],
    progress: 70,
  },
  {
    id: 'biologia',
    name: 'Biologia',
    icon: '❋',
    color: '#66866b',
    topics: [
      { name: 'Ecologia', status: 'Em andamento' },
      { name: 'Citologia', status: 'Não iniciado' },
      { name: 'Genética', status: 'Não iniciado' },
    ],
    progress: 30,
  },
  {
    id: 'geografia',
    name: 'Geografia',
    icon: '⌖',
    color: '#5d8490',
    topics: [
      { name: 'Cartografia', status: 'Concluído' },
      { name: 'Clima e vegetação', status: 'Em andamento' },
      { name: 'Geopolítica', status: 'Não iniciado' },
    ],
    progress: 55,
  },
  {
    id: 'historia',
    name: 'História',
    icon: '◷',
    color: '#b47856',
    topics: [
      { name: 'Brasil Colônia', status: 'Em andamento' },
      { name: 'Revolução Industrial', status: 'Não iniciado' },
      { name: 'Antiguidade clássica', status: 'Não iniciado' },
    ],
    progress: 20,
  },
  {
    id: 'quimica',
    name: 'Química',
    icon: '⚗',
    color: '#a2883f',
    topics: [
      { name: 'Tabela periódica', status: 'Em andamento' },
      { name: 'Ligações químicas', status: 'Não iniciado' },
      { name: 'Estequiometria', status: 'Não iniciado' },
    ],
    progress: 10,
  },
]);

export const subjectColors = [
  '#b66b59',
  '#a66f7d',
  '#66866b',
  '#5d8490',
  '#b47856',
  '#a2883f',
];
