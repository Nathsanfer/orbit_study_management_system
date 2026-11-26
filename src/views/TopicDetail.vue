<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  RouterLink,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter,
} from 'vue-router';
import { saveTopicContent } from '@/data/topic-content.js';
import { saveTopicMasteryRating } from '@/data/topic-mastery.js';
import {
  deleteTopic as removeTopicRecord,
  loadSubject,
  updateTopic as updateTopicRecord,
} from '@/data/subjects.js';
import { getErrorMessage } from '@/lib/supabase.js';
import { getSubjectIcon } from '@/lib/icons.js';
import StudyTimer from '@/components/StudyTimer.vue';
import TopicSummaryEditor from '@/components/TopicSummaryEditor.vue';

const route = useRoute();
const router = useRouter();
const subject = ref(null);
const topic = ref(null);
const showTopicEditDialog = ref(false);
const showTopicDeleteDialog = ref(false);
const editTopicName = ref('');
const editTopicDescription = ref('');
const isSavingTopic = ref(false);
const isDeletingTopic = ref(false);
const topicEditErrorMessage = ref('');
const topicDeleteErrorMessage = ref('');
const isLoading = ref(true);
const errorMessage = ref('');
const summaryContent = computed(() =>
  topic.value?.content?.resumo_rich
    ?? topic.value?.content?.resumo
    ?? topic.value?.content?.summary
    ?? topic.value?.description
    ?? '',
);
const notes = computed(() =>
  topic.value?.content?.anotacoes ?? topic.value?.content?.notes ?? '',
);
const masteryRating = ref(0);
const savedMasteryRating = ref(0);
const masteryErrorMessage = ref('');
const isSavingMastery = ref(false);
const contentSaveStatus = ref('saved');
const contentSaveError = ref('');
const masteryLevels = [
  { value: 1, label: 'Ainda não compreendi' },
  { value: 2, label: 'Tenho bastante dificuldade' },
  { value: 3, label: 'Compreendi parcialmente' },
  { value: 4, label: 'Tenho um bom domínio' },
  { value: 5, label: 'Domino o conteúdo' },
];
let pendingContentTimer;
let contentSaveQueue = Promise.resolve();
let contentRevision = 0;
let savedRevision = 0;

async function loadCurrentTopic() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    subject.value = await loadSubject(route.params.subjectId);
    topic.value = subject.value?.topics.find((item) => item.id === route.params.topicId) ?? null;
    const savedRating = Number(topic.value?.masteryLevel);
    const legacyRating = Number(topic.value?.content?.avaliacao_dominio);
    masteryRating.value = Number.isInteger(savedRating) && savedRating >= 1 && savedRating <= 5
      ? savedRating
      : Number.isInteger(legacyRating) && legacyRating >= 1 && legacyRating <= 5
        ? legacyRating
        : 0;
    savedMasteryRating.value = masteryRating.value;
    masteryErrorMessage.value = '';
    contentRevision = 0;
    savedRevision = 0;
    contentSaveStatus.value = 'saved';
    contentSaveError.value = '';
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadCurrentTopic);
watch(
  () => [route.params.subjectId, route.params.topicId],
  loadCurrentTopic,
);

onBeforeRouteLeave(flushPendingContent);
onBeforeRouteUpdate(async (to) => {
  if (
    to.params.subjectId !== route.params.subjectId
    || to.params.topicId !== route.params.topicId
  ) {
    return flushPendingContent();
  }
  return true;
});

onMounted(() => window.addEventListener('beforeunload', warnBeforeUnload));
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', warnBeforeUnload);
  if (pendingContentTimer) clearTimeout(pendingContentTimer);
});

function cloneContent(content) {
  return JSON.parse(JSON.stringify(content ?? {}));
}

function scheduleContentSave(patch) {
  if (!topic.value) return;

  topic.value.content = { ...topic.value.content, ...patch };
  const topicId = topic.value.id;
  const content = cloneContent(topic.value.content);
  const revision = ++contentRevision;
  contentSaveStatus.value = 'saving';

  if (pendingContentTimer) clearTimeout(pendingContentTimer);
  pendingContentTimer = setTimeout(() => {
    pendingContentTimer = null;
    void saveContentSnapshot(topicId, content, revision);
  }, 650);
}

