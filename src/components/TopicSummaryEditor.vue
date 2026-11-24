<script setup>
import { onMounted, ref, watch } from 'vue';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Placeholder } from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import { getTopicAssetUrl, uploadTopicImage } from '@/data/topic-assets.js';
import { getErrorMessage } from '@/lib/supabase.js';
import { TopicCallout, TopicHorizontalRule, TopicImage } from '@/lib/topic-editor-extensions.js';

const props = defineProps({
  topicId: {
    type: [String, Number],
    required: true,
  },
  modelValue: {
    type: [Object, String],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);
const imageInput = ref(null);
const isUploadingImage = ref(false);
const editorError = ref('');
let contentRestored = false;

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      horizontalRule: false,
      link: { openOnClick: false },
      heading: { levels: [1, 2, 3] },
    }),
    TopicHorizontalRule,
    TopicImage.configure({
      allowBase64: false,
    }),
    TopicCallout,
    Placeholder.configure({ placeholder: 'Escreva seu resumo, organize ideias e registre descobertas...' }),
    TableKit.configure({ table: { resizable: true } }),
  ],
  content: { type: 'doc', content: [{ type: 'paragraph' }] },
  onUpdate: ({ editor: currentEditor }) => {
    emit('update:modelValue', toStoredDocument(currentEditor.getJSON()));
  },
});

