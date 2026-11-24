<script setup>
import { computed, onMounted, ref } from 'vue';
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
const searchQuery = ref('');

const filteredEssays = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('pt-BR');
  if (!query) return essays.value;

  return essays.value.filter((essay) => {
    const titleText = essay.title?.toLocaleLowerCase('pt-BR') ?? '';
    const themeText = essay.theme?.toLocaleLowerCase('pt-BR') ?? '';
    const excerptText = essay.excerpt?.toLocaleLowerCase('pt-BR') ?? '';
    return titleText.includes(query)
      || themeText.includes(query)
      || excerptText.includes(query);
  });
});

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
      <div class="header-left">
        <p class="page-eyebrow">Escrever também é aprender</p>
        <h1 class="page-title">Minhas redações</h1>
        <p class="page-subtitle">Relembre seus temas, acompanhe as notas e veja os detalhes de cada avaliação.</p>
      </div>
      <div class="header-right">
        <label class="search-wrap">
          <svg class="search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.6" />
            <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            class="search"
            type="search"
            placeholder="Buscar redação..."
            aria-label="Buscar redação"
          />
        </label>
        <button class="add-btn" type="button" @click="showAddDialog = true">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
          </svg>
          Nova redação
        </button>
      </div>
    </header>

    <p v-if="errorMessage && !showAddDialog" class="request-error" role="alert">{{ errorMessage }}</p>
    <div v-if="isLoading" class="empty-state" role="status">Carregando redações...</div>
    <div class="essay-grid">
      <RouterLink
        v-for="essay in filteredEssays"
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
      <div v-else-if="!isLoading && filteredEssays.length === 0 && !errorMessage" class="empty-state">
        <h2>Nenhuma redação encontrada</h2>
        <p>Tente buscar pelo título ou tema da redação.</p>
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
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 34px;
}

.header-left {
  min-width: 220px;
}

.page-title {
  margin: 8px 0 0;
  color: var(--text);
  font: 500 clamp(31px, 3.2vw, 42px)/1.15 var(--font-title);
  letter-spacing: -.035em;
}

.page-subtitle {
  max-width: 540px;
  margin: 10px 0 0;
  color: var(--text-soft);
  font-size: 13px;
  line-height: 1.65;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-wrap {
  position: relative;
  display: flex;
  width: min(255px, 27vw);
  height: 42px;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 13px;
  color: var(--muted);
  pointer-events: none;
}

.search {
  width: 100%;
  height: 100%;
  padding: 0 13px 0 39px;
  border: 1px solid var(--border);
  border-radius: 9px;
  color: var(--text);
  background: var(--surface);
  font-size: 11px;
  transition: border-color .18s ease, box-shadow .18s ease;
}

.search::placeholder {
  color: var(--muted);
}

.search:focus {
  border-color: var(--c-lavender);
  outline: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-lavender) 18%, transparent);
}

.add-btn {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
}

.add-btn:hover {
  transform: translateY(-1px);
  background: var(--accent-hover);
  box-shadow: 0 5px 14px color-mix(in srgb, var(--accent) 20%, transparent);
}

:global(:root[data-theme='dark']) .add-btn {
  color: #241a20;
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

  .essays-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-right {
    width: 100%;
  }

  .search-wrap {
    width: min(100%, 340px);
  }
}

@media (max-width: 600px) {
  .essay-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .essays-header {
    gap: 19px;
    margin-bottom: 25px;
  }

  .header-right {
    align-items: stretch;
  }

  .search-wrap {
    flex: 1;
  }

  .add-btn {
    padding-inline: 12px;
  }
}

@media (max-width: 480px) {
  .header-right {
    flex-direction: column;
  }

  .search-wrap {
    width: 100%;
  }

  .add-btn {
    width: 100%;
  }
}
</style>