async function saveContentSnapshot(topicId, content, revision) {
  const save = contentSaveQueue.then(
    () => saveTopicContent(topicId, content),
    () => saveTopicContent(topicId, content),
  );
  contentSaveQueue = save;

  try {
    await save;
    savedRevision = Math.max(savedRevision, revision);
    if (revision === contentRevision) {
      contentSaveStatus.value = 'saved';
      contentSaveError.value = '';
    }
    return true;
  } catch (error) {
    if (revision === contentRevision) {
      contentSaveStatus.value = 'error';
      contentSaveError.value = getErrorMessage(error);
    }
    return false;
  }
}

async function flushPendingContent() {
  if (!topic.value || contentRevision === 0 || savedRevision >= contentRevision) return true;
  if (pendingContentTimer) {
    clearTimeout(pendingContentTimer);
    pendingContentTimer = null;
  }

  return saveContentSnapshot(
    topic.value.id,
    cloneContent(topic.value.content),
    contentRevision,
  );
}

function warnBeforeUnload(event) {
  if (savedRevision >= contentRevision) return;
  event.preventDefault();
  event.returnValue = '';
}

async function saveMasteryRating(value) {
  if (isSavingMastery.value) return;

  masteryRating.value = value;
  masteryErrorMessage.value = '';
  isSavingMastery.value = true;
  try {
    const savedRating = await saveTopicMasteryRating(topic.value.id, value);
    topic.value.masteryLevel = savedRating;
    masteryRating.value = savedRating;
    savedMasteryRating.value = savedRating;
  } catch (error) {
    masteryRating.value = savedMasteryRating.value;
    masteryErrorMessage.value = getErrorMessage(error);
  } finally {
    isSavingMastery.value = false;
  }
}

function openTopicEditDialog() {
  editTopicName.value = topic.value.name;
  editTopicDescription.value = topic.value.description ?? '';
  topicEditErrorMessage.value = '';
  showTopicEditDialog.value = true;
}

function closeTopicEditDialog() {
  if (isSavingTopic.value) return;

  showTopicEditDialog.value = false;
  topicEditErrorMessage.value = '';
}

async function saveTopicDetails() {
  if (!topic.value) return;

  const name = editTopicName.value.trim();
  if (!name) {
    topicEditErrorMessage.value = 'Informe o nome do tópico.';
    return;
  }

  topicEditErrorMessage.value = '';
  isSavingTopic.value = true;
  try {
    const description = editTopicDescription.value.trim();
    await updateTopicRecord({
      topicId: topic.value.id,
      name,
      description,
    });
    topic.value.name = name;
    topic.value.description = description;
    showTopicEditDialog.value = false;
  } catch (error) {
    topicEditErrorMessage.value = getErrorMessage(error);
  } finally {
    isSavingTopic.value = false;
  }
}

function openTopicDeleteDialog() {
  topicDeleteErrorMessage.value = '';
  showTopicDeleteDialog.value = true;
}

function closeTopicDeleteDialog() {
  if (isDeletingTopic.value) return;

  showTopicDeleteDialog.value = false;
  topicDeleteErrorMessage.value = '';
}

async function confirmDeleteTopic() {
  if (!topic.value || !subject.value || isDeletingTopic.value) return;

  const topicId = topic.value.id;
  const subjectId = subject.value.id;
  isDeletingTopic.value = true;
  topicDeleteErrorMessage.value = '';
  try {
    const result = await removeTopicRecord(topicId);
    showTopicDeleteDialog.value = false;
    const cleanupWarning = result.assetCleanupErrors[0]?.message;
    await router.replace({
      name: 'subject-detail',
      params: { id: subjectId },
      query: cleanupWarning ? { cleanupWarning } : {},
    });
  } catch (error) {
    topicDeleteErrorMessage.value = getErrorMessage(error);
  } finally {
    isDeletingTopic.value = false;
  }
}

