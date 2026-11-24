<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { createTopic as saveTopic, loadSubject } from '@/data/subjects.js';
import { getErrorMessage } from '@/lib/supabase.js';
import { getSubjectIcon } from '@/lib/icons.js';

const route = useRoute();
const subject = ref(null);
const showTopicDialog = ref(false);
const newTopicName = ref('');
const newTopicDescription = ref('');
const isCreatingTopic = ref(false);
const topicErrorMessage = ref('');
const isLoading = ref(true);
const errorMessage = ref('');
const noticeMessage = ref('');
const topicSearchQuery = ref('');
const masteryLabels = [
  'Ainda não compreendi',
  'Tenho bastante dificuldade',
  'Compreendi parcialmente',
  'Tenho um bom domínio',
  'Domino o conteúdo',
];

const filteredTopics = computed(() => {
  const query = topicSearchQuery.value.trim().toLocaleLowerCase('pt-BR');
  if (!subject.value) return [];
  if (!query) return subject.value.topics;

  return subject.value.topics.filter((topic) => {
    const name = topic.name?.toLocaleLowerCase('pt-BR') ?? '';
    const description = topic.description?.toLocaleLowerCase('pt-BR') ?? '';
    return name.includes(query) || description.includes(query);
  });
});

async function loadCurrentSubject() {
  isLoading.value = true;
  topicSearchQuery.value = '';
  errorMessage.value = '';
  noticeMessage.value = typeof route.query.cleanupWarning === 'string'
    ? `O tópico foi excluído, mas não foi possível remover todas as imagens do resumo: ${route.query.cleanupWarning}`
    : '';
  try {
    subject.value = await loadSubject(route.params.id);
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadCurrentSubject);
watch(() => route.params.id, loadCurrentSubject);

function formatStudyDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (!hours && !minutes) return `${seconds} s`;
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours}h ${minutes}min` : `${hours}h`;
}

function formatSessionStatus(status) {
  if (typeof status !== 'string' || !status.trim()) return 'Sem sessões';

  const label = status.trim().replaceAll('_', ' ');
  return `${label[0].toLocaleUpperCase('pt-BR')}${label.slice(1)}`;
}

function getMasteryLevel(value) {
  const level = Number(value);
  return Number.isInteger(level) && level >= 1 && level <= 5 ? level : 0;
}

function getMasteryLabel(value) {
  const level = getMasteryLevel(value);
  return level ? `${masteryLabels[level - 1]} (${level}/5)` : 'Ainda não avaliado';
}

function openTopicDialog() {
  newTopicName.value = '';
  newTopicDescription.value = '';
  topicErrorMessage.value = '';
  showTopicDialog.value = true;
}

function closeTopicDialog() {
  if (isCreatingTopic.value) return;

  showTopicDialog.value = false;
  newTopicName.value = '';
  newTopicDescription.value = '';
  topicErrorMessage.value = '';
}

async function createNewTopic() {
  const name = newTopicName.value.trim();
  if (!name) {
    topicErrorMessage.value = 'Informe o nome do tópico.';
    return;
  }

  topicErrorMessage.value = '';
  isCreatingTopic.value = true;
  try {
    const topic = await saveTopic({
      subjectId: subject.value.id,
      name,
      description: newTopicDescription.value.trim(),
    });
    subject.value.topics.push(topic);
    showTopicDialog.value = false;
    newTopicName.value = '';
    newTopicDescription.value = '';
  } catch (error) {
    topicErrorMessage.value = getErrorMessage(error);
  } finally {
    isCreatingTopic.value = false;
  }
}
</script>

<template>
  <section v-if="subject" class="subject-detail" :style="{ '--subject-color': subject.color }">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <RouterLink :to="{ name: 'subjects' }">Matérias</RouterLink>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">{{ subject.name }}</span>
    </nav>

    <p v-if="noticeMessage" class="cleanup-warning" role="status">{{ noticeMessage }}</p>

    <header class="detail-header">
      <div class="detail-title-line">
        <span class="detail-subject-icon" aria-hidden="true">
          <component :is="getSubjectIcon(subject.icon)" :size="26" :stroke-width="1.6" />
        </span>
        <div>
          <p class="page-eyebrow">Sua matéria</p>
          <h1 class="detail-title">{{ subject.name }}</h1>
          <p class="detail-summary">Continue no seu ritmo. Cada tópico é mais um passo adiante.</p>
        </div>
      </div>
    </header>

    <section class="detail-overview" aria-label="Resumo da matéria">
      <div class="overview-panel">
        <p class="panel-label">Tempo acumulado</p>
        <div class="overview-time">
          <strong>{{ formatStudyDuration(subject.totalStudySeconds) }}</strong>
          <span>de estudo registrado</span>
        </div>
        <p class="overview-caption">Somando todas as sessões desta matéria</p>
      </div>
      <div class="study-panel">
        <span class="study-panel-icon" aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
            <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H17v14H6.5A2.5 2.5 0 0 0 4 18.5v-14Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
            <path d="M4 4.5v14M7.5 6H14m-6.5 3H14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </span>
        <div>
          <strong>{{ subject.topics.length }}</strong>
          <span>{{ subject.topics.length === 1 ? 'tópico cadastrado' : 'tópicos cadastrados' }}</span>
        </div>
      </div>
    </section>

    <section class="topics-section">
      <div class="topics-heading">
        <h2>Seus tópicos</h2>
        <div class="topics-heading-actions">
          <label class="topic-search-wrap">
            <svg class="topic-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.6" />
              <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
            <input
              v-model="topicSearchQuery"
              class="topic-search"
              type="search"
              placeholder="Buscar tópico..."
              aria-label="Buscar tópico"
            />
          </label>
          <span class="topics-path">Matéria <span aria-hidden="true">→</span> Tópicos</span>
          <button class="primary-button add-topic-button" type="button" @click="openTopicDialog()">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
            Novo tópico
          </button>
        </div>
      </div>

      <div v-if="filteredTopics.length" class="topics-list">
        <RouterLink
          v-for="(topic, index) in filteredTopics"
          :key="topic.id"
          class="topic-row"
          :to="{ name: 'topic-detail', params: { subjectId: subject.id, topicId: topic.id } }"
        >
          <span class="topic-index" aria-hidden="true">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
          </span>
          <div class="topic-copy">
            <strong>{{ topic.name }}</strong>
            <span>{{ topic.description || 'Sem descrição cadastrada.' }}</span>
          </div>
          <span class="topic-arrow" aria-hidden="true">→</span>
          <div class="topic-meta">
            <span class="topic-meta-chip topic-time">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="5.75" stroke="currentColor" stroke-width="1.2"/>
                <path d="M8 4.5V8l2.2 1.3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              <span>Estudado</span>
              <strong>{{ formatStudyDuration(topic.studySeconds) }}</strong>
            </span>
            <span
              class="topic-meta-chip topic-state"
              :class="{ 'no-sessions': !topic.studyStatus }"
              :title="formatSessionStatus(topic.studyStatus)"
            >
              <span class="session-dot" aria-hidden="true"></span>
              {{ formatSessionStatus(topic.studyStatus) }}
            </span>
            <span
              v-if="getMasteryLevel(topic.masteryLevel)"
              class="topic-meta-chip topic-mastery"
              :title="getMasteryLabel(topic.masteryLevel)"
            >
              <span class="mastery-stars" aria-hidden="true">
                {{ '★'.repeat(getMasteryLevel(topic.masteryLevel)) }}{{ '☆'.repeat(5 - getMasteryLevel(topic.masteryLevel)) }}
              </span>
              <strong>{{ getMasteryLevel(topic.masteryLevel) }}/5</strong>
            </span>
            <span v-else class="topic-meta-chip topic-mastery no-mastery">
              <span class="mastery-stars" aria-hidden="true">☆☆☆☆☆</span>
              <span>Sem avaliação</span>
            </span>
          </div>
        </RouterLink>
      </div>
      <div v-else-if="subject.topics.length === 0" class="detail-empty">
        Nenhum tópico cadastrado nesta matéria.
      </div>
      <div v-else class="detail-empty">
        Nenhum tópico encontrado para "{{ topicSearchQuery }}".
      </div>
    </section>

    <div
      v-if="showTopicDialog"
      class="topic-modal-backdrop"
      @click.self="closeTopicDialog"
      @keydown.esc="closeTopicDialog"
    >
      <section
        class="topic-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-topic-title"
      >
        <div class="topic-modal-heading">
          <div>
            <h2 id="new-topic-title">Novo tópico</h2>
            <p>Organize mais um assunto dentro de {{ subject.name }}.</p>
          </div>
          <button
            class="topic-modal-close"
            type="button"
            aria-label="Fechar"
            :disabled="isCreatingTopic"
            @click="closeTopicDialog"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <form class="topic-form" @submit.prevent="createNewTopic">
          <p v-if="topicErrorMessage" class="request-error" role="alert">{{ topicErrorMessage }}</p>
          <label for="new-topic-name">Nome do tópico</label>
          <input
            id="new-topic-name"
            v-model="newTopicName"
            type="text"
            placeholder="Ex.: Introdução à matéria"
            required
            autofocus
          />
          <label for="new-topic-description">Descrição <span>(opcional)</span></label>
          <textarea
            id="new-topic-description"
            v-model="newTopicDescription"
            rows="4"
            placeholder="O que você vai estudar neste tópico?"
          ></textarea>
          <div class="topic-modal-actions">
            <button
              class="secondary-button"
              type="button"
              :disabled="isCreatingTopic"
              @click="closeTopicDialog"
            >
              Cancelar
            </button>
            <button class="primary-button" type="submit" :disabled="isCreatingTopic">
              {{ isCreatingTopic ? 'Criando...' : 'Criar tópico' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>

  <section v-else-if="isLoading" class="empty-state" role="status">Carregando matéria...</section>

  <section v-else-if="errorMessage" class="empty-state" role="alert">
    <h1>Não foi possível carregar a matéria</h1>
    <p>{{ errorMessage }}</p>
    <RouterLink class="primary-button" :to="{ name: 'subjects' }">Voltar às matérias</RouterLink>
  </section>

  <section v-else class="empty-state">
    <h1>Matéria não encontrada</h1>
    <p>Ela pode ter sido removida ou o endereço está incorreto.</p>
    <RouterLink class="primary-button" :to="{ name: 'subjects' }">Voltar às matérias</RouterLink>
  </section>
</template>

<style scoped>
.detail-header {
  margin-bottom: 27px;
}

.cleanup-warning {
  margin: 12px 0 18px;
  padding: 11px 13px;
  border: 1px solid color-mix(in srgb, #b18b3b 30%, var(--border));
  border-radius: 9px;
  color: var(--text-soft);
  background: color-mix(in srgb, #b18b3b 9%, var(--surface));
  font-size: 10px;
  line-height: 1.5;
}

.detail-title-line {
  display: flex;
  align-items: center;
  gap: 15px;
}

.detail-subject-icon {
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

.detail-title {
  margin: 0;
  color: var(--text);
  font: 500 clamp(29px, 3vw, 38px)/1.13 var(--font-title);
  letter-spacing: -.035em;
}

.detail-summary {
  margin: 7px 0 0;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.6;
}

.detail-overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  gap: 18px;
  margin-bottom: 34px;
}

.overview-panel,
.study-panel {
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.overview-panel {
  padding: 21px 23px;
}

.panel-label {
  margin: 0;
  color: var(--muted);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .13em;
  text-transform: uppercase;
}

.overview-time {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

.overview-time strong {
  color: var(--subject-color);
  font: 500 clamp(25px, 3vw, 32px)/1.1 var(--font-title);
}

.overview-time span,
.overview-caption {
  color: var(--text-soft);
  font-size: 10px;
}

.overview-caption {
  margin: 9px 0 0;
}

.study-panel {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 18px;
}

.study-panel-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 11px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 12%, var(--surface));
}

.study-panel strong {
  display: block;
  color: var(--text);
  font: 500 20px var(--font-title);
}

.study-panel span {
  color: var(--muted);
  font-size: 9px;
}

.topics-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 13px;
}

.topics-heading-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.topic-search-wrap {
  position: relative;
  display: flex;
  width: 210px;
  height: 36px;
  align-items: center;
}

.topic-search-icon {
  position: absolute;
  left: 11px;
  color: var(--muted);
  pointer-events: none;
}

.topic-search {
  width: 100%;
  height: 100%;
  padding: 0 11px 0 34px;
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text);
  background: var(--surface);
  font-size: 10px;
  transition: border-color .18s ease, box-shadow .18s ease;
}

.topic-search::placeholder {
  color: var(--muted);
}

.topic-search:focus {
  border-color: var(--subject-color);
  outline: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--subject-color) 16%, transparent);
}

.topics-heading h2 {
  margin: 0;
  color: var(--text);
  font: 500 24px var(--font-title);
}

.topics-path {
  color: var(--muted);
  font-size: 10px;
}

.add-topic-button {
  min-height: 36px;
  padding-inline: 12px;
  font-size: 10px;
}

.topics-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
  gap: 12px;
}

.topic-row {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 18px;
  grid-template-areas:
    "index copy arrow"
    ". meta meta";
  align-items: center;
  gap: 12px 13px;
  padding: 15px 16px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: linear-gradient(
    110deg,
    color-mix(in srgb, var(--subject-color) 4%, var(--surface)),
    var(--surface) 36%
  );
  box-shadow: var(--shadow-card);
  transition: border-color .18s ease, transform .18s ease, box-shadow .18s ease;
}

.topic-row:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--subject-color) 42%, var(--border));
  box-shadow: 0 8px 20px color-mix(in srgb, var(--subject-color) 9%, transparent);
}

.topic-index {
  grid-area: index;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--subject-color) 16%, var(--border));
  border-radius: 11px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 9%, var(--surface));
  font: 600 11px var(--font-title);
}

.topic-copy {
  grid-area: copy;
  min-width: 0;
}

.topic-copy strong {
  display: block;
  overflow: hidden;
  color: var(--text);
  font: 500 16px var(--font-title);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-copy span {
  display: block;
  overflow: hidden;
  margin-top: 3px;
  color: var(--muted);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-meta {
  grid-area: meta;
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.topic-meta-chip {
  display: inline-flex;
  min-height: 27px;
  align-items: center;
  gap: 6px;
  padding: 0 9px;
  border: 1px solid var(--border);
  border-radius: 20px;
  color: var(--text-soft);
  background: var(--surface);
  font-size: 9px;
  white-space: nowrap;
}

.topic-meta-chip strong {
  color: var(--text);
  font-size: 9px;
  font-weight: 600;
}

.topic-time svg {
  color: var(--muted);
}

.topic-state {
  color: var(--subject-color);
  border-color: color-mix(in srgb, var(--subject-color) 21%, var(--border));
  background: color-mix(in srgb, var(--subject-color) 7%, var(--surface));
}

.topic-state.no-sessions {
  color: var(--muted);
  background: var(--surface-soft);
}

.session-dot {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: currentColor;
  opacity: .7;
}

.topic-mastery {
  border-color: color-mix(in srgb, #b18b3b 24%, var(--border));
}

.mastery-stars {
  color: #b18b3b;
  font-size: 10px;
  letter-spacing: -.04em;
}

.topic-arrow {
  grid-area: arrow;
  justify-self: end;
  color: var(--muted);
  font-size: 16px;
  transition: color .18s ease, transform .18s ease;
}

.topic-row:hover .topic-arrow {
  transform: translateX(2px);
  color: var(--subject-color);
}

.no-mastery {
  color: var(--muted);
}

.detail-empty {
  padding: 27px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  color: var(--text-soft);
  font-size: 12px;
  text-align: center;
}

.topic-modal-backdrop {
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

.topic-modal {
  width: min(100%, 460px);
  max-height: min(90vh, 620px);
  overflow-y: auto;
  padding: 25px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: 0 24px 70px rgb(21 12 23 / 25%);
}

.topic-modal-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.topic-modal-heading h2 {
  margin: 0;
  color: var(--text);
  font: 500 25px/1.2 var(--font-title);
}

.topic-modal-heading p {
  margin: 6px 0 0;
  color: var(--text-soft);
  font-size: 11px;
  line-height: 1.55;
}

.topic-modal-close {
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

.topic-modal-close:disabled {
  cursor: not-allowed;
  opacity: .6;
}

.topic-form {
  display: grid;
  gap: 8px;
}

.topic-form label {
  margin-top: 7px;
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 600;
}

.topic-form label span {
  color: var(--muted);
  font-weight: 400;
}

.topic-form input,
.topic-form textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  background: var(--bg);
  font: inherit;
  font-size: 12px;
}

.topic-form input {
  height: 42px;
  padding: 0 12px;
}

.topic-form textarea {
  min-height: 96px;
  padding: 10px 12px;
  line-height: 1.5;
  resize: vertical;
}

.topic-form input:focus,
.topic-form textarea:focus {
  border-color: var(--subject-color);
  outline: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--subject-color) 17%, transparent);
}

.topic-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 15px;
}

:global(:root[data-theme='dark']) .detail-subject-icon,
:global(:root[data-theme='dark']) .study-panel-icon,
:global(:root[data-theme='dark']) .topic-index,
:global(:root[data-theme='dark']) .topic-state:not(.no-sessions) {
  color: color-mix(in srgb, var(--subject-color) 60%, white);
}

@media (max-width: 720px) {
  .detail-overview {
    grid-template-columns: minmax(0, 1fr);
  }

  .topics-heading {
    align-items: flex-start;
  }

  .topics-heading-actions {
    flex-wrap: wrap;
  }

  .topic-search-wrap {
    width: min(100%, 210px);
  }
}

@media (max-width: 480px) {
  .detail-title-line {
    align-items: flex-start;
  }

  .detail-subject-icon {
    width: 44px;
    height: 44px;
    border-radius: 13px;
  }

  .topic-row {
    grid-template-columns: 32px minmax(0, 1fr) 14px;
    gap: 10px;
    padding: 13px 11px;
  }

  .topic-index {
    width: 32px;
    height: 32px;
  }

  .topic-meta {
    gap: 6px;
  }

  .topic-meta-chip {
    min-height: 25px;
    padding-inline: 7px;
    font-size: 8px;
  }

  .topics-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .topics-heading-actions {
    width: 100%;
    justify-content: space-between;
  }

  .topic-modal {
    padding: 21px;
  }
}
</style>
