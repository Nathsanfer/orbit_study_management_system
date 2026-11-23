<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { subjects } from '@/data/subjects.js';

const route = useRoute();
const subject = computed(() => subjects.value.find((item) => item.id === route.params.id));
const completedTopics = computed(() =>
  subject.value?.topics.filter((topic) => topic.status === 'Concluído').length ?? 0,
);
</script>

<template>
  <section v-if="subject" class="subject-detail" :style="{ '--subject-color': subject.color }">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <RouterLink :to="{ name: 'subjects' }">Matérias</RouterLink>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">{{ subject.name }}</span>
    </nav>

    <header class="detail-header">
      <div class="detail-title-line">
        <span class="detail-subject-icon" aria-hidden="true">{{ subject.icon }}</span>
        <div>
          <p class="page-eyebrow">Sua matéria</p>
          <h1 class="detail-title">{{ subject.name }}</h1>
          <p class="detail-summary">Continue no seu ritmo. Cada tópico é mais um passo adiante.</p>
        </div>
      </div>
    </header>

    <section class="detail-overview" aria-label="Resumo da matéria">
      <div class="overview-panel">
        <p class="panel-label">Progresso dos estudos</p>
        <div class="overview-progress">
          <div
            class="progress-track"
            role="progressbar"
            :aria-label="`Progresso em ${subject.name}`"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="subject.progress"
          >
            <div class="progress-fill" :style="{ width: `${subject.progress}%` }"></div>
          </div>
          <strong>{{ subject.progress }}%</strong>
        </div>
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
          <span>{{ subject.topics.length === 1 ? 'tópico' : 'tópicos' }} · {{ completedTopics }} concluídos</span>
        </div>
      </div>
    </section>

    <section class="topics-section">
      <div class="topics-heading">
        <h2>Seus tópicos</h2>
        <span>Matéria <span aria-hidden="true">→</span> Tópicos</span>
      </div>

      <div v-if="subject.topics.length" class="topics-list">
        <RouterLink
          v-for="(topic, index) in subject.topics"
          :key="topic.id"
          class="topic-row"
          :to="{ name: 'topic-detail', params: { subjectId: subject.id, topicId: topic.id } }"
        >
          <span class="topic-status" aria-hidden="true">
            <svg v-if="topic.status === 'Concluído'" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="m3.5 8 3 3 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span v-else>{{ String(index + 1).padStart(2, '0') }}</span>
          </span>
          <div class="topic-copy">
            <strong>{{ topic.name }}</strong>
            <span>Materiais e anotações em breve</span>
          </div>
          <span class="topic-state" :class="{ done: topic.status === 'Concluído' }">{{ topic.status }}</span>
        </RouterLink>
      </div>
      <div v-else class="detail-empty">
        Ainda não há tópicos nesta matéria. Em breve você poderá organizá-los por aqui.
      </div>
    </section>
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

.overview-progress {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 15px;
}

.progress-track {
  height: 7px;
  flex: 1;
  overflow: hidden;
  border-radius: 6px;
  background: var(--track);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--subject-color);
  transition: width .3s ease;
}

.overview-progress strong {
  color: var(--subject-color);
  font: 500 25px var(--font-title);
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

.topics-heading h2 {
  margin: 0;
  color: var(--text);
  font: 500 24px var(--font-title);
}

.topics-heading span {
  color: var(--muted);
  font-size: 10px;
}

.topics-list {
  display: grid;
  gap: 9px;
}

.topic-row {
  display: flex;
  min-height: 69px;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface);
  transition: border-color .18s ease, transform .18s ease;
}

.topic-row:hover {
  transform: translateX(2px);
  border-color: color-mix(in srgb, var(--subject-color) 42%, var(--border));
}

.topic-status {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 10%, var(--surface));
}

.topic-copy {
  min-width: 0;
  flex: 1;
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
  margin-top: 3px;
  color: var(--muted);
  font-size: 9px;
}

.topic-state {
  padding: 5px 8px;
  border-radius: 20px;
  color: var(--text-soft);
  background: var(--surface-soft);
  font-size: 9px;
  white-space: nowrap;
}

.topic-state.done {
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 10%, var(--surface));
}

.detail-empty {
  padding: 27px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  color: var(--text-soft);
  font-size: 12px;
  text-align: center;
}

:global(:root[data-theme='dark']) .detail-subject-icon,
:global(:root[data-theme='dark']) .study-panel-icon,
:global(:root[data-theme='dark']) .topic-status,
:global(:root[data-theme='dark']) .topic-state.done {
  color: color-mix(in srgb, var(--subject-color) 60%, white);
}

:global(:root[data-theme='dark']) .progress-fill {
  background: color-mix(in srgb, var(--subject-color) 60%, white);
}

@media (max-width: 720px) {
  .detail-overview {
    grid-template-columns: minmax(0, 1fr);
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
    gap: 10px;
    padding-inline: 11px;
  }
}
</style>