function contentSaveLabel() {
  if (contentSaveStatus.value === 'saving') return 'Salvando...';
  if (contentSaveStatus.value === 'error') return 'Não foi possível salvar';
  return 'Salvo';
}
</script>

<template>
  <section
    v-if="subject && topic"
    class="topic-page"
    :style="{ '--subject-color': subject.color }"
  >
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <RouterLink :to="{ name: 'subjects' }">Matérias</RouterLink>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <RouterLink :to="{ name: 'subject-detail', params: { id: subject.id } }">
        {{ subject.name }}
      </RouterLink>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">{{ topic.name }}</span>
    </nav>

    <header class="topic-header">
      <div class="topic-heading">
        <span class="topic-subject-icon" aria-hidden="true">
          <component :is="getSubjectIcon(subject.icon)" :size="25" :stroke-width="1.6" />
        </span>
        <div>
          <p class="page-eyebrow">{{ subject.name }}</p>
          <div class="topic-title-wrap">
            <h1>{{ topic.name }}</h1>
            <div class="topic-title-actions">
              <button
                class="topic-edit-trigger"
                type="button"
                :aria-label="`Editar tópico ${topic.name}`"
                :title="`Editar tópico ${topic.name}`"
                @click="openTopicEditDialog"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="m10.8 2.8 2.4 2.4M3 13l2.8-.6 7.7-7.7a1.7 1.7 0 0 0-2.4-2.4l-7.7 7.7L3 13Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button
                class="topic-delete-trigger"
                type="button"
                :aria-label="`Excluir tópico ${topic.name}`"
                :title="`Excluir tópico ${topic.name}`"
                @click="openTopicDeleteDialog"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2.5 4.5h11m-9.5 0 .6 8.3c.1.5.5.8 1 .8h5c.5 0 .9-.3 1-.8l.6-8.3M6 4.5V3.4c0-.5.4-.9.9-.9h2.2c.5 0 .9.4.9.9v1.1M6.5 7v4m3-4v4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <p class="topic-intro">Um espaço dedicado para reunir e aprofundar este conteúdo.</p>
        </div>
      </div>
    </header>

    <div class="topic-layout">
      <StudyTimer class="topic-timer" :key="topic.id" :topic-id="topic.id" />

      <main class="topic-main">
        <section class="topic-section summary-section">
          <div class="summary-heading">
            <div class="section-title">
              <span class="section-icon summary-icon" aria-hidden="true">✦</span>
              <div>
                <p class="section-eyebrow">Essencial</p>
                <h2>Resumo</h2>
              </div>
            </div>
            <span class="content-save-status" :class="contentSaveStatus">{{ contentSaveLabel() }}</span>
          </div>
          <TopicSummaryEditor
            :key="topic.id"
            :topic-id="topic.id"
            :model-value="summaryContent"
            @update:model-value="scheduleContentSave({ resumo_rich: $event })"
          />
          <p v-if="contentSaveError" class="content-save-error" role="alert">
            Não foi possível salvar seu conteúdo: {{ contentSaveError }}
          </p>
        </section>

        <section class="topic-section mastery-section">
          <div class="section-title">
            <span class="section-icon mastery-icon" aria-hidden="true">★</span>
            <div>
              <p class="section-eyebrow">Autoavaliação</p>
              <h2>Meu domínio sobre o conteúdo</h2>
            </div>
          </div>
          <p class="mastery-prompt">Como você se sente em relação a este tópico?</p>
          <div class="mastery-options" role="radiogroup" aria-label="Nível de domínio do conteúdo">
            <button
              v-for="level in masteryLevels"
              :key="level.value"
              class="mastery-option"
              :class="{ selected: masteryRating === level.value }"
              type="button"
              role="radio"
              :aria-checked="masteryRating === level.value"
              :aria-label="`${level.value} de 5: ${level.label}`"
              :disabled="isSavingMastery"
              @click="saveMasteryRating(level.value)"
            >
              <strong>{{ level.value }}</strong>
              <span class="mastery-stars" aria-hidden="true">{{ '★'.repeat(level.value) }}</span>
              <span>{{ level.label }}</span>
            </button>
          </div>
          <p v-if="isSavingMastery" class="mastery-status" role="status">Salvando sua avaliação...</p>
          <p v-else-if="masteryErrorMessage" class="mastery-status mastery-error" role="alert">
            Não foi possível salvar: {{ masteryErrorMessage }}
          </p>
          <p v-else-if="savedMasteryRating" class="mastery-status" role="status">
            Avaliação salva: {{ masteryLevels[savedMasteryRating - 1].label }}
          </p>
        </section>
      </main>
    </div>

    <div
      v-if="showTopicEditDialog"
      class="topic-edit-backdrop"
      @click.self="closeTopicEditDialog"
      @keydown.esc="closeTopicEditDialog"
    >
      <section
        class="topic-edit-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="topic-edit-title"
      >
        <div class="topic-edit-heading">
          <div>
            <h2 id="topic-edit-title">Editar tópico</h2>
            <p>Atualize o nome e a descrição deste conteúdo.</p>
          </div>
          <button
            class="topic-edit-close"
            type="button"
            aria-label="Fechar"
            :disabled="isSavingTopic"
            @click="closeTopicEditDialog"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <form class="topic-edit-form" @submit.prevent="saveTopicDetails">
          <p v-if="topicEditErrorMessage" class="topic-edit-error" role="alert">
            {{ topicEditErrorMessage }}
          </p>
          <label for="edit-topic-name">Nome do tópico</label>
          <input
            id="edit-topic-name"
            v-model="editTopicName"
            type="text"
            required
            autofocus
          />
          <label for="edit-topic-description">Descrição <span>(opcional)</span></label>
          <textarea
            id="edit-topic-description"
            v-model="editTopicDescription"
            rows="4"
            placeholder="O que você vai estudar neste tópico?"
          ></textarea>
          <div class="topic-edit-actions">
            <button
              class="secondary-button"
              type="button"
              :disabled="isSavingTopic"
              @click="closeTopicEditDialog"
            >
              Cancelar
            </button>
            <button class="primary-button" type="submit" :disabled="isSavingTopic">
              {{ isSavingTopic ? 'Salvando...' : 'Salvar alterações' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div
      v-if="showTopicDeleteDialog"
      class="topic-edit-backdrop"
      @click.self="closeTopicDeleteDialog"
      @keydown.esc="closeTopicDeleteDialog"
    >
      <section
        class="topic-edit-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="topic-delete-title"
      >
        <div class="topic-edit-heading">
          <div>
            <h2 id="topic-delete-title">Excluir tópico?</h2>
            <p>
              O tópico <strong>{{ topic.name }}</strong>, seu resumo, avaliação, sessões de estudo
              e materiais relacionados serão excluídos permanentemente.
            </p>
          </div>
          <button
            class="topic-edit-close"
            type="button"
            aria-label="Fechar"
            :disabled="isDeletingTopic"
            @click="closeTopicDeleteDialog"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <p v-if="topicDeleteErrorMessage" class="topic-edit-error" role="alert">
          Não foi possível excluir o tópico: {{ topicDeleteErrorMessage }}
        </p>
        <div class="topic-edit-actions">
          <button
            class="secondary-button"
            type="button"
            :disabled="isDeletingTopic"
            @click="closeTopicDeleteDialog"
          >
            Cancelar
          </button>
          <button
            class="danger-button"
            type="button"
            :disabled="isDeletingTopic"
            @click="confirmDeleteTopic"
          >
            {{ isDeletingTopic ? 'Excluindo...' : 'Excluir tópico' }}
          </button>
        </div>
      </section>
    </div>
  </section>

  <section v-else-if="isLoading" class="empty-state" role="status">Carregando tópico...</section>

  <section v-else-if="errorMessage" class="empty-state" role="alert">
    <h1>Não foi possível carregar o tópico</h1>
    <p>{{ errorMessage }}</p>
    <RouterLink class="primary-button" :to="{ name: 'subjects' }">Voltar às matérias</RouterLink>
  </section>

  <section v-else class="empty-state">
    <h1>Tópico não encontrado</h1>
    <p>Este tópico pode ter sido removido ou o endereço está incorreto.</p>
    <RouterLink v-if="subject" class="primary-button" :to="{ name: 'subject-detail', params: { id: subject.id } }">
      Voltar para {{ subject.name }}
    </RouterLink>
    <RouterLink v-else class="primary-button" :to="{ name: 'subjects' }">
      Voltar às matérias
    </RouterLink>
  </section>
</template>

<style scoped>
.topic-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 27px;
}

.topic-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 15px;
}

