<script setup>
import { onMounted, ref } from 'vue';
import { createEssay as saveEssay, loadEssays } from '@/data/essays.js';
import { getErrorMessage } from '@/lib/supabase.js';

const essays = ref([]);
const isLoading = ref(true);
const showAddDialog = ref(false);
const isSaving = ref(false);
const title = ref('');
const theme = ref('');
const text = ref('');
const errorMessage = ref('');

onMounted(loadData);

async function loadData() {
  try {
    essays.value = await loadEssays();
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isLoading.value = false;
  }
}

async function addEssay() {
  errorMessage.value = '';
  isSaving.value = true;
  try {
    const essay = await saveEssay({
      title: title.value.trim(),
      theme: theme.value.trim(),
      text: text.value.trim(),
    });
    essays.value.unshift(essay);
    title.value = '';
    theme.value = '';
    text.value = '';
    showAddDialog.value = false;
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <section class="essays-page">
    <nav class="breadcrumb" aria-label="Caminho de navegação">
      <span>Seu espaço</span>
      <span class="breadcrumb-separator" aria-hidden="true">/</span>
      <span aria-current="page">Redações</span>
    </nav>

    <header class="essays-header">
      <p class="page-eyebrow">Escrever também é aprender</p>
      <h1 class="page-title">Minhas redações</h1>
      <p class="page-subtitle">Relembre seus temas, acompanhe as notas e veja os detalhes de cada avaliação.</p>
      <button class="primary-button add-essay-button" type="button" @click="showAddDialog = true">
        <span aria-hidden="true">+</span> Nova redação
      </button>
    </header>

    <p v-if="errorMessage && !showAddDialog" class="request-error" role="alert">{{ errorMessage }}</p>
    <div v-if="isLoading" class="empty-state" role="status">Carregando redações...</div>
    <div class="essay-grid">
      <RouterLink
        v-for="essay in essays"
        :key="essay.id"
        class="essay-card"
        :to="{ name: 'essay-detail', params: { id: essay.id } }"
        :aria-label="`${essay.theme}, ${essay.score === null ? 'sem nota' : `nota ${essay.score} de 1000`}. Ver redação e avaliação`"
      >
        <div class="card-topline">
          <span class="essay-mark" aria-hidden="true">Aa</span>
          <span class="essay-date">{{ essay.date }}</span>
        </div>
        <h2>{{ essay.theme }}</h2>
        <p class="essay-excerpt">{{ essay.excerpt }}</p>
        <div class="card-footer">
          <span class="score-label">Nota</span>
          <strong v-if="essay.score !== null" class="essay-score">{{ essay.score }}<small>/1000</small></strong>
          <span v-else class="ungraded-label">Sem nota</span>
          <span class="card-action">Ver redação <span aria-hidden="true">→</span></span>
        </div>
      </RouterLink>
      <div v-if="!isLoading && essays.length === 0 && !errorMessage" class="empty-state">
        <h2>Nenhuma redação cadastrada</h2>
        <p>Adicione uma redação para acompanhar o texto e as avaliações.</p>
        <button class="primary-button" type="button" @click="showAddDialog = true">Adicionar redação</button>
      </div>
    </div>

    <div v-if="showAddDialog" class="modal-backdrop" @click.self="showAddDialog = false">
      <section class="essay-dialog" role="dialog" aria-modal="true" aria-labelledby="new-essay-title">
        <div class="dialog-heading">
          <div>
            <h2 id="new-essay-title">Nova redação</h2>
            <p>Salve seu texto para consultar depois.</p>
          </div>
          <button class="icon-button" type="button" aria-label="Fechar" @click="showAddDialog = false">×</button>
        </div>
        <form class="essay-form" @submit.prevent="addEssay">
          <p v-if="errorMessage" class="request-error" role="alert">{{ errorMessage }}</p>
          <label for="essay-title">Título</label>
          <input id="essay-title" v-model="title" maxlength="120" required />
          <label for="essay-theme">Tema</label>
          <input id="essay-theme" v-model="theme" maxlength="250" required />
          <label for="essay-text">Texto</label>
          <textarea id="essay-text" v-model="text" rows="9" required></textarea>
          <div class="dialog-actions">
            <button class="secondary-button" type="button" @click="showAddDialog = false">Cancelar</button>
            <button class="primary-button" type="submit" :disabled="isSaving">
              {{ isSaving ? 'Salvando...' : 'Salvar redação' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<style scoped>
.essays-header {
  position: relative;
  margin-bottom: 28px;
}

.page-title {
  margin: 8px 0 0;
  color: var(--text);
  font: 500 clamp(31px, 3.2vw, 42px)/1.15 var(--font-title);
  letter-spacing: -.035em;
}

.page-subtitle {
  max-width: 540px;
  margin: 9px 0 0;
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.6;
}

.add-essay-button {
  margin-top: 15px;
}

.essay-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.essay-card {
  display: flex;
  min-height: 250px;
  flex-direction: column;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
  transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}

.essay-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--accent) 32%, var(--border));
  box-shadow: var(--shadow-hover);
}

.card-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.essay-mark {
  display: grid;
  width: 37px;
  height: 37px;
  place-items: center;
  border-radius: 11px;
  color: var(--accent);
  background: var(--accent-soft);
  font: 600 15px var(--font-title);
}

.essay-date {
  color: var(--muted);
  font-size: 9px;
}

.essay-card h2 {
  margin: 18px 0 8px;
  color: var(--text);
  font: 500 19px/1.35 var(--font-title);
}

.essay-excerpt {
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 18px;
  color: var(--text-soft);
  font-size: 10px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card-footer {
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin-top: auto;
  padding-top: 13px;
  border-top: 1px solid var(--border);
}

.score-label {
  color: var(--muted);
  font-size: 9px;
}

.essay-score {
  color: var(--accent);
  font: 500 20px var(--font-title);
}

.essay-score small {
  margin-left: 2px;
  color: var(--muted);
  font: 400 9px var(--font-body);
}

.card-action {
  margin-left: auto;
  color: var(--text-soft);
  font-size: 9px;
}

.essay-card:hover .card-action {
  color: var(--accent);
}

.ungraded-label {
  color: var(--muted);
  font-size: 9px;
}

.modal-backdrop {
  position: fixed;
  z-index: 20;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(31 20 34 / 42%);
  backdrop-filter: blur(4px);
}

.essay-dialog {
  width: min(100%, 520px);
  max-height: min(90vh, 760px);
  overflow: auto;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--surface);
  box-shadow: 0 24px 70px rgb(21 12 23 / 25%);
}

.dialog-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.dialog-heading h2 {
  margin: 0;
  color: var(--text);
  font: 500 24px var(--font-title);
}

.dialog-heading p {
  margin: 5px 0 0;
  color: var(--text-soft);
  font-size: 10px;
}

.icon-button {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text-soft);
  background: var(--surface);
  font-size: 18px;
  cursor: pointer;
}

.essay-form {
  display: grid;
  gap: 8px;
}

.essay-form label {
  margin-top: 5px;
  color: var(--text-soft);
  font-size: 10px;
  font-weight: 600;
}

.essay-form input,
.essay-form textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  background: var(--bg);
  font-size: 11px;
}

.essay-form input {
  min-height: 40px;
}

.essay-form textarea {
  resize: vertical;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 12px;
}

@media (max-width: 1000px) {
  .essay-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .essay-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
