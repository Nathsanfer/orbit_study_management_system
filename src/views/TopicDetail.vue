<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { loadSubject } from '@/data/subjects.js';
import { getErrorMessage } from '@/lib/supabase.js';
import { getSubjectIcon } from '@/lib/icons.js';

const route = useRoute();
const subject = ref(null);
const topic = ref(null);
const isLoading = ref(true);
const errorMessage = ref('');
const summary = computed(() =>
  topic.value?.content?.resumo ?? topic.value?.content?.summary ?? topic.value?.description ?? '',
);
const notes = computed(() =>
  topic.value?.content?.anotacoes ?? topic.value?.content?.notes ?? '',
);

async function loadCurrentTopic() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    subject.value = await loadSubject(route.params.subjectId);
    topic.value = subject.value?.topics.find((item) => item.id === route.params.topicId) ?? null;
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
          <h1>{{ topic.name }}</h1>
          <p class="topic-intro">Um espaço dedicado para reunir e aprofundar este conteúdo.</p>
        </div>
      </div>
    </header>

    <div class="topic-layout">
      <main class="topic-main">
        <section class="topic-section summary-section">
          <div class="section-title">
            <span class="section-icon summary-icon" aria-hidden="true">✦</span>
            <div>
              <p class="section-eyebrow">Essencial</p>
              <h2>Resumo</h2>
            </div>
          </div>
          <p v-if="summary" class="summary-copy">{{ summary }}</p>
          <div v-else class="content-placeholder">
            <span class="placeholder-mark" aria-hidden="true">Aa</span>
            <p>Nenhum resumo cadastrado.</p>
          </div>
        </section>

        <section class="topic-section">
          <div class="section-title">
            <span class="section-icon notes-icon" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                <path d="M5 3.5h10A1.5 1.5 0 0 1 16.5 5v12l-3.5-2-3 2-3-2-3.5 2V5A1.5 1.5 0 0 1 5 3.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
                <path d="M7 7h6M7 10h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
            </span>
            <div>
              <p class="section-eyebrow">Suas ideias</p>
              <h2>Anotações</h2>
            </div>
          </div>
          <p v-if="notes" class="notes-copy">{{ notes }}</p>
          <div v-else class="content-placeholder">
            <p>Nenhuma anotação cadastrada.</p>
          </div>
        </section>

        <section class="topic-section materials-section">
          <div class="materials-heading">
            <div class="section-title">
              <span class="section-icon materials-icon" aria-hidden="true">
                <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
                  <path d="M5 2.5h7l4 4v11H5a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 5 2.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
                  <path d="M12 2.5v4h4M7 11h6M7 14h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
              </span>
              <div>
                <p class="section-eyebrow">Conteúdo de apoio</p>
                <h2>Materiais</h2>
              </div>
            </div>
            <span class="materials-count">{{ topic.materials.length }}</span>
          </div>

          <div v-if="topic.materials.length" class="materials-list">
            <article v-for="material in topic.materials" :key="material.id" class="material-card">
              <span class="material-icon" :class="`material-${material.type.toLowerCase()}`" aria-hidden="true">
                <svg v-if="material.type === 'Imagem'" width="19" height="19" viewBox="0 0 20 20" fill="none">
                  <rect x="2.5" y="3" width="15" height="14" rx="2" stroke="currentColor" stroke-width="1.4"/>
                  <circle cx="7" cy="8" r="1.5" stroke="currentColor" stroke-width="1.3"/>
                  <path d="m3.5 14 4-4 3 3 2-2 4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else-if="material.type === 'PDF'" width="19" height="19" viewBox="0 0 20 20" fill="none">
                  <path d="M5 2.5h7l4 4v11H5a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 5 2.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
                  <path d="M12 2.5v4h4M6.5 12h7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
                <svg v-else width="19" height="19" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4.5h12M4 8h12M4 11.5h8M4 15h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </span>
              <div class="material-copy">
                <strong>{{ material.title }}</strong>
                <span>{{ material.type }}</span>
              </div>
              <span class="material-type">{{ material.type }}</span>
            </article>
          </div>
          <div v-else class="materials-empty">
            <p>Textos, imagens, resumos e PDFs deste tópico poderão ser reunidos aqui.</p>
          </div>
        </section>
      </main>

      <aside class="topic-aside">
        <RouterLink
          class="subject-return"
          :to="{ name: 'subject-detail', params: { id: subject.id } }"
        >
          <span class="return-icon" aria-hidden="true">
            <component :is="getSubjectIcon(subject.icon)" :size="18" :stroke-width="1.7" />
          </span>
          <span>
            <small>Parte da matéria</small>
            <strong>{{ subject.name }}</strong>
          </span>
          <span class="return-arrow" aria-hidden="true">→</span>
        </RouterLink>

      </aside>
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
  grid-template-columns: minmax(0, 1fr) 250px;
  align-items: start;
  gap: 18px;
}