.topic-title-wrap {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.topic-title-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
}

.topic-subject-icon {
  display: grid;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--subject-color) 20%, transparent);
  border-radius: 15px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 11%, var(--surface));
  font: 600 22px var(--font-title);
}

.topic-heading h1 {
  margin: 4px 0 0;
  color: var(--text);
  font: 500 clamp(30px, 3vw, 39px)/1.15 var(--font-title);
  letter-spacing: -.03em;
}

.topic-edit-trigger {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--subject-color) 20%, var(--border));
  border-radius: 50%;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 8%, var(--surface));
  cursor: pointer;
  transition: transform .18s ease, background .18s ease;
}

.topic-delete-trigger {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid color-mix(in srgb, #b54747 20%, var(--border));
  border-radius: 50%;
  color: #b54747;
  background: color-mix(in srgb, #b54747 7%, var(--surface));
  cursor: pointer;
  transition: transform .18s ease, background .18s ease;
}

.topic-edit-trigger:hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--subject-color) 16%, var(--surface));
}

.topic-delete-trigger:hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, #b54747 15%, var(--surface));
}

.topic-edit-trigger:focus-visible,
.topic-delete-trigger:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--subject-color) 40%, transparent);
  outline-offset: 2px;
}

.topic-intro {
  margin: 7px 0 0;
  color: var(--text-soft);
  font-size: 11px;
  line-height: 1.6;
}

