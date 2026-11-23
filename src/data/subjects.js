import { ref } from 'vue';

export const subjects = ref([
  {
    id: 'matematica',
    name: 'Matemática',
    icon: '∑',
    color: '#b66b59',
    topics: [
      {
        id: 'equacoes',
        name: 'Equações',
        status: 'Em andamento',
        summary: 'Uma equação representa uma igualdade entre duas expressões. Resolver uma equação é encontrar o valor da incógnita que torna essa igualdade verdadeira.',
        notes: 'Lembre-se de aplicar a mesma operação nos dois lados da igualdade para manter o equilíbrio.',
        materials: [
          { id: 'guia-equacoes', type: 'PDF', title: 'Guia de equações', description: 'Material demonstrativo · 1,2 MB' },
          { id: 'mapa-equacoes', type: 'Imagem', title: 'Mapa visual', description: 'Material demonstrativo' },
        ],
      },
      {
        id: 'porcentagem',
        name: 'Porcentagem',
        status: 'Concluído',
        summary: 'Porcentagem é uma forma de representar uma parte de um todo dividido em cem partes iguais.',
        materials: [
          { id: 'resumo-porcentagem', type: 'Resumo', title: 'Porcentagem no dia a dia', description: 'Texto demonstrativo · 3 min de leitura' },
        ],
      },
      { id: 'fracoes', name: 'Frações', status: 'Em andamento' },
      { id: 'geometria', name: 'Geometria', status: 'Não iniciado' },
    ],
    progress: 45,
  },
  {
    id: 'lingua-portuguesa',
    name: 'Língua Portuguesa',
    icon: 'Aa',
    color: '#a66f7d',
    topics: [
      { id: 'interpretacao-de-texto', name: 'Interpretação de texto', status: 'Concluído' },
      { id: 'classes-gramaticais', name: 'Classes gramaticais', status: 'Em andamento' },
      { id: 'figuras-de-linguagem', name: 'Figuras de linguagem', status: 'Não iniciado' },
    ],
    progress: 70,
  },
  {
    id: 'biologia',
    name: 'Biologia',
    icon: '❋',
    color: '#66866b',
    topics: [
      { id: 'ecologia', name: 'Ecologia', status: 'Em andamento' },
      { id: 'citologia', name: 'Citologia', status: 'Não iniciado' },
      { id: 'genetica', name: 'Genética', status: 'Não iniciado' },
    ],
    progress: 30,
  },
  {
    id: 'geografia',
    name: 'Geografia',
    icon: '⌖',
    color: '#5d8490',
    topics: [
      { id: 'cartografia', name: 'Cartografia', status: 'Concluído' },
      { id: 'clima-e-vegetacao', name: 'Clima e vegetação', status: 'Em andamento' },
      { id: 'geopolitica', name: 'Geopolítica', status: 'Não iniciado' },
    ],
    progress: 55,
  },
  {
    id: 'historia',
    name: 'História',
    icon: '◷',
    color: '#b47856',
    topics: [
      { id: 'brasil-colonia', name: 'Brasil Colônia', status: 'Em andamento' },
      { id: 'revolucao-industrial', name: 'Revolução Industrial', status: 'Não iniciado' },
      { id: 'antiguidade-classica', name: 'Antiguidade clássica', status: 'Não iniciado' },
    ],
    progress: 20,
  },
  {
    id: 'quimica',
    name: 'Química',
    icon: '⚗',
    color: '#a2883f',
    topics: [
      { id: 'tabela-periodica', name: 'Tabela periódica', status: 'Em andamento' },
      { id: 'ligacoes-quimicas', name: 'Ligações químicas', status: 'Não iniciado' },
      { id: 'estequiometria', name: 'Estequiometria', status: 'Não iniciado' },
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