.topic-main {
  display: grid;
  min-width: 0;
  gap: 14px;
}

.topic-section {
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.summary-section {
  background: color-mix(in srgb, var(--subject-color) 4%, var(--surface));
}

.section-title {
  display: flex;
  align-items: center;
  gap: 11px;
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

.materials-icon {
  color: #a37352;
  background: #f6ede6;
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

.summary-copy,
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

.content-placeholder,
.materials-empty {
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

.content-placeholder p,
.materials-empty p {
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

.materials-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.materials-count {
  display: grid;
  min-width: 25px;
  height: 25px;
  place-items: center;
  border-radius: 50%;
  color: var(--text-soft);
  background: var(--surface-soft);
  font-size: 9px;
}

.materials-list {
  display: grid;
  gap: 8px;
  margin-top: 15px;
}

.material-card {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
  padding: 11px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

.material-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 9px;
  color: var(--accent);
  background: var(--accent-soft);
}

.material-pdf {
  color: #a55f57;
  background: #f7e9e5;
}

.material-imagem {
  color: #64866b;
  background: #eaf1e9;
}

.material-resumo {
  color: #806b96;
  background: #f0eaf4;
}

.material-copy {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 4px;
}

.material-copy strong {
  overflow: hidden;
  color: var(--text);
  font: 500 13px var(--font-title);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-copy span {
  color: var(--muted);
  font-size: 9px;
}

.material-type {
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 8px;
}

.topic-aside {
  display: grid;
  gap: 12px;
}

.progress-panel {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.progress-number {
  display: block;
  margin: 10px 0 12px;
  color: var(--subject-color);
  font: 500 34px var(--font-title);
}

.progress-number span {
  margin-left: 2px;
  font-size: 17px;
}

.topic-progress-track {
  height: 6px;
  overflow: hidden;
  border-radius: 6px;
  background: var(--track);
}

.topic-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--subject-color);
  transition: width .25s ease;
}

.progress-caption {
  display: inline-block;
  margin-top: 9px;
  color: var(--muted);
  font-size: 9px;
}

.subject-return {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  transition: border-color .18s ease, transform .18s ease;
}

.subject-return:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--subject-color) 40%, var(--border));
}

.return-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 10px;
  color: var(--subject-color);
  background: color-mix(in srgb, var(--subject-color) 11%, var(--surface));
  font: 600 15px var(--font-title);
}

.subject-return > span:nth-child(2) {
  display: grid;
  min-width: 0;
  gap: 3px;
}

.subject-return small {
  color: var(--muted);
  font-size: 8px;
}

.subject-return strong {
  overflow: hidden;
  color: var(--text);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.return-arrow {
  margin-left: auto;
  color: var(--muted);
}

.future-note {
  margin: 2px 3px;
  color: var(--muted);
  font: italic 11px/1.7 var(--font-title);
}

:global(:root[data-theme='dark']) .topic-subject-icon,
:global(:root[data-theme='dark']) .summary-icon {
  color: color-mix(in srgb, var(--subject-color) 60%, white);
}

:global(:root[data-theme='dark']) .material-pdf {
  color: #e5ada7;
  background: #493536;
}

:global(:root[data-theme='dark']) .material-imagem {
  color: #b7d0b4;
  background: #344435;
}

:global(:root[data-theme='dark']) .material-resumo {
  color: #c6b3d8;
  background: #40374a;
}

@media (max-width: 1050px) {
  .topic-layout {
    grid-template-columns: minmax(0, 1fr) 220px;
  }
}

@media (max-width: 720px) {
  .topic-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .topic-aside {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .future-note {
    grid-column: 1 / -1;
  }
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

  .topic-aside {
    grid-template-columns: minmax(0, 1fr);
  }

  .future-note {
    grid-column: auto;
  }

  .topic-section {
    padding: 16px;
  }
}
</style>