.topic-status {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text-soft);
  background: var(--surface);
  font-size: 9px;
}

.topic-status > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c-apricot);
}

.topic-status.complete > span {
  background: #7b9d7c;
}

.topic-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: 18px;
}

.topic-main {
  display: grid;
  min-width: 0;
  gap: 14px;
}

.topic-section {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.summary-section {
  background: color-mix(in srgb, var(--subject-color) 4%, var(--surface));
}

.summary-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.content-save-status {
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 9px;
}

.content-save-status.saving {
  color: var(--subject-color);
}

.content-save-status.error,
.content-save-error {
  color: #b54747;
}

.content-save-error {
  margin: 10px 0 0;
  font-size: 10px;
  line-height: 1.5;
}

.section-title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
}

.section-title > div {
  min-width: 0;
}

.section-icon {
  display: grid;
  width: 35px;
  height: 35px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
}

.summary-icon {
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 12%, var(--surface));
  font-size: 15px;
}

.notes-icon {
  color: #806b96;
  background: #f0eaf4;
}

.mastery-icon {
  color: #a2883f;
  background: #f5f0df;
}

.section-eyebrow {
  margin: 0 0 3px;
  color: var(--muted);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.section-title h2 {
  margin: 0;
  color: var(--text);
  font: 500 20px var(--font-title);
}

.notes-copy {
  margin: 15px 0 0;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.8;
}

.notes-copy {
  padding: 13px 15px;
  border-left: 2px solid color-mix(in srgb, var(--subject-color) 55%, var(--border));
  background: var(--surface-soft);
}

.content-placeholder {
  display: flex;
  min-height: 65px;
  align-items: center;
  gap: 12px;
  margin-top: 13px;
  padding: 13px;
  border: 1px dashed var(--border);
  border-radius: 10px;
  color: var(--muted);
}

.content-placeholder p {
  margin: 0;
  font-size: 10px;
  line-height: 1.6;
}

.placeholder-mark {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 9px;
  color: var(--accent);
  background: var(--accent-soft);
  font: 600 14px var(--font-title);
}

.mastery-prompt {
  margin: 15px 0 12px;
  color: var(--text-soft);
  font-size: 11px;
}

.mastery-options {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.mastery-option {
  display: flex;
  min-width: 0;
  min-height: 100px;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-soft);
  background: var(--surface);
  cursor: pointer;
  text-align: left;
  transition: border-color .18s ease, background .18s ease, transform .18s ease;
}

.mastery-option:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--subject-color) 45%, var(--border));
}