watch(
  editor,
  (instance) => {
    if (instance && !contentRestored) {
      contentRestored = true;
      void restoreContent(instance);
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (editor.value && !contentRestored) {
    contentRestored = true;
    void restoreContent(editor.value);
  }
});

function toDocument(content) {
  if (content && typeof content === 'object' && content.type === 'doc') {
    return JSON.parse(JSON.stringify(content));
  }

  if (typeof content === 'string' && content.trim()) {
    const paragraphs = content
      .split(/\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((text) => ({ type: 'paragraph', content: [{ type: 'text', text }] }));
    return { type: 'doc', content: paragraphs.length ? paragraphs : [{ type: 'paragraph' }] };
  }

  return { type: 'doc', content: [{ type: 'paragraph' }] };
}

function toStoredDocument(document) {
  const storedDocument = JSON.parse(JSON.stringify(document));
  const removeTemporaryUrls = (node) => {
    if (node.type === 'image' && node.attrs?.storagePath) node.attrs.src = null;
    node.content?.forEach(removeTemporaryUrls);
  };
  removeTemporaryUrls(storedDocument);
  return storedDocument;
}

async function restoreImageUrls(node) {
  if (node.type === 'image' && node.attrs?.storagePath) {
    try {
      node.attrs.src = await getTopicAssetUrl(node.attrs.storagePath);
    } catch (error) {
      editorError.value = getErrorMessage(error);
      node.attrs.src = '';
    }
  }

  if (node.content) {
    await Promise.all(node.content.map(restoreImageUrls));
  }
}

async function restoreContent(instance) {
  const document = toDocument(props.modelValue);
  await restoreImageUrls(document);
  if (!instance.isDestroyed) {
    instance.commands.setContent(document, { emitUpdate: false });
  }
}

function toggleHeading(level) {
  editor.value?.chain().focus().toggleHeading({ level }).run();
}

function setBlockStyle(event) {
  const style = event.target.value;
  if (style === 'paragraph') {
    editor.value?.chain().focus().setParagraph().run();
  } else {
    toggleHeading(Number(style));
  }
}

function setLink() {
  const currentUrl = editor.value?.getAttributes('link').href ?? '';
  const url = window.prompt('Endereço do link', currentUrl);
  if (url === null) return;

  const chain = editor.value?.chain().focus();
  if (!chain) return;
  if (url.trim()) chain.setLink({ href: url.trim() }).run();
  else chain.unsetLink().run();
}

function setCallout(kind) {
  const currentEditor = editor.value;
  if (!currentEditor) return;

  const chain = currentEditor.chain().focus();
  if (currentEditor.isActive('topicCallout')) {
    chain.updateAttributes('topicCallout', { kind }).run();
  } else {
    chain.wrapIn('topicCallout', { kind }).run();
  }
}

function insertTable() {
  editor.value?.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run();
}

function insertDivider(variant) {
  editor.value?.chain().focus().insertContent({
    type: 'horizontalRule',
    attrs: { variant },
  }).run();
}

function selectImage() {
  imageInput.value?.click();
}

async function handleImageUpload(event) {
  const [file] = event.target.files ?? [];
  event.target.value = '';
  if (!file || !editor.value) return;

  editorError.value = '';
  isUploadingImage.value = true;
  try {
    const image = await uploadTopicImage(props.topicId, file);
    editor.value.chain().focus().setImage({
      src: image.signedUrl,
      alt: file.name,
      storagePath: image.path,
    }).run();
  } catch (error) {
    editorError.value = getErrorMessage(error);
  } finally {
    isUploadingImage.value = false;
  }
}
</script>

<template>
  <section class="summary-editor" aria-label="Editor de resumo">
    <div v-if="editor" class="editor-toolbar" role="toolbar" aria-label="Formatação do resumo">
      <label class="block-style-label">
        <span class="sr-only">Estilo do parágrafo</span>
        <select aria-label="Estilo do parágrafo" @change="setBlockStyle">
          <option value="paragraph">Texto</option>
          <option value="1">Título</option>
          <option value="2">Subtítulo</option>
          <option value="3">Título pequeno</option>
        </select>
      </label>
      <span class="toolbar-divider" aria-hidden="true"></span>
      <button
        class="tool-button"
        :class="{ active: editor.isActive('bold') }"
        type="button"
        title="Negrito"
        aria-label="Negrito"
        :aria-pressed="editor.isActive('bold')"
        @mousedown.prevent
        @click="editor.chain().focus().toggleBold().run()"
      ><strong>B</strong></button>
      <button
        class="tool-button italic-tool"
        :class="{ active: editor.isActive('italic') }"
        type="button"
        title="Itálico"
        aria-label="Itálico"
        :aria-pressed="editor.isActive('italic')"
        @mousedown.prevent
        @click="editor.chain().focus().toggleItalic().run()"
      >I</button>
      <button
        class="tool-button underline-tool"
        :class="{ active: editor.isActive('underline') }"
        type="button"
        title="Sublinhado"
        aria-label="Sublinhado"
        :aria-pressed="editor.isActive('underline')"
        @mousedown.prevent
        @click="editor.chain().focus().toggleUnderline().run()"
      >U</button>
      <button
        class="tool-button"
        :class="{ active: editor.isActive('strike') }"
        type="button"
        title="Riscado"
        aria-label="Riscado"
        :aria-pressed="editor.isActive('strike')"
        @mousedown.prevent
        @click="editor.chain().focus().toggleStrike().run()"
      >S</button>
      <span class="toolbar-divider" aria-hidden="true"></span>
      <button
        class="tool-button"
        :class="{ active: editor.isActive('bulletList') }"
        type="button"
        title="Lista com marcadores"
        aria-label="Lista com marcadores"
        :aria-pressed="editor.isActive('bulletList')"
        @mousedown.prevent
        @click="editor.chain().focus().toggleBulletList().run()"
      >• Lista</button>
      <button
        class="tool-button"
        :class="{ active: editor.isActive('orderedList') }"
        type="button"
        title="Lista numerada"
        aria-label="Lista numerada"
        :aria-pressed="editor.isActive('orderedList')"
        @mousedown.prevent
        @click="editor.chain().focus().toggleOrderedList().run()"
      >1. Lista</button>
      <button
        class="tool-button"
        :class="{ active: editor.isActive('blockquote') }"
        type="button"
        title="Citação em bloco"
        aria-label="Citação em bloco"
        :aria-pressed="editor.isActive('blockquote')"
        @mousedown.prevent
        @click="editor.chain().focus().toggleBlockquote().run()"
      >Citação</button>
      <button
        class="tool-button"
        type="button"
        title="Adicionar ou editar link"
        aria-label="Adicionar ou editar link"
        @mousedown.prevent
        @click="setLink"
      >Link</button>
      <span class="toolbar-divider" aria-hidden="true"></span>
      <button
        class="tool-button"
        type="button"
        title="Adicionar imagem"
        aria-label="Adicionar imagem"
        :disabled="isUploadingImage"
        @mousedown.prevent
        @click="selectImage"
      >{{ isUploadingImage ? 'Enviando...' : 'Imagem' }}</button>
      <input
        ref="imageInput"
        class="image-input"
        type="file"
        accept="image/*"
        @change="handleImageUpload"
      />
      <button
        class="tool-button"
        type="button"
        title="Inserir tabela com duas colunas"
        aria-label="Inserir tabela com duas colunas"
        @mousedown.prevent
        @click="insertTable"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M2.5 6h11M6 3v10M10 3v10" stroke="currentColor" stroke-width="1.2"/>
        </svg>
        Tabela
      </button>
      <button
        class="tool-button divider-tool"
        type="button"
        title="Inserir divisor colorido"
        @mousedown.prevent
        @click="insertDivider('accent')"
      ><span class="divider-preview accent" aria-hidden="true"></span>Divisor</button>
      <button
        class="tool-button divider-tool"
        type="button"
        title="Inserir divisor fino cinza"
        @mousedown.prevent
        @click="insertDivider('subtle')"
      ><span class="divider-preview subtle" aria-hidden="true"></span>Divisor fino</button>
      <span class="toolbar-divider" aria-hidden="true"></span>
      <button
        v-for="callout in [
          { kind: 'info', label: 'Importante' },
          { kind: 'tip', label: 'Dica' },
          { kind: 'observation', label: 'Observação' },
          { kind: 'example', label: 'Exemplo' },
          { kind: 'warning', label: 'Alerta' },
        ]"
        :key="callout.kind"
        class="tool-button callout-tool"
        type="button"
        :title="`Criar bloco: ${callout.label}`"
        @mousedown.prevent
        @click="setCallout(callout.kind)"
      >{{ callout.label }}</button>
    </div>

    <p v-if="editorError" class="editor-error" role="alert">{{ editorError }}</p>
    <EditorContent v-if="editor" :editor="editor" class="editor-content" />
  </section>
</template>

<style scoped>
.summary-editor {
  overflow: hidden;
  margin-top: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 5px;
  overflow-x: auto;
  padding: 9px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface-soft) 62%, var(--surface));
  scrollbar-width: thin;
}

