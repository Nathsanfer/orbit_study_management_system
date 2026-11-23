import {
  Atom,
  BookOpen,
  Brain,
  Calculator,
  Code2,
  Dna,
  FlaskConical,
  Globe,
  GraduationCap,
  Landmark,
  Languages,
  Leaf,
  Map,
  Microscope,
  Music,
  Palette,
  PenLine,
  Pi,
  ScrollText,
  Sigma,
} from '@lucide/vue';

export const subjectIconRegistry = Object.freeze({
  Atom,
  BookOpen,
  Brain,
  Calculator,
  Code2,
  Dna,
  FlaskConical,
  Globe,
  GraduationCap,
  Landmark,
  Languages,
  Leaf,
  Map,
  Microscope,
  Music,
  Palette,
  PenLine,
  Pi,
  ScrollText,
  Sigma,
});

export const defaultSubjectIconName = 'BookOpen';

export const subjectIconOptions = [
  { name: 'Atom', label: 'Átomo' },
  { name: 'BookOpen', label: 'Livro' },
  { name: 'Brain', label: 'Cérebro' },
  { name: 'Calculator', label: 'Cálculo' },
  { name: 'Code2', label: 'Código' },
  { name: 'Dna', label: 'DNA' },
  { name: 'FlaskConical', label: 'Química' },
  { name: 'Globe', label: 'Globo' },
  { name: 'GraduationCap', label: 'Formatura' },
  { name: 'Landmark', label: 'História' },
  { name: 'Languages', label: 'Idiomas' },
  { name: 'Leaf', label: 'Natureza' },
  { name: 'Map', label: 'Mapa' },
  { name: 'Microscope', label: 'Microscópio' },
  { name: 'Music', label: 'Música' },
  { name: 'Palette', label: 'Arte' },
  { name: 'PenLine', label: 'Escrita' },
  { name: 'Pi', label: 'Pi' },
  { name: 'ScrollText', label: 'Texto' },
  { name: 'Sigma', label: 'Sigma' },
];

export function isSubjectIconName(name) {
  return Object.prototype.hasOwnProperty.call(subjectIconRegistry, name);
}

export function getSubjectIcon(name) {
  return isSubjectIconName(name)
    ? subjectIconRegistry[name]
    : subjectIconRegistry[defaultSubjectIconName];
}

export function normalizeSubjectIconName(name) {
  return isSubjectIconName(name) ? name : defaultSubjectIconName;
}