.mastery-option.selected {
  border-color: color-mix(in srgb, var(--subject-color) 55%, var(--border));
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 8%, var(--surface));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--subject-color) 10%, transparent);
}

.mastery-option:disabled {
  cursor: wait;
  opacity: .7;
}

.mastery-option strong {
  color: var(--text);
  font: 500 18px var(--font-title);
}

.mastery-stars {
  color: #b18b3b;
  font-size: 11px;
  letter-spacing: .03em;
  white-space: nowrap;
}

.mastery-option > span:last-child {
  font-size: 9px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.mastery-status {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 9px;
}

.mastery-error {
  color: #b54747;
}

.topic-edit-backdrop {
  position: fixed;
  z-index: 30;
  inset: 0;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 20px;
  background: rgb(31 20 34 / 48%);
  backdrop-filter: blur(4px);
}

.topic-edit-dialog {
  width: min(100%, 460px);
  max-height: min(90vh, 620px);
  overflow-y: auto;
  padding: 25px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: 0 24px 70px rgb(21 12 23 / 25%);
}

.topic-edit-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.topic-edit-heading h2 {
  margin: 0;
  color: var(--text);
  font: 500 25px/1.2 var(--font-title);
}

.topic-edit-heading p {
  margin: 6px 0 0;
  color: var(--text-soft);
  font-size: 11px;
  line-height: 1.55;
}

.topic-edit-heading p strong {
  color: var(--text);
}

.topic-edit-close {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text-soft);
  background: var(--surface);
  cursor: pointer;
}

.topic-edit-close:disabled {
  cursor: not-allowed;
  opacity: .6;
}

.topic-edit-form {
  display: grid;
  gap: 8px;
}

.topic-edit-form label {
  margin-top: 7px;
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 600;
}

.topic-edit-form label span {
  color: var(--muted);
  font-weight: 400;
}

.topic-edit-form input,
.topic-edit-form textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  background: var(--bg);
  font: inherit;
  font-size: 12px;
}

.topic-edit-form input {
  height: 42px;
  padding: 0 12px;
}

.topic-edit-form textarea {
  min-height: 96px;
  padding: 10px 12px;
  line-height: 1.5;
  resize: vertical;
}

.topic-edit-form input:focus,
.topic-edit-form textarea:focus {
  border-color: var(--subject-color);
  outline: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--subject-color) 17%, transparent);
}

.topic-edit-error {
  margin: 0;
  color: #b54747;
  font-size: 10px;
  line-height: 1.5;
}

.topic-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 15px;
}

.danger-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  border: 1px solid #b54747;
  border-radius: 8px;
  color: #fff;
  background: #b54747;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background .18s ease, transform .18s ease;
}

.danger-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #983d3d;
}

.danger-button:disabled {
  cursor: wait;
  opacity: .7;
}

:global(:root[data-theme='dark']) .topic-subject-icon,
:global(:root[data-theme='dark']) .summary-icon {
  color: color-mix(in srgb, var(--subject-color) 60%, white);
}

:global(:root[data-theme='dark']) .mastery-icon {
  color: #d3b86e;
  background: #433c2b;
}

@media (max-width: 480px) {
  .topic-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .topic-heading {
    align-items: flex-start;
    gap: 11px;
  }

  .topic-subject-icon {
    width: 43px;
    height: 43px;
    border-radius: 13px;
  }

  .topic-heading h1 {
    font-size: 30px;
  }

  .topic-title-wrap {
    gap: 7px;
  }

  .topic-section {
    padding: 16px;
  }

  .summary-heading {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .topic-edit-dialog {
    padding: 21px;
  }

}

@media (max-width: 600px) {
  .mastery-options {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .mastery-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