.block-style-label {
  flex: 0 0 auto;
}

.block-style-label select {
  height: 30px;
  padding: 0 8px;
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--text-soft);
  background: var(--surface);
  font: inherit;
  font-size: 10px;
}

.toolbar-divider {
  width: 1px;
  height: 21px;
  flex: 0 0 auto;
  margin: 0 3px;
  background: var(--border);
}

.tool-button {
  display: inline-flex;
  min-width: 29px;
  height: 30px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 7px;
  color: var(--text-soft);
  background: transparent;
  font: inherit;
  font-size: 10px;
  cursor: pointer;
  transition: background .15s ease, color .15s ease, border-color .15s ease;
}

.tool-button:hover,
.tool-button.active {
  border-color: color-mix(in srgb, var(--subject-color) 20%, var(--border));
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 9%, var(--surface));
}

.tool-button:disabled {
  cursor: wait;
  opacity: .6;
}

.italic-tool {
  font-family: var(--font-title);
  font-style: italic;
  font-weight: 700;
}

.underline-tool {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.callout-tool {
  border-color: var(--border);
  background: var(--surface);
}

.divider-tool {
  gap: 6px;
}

.divider-preview {
  width: 19px;
  border-radius: 2px;
}

.divider-preview.accent {
  height: 4px;
  background: var(--subject-color);
}

.divider-preview.subtle {
  height: 1px;
  background: #aeb3ba;
}

.image-input {
  display: none;
}

.editor-error {
  margin: 10px 14px 0;
  color: #b54747;
  font-size: 10px;
  line-height: 1.5;
}

.editor-content {
  min-height: 290px;
  padding: 7px 17px 18px;
  color: var(--text);
}

.editor-content :deep(.tiptap) {
  min-height: 265px;
  outline: none;
  font-size: 12px;
  line-height: 1.8;
}

.editor-content :deep(.tiptap > * + *) {
  margin-top: .75em;
}

.editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  float: left;
  height: 0;
  color: var(--muted);
  content: attr(data-placeholder);
  pointer-events: none;
}

.editor-content :deep(.tiptap h1),
.editor-content :deep(.tiptap h2),
.editor-content :deep(.tiptap h3) {
  margin: 1.2em 0 .45em;
  color: var(--text);
  font-family: var(--font-title);
  line-height: 1.3;
}

.editor-content :deep(.tiptap h1) {
  font-size: 26px;
}

.editor-content :deep(.tiptap h2) {
  font-size: 21px;
}

.editor-content :deep(.tiptap h3) {
  font-size: 17px;
}

.editor-content :deep(.tiptap ul),
.editor-content :deep(.tiptap ol) {
  padding-left: 1.5em;
}

.editor-content :deep(.tiptap a) {
  color: var(--subject-color);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.editor-content :deep(.tiptap blockquote) {
  margin-inline: 0;
  padding: 10px 14px;
  border-left: 3px solid color-mix(in srgb, var(--subject-color) 60%, var(--border));
  border-radius: 0 8px 8px 0;
  color: var(--text-soft);
  background: color-mix(in srgb, var(--subject-color) 6%, var(--surface));
}

.editor-content :deep(.tiptap aside[data-topic-callout]) {
  margin: 14px 0;
  padding: 12px 15px;
  border: 1px solid color-mix(in srgb, var(--subject-color) 22%, var(--border));
  border-left: 4px solid var(--subject-color);
  border-radius: 9px;
  background: color-mix(in srgb, var(--subject-color) 6%, var(--surface));
}

.editor-content :deep(.tiptap aside[data-topic-callout]::before) {
  display: block;
  margin-bottom: 5px;
  color: var(--subject-color);
  content: 'Importante';
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.editor-content :deep(.tiptap aside[data-callout-kind='tip']::before) {
  content: 'Dica';
}

.editor-content :deep(.tiptap aside[data-callout-kind='observation']::before) {
  content: 'Observação';
}

.editor-content :deep(.tiptap aside[data-callout-kind='example']::before) {
  content: 'Exemplo';
}

.editor-content :deep(.tiptap aside[data-callout-kind='warning']::before) {
  content: 'Alerta';
}

.editor-content :deep(.tiptap aside[data-callout-kind='tip']) {
  --subject-color: #66866b;
}

.editor-content :deep(.tiptap aside[data-callout-kind='observation']) {
  --subject-color: #8e7aae;
}

.editor-content :deep(.tiptap aside[data-callout-kind='example']) {
  --subject-color: #7186a6;
}

.editor-content :deep(.tiptap aside[data-callout-kind='warning']) {
  --subject-color: #b66b59;
}

.editor-content :deep(.tiptap table) {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 9px;
  border-spacing: 0;
  overflow: hidden;
  table-layout: fixed;
}

.editor-content :deep(.tiptap .tableWrapper) {
  overflow-x: auto;
}

.editor-content :deep(.tiptap th),
.editor-content :deep(.tiptap td) {
  min-width: 70px;
  padding: 8px 10px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
}

.editor-content :deep(.tiptap th) {
  border-top: 3px solid var(--subject-color);
  color: var(--text);
  background: color-mix(in srgb, var(--subject-color) 8%, var(--surface));
  font-weight: 600;
}

.editor-content :deep(.tiptap tr > :last-child) {
  border-right: 0;
}

.editor-content :deep(.tiptap tr:last-child > *) {
  border-bottom: 0;
}

.editor-content :deep(.tiptap tr:nth-child(even) td) {
  background: color-mix(in srgb, var(--surface-soft) 55%, var(--surface));
}

.editor-content :deep(.tiptap img) {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 9px;
}

.editor-content :deep(.tiptap hr) {
  border: 0;
  border-top: 1px solid #b8bdc4;
  margin: 1.3em 0;
}

.editor-content :deep(.tiptap hr[data-variant='accent']) {
  border-top: 4px solid var(--subject-color);
  border-radius: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@media (max-width: 600px) {
  .editor-content {
    min-height: 240px;
    padding-inline: 13px;
  }

  .editor-content :deep(.tiptap) {
    min-height: 215px;
  }
}
</style>
